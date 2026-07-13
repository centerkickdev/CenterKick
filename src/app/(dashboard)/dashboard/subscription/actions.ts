'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function requestVerification(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  const paymentReference = formData.get('payment_reference') as string;
  const paymentReceipt = formData.get('payment_receipt') as File | null;

  if (!paymentReference) {
    return { error: 'Payment reference is required' };
  }
  
  if (paymentReference.length > 15) {
    return { error: 'Payment reference must not exceed 15 characters' };
  }
  
  if (!/^[A-Za-z0-9]+$/.test(paymentReference)) {
    return { error: 'Payment reference must contain only letters and numbers' };
  }

  if (!paymentReceipt || paymentReceipt.size === 0) {
    return { error: 'Payment receipt upload is mandatory' };
  }

  // Fetch the profile id and role to create the transaction
  const { data: profile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('id, role, first_name, last_name, email')
    .eq('user_id', user.id)
    .single();

  if (profileFetchError || !profile) {
    return { error: 'Profile not found' };
  }

  // Fetch dynamic amount from pricing_plans
  const { data: plan } = await supabase
    .from('pricing_plans')
    .select('amount')
    .eq('role', profile.role)
    .eq('is_active', true)
    .single();

  const amount = plan ? Number(plan.amount) : 15000;

  const adminClient = createAdminClient();
  let proofFileUrl = '';
  let proofFileName = '';

  if (paymentReceipt && paymentReceipt.size > 0) {
    const fileExt = paymentReceipt.name.split('.').pop() || 'png';
    const fileName = `receipt-${user.id}-${Date.now()}.${fileExt}`;
    
    // Ensure bucket exists
    const { data: buckets } = await adminClient.storage.listBuckets();
    if (!buckets?.find(b => b.id === 'receipts')) {
      await adminClient.storage.createBucket('receipts', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
    }

    const { error: uploadError } = await adminClient.storage
      .from('receipts')
      .upload(fileName, paymentReceipt);
      
    if (!uploadError) {
       const { data: { publicUrl } } = adminClient.storage.from('receipts').getPublicUrl(fileName);
       proofFileUrl = publicUrl;
       proofFileName = paymentReceipt.name;
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      verification_requested: true,
      payment_reference: paymentReference,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id);

  if (error) {
    console.error('Error requesting verification:', error);
    return { error: error.message };
  }

  // Log the payment reference in transactions as well
  const { error: transError } = await adminClient
     .from('transactions')
     .insert({
        user_id: profile.id, // Using correct profiles.id reference
        amount: amount,
        currency: 'NGN',
        status: 'pending',
        reference: paymentReference,
        method: 'direct_transfer',
        metadata: {
           type: 'subscription',
           description: `Billing Claim: Onboarding subscription for ${profile.role}`,
           proofFileUrl,
           proofFileName,
           proofName: `${profile.first_name} ${profile.last_name}`,
           proofEmail: profile.email
        }
     });

  if (transError) {
     console.error('Error logging transaction:', transError);
     return { error: 'Failed to record transaction: ' + transError.message };
  }

  revalidatePath('/dashboard/subscription');
  return { success: true };
}

export async function getUserTransactions() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile || !profile.id) {
    return { transactions: [] };
  }

  const adminClient = createAdminClient();
  const { data: transactions, error } = await adminClient
    .from('transactions')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user transactions:', error);
    return { error: error.message };
  }

  return { transactions: transactions || [] };
}

export async function getPricingPlan(role: string) {
  const supabase = await createClient();
  const { data: plan, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('role', role)
    .eq('is_active', true)
    .single();

  if (error || !plan) return null;
  return plan;
}
