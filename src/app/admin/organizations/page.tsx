import { createClient } from '@/lib/supabase/server';
import { Trophy, Shield, Globe, Clock, UserPlus, Building2 } from 'lucide-react';
import Link from 'next/link';
import { RoleDirectoryClient } from '@/components/admin/directories/RoleDirectoryClient';

export default async function AdminOrganizationsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const resolvedParams = (await searchParams) || {};

  const tab = (resolvedParams.tab as string) || 'all';
  const page = parseInt((resolvedParams.page as string) || '1');
  const q = (resolvedParams.q as string) || '';

  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  // 1. Fetch Stats for Organizations
  const [
    { count: totalCount },
    { count: pendingCount },
    { count: activeCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'organization').not('email', 'is', null),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'organization').eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'organization').eq('status', 'active'),
  ]);

  // 2. Fetch Organizations Data
  let query = supabase
    .from('profiles')
    .select('*, users!user_id(role, email)')
    .eq('role', 'organization')
    .not('email', 'is', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (tab === 'pending') query = query.eq('status', 'pending');
  if (tab === 'active') query = query.eq('status', 'active');
  if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,agency_name.ilike.%${q}%`);

  const { data: orgs, count: filteredTotal } = await query;

  const stats = [
    { label: 'Total Orgs', value: totalCount || 0, tab: 'all', icon: Building2, color: 'text-gray-900', bg: 'bg-gray-100' },
    { label: 'Pending Approval', value: pendingCount || 0, tab: 'pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Verified Institutions', value: activeCount || 0, tab: 'active', icon: Shield, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Organization <span className="text-[#b50a0a]">Control</span></h1>
          <p className="text-gray-400 text-[10px] font-black tracking-[0.2em] mt-2 flex items-center gap-2">
            <Shield className="w-3 h-3 text-[#b50a0a]" /> Club, Academy & Agency Administration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/organizations?add=true" className="bg-[#b50a0a] hover:bg-black text-white px-6 py-4 rounded-2xl font-black text-[10px] tracking-wide transition-all flex items-center gap-2 shadow-xl shadow-red-900/10 active:scale-95">
            <UserPlus className="w-4 h-4" /> Register Organization
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Link
            key={i}
            href={`/admin/organizations?tab=${stat.tab}&page=1`}
            className={`bg-white p-6 rounded-[2rem] border-2 transition-all duration-300 relative group active:scale-95 ${tab === stat.tab ? 'border-[#b50a0a] shadow-xl shadow-red-900/10' : 'border-gray-100 shadow-sm hover:border-gray-200'}`}
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-gray-400 tracking-wide">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 tracking-tighter mt-1">{stat.value}</p>
          </Link>
        ))}
      </div>

      <RoleDirectoryClient 
        initialData={orgs || []}
        totalCount={filteredTotal || 0}
        currentPage={page}
        pageSize={pageSize}
        roleLabel="Organization"
        roleSlug="organizations"
        iconName="Trophy"
      />
    </div>
  );
}
