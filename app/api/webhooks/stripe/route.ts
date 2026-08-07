import type Stripe from 'stripe'
import { getStripe, stripeConfigured } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Stripe webhook — no bearer auth (Stripe doesn't send one), signature
 * verification instead. Needs the exact raw request bytes, so this route
 * reads req.text() rather than req.json() like every other route in this
 * codebase; parsing the body first would invalidate the signature check.
 */
export async function POST(req: Request) {
  if (!stripeConfigured || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Billing not configured' }, { status: 501 })
  }
  if (!supabaseAdmin) {
    console.error('Stripe webhook received but SUPABASE_SERVICE_ROLE_KEY is missing — cannot write billing state.')
    return Response.json({ error: 'Server not configured' }, { status: 500 })
  }

  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  if (!signature) {
    return Response.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const accountId = session.client_reference_id
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
      if (!accountId || !customerId || !subscriptionId) break

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      await supabaseAdmin
        .from('billing_accounts')
        .upsert(
          {
            account_id: accountId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            current_period_end: new Date(subscription.items.data[0].current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'account_id' },
        )
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      // Stripe sets status: 'canceled' on the .deleted event too, so one
      // handler covers both — no separate "clear the row" branch needed.
      const subscription = event.data.object as Stripe.Subscription
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
      await supabaseAdmin
        .from('billing_accounts')
        .update({
          subscription_status: subscription.status,
          stripe_subscription_id: subscription.id,
          current_period_end: new Date(subscription.items.data[0].current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId)
      break
    }

    default:
      break
  }

  return Response.json({ received: true })
}
