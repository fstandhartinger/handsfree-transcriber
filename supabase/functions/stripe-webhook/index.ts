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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Webhook received:', new Date().toISOString());
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    console.log('Webhook signature:', signature);
    
    if (!signature) {
      throw new Error('No stripe signature found');
    }

    // WICHTIG: Wir müssen den rohen Request Body als Text erhalten
    const rawBody = await req.text();
    console.log('Raw body length:', rawBody.length);
    
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
    console.log('Constructing Stripe event...');
    
    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret
    );

    console.log(`Webhook event type: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Processing checkout.session.completed...');
        const session = event.data.object;
        console.log('Checkout session:', JSON.stringify(session, null, 2));
        
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string;
        const stripeCustomerId = session.customer as string;
        
        console.log('Updating customer metadata:', {
          userId,
          subscriptionId,
          stripeCustomerId
        });

        // Update customer metadata with user_id
        await stripe.customers.update(stripeCustomerId, {
          metadata: { user_id: userId }
        });
        console.log('Customer metadata updated successfully');

        // Update user profile
        console.log('Updating user profile in Supabase...');
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            plan_id: 2,  // Pro plan
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: subscriptionId,
            authenticated_usage_count: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (profileError) {
          console.error('Error updating user profile:', profileError);
          throw profileError;
        }
        console.log('User profile updated successfully');

        break;
      }

      case 'invoice.paid': {
        console.log('Processing invoice.paid...');
        const invoice = event.data.object;
        console.log('Invoice:', JSON.stringify(invoice, null, 2));

        const customer = await stripe.customers.retrieve(invoice.customer as string);
        console.log('Retrieved Stripe customer:', JSON.stringify(customer, null, 2));

        // Get user_id from customer metadata
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
        } else {
          console.error('No user_id found in customer metadata');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        console.log('Processing subscription deletion...');
        const subscription = event.data.object;
        console.log('Subscription:', JSON.stringify(subscription, null, 2));

        const customer = await stripe.customers.retrieve(subscription.customer as string);
        console.log('Retrieved Stripe customer:', JSON.stringify(customer, null, 2));

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
        } else {
          console.error('No user_id found in customer metadata');
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
})