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

  // Fetch official user role from public.users table
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  // Fetch dynamic amount from CMS site_content payment settings
  const { data: settingsData } = await supabase
    .from('site_content')
    .select('content')
    .eq('page', 'settings')
    .eq('section', 'payment')
    .single();

  const userRole = userData?.role || profile.role || 'player';
  const rolePlan = settingsData?.content?.plans?.[userRole];
  const amount = rolePlan?.amount ? Number(rolePlan.amount) : 0;

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
      role: userRole,
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
           description: `Billing Claim: Onboarding subscription for ${userRole}`,
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

import { getEffectiveUserSession } from '@/lib/auth/impersonation';

export async function getEffectiveSubscriptionData() {
  const session = await getEffectiveUserSession();
  if (!session) return { error: 'Unauthorized' };

  const activeUserId = session.effectiveUserId;
  const adminClient = createAdminClient();

  const [
    { data: profData },
    { data: userData },
    { data: settings }
  ] = await Promise.all([
    adminClient.from('profiles').select('*').eq('user_id', activeUserId).single(),
    adminClient.from('users').select('role').eq('id', activeUserId).single(),
    adminClient.from('site_content').select('content').eq('page', 'settings').eq('section', 'payment').single()
  ]);

  if (profData) {
    profData.role = userData?.role || 'player';
  }

  if (settings?.content) {
    const paystackEnv = settings.content.paystackEnv || 'live';
    const activePaystackPublicKey = paystackEnv === 'test' 
      ? (settings.content.paystackTestPublicKey || settings.content.paystackPublicKey) 
      : (settings.content.paystackPublicKey || settings.content.paystackLivePublicKey);
      
    const activePaystackSecret = paystackEnv === 'test' 
      ? (settings.content.paystackTestSecretKey || settings.content.paystackSecret) 
      : (settings.content.paystackSecret || settings.content.paystackLiveSecretKey);

    const stripeEnv = settings.content.stripeEnv || 'live';
    const activeStripePublicKey = stripeEnv === 'test'
      ? (settings.content.stripeTestPublicKey || settings.content.stripeKey)
      : (settings.content.stripeKey || settings.content.stripeLivePublicKey);

    settings.content = {
      ...settings.content,
      paystackPublicKey: activePaystackPublicKey,
      paystackSecret: activePaystackSecret,
      stripeKey: activeStripePublicKey
    };
  }

  return {
    profData,
    settings: settings?.content || { paymentLink: 'https://paystack.com/pay/centerkick-pro' },
    isImpersonating: session.isImpersonating
  };
}

