import { supabaseAdmin } from '@/lib/supabase-admin'
import { isEntitledStatus, type SubscriptionStatus } from '@/lib/types'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Lazy get-or-create: upsert on the PK with no changed columns returns the
 * existing row if present, or creates a fresh one with all column defaults.
 * Mirrors how players rows are created by app code rather than a DB trigger —
 * there's no signup hook that creates a billing_accounts row up front.
 */
export async function getOrCreateBillingRow(accountId: string): Promise<any> {
  if (!supabaseAdmin) throw new Error('Billing not configured: SUPABASE_SERVICE_ROLE_KEY missing')
  const { data, error } = await supabaseAdmin
    .from('billing_accounts')
    .upsert({ account_id: accountId }, { onConflict: 'account_id', ignoreDuplicates: false })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Failed to load billing row')
  return data
}

/**
 * Monthly analysis cap for entitled (Pro) accounts. "Unlimited" in the
 * marketing copy is a fair-use ceiling, not a literal guarantee — this bounds
 * worst-case Anthropic spend per $20/mo subscriber to well under $10/mo even
 * if every call maxes its token budget (feedback: max_tokens 8000 with
 * adaptive thinking, ~$0.13/call worst case; a full 12-turn chat thread on
 * top of that, ~$0.20 worst case; ~$0.35-0.40/clip all-in). 20 * $0.40 = $8,
 * leaving real margin under $10 even accounting for estimation error, and
 * comfortably above realistic usage (a few clips/week).
 */
export const PRO_MONTHLY_ANALYSIS_LIMIT = 20

export type UsageCheckResult =
  | { allowed: true; remaining: number }
  | { allowed: false; remaining: 0; reason: 'free_limit' | 'pro_monthly_cap' | 'chat_monthly_cap' }

function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7) // 'YYYY-MM'
}

/**
 * Consumes one analysis against whichever pool applies: the monthly cap for
 * entitled (Pro) accounts, or the lifetime free pool otherwise. Uses a
 * compare-and-swap UPDATE (only succeeds if the counter column still matches
 * what was just read) with a few retries, rather than a blind read-then-write
 * — good enough at this scale (one account, one device, one upload at a time)
 * without introducing a Postgres function, which nothing else in this schema
 * uses.
 */
export async function checkAndConsumeUsage(accountId: string): Promise<UsageCheckResult> {
  if (!supabaseAdmin) throw new Error('Billing not configured: SUPABASE_SERVICE_ROLE_KEY missing')
  const period = currentPeriod()
  let lastSeenEntitled = false

  for (let attempt = 0; attempt < 3; attempt++) {
    const row = await getOrCreateBillingRow(accountId)
    lastSeenEntitled = isEntitledStatus(row.subscription_status as SubscriptionStatus)

    if (lastSeenEntitled) {
      const usedThisPeriod = row.pro_analyses_period === period ? row.pro_analyses_used : 0
      if (usedThisPeriod >= PRO_MONTHLY_ANALYSIS_LIMIT) {
        return { allowed: false, remaining: 0, reason: 'pro_monthly_cap' }
      }

      const { data } = await supabaseAdmin
        .from('billing_accounts')
        .update({
          pro_analyses_used: usedThisPeriod + 1,
          pro_analyses_period: period,
          updated_at: new Date().toISOString(),
        })
        .eq('account_id', accountId)
        .eq('pro_analyses_used', row.pro_analyses_used) // CAS guard against the raw stored value
        .select()
        .maybeSingle()

      if (data) {
        return { allowed: true, remaining: PRO_MONTHLY_ANALYSIS_LIMIT - (usedThisPeriod + 1) }
      }
      continue // another request updated it first; loop and retry
    }

    if (row.free_analyses_used >= row.free_analyses_limit) {
      return { allowed: false, remaining: 0, reason: 'free_limit' }
    }

    const { data } = await supabaseAdmin
      .from('billing_accounts')
      .update({ free_analyses_used: row.free_analyses_used + 1, updated_at: new Date().toISOString() })
      .eq('account_id', accountId)
      .eq('free_analyses_used', row.free_analyses_used) // CAS guard
      .select()
      .maybeSingle()

    if (data) {
      return { allowed: true, remaining: row.free_analyses_limit - (row.free_analyses_used + 1) }
    }
    // 0 rows updated — another request incremented it first; loop and retry.
  }
  // Fail closed after 3 collisions, with the reason matching what we last saw.
  return { allowed: false, remaining: 0, reason: lastSeenEntitled ? 'pro_monthly_cap' : 'free_limit' }
}

/**
 * Monthly chat-message cap, applied to every account regardless of tier.
 * MAX_CHAT_TURNS in lib/mock-chat.ts already caps each clip's thread at 12
 * questions, but that cap is enforced by counting a client-supplied `history`
 * array — a scripted client could send a forged short history on every call
 * to bypass it indefinitely. This counter is incremented server-side per
 * call, so it holds regardless of what the client claims its history is.
 * Sized with the feedback-analysis cap so the two together keep worst-case
 * spend under the $10/mo target: 20 analyses (~$0.13 each, max_tokens 8000)
 * + 60 chat messages (~$0.08 each worst case, bounded by the message-length
 * checks in the chat route) ≈ $2.60 + $4.80 = $7.40.
 */
export const CHAT_MESSAGE_MONTHLY_LIMIT = 60

export async function checkAndConsumeChatUsage(accountId: string): Promise<UsageCheckResult> {
  if (!supabaseAdmin) throw new Error('Billing not configured: SUPABASE_SERVICE_ROLE_KEY missing')
  const period = currentPeriod()

  for (let attempt = 0; attempt < 3; attempt++) {
    const row = await getOrCreateBillingRow(accountId)
    const usedThisPeriod = row.chat_messages_period === period ? row.chat_messages_used : 0
    if (usedThisPeriod >= CHAT_MESSAGE_MONTHLY_LIMIT) {
      return { allowed: false, remaining: 0, reason: 'chat_monthly_cap' }
    }

    const { data } = await supabaseAdmin
      .from('billing_accounts')
      .update({
        chat_messages_used: usedThisPeriod + 1,
        chat_messages_period: period,
        updated_at: new Date().toISOString(),
      })
      .eq('account_id', accountId)
      .eq('chat_messages_used', row.chat_messages_used) // CAS guard against the raw stored value
      .select()
      .maybeSingle()

    if (data) {
      return { allowed: true, remaining: CHAT_MESSAGE_MONTHLY_LIMIT - (usedThisPeriod + 1) }
    }
    // 0 rows updated — another request incremented it first; loop and retry.
  }
  return { allowed: false, remaining: 0, reason: 'chat_monthly_cap' } // fail closed after 3 collisions
}
