import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-10-28.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

// This is needed for webhook signature verification
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')

  // First step is to verify the event. The .text() method must be used as the
  // verification relies on the raw request body rather than the parsed JSON.
  const body = await request.text()
  let receivedEvent
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.error('Error:', err);
    return new Response(err.message, { status: 400 })
  }
  console.log(`🔔 Event received: ${receivedEvent.id}`)
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})

/*

serve(async (req) => {
  console.log('Webhook received:', new Date().toISOString());

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret');
      throw new Error('Missing signature or webhook secret');
    }

    // Get the raw body as text for signature verification
    const rawBody = await req.text();
    
    console.log('Raw body length:', rawBody.length);
    console.log('Webhook signature:', signature);
    console.log('Attempting to construct event...');

    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    console.log(`Webhook event type: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        console.log('Processing checkout.session.completed:', {
          userId,
          subscriptionId,
          customerId
        });

        // Update customer metadata
        console.log('Updating Stripe customer metadata...');
        await stripe.customers.update(customerId, {
          metadata: { user_id: userId }
        });
        console.log('Stripe customer metadata updated successfully');

        // Update user profile
        console.log('Updating user profile in Supabase...');
        const { data, error } = await supabase
          .from('profiles')
          .update({ 
            plan_id: 2,  // Pro plan
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            authenticated_usage_count: 0,  // Reset usage count for new subscription
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('Error updating user profile:', error);
          throw error;
        }
        console.log('User profile updated successfully:', data);

        // Add payment history
        console.log('Adding payment history...');
        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert({
            user_id: userId,
            stripe_payment_id: session.payment_intent as string,
            amount: session.amount_total! / 100,
            currency: session.currency,
            token_credits_added: 0,
            status: 'completed',
            completed_at: new Date().toISOString()
          });

        if (paymentError) {
          console.error('Error adding payment history:', paymentError);
          throw paymentError;
        }
        console.log('Payment history added successfully');

        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log('Processing invoice.paid:', invoice);

        const customer = await stripe.customers.retrieve(invoice.customer as string);
        console.log('Retrieved Stripe customer:', customer);

        const userId = (customer as Stripe.Customer).metadata.user_id;
        console.log('User ID from metadata:', userId);

        if (userId) {
          console.log('Resetting usage count for new billing period...');
          const { error } = await supabase
            .from('profiles')
            .update({ 
              authenticated_usage_count: 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (error) {
            console.error('Error resetting usage count:', error);
            throw error;
          }
          console.log('Usage count reset successfully');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Processing subscription deletion:', subscription);

        const customer = await stripe.customers.retrieve(subscription.customer as string);
        console.log('Retrieved Stripe customer:', customer);

        const userId = (customer as Stripe.Customer).metadata.user_id;
        console.log('User ID from metadata:', userId);

        if (userId) {
          console.log('Downgrading user to free plan...');
          const { error } = await supabase
            .from('profiles')
            .update({ 
              plan_id: 1,  // Free plan
              stripe_subscription_id: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (error) {
            console.error('Error downgrading user:', error);
            throw error;
          }
          console.log('User downgraded successfully');
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log('Webhook processed successfully');
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
})*/