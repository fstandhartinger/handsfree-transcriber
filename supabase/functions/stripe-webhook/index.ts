import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.10.0'
import { 
  handleCheckoutSessionCompleted, 
  handleInvoicePaid, 
  handleSubscriptionDeleted 
} from './eventHandlers.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2022-11-15'
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Webhook received:', new Date().toISOString());
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSignature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    console.log('Webhook secret exists:', !!webhookSecret);
    console.log('Stripe signature exists:', !!stripeSignature);

    if (!stripeSignature || !webhookSecret) {
      console.error('Missing required headers or secret');
      throw new Error('Missing signature or webhook secret');
    }

    const rawBody = await req.text();
    console.log('Raw body length:', rawBody.length);

    console.log('Attempting to construct Stripe event...');
    const event = stripe.webhooks.constructEvent(
      rawBody,
      stripeSignature,
      webhookSecret
    );

    console.log('Event constructed successfully:', event.type);
    console.log('Event ID:', event.id);

    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(stripe, event.data.object as Stripe.Checkout.Session);
        break;
      }
      case 'invoice.paid': {
        await handleInvoicePaid(stripe, event.data.object as Stripe.Invoice);
        break;
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(stripe, event.data.object as Stripe.Subscription);
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