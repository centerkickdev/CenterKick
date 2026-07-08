import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Users, Shield, Globe, Clock, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import { UsersClient } from '@/components/admin/users/UsersClient';

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const adminClient = createAdminClient(); // Service-role client: bypasses RLS
  const resolvedParams = await searchParams;

  // URL Params
  const role = (resolvedParams.role as string) || 'all';
  const page = parseInt((resolvedParams.page as string) || '1');
  const q = (resolvedParams.q as string) || '';

  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  // 1. Fetch Stats for all roles (using admin client for reliable counts)
  const [
    { count: totalCount },
    { count: pendingCount },
    { count: activeCount },
    { count: playersCount },
    { count: coachesCount },
    { count: agentsCount },
    { count: scoutsCount },
    { count: orgsCount }
  ] = await Promise.all([
    adminClient.from('users').select('*', { count: 'exact', head: true }),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    adminClient.from('users').select('*', { count: 'exact', head: true }).eq('role', 'player'),
    adminClient.from('users').select('*', { count: 'exact', head: true }).eq('role', 'coach'),
    adminClient.from('users').select('*', { count: 'exact', head: true }).eq('role', 'agent'),
    adminClient.from('users').select('*', { count: 'exact', head: true }).eq('role', 'scout'),
    adminClient.from('users').select('*', { count: 'exact', head: true }).eq('role', 'organization'),
  ]);

  // 2. Fetch Users with Filters (admin client bypasses RLS completely)
  let query = adminClient
    .from('users')
    .select('id, email, role, is_active, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (role !== 'all') {
    query = query.eq('role', role);
  }

  if (q) {
    query = query.or(`email.ilike.%${q}%`);
  }

  const { data: rawUsers, count: filteredTotal } = await query;

  // 3. Fetch profiles separately to avoid silent RLS failure on the join
  //    Server-side admin client has full access so this is reliable.
  let users: any[] = [];
  if (rawUsers && rawUsers.length > 0) {
    const userIds = rawUsers.map((u: any) => u.id);
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('user_id, status, first_name, last_name')
      .in('user_id', userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
    users = rawUsers.map((u: any) => ({
      ...u,
      profile: profileMap.get(u.id) || null,
    }));
  }

  const stats = [
    { label: 'All Accounts', value: totalCount || 0, icon: Users, color: 'text-gray-900', bg: 'bg-gray-100' },
    { label: 'Pending Onboarding', value: pendingCount || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Verified Active', value: activeCount || 0, icon: Shield, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Global Reach', value: (totalCount || 0) * 12, icon: Globe, color: 'text-[#b50a0a]', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tighter leading-none">Account <span className="text-[#b50a0a]">Management</span></h1>
          <p className="text-gray-400 text-xs font-bold tracking-[0.2em] mt-2 flex items-center gap-2">
            <Shield className="w-3 h-3 text-[#b50a0a]" /> Directory of all registered entities
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-gray-400 tracking-wide">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tighter mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Sub-counts for Roles */}
      <div className="bg-gray-900 rounded-[2rem] p-4 md:p-8 text-white flex flex-wrap gap-12 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#b50a0a] rounded-full blur-[100px] opacity-10 -mr-32 -mt-32"></div>
        <div>
          <p className="text-xs font-bold text-[#b50a0a] tracking-[0.3em] mb-1">Role Distribution</p>
          <div className="flex gap-4 md:p-8">
            <div><p className="text-xl font-bold">{playersCount || 0}</p><p className="text-xs font-bold text-gray-500 tracking-wide">Players</p></div>
            <div><p className="text-xl font-bold">{coachesCount || 0}</p><p className="text-xs font-bold text-gray-500 tracking-wide">Coaches</p></div>
            <div><p className="text-xl font-bold">{agentsCount || 0}</p><p className="text-xs font-bold text-gray-500 tracking-wide">Agents</p></div>
            <div><p className="text-xl font-bold">{scoutsCount || 0}</p><p className="text-xs font-bold text-gray-500 tracking-wide">Scouts</p></div>
            <div><p className="text-xl font-bold">{orgsCount || 0}</p><p className="text-xs font-bold text-gray-500 tracking-wide">Orgs</p></div>
          </div>
        </div>
      </div>

      {/* Client Table */}
      <UsersClient 
        initialUsers={users || []}
        totalCount={filteredTotal || 0}
        currentPage={page}
        pageSize={pageSize}
      />
    </div>
  );
}
