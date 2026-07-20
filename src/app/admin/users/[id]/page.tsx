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

  const role = (profile.role || 'player').toLowerCase();

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
      initialClients={linkedAccounts} 
      clubsList={clubs || []}
      leaguesList={leagues || []}
      seasonsList={seasons || []}
      countriesList={countries || []}
    />
  );
}
