'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, Newspaper, Star, ArrowRight, Tag as TagIcon, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { DateDisplay } from '@/components/common/DateDisplay';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  cover_image_url?: string;
  published_at: string;
  is_draft: boolean;
  category_id?: string;
  category?: { name: string };
  post_tags?: { tag_id: string }[];
}

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface BlogFeedClientProps {
  layout: string[];
  siteContent: Record<string, any>;
  initialPosts: BlogPost[];
  categories: Category[];
  tags: Tag[];
  navContent?: Record<string, any>;
  footerContent?: Record<string, any>;
  siteSettings?: Record<string, any>;
}

export default function BlogFeedClient({ layout, siteContent, initialPosts, categories, tags, navContent, footerContent, siteSettings }: BlogFeedClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 1024 ? 15 : 30);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, selectedTag]);

  const filteredPosts = useMemo(() => {
    return initialPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || post.category_id === selectedCategory;
      const matchesTag = !selectedTag || post.post_tags?.some((pt: { tag_id: string }) => pt.tag_id === selectedTag);
      
      return matchesSearch && matchesCategory && matchesTag && !post.is_draft;
    });
  }, [initialPosts, searchQuery, selectedCategory, selectedTag]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / itemsPerPage));
  const paginatedPosts = useMemo(() => {
    return filteredPosts.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [filteredPosts, page, itemsPerPage]);

  const latestPosts = useMemo(() => initialPosts.slice(0, 3), [initialPosts]);

  const renderSection = (key: string) => {
    switch (key) {
      case 'header':
        const header = siteContent.header || { title: "Centerkick News", subtitle: "Exclusive updates, transfer focus, and match highlights." };
        return (
          <div key={key} className="bg-gradient-to-b from-gray-50 to-white py-16 lg:py-24 border-b border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-gray-100/50 to-transparent pointer-events-none" />
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#b50a0a]/5 rounded-full blur-3xl pointer-events-none" />
             
             <div className="max-w-[1200px] mx-auto px-4 lg:px-0 relative z-10 flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-[#b50a0a] text-xs font-bold tracking-[0.2em] mb-6">
                   <span className="w-1.5 h-1.5 rounded-full bg-[#b50a0a] animate-pulse" />
                   Live Updates
                </div>
                <h1 className="text-gray-900 text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9]">
                   {header.title?.split(' ')[0]} <span className="text-[#b50a0a]">{header.title?.split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className="text-gray-500 text-base md:text-base font-bold mt-6 max-w-xl mx-auto">{header.subtitle}</p>
             </div>
          </div>
        );
      case 'featured':
        if (latestPosts.length === 0 || selectedTag || selectedCategory) return null;
        return (
          <section key={key} className="max-w-[1200px] mx-auto px-4 lg:px-0 mb-16 animate-in fade-in duration-1000 mt-12">
             <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 rounded-full bg-[#b50a0a] flex items-center justify-center shadow-lg shadow-red-900/10"><Star className="w-5 h-5 text-white" /></div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Featured Stories</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:p-8">
                {latestPosts.map((post) => (
                   <Link href={`/news/${post.slug}`} key={post.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col h-full">
                      <div className="h-64 overflow-hidden relative">
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
                         <img src={post.cover_image_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800'} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wide text-gray-900 z-20">
                            {post.category?.name || 'News'}
                         </div>
                      </div>
                      <div className="p-4 md:p-8 flex flex-col flex-1 justify-between">
                         <h3 className="font-bold text-gray-900 text-xl leading-tight mb-4 group-hover:text-[#b50a0a] transition-colors line-clamp-2 tracking-tighter">{post.title}</h3>
                         <div className="flex items-center gap-2 text-gray-400">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            <DateDisplay date={post.published_at} className="text-xs font-bold tracking-wide" />
                         </div>
                      </div>
                   </Link>
                ))}
             </div>
          </section>
        );
      case 'feed':
        return (
          <div key={key} className="space-y-8">
            <div className="sticky top-[88px] z-40 bg-white/95 backdrop-blur-md py-4 transition-all">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <button 
                        onClick={() => setShowFilters(!showFilters)} 
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${showFilters ? 'bg-black text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                     >
                        <Filter className="w-4 h-4" />
                        {showFilters ? 'Hide Filters' : 'Filter / Search'}
                     </button>
                     {(selectedCategory || selectedTag || searchQuery) && (
                        <div className="hidden md:flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-[#b50a0a] animate-pulse"></span>
                           <span className="text-xs font-bold text-gray-400 tracking-wide">Active Filters</span>
                        </div>
                     )}
                  </div>
                  <div className="text-xs font-bold tracking-wide text-gray-400 hidden sm:block">
                     Showing {paginatedPosts.length} of {filteredPosts.length} Articles
                  </div>
               </div>

               {showFilters && (
                  <div className="max-w-[1200px] mx-auto px-4 lg:px-0 pt-6 mt-4 border-t border-gray-100 animate-in slide-in-from-top-4 duration-300">
                     <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden w-full md:w-auto">
                           <button onClick={() => { setSelectedCategory(null); setSelectedTag(null); }} className={`text-xs font-bold tracking-wide px-4 py-2 rounded-full transition-all whitespace-nowrap ${!selectedCategory && !selectedTag ? 'bg-[#b50a0a] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}>All Feed</button>
                           {categories.map(cat => (
                              <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setSelectedTag(null); }} className={`text-xs font-bold tracking-wide px-4 py-2 rounded-full transition-all whitespace-nowrap ${selectedCategory === cat.id ? 'bg-[#b50a0a] text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}>{cat.name}</button>
                           ))}
                        </div>
                        <div className="relative w-full md:w-full max-w-[400px]">
                           <input type="text" placeholder="Search articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] transition-all placeholder:text-gray-300" />
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        </div>
                     </div>
                     <div className="flex items-center gap-3 mt-6 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                        <span className="text-xs font-bold text-gray-300 tracking-wide shrink-0">Popular Tags:</span>
                        {tags.map((tag: Tag) => (
                           <button key={tag.id} onClick={() => { setSelectedTag(selectedTag === tag.id ? null : tag.id); setSelectedCategory(null); }} className={`text-xs font-bold tracking-wide px-3 py-1 rounded-lg border transition-all whitespace-nowrap flex items-center gap-1 ${selectedTag === tag.id ? 'bg-black border-black text-white' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}>
                              <TagIcon className="w-2.5 h-2.5" /> {tag.name}
                           </button>
                        ))}
                     </div>
                  </div>
               )}
            </div>
            <div className="max-w-[1200px] mx-auto px-4 lg:px-0 pb-20 mt-8">
               {(selectedCategory || selectedTag) && (
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-10">
                     {selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.name} Archive` : `Tag: ${tags.find(t => t.id === selectedTag)?.name}`}
                  </h2>
               )}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:p-8">
                  {paginatedPosts.length === 0 ? (
                     <div className="col-span-1 md:col-span-3 py-20 text-center bg-gray-50 rounded-[40px] border border-gray-100">
                        <Newspaper className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-xs font-bold text-gray-400 tracking-wide">No articles found matching your criteria.</p>
                        <button onClick={() => { setSelectedCategory(null); setSelectedTag(null); setSearchQuery(''); }} className="mt-6 text-[#b50a0a] text-xs font-bold tracking-wide hover:underline">Clear all filters</button>
                     </div>
                  ) : (
                     paginatedPosts.map((post) => (
                        <Link href={`/news/${post.slug}`} key={post.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">
                           <div className="h-44 overflow-hidden relative">
                              <div className="absolute inset-0 bg-black/10 group-hover:opacity-0 transition-opacity z-10" />
                              <img src={post.cover_image_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800'} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           </div>
                           <div className="p-6 flex flex-col flex-1 justify-between">
                              <h3 className="font-bold text-gray-900 text-sm leading-snug mb-4 group-hover:text-[#b50a0a] transition-colors line-clamp-2 tracking-tighter">{post.title}</h3>
                              <div className="flex items-center justify-between">
                                 <DateDisplay date={post.published_at} className="text-xs font-bold text-gray-400 tracking-wide" />
                                 <span className="text-xs font-bold text-[#b50a0a] tracking-wide group-hover:translate-x-1 transition-transform flex items-center gap-1">Read Article <ArrowRight className="w-3 h-3" /></span>
                              </div>
                           </div>
                        </Link>
                     ))
                  )}
               </div>

               {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-2">
                     <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                     >
                        <ChevronLeft className="w-5 h-5" />
                     </button>
                     
                     <div className="flex items-center gap-1 px-4">
                        {[...Array(totalPages)].map((_, i) => (
                           <button
                              key={i}
                              onClick={() => setPage(i + 1)}
                              className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${page === i + 1 ? 'bg-[#b50a0a] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                           >
                              {i + 1}
                           </button>
                        ))}
                     </div>

                     <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                     >
                        <ChevronRight className="w-5 h-5" />
                     </button>
                  </div>
               )}
            </div>
          </div>
        );
      default: return null;
    }
  };
   return (
    <div className="space-y-0 min-h-screen bg-white selection:bg-red-50">
      <Navbar content={navContent} settings={siteSettings} />
      <div className="pt-20">
         {layout.map(key => renderSection(key))}
      </div>
      <Footer content={footerContent} settings={siteSettings} />
    </div>
  );
}
