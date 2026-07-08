import { createClient } from '@/lib/supabase/server';
import { Briefcase, CreditCard, Clock, CheckCircle, UserPlus, Users, Link2 } from 'lucide-react';
import Link from 'next/link';
import { AgentsClient } from '@/components/admin/agents/AgentsClient';

export default async function AdminAgentsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;

  // URL Params for filtering and pagination
  const tab = (resolvedParams.tab as string) || 'all';
  const page = parseInt((resolvedParams.page as string) || '1');
  const q = (resolvedParams.q as string) || '';
  const gender = (resolvedParams.gender as string) || '';
  const country = (resolvedParams.country as string) || '';

  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  // 1. Fetch Stats
  const [
    { count: totalCount },
    { count: pendingCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'agent').eq('is_subscribed', true).not('email', 'is', null),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'agent').eq('status', 'pending').not('email', 'is', null)
  ]);

  const subscribedCount = totalCount || 0;

  // 2. Fetch Agents from PROFILES (to include unlinked)
  let query = supabase
    .from('profiles')
    .select('*, users!user_id(role, email)', { count: 'exact' });

  // Apply role filter
  query = query.eq('role', 'agent').eq('is_subscribed', true);

  // Apply tab filters
  if (tab === 'pending') query = query.eq('status', 'pending');

  // Apply filters
  if (gender) query = query.eq('gender', gender);
  if (country) query = query.ilike('country', `%${country}%`);

  // Apply search
  if (q) {
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,users.email.ilike.%${q}%,agency_name.ilike.%${q}%`);
  }

  const { data: agents, count: filteredTotal } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  // 3. Fetch Client Counts for each agent
  const agentIds = agents?.map(a => a.user_id) || [];
  const { data: clientCounts } = await supabase
    .from('profiles')
    .select('agent_id')
    .in('agent_id', agentIds);

  const agentsWithCounts = (agents || []).map(agent => ({
    ...agent,
    email: agent.users?.email || 'N/A',
    profiles: { ...agent }, // Compatibility wrapper
    clientCount: clientCounts?.filter(c => c.agent_id === agent.user_id).length || 0
  })) || [];

  const stats = [
    { label: 'All Agents', value: totalCount || 0, tab: 'all', color: 'text-gray-900', bg: 'bg-gray-100', icon: Briefcase },
    { label: 'Subscribed', value: subscribedCount || 0, tab: 'subscribed', color: 'text-green-600', bg: 'bg-green-50', icon: CreditCard },
    { label: 'Prospects', value: 'VIEW', tab: 'prospects', color: 'text-gray-400', bg: 'bg-gray-50', icon: Users },
    { label: 'Pending Requests', value: pendingCount || 0, tab: 'pending', color: 'text-[#b50a0a]', bg: 'bg-red-50', icon: Clock },
  ];

  // 4. Fetch current admin role for RBAC
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tighter leading-none">Agents <span className="text-[#b50a0a]">Portfolio</span></h1>
          <p className="text-gray-400 text-xs font-bold tracking-[0.2em] mt-2">Manage sports agencies, license credentials and network connections.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/agents?add=true" className="bg-[#b50a0a] hover:bg-black text-white px-5 py-3 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center gap-2 shadow-xl shadow-red-900/10 active:scale-95">
            <UserPlus className="w-3.5 h-3.5" /> Enroll New Agent
          </Link>
        </div>
      </div>

      {/* Linked Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Link
            key={i}
            href={stat.tab === 'prospects' ? `/admin/approvals?tab=prospects&role=agent` : `/admin/agents?tab=${stat.tab === 'subscribed' ? 'all' : stat.tab}&page=1`}
            className={`bg-white p-5 rounded-[1.5rem] border-2 transition-all duration-300 relative overflow-hidden group active:scale-95 ${tab === stat.tab ? 'border-[#b50a0a] shadow-xl shadow-red-900/10' : 'border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md'}`}
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className={`text-xs font-bold tracking-wide ${tab === stat.tab ? 'text-gray-900' : 'text-gray-400'}`}>{stat.label}</p>
              <p className={`text-2xl font-bold tracking-tighter ${tab === stat.tab ? 'text-[#b50a0a]' : 'text-gray-900'}`}>{stat.value}</p>
            </div>
            {tab === stat.tab && (
              <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-[#b50a0a] rounded-full"></div>
            )}
          </Link>
        ))}
      </div>

      {/* Client Management Portal */}
      <AgentsClient
        initialAgents={agentsWithCounts as any}
        totalCount={filteredTotal || 0}
        currentPage={page}
        pageSize={pageSize}
        role={userRecord?.role || 'player'}
      />
    </div>
  );
}
