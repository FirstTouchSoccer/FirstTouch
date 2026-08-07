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

export type UsageCheckResult =
  | { allowed: true; unlimited: true }
  | { allowed: true; unlimited: false; remaining: number }
  | { allowed: false; remaining: 0 }

/**
 * Consumes one free analysis if the account isn't on an entitled subscription.
 * Uses a compare-and-swap UPDATE (only succeeds if free_analyses_used still
 * matches what was just read) with a few retries, rather than a blind
 * read-then-write — good enough at this scale (one account, one device, one
 * upload at a time) without introducing a Postgres function, which nothing
 * else in this schema uses.
 */
export async function checkAndConsumeUsage(accountId: string): Promise<UsageCheckResult> {
  if (!supabaseAdmin) throw new Error('Billing not configured: SUPABASE_SERVICE_ROLE_KEY missing')

  for (let attempt = 0; attempt < 3; attempt++) {
    const row = await getOrCreateBillingRow(accountId)
    if (isEntitledStatus(row.subscription_status as SubscriptionStatus)) {
      return { allowed: true, unlimited: true }
    }
    if (row.free_analyses_used >= row.free_analyses_limit) {
      return { allowed: false, remaining: 0 }
    }

    const { data } = await supabaseAdmin
      .from('billing_accounts')
      .update({ free_analyses_used: row.free_analyses_used + 1, updated_at: new Date().toISOString() })
      .eq('account_id', accountId)
      .eq('free_analyses_used', row.free_analyses_used) // CAS guard
      .select()
      .maybeSingle()

    if (data) {
      return {
        allowed: true,
        unlimited: false,
        remaining: row.free_analyses_limit - (row.free_analyses_used + 1),
      }
    }
    // 0 rows updated — another request incremented it first; loop and retry.
  }
  return { allowed: false, remaining: 0 } // fail closed after 3 collisions
}
