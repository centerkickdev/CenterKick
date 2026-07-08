import { createClient } from '@/lib/supabase/server';
import { PlusCircle, Edit3, Trash2, FileText, Globe, Clock, Activity, ChevronRight, Newspaper } from 'lucide-react';
import Link from 'next/link';
import BlogManagementClient from '@/components/admin/blog/BlogManagementClient';
import BlogListClient from '@/components/admin/blog/BlogListClient';

// Force Next.js compilation cache refresh trigger - v7
export default async function BlogDashboard({ 
  searchParams 
}: { 
  searchParams: Promise<{ status?: string }> 
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  
  const query = supabase
    .from('cms_posts')
    .select('*, author:users(email), category:blog_categories(name)');
    
  if (status === 'draft') {
    query.is('published_at', null);
  } else if (status === 'published') {
    query.not('published_at', 'is', null);
  }

  const { data: posts } = await query.order('created_at', { ascending: false });

  const { data: categories } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name');

  const { data: tags } = await supabase
    .from('blog_tags')
    .select('*')
    .order('name');

  const { data: assets } = await supabase
    .from('blog_assets')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="relative overflow-hidden bg-white rounded-[3rem] p-12 border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] group">
        <div className="absolute top-0 right-0 w-full max-w-[400px] h-[400px] bg-[#b50a0a]/5 rounded-full blur-[100px] -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-[#b50a0a]/10"></div>
        
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:p-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                <span className="w-1.5 h-1.5 bg-[#b50a0a] rounded-full"></span>
                <span className="text-xs font-bold tracking-[0.2em] text-slate-400">Content Management</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-none text-slate-900">
                Blog <span className="text-[#b50a0a]">&</span> <br />News Room
              </h1>
            </div>

            <div className="max-w-xs">
                <p className="text-slate-400 text-xs font-bold tracking-[0.15em] leading-relaxed border-l border-slate-200 pl-4 py-1">
                  Professional football insights and platform updates managed through a unified control center.
                </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-6 pt-10 border-t border-slate-50">
            <div className="flex-1 flex flex-wrap gap-3">
              <BlogManagementClient 
                categories={categories || []} 
                tags={tags || []} 
                assets={assets || []} 
              />
            </div>
            
            <Link 
              href="/admin/blog/new"
              className="group/btn relative bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-xs tracking-[0.15em] transition-all duration-500 flex items-center gap-4 hover:bg-[#b50a0a] hover:shadow-xl hover:shadow-red-900/20 active:scale-95 overflow-hidden"
            >
              <PlusCircle className="w-5 h-5 transition-transform duration-500 group-hover/btn:rotate-90" />
              <span>Write New Article</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Minimal Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Content', 
            value: (posts?.length || 0), 
            icon: Newspaper,
          },
          { 
            label: 'Public Articles', 
            value: (posts?.filter(p => p.published_at).length || 0), 
            icon: Globe,
            href: '/admin/blog?status=published',
            active: status === 'published'
          },
          { 
            label: 'Draft Content', 
            value: (posts?.filter(p => !p.published_at).length || 0), 
            icon: FileText,
            href: '/admin/blog?status=draft',
            active: status === 'draft'
          },
          { 
            label: 'Media Assets', 
            value: (assets?.length || 0), 
            icon: Activity,
          },
        ].map((stat, i) => {
          const Content = (
            <div className={`group relative p-6 rounded-2xl border transition-all duration-300 ${
 stat.active ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 hover:border-slate-200 text-slate-900'
 }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-bold tracking-[0.2em] mb-1 ${
 stat.active ? 'text-slate-400' : 'text-slate-400'
 }`}>
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold tracking-tighter leading-none">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
 stat.active ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-300 group-hover:bg-slate-100 group-hover:text-slate-900'
 }`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );

          return stat.href ? (
            <Link key={i} href={stat.href}>{Content}</Link>
          ) : (
            <div key={i}>{Content}</div>
          );
        })}
      </div>

      {status && (
        <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-[#b50a0a] animate-pulse"></div>
             <p className="text-xs font-bold tracking-wide text-gray-900">
                Showing <span className="text-[#b50a0a]">{status}</span> articles only
             </p>
          </div>
          <Link 
            href="/admin/blog"
            className="text-xs font-bold tracking-wide text-gray-400 hover:text-black transition-colors flex items-center gap-2"
          >
             Clear Filter
             <span className="w-5 h-5 bg-gray-50 rounded-full flex items-center justify-center">Ã—</span>
          </Link>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <BlogListClient initialPosts={posts || []} />
      </div>
    </div>
  );
}
