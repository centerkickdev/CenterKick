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
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-3.5 sm:space-y-0 sm:flex sm:flex-col lg:flex-row items-stretch sm:items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#b50a0a]/10 text-[#b50a0a] flex items-center justify-center shrink-0">
            <Newspaper className="w-5 h-5 text-[#b50a0a]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
              Blog & News Room
            </h1>
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-wide mt-0.5">
              Manage news, editorials & media assets
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <BlogManagementClient 
            categories={categories || []} 
            tags={tags || []} 
            assets={assets || []} 
          />
          
          <Link 
            href="/admin/blog/new"
            className="group/btn bg-slate-900 text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 hover:bg-[#b50a0a] hover:shadow-md active:scale-95 shrink-0 w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover/btn:rotate-90" />
            <span>Write New Article</span>
          </Link>
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
