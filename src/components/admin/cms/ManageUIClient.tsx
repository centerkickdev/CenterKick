'use client';

import { useState } from 'react';
import { 
  Monitor, Layout, Settings, ChevronRight, 
  Globe, Navigation, Info, Mail, Share2, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { seedSitePages } from '@/app/admin/manage-ui/actions';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

interface Page {
  slug: string;
  name: string;
  layout: string[];
}

interface ManageUIClientProps {
  pages: Page[];
}

export default function ManageUIClient({ pages }: ManageUIClientProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    const res = await seedSitePages();
    if (res.success) {
      showToast('Site pages initialized successfully', 'success');
      router.refresh();
    } else {
      showToast('Failed to initialize pages', 'error');
    }
    setIsSeeding(false);
  };

  const getIcon = (slug: string) => {
    switch (slug) {
      case '/': return <Monitor className="w-8 h-8 text-[#b50a0a]" />;
      case '/about': return <Info className="w-8 h-8 text-[#b50a0a]" />;
      case '/news': return <Globe className="w-8 h-8 text-[#b50a0a]" />;
      case '/contact': return <Mail className="w-8 h-8 text-[#b50a0a]" />;
      case 'navbar': return <Navigation className="w-8 h-8 text-[#b50a0a]" />;
      case 'footer': return <Share2 className="w-8 h-8 text-[#b50a0a]" />;
      default: return <Layout className="w-8 h-8 text-[#b50a0a]" />;
    }
  };

  const getCategory = (slug: string) => {
    if (['navbar', 'footer'].includes(slug)) return 'Global Elements';
    return 'Site Pages';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
           <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
             Site <span className="text-[#b50a0a]">Manager</span>
           </h1>
           <p className="text-gray-900 text-[11px] font-bold tracking-[0.25em] mt-3 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#b50a0a] animate-pulse"></span>
              Full control over frontend layouts and content
           </p>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
           {pages.length === 0 && (
              <button 
                onClick={handleSeed}
                disabled={isSeeding}
                className="bg-black text-white px-6 py-4 rounded-3xl font-black text-[10px] tracking-wide hover:bg-[#b50a0a] transition-all flex items-center gap-2 shadow-xl shadow-gray-200"
              >
                {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                Initialize Default Pages
              </button>
           )}
           <div className="bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100">
              <p className="text-[9px] font-black text-gray-900 tracking-wide mb-1 text-center">Manageable Views</p>
              <p className="text-2xl font-black text-gray-900 tracking-tight text-center">{pages.length}</p>
           </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-50/40 rounded-full blur-[120px]"></div>
      </div>

      {pages.length === 0 && (
        <div className="bg-white p-20 rounded-[3.5rem] border border-gray-100 shadow-sm text-center">
           <Layout className="w-20 h-20 text-gray-100 mx-auto mb-8" />
           <h3 className="text-2xl font-black text-gray-900 tracking-tighter">No manageable pages found</h3>
           <p className="text-gray-900 text-[10px] font-black tracking-wide mt-2 px-12">It seems the database hasn't been initialized with the layout schema yet. Click the button above to seed the default system pages.</p>
        </div>
      )}

      {/* Grid of Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-3 gap-4 md:p-8">
        {pages.map((page) => (
          <Link 
            key={page.slug}
            href={`/admin/manage-ui/${encodeURIComponent(page.slug)}`}
            className="group bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all relative overflow-hidden flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center transition-all group-hover:bg-[#b50a0a] group-hover:text-white mb-6 group-hover:rotate-6 shadow-sm group-hover:shadow-xl">
               {getIcon(page.slug)}
            </div>
            
            <div className="space-y-2">
               <p className="text-[10px] font-black text-[#b50a0a] tracking-wide">{getCategory(page.slug)}</p>
               <h3 className="text-2xl font-black text-gray-900 tracking-tighter group-hover: transition-all">{page.name}</h3>
               <p className="text-[9px] font-bold text-gray-900 tracking-[0.2em]">{page.slug === '/' ? 'Main Entry Point' : page.slug}</p>
            </div>

            <div className="mt-10 w-full pt-8 border-t border-gray-50 flex items-center justify-between">
               <div className="flex -space-x-2">
                  {page.layout.slice(0, 3).map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white"></div>
                  ))}
                  {page.layout.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-black text-white text-[7px] font-bold flex items-center justify-center border-2 border-white">
                       +{page.layout.length - 3}
                    </div>
                  )}
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black text-gray-900 tracking-wide opacity-0 group-hover:opacity-100 transition-all">
                  Customize
                  <ChevronRight className="w-4 h-4 text-[#b50a0a]" />
               </div>
            </div>

            {/* Subtle path indicator */}
            <div className="absolute top-6 right-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <Settings className="w-12 h-12" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
