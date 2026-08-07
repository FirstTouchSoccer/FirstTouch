import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Service-role Supabase client — bypasses RLS. Server-only: never import this
 * from a 'use client' file. Used by the billing usage-gate (lib/billing-server.ts)
 * and the Stripe webhook, which both write rows the account owner's own RLS
 * policy deliberately can't write (same "service-role only" shape as
 * coach_notes writes).
 */
export const supabaseAdmin: SupabaseClient | null =
  url && serviceKey ? createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } }) : null
