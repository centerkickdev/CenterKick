'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updatePaymentSettings(settings: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!['superadmin', 'admin'].includes(userRecord?.role)) {
    throw new Error('Unauthorized');
  }

  // Handle Paystack Plan Creation for both Test & Live environments
  if (settings.paystackActive && settings.plans) {
    const liveSecret = settings.paystackSecret || settings.paystackLiveSecretKey;
    const testSecret = settings.paystackTestSecretKey;

    for (const roleId of Object.keys(settings.plans)) {
      const plan = settings.plans[roleId];
      const amountNum = Number(plan.amount) || 0;
      
      if (amountNum > 0 && plan.frequency && plan.frequency !== 'Lifetime Access') {
        let interval = 'monthly';
        if (plan.frequency === 'Monthly') interval = 'monthly';
        if (plan.frequency === 'Quarterly') interval = 'quarterly';
        if (plan.frequency === 'Biannually') interval = 'biannually';
        if (plan.frequency === 'Yearly') interval = 'annually';

        const paystackPayload = {
          name: plan.name || `CenterKick ${roleId} Pro`,
          interval: interval,
          amount: amountNum * 100,
        };

        // Helper to create plan on Paystack
        const createPlanOnPaystack = async (secretKey: string) => {
          try {
            const response = await fetch('https://api.paystack.co/plan', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(paystackPayload)
            });
            const data = await response.json();
            if (data.status && data.data && data.data.plan_code) {
              return data.data.plan_code;
            }
          } catch (err) {
            console.error('Error creating Paystack plan:', err);
          }
          return null;
        };

        // Create Live Plan Code if live secret exists
        if (liveSecret && liveSecret.startsWith('sk_live_')) {
          const liveCode = await createPlanOnPaystack(liveSecret);
          if (liveCode) {
            settings.plans[roleId].paystackLivePlanCode = liveCode;
            settings.plans[roleId].paystackPlanCode = liveCode; // Backwards compatibility fallback
          }
        }

        // Create Test Plan Code if test secret exists
        if (testSecret && testSecret.startsWith('sk_test_')) {
          const testCode = await createPlanOnPaystack(testSecret);
          if (testCode) {
            settings.plans[roleId].paystackTestPlanCode = testCode;
          }
        }
      } else {
        // If free or lifetime, clear the plan codes
        settings.plans[roleId].paystackPlanCode = null;
        settings.plans[roleId].paystackLivePlanCode = null;
        settings.plans[roleId].paystackTestPlanCode = null;
      }
    }
  }

  const { error } = await supabase
    .from('site_content')
    .upsert({
      page: 'settings',
      section: 'payment',
      content: settings,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'page,section'
    });

  if (error) throw error;

  revalidatePath('/admin/payments/subscriptions');
  return { success: true };
}
