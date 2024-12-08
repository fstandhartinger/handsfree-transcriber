import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.10.0'

export async function handleCheckoutSessionCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', JSON.stringify(session, null, 2));
  
  const userId = session.client_reference_id;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  if (!userId) {
    console.error('No user ID found in session');
    throw new Error('No user ID in session');
  }

  console.log('Updating customer metadata:', { userId, customerId, subscriptionId });
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
}

export async function handleInvoicePaid(stripe: Stripe, invoice: Stripe.Invoice) {
  console.log('Processing invoice.paid:', JSON.stringify(invoice, null, 2));

  const customer = await stripe.customers.retrieve(invoice.customer as string);
  console.log('Retrieved customer:', JSON.stringify(customer, null, 2));

  const userId = (customer as Stripe.Customer).metadata.user_id;
  if (!userId) {
    console.error('No user ID found in customer metadata');
    return;
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
}

export async function handleSubscriptionDeleted(stripe: Stripe, subscription: Stripe.Subscription) {
  console.log('Processing subscription deletion:', JSON.stringify(subscription, null, 2));

  const customer = await stripe.customers.retrieve(subscription.customer as string);
  console.log('Retrieved customer for deletion:', JSON.stringify(customer, null, 2));

  const userId = (customer as Stripe.Customer).metadata.user_id;
  if (!userId) {
    console.error('No user ID found in customer metadata for deletion');
    return;
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
}