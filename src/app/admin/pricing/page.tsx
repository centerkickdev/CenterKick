import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PricingClient } from './PricingClient';

export default async function AdminPricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userRecord || !['superadmin', 'admin'].includes(userRecord.role)) {
    redirect('/dashboard');
  }

  const { data: plans } = await supabase
    .from('pricing_plans')
    .select('*')
    .order('role', { ascending: true })
    .order('created_at', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tighter">
          Pricing <span className="text-[#b50a0a]">Plans</span>
        </h1>
        <p className="text-gray-500 font-bold text-sm mt-1">
          Manage subscription tiers and pricing for different account roles.
        </p>
      </div>

      <PricingClient initialPlans={plans || []} />
    </div>
  );
}
