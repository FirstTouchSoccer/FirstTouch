import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getStripe, stripeConfigured } from '@/lib/stripe'
import { getOrCreateBillingRow } from '@/lib/billing-server'

/**
 * Creates a Stripe Checkout Session for the FirstTouch Pro subscription.
 * The launch discount (STRIPE_LAUNCH_COUPON_ID) is applied automatically here
 * rather than via a promo code the user types in — Stripe doesn't allow both
 * `discounts` and `allow_promotion_codes` on the same session, so this route
 * must never set allow_promotion_codes.
 */
export async function POST(req: Request) {
  if (!supabase) {
    return Response.json({ error: 'No backend configured' }, { status: 501 })
  }
  if (!stripeConfigured || !process.env.STRIPE_PRICE_ID) {
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
  const userId = data.user.id

  const stripe = getStripe()
  const row = await getOrCreateBillingRow(userId)

  let customerId: string = row.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: data.user.email,
      metadata: { supabase_user_id: userId },
    })
    customerId = customer.id
    if (!supabaseAdmin) {
      return Response.json({ error: 'Billing not configured' }, { status: 500 })
    }
    await supabaseAdmin.from('billing_accounts').update({ stripe_customer_id: customerId }).eq('account_id', userId)
  }

  const origin = req.headers.get('origin') ?? new URL(req.url).origin

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: userId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    discounts: process.env.STRIPE_LAUNCH_COUPON_ID
      ? [{ coupon: process.env.STRIPE_LAUNCH_COUPON_ID }]
      : undefined,
    subscription_data: { metadata: { supabase_user_id: userId } },
    success_url: `${origin}/?billing=success`,
    cancel_url: `${origin}/?billing=cancelled`,
  })

  return Response.json({ url: session.url })
}
