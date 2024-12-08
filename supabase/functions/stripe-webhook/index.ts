import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.10.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2022-11-15'
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No stripe signature found');
      throw new Error('No stripe signature found');
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('No webhook secret found');
      throw new Error('No webhook secret found');
    }

    // Get the raw body
    const rawBody = await req.text();
    console.log('Processing webhook with signature:', signature);

    // Construct the event asynchronously
    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret
    );

    console.log('Event type:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Processing checkout.session.completed:', session);
        
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!userId) {
          throw new Error('No user ID found in session');
        }

        console.log('Updating customer metadata with user_id:', userId);
        await stripe.customers.update(customerId, {
          metadata: { user_id: userId }
        });

        console.log('Updating user profile...');
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            plan_id: 2,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            authenticated_usage_count: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          throw profileError;
        }

        console.log('Successfully processed checkout session');
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
          console.log('Resetting usage count for user:', userId);
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
          console.log('Successfully reset usage count');
        } else {
          console.error('No user_id found in customer metadata');
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
          console.log('Downgrading user to free plan:', userId);
          const { error } = await supabase
            .from('profiles')
            .update({ 
              plan_id: 1,
              stripe_subscription_id: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (error) {
            console.error('Error downgrading user:', error);
            throw error;
          }
          console.log('Successfully downgraded user');
        }
        break;
      }
    }

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
});