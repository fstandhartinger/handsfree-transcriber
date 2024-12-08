import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.10.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-10-28.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  const body = await req.text()

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    console.log(`Webhook received: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.client_reference_id
        const subscriptionId = session.subscription as string
        const customerId = session.customer as string

        // Update customer metadata
        await stripe.customers.update(customerId, {
          metadata: { user_id: userId }
        })

        // Update user profile
        const { error } = await supabase
          .from('profiles')
          .update({ 
            plan_id: 2,  // Pro plan
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            authenticated_usage_count: 0,  // Reset usage count for new subscription
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (error) throw error

        // Add payment history
        await supabase
          .from('payment_history')
          .insert({
            user_id: userId,
            stripe_payment_id: session.payment_intent as string,
            amount: session.amount_total! / 100,
            currency: session.currency,
            token_credits_added: 0,
            status: 'completed',
            completed_at: new Date().toISOString()
          })

        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object
        const customer = await stripe.customers.retrieve(invoice.customer as string)
        const userId = (customer as Stripe.Customer).metadata.user_id

        if (userId) {
          // Reset usage count for the new billing period
          const { error } = await supabase
            .from('profiles')
            .update({ 
              authenticated_usage_count: 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)

          if (error) throw error
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        const userId = (customer as Stripe.Customer).metadata.user_id

        if (userId) {
          // Downgrade to free plan
          const { error } = await supabase
            .from('profiles')
            .update({ 
              plan_id: 1,  // Free plan
              stripe_subscription_id: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)

          if (error) throw error
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Webhook error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})