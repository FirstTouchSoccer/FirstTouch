import { supabase } from '@/lib/supabase'
import { getStripe, stripeConfigured } from '@/lib/stripe'
import { getOrCreateBillingRow } from '@/lib/billing-server'

/** Opens the Stripe Customer Portal so a subscriber can manage or cancel. */
export async function POST(req: Request) {
  if (!supabase) {
    return Response.json({ error: 'No backend configured' }, { status: 501 })
  }
  if (!stripeConfigured) {
    return Response.json({ error: 'Billing not configured' }, { status: 501 })
  }

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const row = await getOrCreateBillingRow(data.user.id)
  if (!row.stripe_customer_id) {
    return Response.json({ error: 'No subscription to manage yet' }, { status: 400 })
  }

  const origin = req.headers.get('origin') ?? new URL(req.url).origin
  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: row.stripe_customer_id,
    return_url: origin,
  })

  return Response.json({ url: session.url })
}
