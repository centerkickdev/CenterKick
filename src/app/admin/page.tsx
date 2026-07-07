import { 
  Users, Shield, Star, FileText, ChevronRight, Activity, TrendingUp, 
  CreditCard, Globe, ArrowUpRight, ArrowDownRight, Search, Settings,
  BookOpen, Newspaper, PlusCircle, Image, Edit3
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  // 1. Fetch current user and determine role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  let role: string | null = user.app_metadata?.role ?? null;
  if (!role) {
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    role = userRecord?.role ?? null;
  }

  const isBlogger = role === 'blogger';

  // 2. Conditional data loading and view rendering for Blogger role
  if (isBlogger) {
    const [
      { count: totalPosts },
      { count: publishedPosts },
      { count: draftPosts },
      { count: mediaAssets },
      { data: recentPosts }
    ] = await Promise.all([
      supabase.from('cms_posts').select('*', { count: 'exact', head: true }),
      supabase.from('cms_posts').select('*', { count: 'exact', head: true }).not('published_at', 'is', null),
      supabase.from('cms_posts').select('*', { count: 'exact', head: true }).is('published_at', null),
      supabase.from('blog_assets').select('*', { count: 'exact', head: true }),
      supabase.from('cms_posts')
        .select('*, author:users(email), category:blog_categories(name)')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    const bloggerStats = [
      { label: 'Total Content', value: totalPosts || 0, icon: Newspaper, path: '/admin/blog', color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Public Articles', value: publishedPosts || 0, icon: Globe, path: '/admin/blog?status=published', color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Draft Content', value: draftPosts || 0, icon: FileText, path: '/admin/blog?status=draft', color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Media Assets', value: mediaAssets || 0, icon: Image, path: '/admin/blog', color: 'text-[#b50a0a]', bg: 'bg-red-50' },
    ];

    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">CMS <span className="text-[#b50a0a]">Workspace</span></h1>
             <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] mt-2 flex items-center gap-2">
                <Globe className="w-3 h-3 text-[#b50a0a]" /> Blogger Control Active
             </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black text-gray-900 tracking-wide">Snapshot Date</p>
                <p className="text-[9px] font-bold text-gray-400">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
             </div>
             <Link href="/admin/blog/new" className="bg-[#b50a0a] hover:bg-black text-white px-6 py-3 rounded-xl font-black text-[9px] tracking-wide transition-all flex items-center gap-2 shadow-md">
                <PlusCircle className="w-4 h-4" /> Write New Article
             </Link>
          </div>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bloggerStats.map((stat, i) => (
            <Link key={i} href={stat.path} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-lg hover:shadow-gray-200/40 transition-all duration-500">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-gray-400 tracking-wide">{stat.label}</p>
                 <div className="flex items-end justify-between">
                    <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{stat.value}</p>
                    <ArrowUpRight className="w-3 h-3 text-gray-300 group-hover:text-[#b50a0a] transition-colors" />
                 </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Middle Section: Trends & Recent Work */}
        <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-4 md:p-8">
           {/* Engagement Glance */}
           <div className="lg:col-span-2 bg-gray-900 rounded-[2rem] p-4 md:p-8 text-white relative overflow-hidden shadow-2xl shadow-gray-400/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#b50a0a] rounded-full blur-[120px] opacity-10 -mr-32 -mt-32"></div>
              
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h2 className="text-[9px] font-black text-[#b50a0a] tracking-[0.3em]">CMS Performance Glance</h2>
                       <p className="text-xl font-black mt-1">Estimated Readership</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-white/20" />
                 </div>

                 <div className="flex items-end gap-10">
                    <div>
                       <p className="text-[8px] font-black text-gray-500 tracking-wide mb-2">Simulated Views to Date</p>
                       <p className="text-4xl font-black tracking-tighter leading-none">4,820<span className="text-base text-[#b50a0a]"> reads</span></p>
                    </div>
                    <div className="pb-1">
                       <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                          <ArrowUpRight className="w-3 h-3 text-green-500" />
                          <span className="text-[9px] font-black tracking-wide">Growth 15%</span>
                       </div>
                    </div>
                 </div>

                 {/* Simulated Chart Bars */}
                 <div className="mt-12 flex items-end justify-between h-24 gap-3">
                    {[20, 35, 50, 45, 65, 55, 80, 75, 90, 85, 95, 100].map((h, i) => (
                      <div key={i} className="flex-1 group relative">
                         <div 
                           className="w-full bg-white/10 rounded-t-lg transition-all duration-1000 group-hover:bg-[#b50a0a] hover:h-full cursor-pointer"
                           style={{ height: `${h}%` }}
                         ></div>
                      </div>
                    ))}
                 </div>
                 <div className="mt-4 flex items-center justify-between text-[8px] font-black text-gray-600 tracking-wide px-1">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                 </div>
              </div>
           </div>

           {/* Quick Tools Card */}
           <div className="bg-white rounded-[2rem] p-4 md:p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                 <h2 className="text-[9px] font-black text-gray-400 tracking-[0.2em] mb-6 font-bold">CMS Operations</h2>
                 <div className="space-y-4">
                    {[
                      { label: 'View CMS Desk', desc: 'Articles listing & status controls', href: '/admin/blog', icon: BookOpen },
                      { label: 'Create Article', desc: 'Add new football insights', href: '/admin/blog/new', icon: PlusCircle },
                      { label: 'Media Library', desc: 'Manage images & visual assets', href: '/admin/blog', icon: Image },
                      { label: 'Public Feed', desc: 'Preview live updates & news', href: '/news', icon: Globe },
                    ].map((tool, i) => (
                      <Link key={i} href={tool.href} className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-[#b50a0a]/5 hover:border-[#b50a0a]/20 border border-transparent rounded-2xl transition-all group">
                         <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#b50a0a] transition-all shrink-0">
                            <tool.icon className="w-4 h-4" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black tracking-tight text-gray-900">{tool.label}</p>
                            <p className="text-[8px] font-bold text-gray-400 mt-0.5">{tool.desc}</p>
                         </div>
                      </Link>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Section: Recent Articles */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-4 md:p-8 space-y-6">
           <div>
              <h2 className="text-[12px] font-black text-gray-900 tracking-wide leading-none">Your Recent Publications</h2>
              <p className="text-[9px] font-bold text-gray-400 tracking-wide mt-2">Quick access to recently created articles and drafts.</p>
           </div>
           
           <div className="divide-y divide-gray-100">
              {recentPosts && recentPosts.length > 0 ? (
                recentPosts.map((post: any) => (
                  <div key={post.id} className="py-4 flex items-center justify-between group first:pt-0 last:pb-0">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                           <FileText className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="font-bold text-gray-900 text-sm line-clamp-1">{post.title}</p>
                           <p className="text-[8px] text-gray-400 font-black tracking-wide mt-1">
                              Category: {post.category?.name || 'Uncategorized'} &bull; Author: {post.author?.email || 'System'}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black tracking-wide ${
 post.published_at ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
 }`}>
                           {post.published_at ? 'Published' : 'Draft'}
                        </span>
                        <Link href={`/admin/blog/edit/${post.id}`} className="p-2.5 bg-gray-50 hover:bg-[#b50a0a] hover:text-white rounded-lg text-gray-400 transition-colors">
                           <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                     </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-400 text-sm font-medium">
                   No articles found. Start writing to see your publications here.
                </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  // 3. Platform stats for System Admins
  const [
    { count: totalUsersCount },
    { count: pendingRequestsCount },
    { count: approvedProfilesCount },
    { count: blogPostsCount },
    { data: roleSubData }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('cms_posts').select('*', { count: 'exact', head: true }),
    // Fetch counts for specific roles and statuses
    supabase
      .from('profiles')
      .select('status, users(role)')
  ]);

  // Process sub counts
  const getSubCount = (role: string, status: string) => {
    return (roleSubData as Record<string, any>[])?.filter((p: Record<string, any>) => {
      const userRole = Array.isArray(p.users) ? p.users[0]?.role : p.users?.role;
      return userRole === role && p.status === status;
    }).length || 0;
  };

  const dashboardStats = [
    { label: 'Users', value: totalUsersCount || 0, icon: Users, path: '/admin/users', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Requests', value: pendingRequestsCount || 0, icon: Shield, path: '/admin/approvals', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Approved Profiles', value: approvedProfilesCount || 0, icon: Star, path: '/admin/users', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Blog Posts', value: blogPostsCount || 0, icon: FileText, path: '/admin/blog', color: 'text-[#b50a0a]', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">System <span className="text-[#b50a0a]">Overview</span></h1>
           <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] mt-2 flex items-center gap-2">
              <Globe className="w-3 h-3 text-[#b50a0a]" /> Global Mission Control Active
           </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black text-gray-900 tracking-wide">Snapshot Date</p>
              <p className="text-[9px] font-bold text-gray-400">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
           </div>
           <Link href="/admin/settings" className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
              <Activity className="w-4 h-4 text-gray-400" />
           </Link>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, i) => (
          <Link key={i} href={stat.path} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-lg hover:shadow-gray-200/40 transition-all duration-500">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
               <p className="text-[9px] font-black text-gray-400 tracking-wide">{stat.label}</p>
               <div className="flex items-end justify-between">
                  <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{stat.value}</p>
                  <ArrowUpRight className="w-3 h-3 text-gray-300 group-hover:text-[#b50a0a] transition-colors" />
               </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Middle Section: Trends & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-4 md:p-8">
         {/* Financial Glance */}
         <div className="lg:col-span-2 bg-gray-900 rounded-[2rem] p-4 md:p-8 text-white relative overflow-hidden shadow-2xl shadow-gray-400/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#b50a0a] rounded-full blur-[120px] opacity-10 -mr-32 -mt-32"></div>
            
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-8">
                  <div>
                     <h2 className="text-[9px] font-black text-[#b50a0a] tracking-[0.3em]">Financial Statistics</h2>
                     <p className="text-xl font-black mt-1">Total Revenue</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-white/20" />
               </div>

               <div className="flex items-end gap-10">
                  <div>
                     <p className="text-[8px] font-black text-gray-500 tracking-wide mb-2">Earnings to date</p>
                     <p className="text-4xl font-black tracking-tighter leading-none">$14,280<span className="text-base text-[#b50a0a]">.00</span></p>
                  </div>
                  <div className="pb-1">
                     <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                        <ArrowUpRight className="w-3 h-3 text-green-500" />
                        <span className="text-[9px] font-black tracking-wide">Growth 24%</span>
                     </div>
                  </div>
               </div>

               {/* Simulated Chart Bars */}
               <div className="mt-12 flex items-end justify-between h-24 gap-3">
                  {[40, 65, 45, 90, 60, 85, 100, 75, 55, 80, 70, 95].map((h, i) => (
                    <div key={i} className="flex-1 group relative">
                       <div 
                         className={`w-full bg-white/10 rounded-t-lg transition-all duration-1000 group-hover:bg-[#b50a0a] hover:h-full cursor-pointer`}
                         style={{ height: `${h}%` }}
                       ></div>
                    </div>
                  ))}
               </div>
               <div className="mt-4 flex items-center justify-between text-[8px] font-black text-gray-600 tracking-wide px-1">
                  <span>Jan</span>
                  <span>Jul</span>
                  <span>Dec</span>
               </div>
            </div>
         </div>

         {/* Subscriptions Card */}
         <div className="bg-white rounded-[2rem] p-4 md:p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
               <h2 className="text-[9px] font-black text-gray-400 tracking-[0.2em] mb-6">User Subscriptions</h2>
               <div className="space-y-5">
                  {[
                    { type: 'Players', subscribed: getSubCount('player', 'active'), unsubscribed: getSubCount('player', 'pending') },
                    { type: 'Coaches', subscribed: getSubCount('coach', 'active'), unsubscribed: getSubCount('coach', 'pending') },
                    { type: 'Agents', subscribed: getSubCount('agent', 'active'), unsubscribed: getSubCount('agent', 'pending') },
                    { type: 'Scouts', subscribed: getSubCount('scout', 'active'), unsubscribed: getSubCount('scout', 'pending') },
                    { type: 'Orgs', subscribed: getSubCount('organization', 'active'), unsubscribed: getSubCount('organization', 'pending') },
                  ].map((sub, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-2xl space-y-3">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black tracking-tight text-gray-900">{sub.type}</span>
                          <span className="text-[9px] font-black text-[#b50a0a] tracking-wide">{sub.subscribed + sub.unsubscribed} Total</span>
                       </div>
                       <div className="flex gap-4">
                          <div className="flex-1">
                             <p className="text-[8px] font-bold text-gray-400">Subscribed</p>
                             <p className="text-base font-black text-gray-900">{sub.subscribed}</p>
                          </div>
                          <div className="flex-1 border-l border-gray-200 pl-4">
                             <p className="text-[8px] font-bold text-gray-400">Unsubscribed</p>
                             <p className="text-base font-black text-gray-400">{sub.unsubscribed}</p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            <Link href="/admin/payments" className="mt-8 group flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-[#b50a0a] transition-all">
               <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span className="text-[10px] font-black tracking-wide text-gray-900 group-hover:text-white transition-colors">Manage Subscriptions</span>
               </div>
               <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
         </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Role Management', desc: 'Admins & Staff Access', path: '/admin/roles', icon: Shield },
           { label: 'Platform Settings', desc: 'Global configuration', path: '/admin/settings', icon: Settings },
           { label: 'System Audit', desc: 'Activity & Event Logs', path: '/admin/logs', icon: Activity },
         ].map((tool, i) => (
           <Link key={i} href={tool.path} className="flex items-center gap-5 p-6 bg-white border border-gray-100 rounded-3xl hover:border-[#b50a0a] hover:shadow-xl hover:shadow-red-900/5 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-[#b50a0a] transition-all">
                 <tool.icon className="w-4 h-4" />
              </div>
              <div>
                 <p className="text-[10px] font-black tracking-tight text-gray-900">{tool.label}</p>
                 <p className="text-[9px] font-bold text-gray-400 mt-0.5">{tool.desc}</p>
              </div>
           </Link>
         ))}
      </div>
    </div>
  );
}
