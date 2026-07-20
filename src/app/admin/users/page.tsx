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
    { count: activeCount },
    { count: playersCount },
    { count: coachesCount },
    { count: agentsCount },
    { count: scoutsCount },
    { count: orgsCount },
    { data: countryData }
  ] = await Promise.all([
    adminClient.from('users').select('*', { count: 'exact', head: true }),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    adminClient.from('users').select('*', { count: 'exact', head: true }).eq('role', 'player'),
    adminClient.from('users').select('*', { count: 'exact', head: true }).eq('role', 'coach'),
    adminClient.from('users').select('*', { count: 'exact', head: true }).eq('role', 'agent'),
    adminClient.from('users').select('*', { count: 'exact', head: true }).eq('role', 'scout'),
    adminClient.from('users').select('*', { count: 'exact', head: true }).eq('role', 'organization'),
    adminClient.from('profiles').select('country').not('country', 'is', null)
  ]);

  const globalReachCount = new Set((countryData || []).map(p => p.country)).size;

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
      .select('user_id, status, first_name, last_name, slug')
      .in('user_id', userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
    users = rawUsers.map((u: any) => ({
      ...u,
      profile: profileMap.get(u.id) || null,
    }));
  }

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Accounts */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
           <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-gray-400 tracking-wide uppercase">All User Accounts</p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter mt-1">{totalCount || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-900 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
           </div>
           <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-auto w-full">
             <div><p className="text-[10px] font-bold text-gray-400 uppercase">Players</p><p className="text-sm font-bold text-gray-900">{playersCount || 0}</p></div>
             <div><p className="text-[10px] font-bold text-gray-400 uppercase">Coaches</p><p className="text-sm font-bold text-gray-900">{coachesCount || 0}</p></div>
             <div><p className="text-[10px] font-bold text-gray-400 uppercase">Agents</p><p className="text-sm font-bold text-gray-900">{agentsCount || 0}</p></div>
             <div><p className="text-[10px] font-bold text-gray-400 uppercase">Scouts</p><p className="text-sm font-bold text-gray-900">{scoutsCount || 0}</p></div>
             <div><p className="text-[10px] font-bold text-gray-400 uppercase">Orgs</p><p className="text-sm font-bold text-gray-900">{orgsCount || 0}</p></div>
           </div>
        </div>

        {/* Verified Active */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 tracking-wide uppercase">Verified Active</p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter mt-1">{activeCount || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
           </div>
           <div className="pt-4 mt-auto">
             <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{ width: `${totalCount ? Math.round(((activeCount||0) / totalCount) * 100) : 0}%` }}></div>
             </div>
             <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">{totalCount ? Math.round(((activeCount||0) / totalCount) * 100) : 0}% of all accounts (System Admin accounts inclusive)</p>
           </div>
        </div>

        {/* Global Reach */}
        <div className="bg-[#b50a0a] p-6 rounded-[2rem] shadow-xl shadow-red-900/10 flex flex-col justify-between relative overflow-hidden text-white">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[60px] opacity-20 -mr-16 -mt-16"></div>
           <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-bold text-red-200 tracking-wide uppercase">Global Reach</p>
                <p className="text-4xl font-black text-white tracking-tighter mt-1">{globalReachCount}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-black/20 text-white flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
           </div>
           <div className="pt-4 mt-auto relative z-10">
             <p className="text-xs font-bold text-red-100">Unique Countries Represented</p>
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
