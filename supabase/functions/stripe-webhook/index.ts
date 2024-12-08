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
  
  // Log all request headers
  const headersObj = Object.fromEntries(req.headers.entries());
  console.log('All request headers:', JSON.stringify(headersObj, null, 2));
  
  // Log specific Stripe signature header
  const stripeSignature = req.headers.get('stripe-signature');
  console.log('Stripe signature header:', stripeSignature);

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the webhook secret and log its presence
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    console.log('Webhook secret exists:', !!webhookSecret);
    console.log('Webhook secret length:', webhookSecret?.length);

    if (!stripeSignature || !webhookSecret) {
      console.error('Missing required headers or secret:');
      console.error('- Stripe signature present:', !!stripeSignature);
      console.error('- Webhook secret present:', !!webhookSecret);
      throw new Error('Missing signature or webhook secret');
    }

    // Get the raw body and log its details
    const rawBody = await req.text();
    console.log('Raw body length:', rawBody.length);
    console.log('Raw body preview:', rawBody.substring(0, 100));
    console.log('Raw body is string:', typeof rawBody === 'string');

    // Attempt to construct the event
    console.log('Attempting to construct Stripe event...');
    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      stripeSignature,
      webhookSecret
    );

    console.log('Event constructed successfully:', event.type);
    console.log('Event ID:', event.id);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Processing checkout.session.completed:', JSON.stringify(session, null, 2));
        
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!userId) {
          console.error('No user ID found in session');
          throw new Error('No user ID in session');
        }

        console.log('Updating customer metadata:', {
          userId,
          customerId,
          subscriptionId
        });

        await stripe.customers.update(customerId, {
          metadata: { user_id: userId }
        });

        console.log('Customer metadata updated');

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
        console.log('Retrieved customer:', JSON.stringify(customer, null, 2));

        const userId = (customer as Stripe.Customer).metadata.user_id;
        if (!userId) {
          console.error('No user ID found in customer metadata');
          break;
        }

        console.log('Resetting usage count for user:', userId);
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const { error } = await supabase
          .from('usage_tracking')
          .update({ 
            authenticated_usage_count: 0,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          console.error('Error resetting usage count:', error);
          throw error;
        }
        console.log('Usage count reset successfully');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Processing subscription deletion:', JSON.stringify(subscription, null, 2));

        const customer = await stripe.customers.retrieve(subscription.customer as string);
        console.log('Retrieved customer for deletion:', JSON.stringify(customer, null, 2));

        const userId = (customer as Stripe.Customer).metadata.user_id;
        if (!userId) {
          console.error('No user ID found in customer metadata for deletion');
          break;
        }

        console.log('Downgrading user to free plan:', userId);
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