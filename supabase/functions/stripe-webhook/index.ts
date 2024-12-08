import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.10.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-10-28.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Webhook received:', new Date().toISOString());
  console.log('Request method:', req.method);
  console.log('Request headers:', JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the raw request body and signature
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    console.log('Raw body first 100 chars:', rawBody.substring(0, 100));
    console.log('Raw body length:', rawBody.length);
    console.log('Signature:', signature);
    console.log('Webhook secret length:', webhookSecret?.length);
    
    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret');
      throw new Error('Missing signature or webhook secret');
    }

    console.log('Constructing Stripe event...');
    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret
    );

    console.log(`Webhook event type: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Processing checkout.session.completed:', JSON.stringify(session, null, 2));
        
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        console.log('Updating customer metadata with user_id:', userId);
        await stripe.customers.update(customerId, {
          metadata: { user_id: userId }
        });

        console.log('Updating user profile in Supabase...');
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const { error } = await supabase
          .from('profiles')
          .update({ 
            plan_id: 2,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('Error updating user profile:', error);
          throw error;
        }
        console.log('User profile updated successfully');
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log('Processing invoice.paid:', JSON.stringify(invoice, null, 2));

        const customer = await stripe.customers.retrieve(invoice.customer as string);
        console.log('Retrieved Stripe customer:', JSON.stringify(customer, null, 2));

        const userId = (customer as Stripe.Customer).metadata.user_id;
        console.log('User ID from metadata:', userId);

        if (userId) {
          console.log('Resetting usage count for new billing period...');
          const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
          );

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
        console.log('Processing subscription deletion:', JSON.stringify(subscription, null, 2));

        const customer = await stripe.customers.retrieve(subscription.customer as string);
        console.log('Retrieved Stripe customer:', JSON.stringify(customer, null, 2));

        const userId = (customer as Stripe.Customer).metadata.user_id;
        console.log('User ID from metadata:', userId);

        if (userId) {
          console.log('Downgrading user to free plan...');
          const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
          );

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
    console.error('Error details:', JSON.stringify(err, null, 2));
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
})