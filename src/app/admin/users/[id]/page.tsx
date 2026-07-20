import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import PlayerProfileClient from '@/components/admin/players/PlayerProfileClient';
import CoachProfileClient from '@/components/admin/coaches/CoachProfileClient';
import AgentProfileClient from '@/components/admin/agents/AgentProfileClient';
import OrganizationProfileClient from '@/components/admin/organizations/OrganizationProfileClient';
import ScoutProfileClient from '@/components/admin/scouts/ScoutProfileClient';

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

  const role = profile.role || 'player'; // default fallback

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
  let RenderedClient = null;

  switch (role) {
    case 'player':
      RenderedClient = (
        <PlayerProfileClient 
          player={profile} 
          agents={agents} 
          leagues={leagues || []}
          clubs={clubs || []}
          seasons={seasons || []}
          countries={countries || []}
        />
      );
      break;
    case 'coach':
      RenderedClient = (
        <CoachProfileClient 
          coach={profile} 
          agents={agents} 
          leagues={leagues || []}
          clubs={clubs || []}
          seasons={seasons || []}
          countries={countries || []}
        />
      );
      break;
    case 'agent':
      RenderedClient = (
        <AgentProfileClient 
          agent={profile} 
          initialClients={linkedAccounts} 
        />
      );
      break;
    case 'organization':
      RenderedClient = (
        <OrganizationProfileClient 
          Organization={profile} 
          initialClients={linkedAccounts} 
        />
      );
      break;
    case 'scout':
      RenderedClient = (
        <ScoutProfileClient 
          Scout={profile} 
          initialClients={linkedAccounts} 
        />
      );
      break;
    default:
      RenderedClient = (
        <PlayerProfileClient 
          player={profile} 
          agents={agents} 
          leagues={leagues || []}
          clubs={clubs || []}
          seasons={seasons || []}
          countries={countries || []}
        />
      );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {RenderedClient}
    </div>
  );
}