export async function getUserTransactions() {
  const session = await getEffectiveUserSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  const activeUserId = session.effectiveUserId;
  const db = session.isImpersonating ? createAdminClient() : await createClient();

  const { data: profile, error: profileError } = await db
    .from('profiles')
    .select('id')
    .eq('user_id', activeUserId)
    .single();

  if (profileError || !profile || !profile.id) {
    return { transactions: [] };
  }

  const adminClient = createAdminClient();
  const [{ data: transactions, error }, { data: redemptions }] = await Promise.all([
    adminClient
      .from('transactions')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false }),
    adminClient
      .from('coupon_redemptions')
      .select('*, coupon_codes(*)')
      .or(`redeemer_id.eq.${activeUserId},redeemer_id.eq.${profile.id}`)
      .order('redeemed_at', { ascending: false })
  ]);

  if (error) {
    console.error('Error fetching user transactions:', error);
    return { error: error.message };
  }

  const redemptionTxs = (redemptions || []).map((r: any) => ({
    id: r.id,
    reference: r.coupon_codes?.code || 'SPONSORED_VOUCHER',
    amount: 0,
    currency: 'NGN',
    status: 'confirmed' as const,
    method: 'gift_voucher',
    created_at: r.redeemed_at,
    metadata: {
      description: `Claimed Voucher: ${r.coupon_codes?.title || 'Sponsored Upgrade'} (${r.new_tier || 'PLAYER'})`,
      reason: `Tier unlocked: ${r.new_tier || 'PLAYER'}`
    }
  }));

  const combined = [...(transactions || []), ...redemptionTxs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return { transactions: combined };
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

export async function activateFreeSubscription() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  const { data: profile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (profileFetchError || !profile) {
    return { error: 'Profile not found' };
  }

  const adminClient = createAdminClient();

  // Create a confirmed transaction for 0 amount
  const { error: transError } = await adminClient
    .from('transactions')
    .insert({
      user_id: profile.id,
      amount: 0,
      currency: 'NGN',
      status: 'confirmed',
      reference: 'free_activation_' + Math.random().toString(36).substring(7),
      method: 'other',
      metadata: {
        type: 'subscription',
        description: `Lifetime free tier activation for ${profile.role}`
      }
    });

  if (transError) {
    return { error: 'Failed to record transaction' };
  }

  // Update profile status
  await supabase
    .from('profiles')
    .update({
      verification_requested: false,
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id);

  revalidatePath('/dashboard/subscription');
  return { success: true };
}

export async function verifyPaystackPayment(reference: string, amount: number, planCode?: string, couponCode?: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const { data: profile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('user_id', user.id)
    .single();

  if (profileFetchError || !profile) {
    return { error: 'Profile not found' };
  }

  const userRole = userData?.role || 'player';

  const adminClient = createAdminClient();

  // Fetch secret from site_content
  const { data: settingsData } = await adminClient
      .from('site_content')
      .select('content')
      .eq('page', 'settings')
      .eq('section', 'payment')
      .single();
      
  const paystackEnv = settingsData?.content?.paystackEnv || 'live';
  const secret = paystackEnv === 'test'
    ? (settingsData?.content?.paystackTestSecretKey || settingsData?.content?.paystackSecret || process.env.PAYSTACK_SECRET_KEY)
    : (settingsData?.content?.paystackSecret || settingsData?.content?.paystackLiveSecretKey || process.env.PAYSTACK_SECRET_KEY);
  if (!secret) return { error: 'Payment gateway not configured' };

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secret}`
      }
    });
    
    const data = await res.json();
    if (data.status && data.data.status === 'success') {
      // Create confirmed transaction
      const { error: insertError } = await adminClient.from('transactions').insert({
        user_id: profile.id,
        amount: data.data.amount / 100, // Paystack returns in kobo
        currency: 'NGN',
        status: 'confirmed',
        reference: reference,
        method: 'paystack_integration',
        metadata: {
          type: 'subscription',
          description: `Paystack Payment for ${userRole}${couponCode ? ` (Discount Coupon: ${couponCode})` : ''}`,
          paystack_plan: planCode || data.data.plan,
          applied_coupon: couponCode || null
        }
      });
      
      if (insertError) {
        // If it's a unique constraint violation, it means the webhook already successfully inserted the transaction just milliseconds before this ran.
        if (insertError.code === '23505' || insertError.message?.includes('duplicate key') || insertError.message?.includes('transactions_reference_key')) {
           // We can safely ignore this and proceed.
        } else {
           console.error('Transaction insert error:', insertError);
           return { error: `Failed to record transaction: ${insertError.message || JSON.stringify(insertError)}` };
        }
      }
      
      // Update profile status & entitlement
      await adminClient.from('profiles').update({
        verification_requested: false,
        status: 'active',
        is_subscribed: true,
        subscription_status: 'ACTIVE',
        updated_at: new Date().toISOString()
      }).eq('user_id', user.id);

      // If a discount coupon code was applied, log its redemption & increment count
      if (couponCode) {
        const { data: coupon } = await adminClient
          .from('coupon_codes')
          .select('*')
          .ilike('code', couponCode.trim())
          .maybeSingle();

        if (coupon) {
          const newCount = (coupon.redemption_count || 0) + 1;
          const newStatus = newCount >= coupon.max_redemptions ? 'REDEEMED' : 'AVAILABLE';
          await adminClient.from('coupon_codes').update({
            redemption_count: newCount,
            status: newStatus
          }).eq('id', coupon.id);

          await adminClient.from('coupon_redemptions').insert({
            coupon_code_id: coupon.id,
            redeemer_id: profile.id,
            redeemer_email: profile.email || user.email,
            resolution_mode: 'DEFAULT',
            previous_tier: 'FREE',
            new_tier: coupon.target_tier || userRole.toUpperCase(),
            redeemed_at: new Date().toISOString()
          });
        }
      }
      
      revalidatePath('/dashboard/subscription');
      return { success: true };
    } else {
      return { error: 'Payment verification failed' };
    }
  } catch (error: any) {
    return { error: error.message };
  }
}
