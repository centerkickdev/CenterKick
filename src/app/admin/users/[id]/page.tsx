import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import AdminUserProfileClient from '@/components/admin/users/AdminUserProfileClient';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  let targetUserId = id;

  if (!isUUID) {
    const { data: profileRef } = await admin.from('profiles').select('user_id').eq('slug', id).single();
    if (!profileRef) notFound();
    targetUserId = profileRef.user_id;
  }

  // Fetch complete profile with linked user data
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('*, users!profiles_user_id_fkey(email, role, subscriptions(current_period_end, status))')
    .eq('user_id', targetUserId)
    .single();

  if (profileError || !profile) {
    return notFound();
  }

  const role = (profile.users?.role || profile.role || 'player').toLowerCase();

  // Fetch pricing plan to determine if it's a Free tier account
  const { data: settings } = await admin.from('site_content').select('content').eq('page', 'settings').eq('section', 'payment').single();
  const basePrice = settings?.content?.plans?.[role]?.amount ? Number(settings.content.plans[role].amount) : 0;

  // The user dashboard evaluates subscription status purely by checking for confirmed transactions.
  // We must query the transactions table for this target user to match that exact logic.
  const { data: transactions } = await admin
    .from('transactions')
    .select('status, amount')
    .eq('user_id', profile.id);

  let subStatus = 'UNPAID';
  const hasPaid = transactions?.some(t => t.status === 'confirmed');

  if (hasPaid) {
    // If they have a confirmed transaction but the plan is free (amount 0), we can display FREE or PAID.
    // The dashboard shows "Paid" under Account Status if active, even for Free tiers. 
    // To match your expectation for a Free badge on free tiers, we check the transaction amount.
    const confirmedTx = transactions?.find(t => t.status === 'confirmed');
    subStatus = confirmedTx?.amount === 0 ? 'FREE' : 'PAID';
  } else if (profile.verification_requested) {
    subStatus = 'PENDING APPROVAL';
  } else if (profile.status === 'expired') {
    subStatus = 'EXPIRED';
  }

  // Fetch common reference data needed for Player and Coach clients
  const [
    { data: agentsData },
    { data: leagues },
    { data: clubs },
    { data: seasons },
    { data: countries }
  ] = await Promise.all([
    admin.from('profiles').select('id, user_id, first_name, last_name, agency_name, email').eq('role', 'agent'),
    admin.from('leagues').select('*, countries(name, code, flag_url)').order('name'),
    admin.from('clubs').select('*, leagues(name)').order('name'),
    admin.from('seasons').select('*').order('sort_order', { ascending: false }),
    admin.from('countries').select('*').order('name')
  ]);

  const agents = agentsData || [];

  // Fetch linked clients for Agent, Organization, and Scout
  let linkedAccounts: any[] = [];
  if (role === 'agent') {
    const { data } = await admin.from('profiles').select('id, user_id, first_name, last_name, slug, avatar_url, role, country, status, agent_status').eq('agent_id', targetUserId);
    if (data) linkedAccounts = data;
  } else if (role === 'organization') {
    const { data } = await admin.from('profiles').select('id, user_id, first_name, last_name, slug, avatar_url, role, country, status, agent_status').eq('organization_id', targetUserId);
    if (data) linkedAccounts = data;
  } else if (role === 'scout') {
    const { data } = await admin.from('profiles').select('id, user_id, first_name, last_name, slug, avatar_url, role, country, status, agent_status').eq('scout_id', targetUserId);
    if (data) linkedAccounts = data;
  }

  // Route to the appropriate Client Component
  return (
    <AdminUserProfileClient 
      profile={profile} 
      role={role} 
      subStatus={subStatus}
      initialClients={linkedAccounts} 
      clubsList={clubs || []}
      leaguesList={leagues || []}
      seasonsList={seasons || []}
      countriesList={countries || []}
    />
  );
}
