'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { isProfileComplete } from "@/lib/utils/profile";

interface Profile {
   id: string;
   slug?: string;
   first_name?: string;
   last_name?: string;
   role?: string;
   bio?: string;
   position?: string;
   agency_name?: string;
   current_club?: string;
   country?: string;
   date_of_birth?: string;
   avatar_url?: string;
   cover_url?: string;
   cover_image_url?: string;
   gallery_urls?: string[];
   video_links?: string[];
   contract_expiry?: string;
   tactics?: {
      preferred_formation?: string;
      defense_style?: string;
      attacking_approach?: string;
      tactical_philosophy?: string;
   };
   formation?: string;
   license?: string;
   league?: string;
   managerial_history?: any[];
}

interface BlogPost {
   id: string;
   title: string;
   slug: string;
   cover_image_url?: string;
   published_at?: string;
   created_at?: string;
   category_id?: string;
}

// Helper to render flags based on string code
const renderFlags = (countryString?: string) => {
   if (!countryString) return null;
   const codes = countryString.split(',').map(c => c.trim().toLowerCase());
   
   // Map common countries to flag emojis or images
   const flagMap: Record<string, string> = {
      'nigeria': '🇳🇬',
      'ng': '🇳🇬',
      'tanzania': '🇹🇿',
      'tz': '🇹🇿',
      'spain': '🇪🇸',
      'es': '🇪🇸',
      'italy': '🇮🇹',
      'it': '🇮🇹',
      'ghana': '🇬🇭',
      'gh': '🇬🇭',
      'united kingdom': '🇬🇧',
      'uk': '🇬🇧',
      'england': '🇬🇧',
      'senegal': '🇸🇳',
      'sn': '🇸🇳',
      'cameroon': '🇨🇲',
      'cm': '🇨🇲'
   };

   return (
      <div className="flex gap-1 items-center justify-center">
         {codes.map((code, index) => (
            <span key={index} className="text-lg" title={code}>
               {flagMap[code] || '🌍'}
            </span>
         ))}
      </div>
   );
};

const calculateAge = (dobString?: string) => {
   if (!dobString) return "N/A";
   const birthDate = new Date(dobString);
   const today = new Date();
   let age = today.getFullYear() - birthDate.getFullYear();
   const m = today.getMonth() - birthDate.getMonth();
   if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
   }
   return age;
};

export default function TransferFocusPage() {
   const [profiles, setProfiles] = useState<Profile[]>([]);
   const [newsPosts, setNewsPosts] = useState<BlogPost[]>([]);
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState('FREE AGENT');
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCountry, setSelectedCountry] = useState('');
   const [showFilters, setShowFilters] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const pageSize = 10;

   const supabase = createClient();

   useEffect(() => {
      async function fetchData() {
         try {
            const transferCategoryIds = ['2978eee7-d598-4097-b11a-805a280c7b06', '82ad8313-7dad-451b-86fc-8f22e0d61703'];

            // Run queries concurrently for better performance
            const [profilesRes, newsRes] = await Promise.all([
               // 1. Fetch only necessary profile columns for players and coaches
               supabase
                  .from('profiles')
                  .select('id, slug, first_name, last_name, role, position, current_club, country, date_of_birth, avatar_url, cover_url, gallery_urls, video_links, contract_expiry, tactics, formation, license, managerial_history')
                  .eq('status', 'active')
                  .in('role', ['player', 'coach']),

               // 2. Fetch only transfer news, limit to 6, select specific columns
               supabase
                  .from('cms_posts')
                  .select('id, slug, title, cover_image_url, published_at, created_at, category_id')
                  .eq('is_draft', false)
                  .in('category_id', transferCategoryIds)
                  .order('published_at', { ascending: false })
                  .limit(6)
            ]);

            if (profilesRes.error) throw profilesRes.error;
            if (newsRes.error) throw newsRes.error;

            // Only display complete profiles as per public directory rules
            const rawProfiles = profilesRes.data || [];
            const completedProfiles = rawProfiles.filter((p: any) => isProfileComplete(p));

            setProfiles(completedProfiles);
            setNewsPosts(newsRes.data || []);

         } catch (error) {
            console.error("Error fetching transfer focus data:", error);
         } finally {
            setLoading(false);
         }
      }
      fetchData();
   }, []);

   // Get unique list of countries for filter dropdown
   const availableCountries = useMemo(() => {
      const countriesSet = new Set<string>();
      profiles.forEach(p => {
         if (p.country) {
            countriesSet.add(p.country.trim());
         }
      });
      return Array.from(countriesSet).sort();
   }, [profiles]);

   // Categorize and filter profiles based on active tab, search, and country
   const filteredProfiles = useMemo(() => {
      const filtered = profiles.filter(profile => {
         const name = `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase();
         const position = (profile.position || '').toLowerCase();
         const agency = (profile.agency_name || '').toLowerCase();
         const club = (profile.current_club || '').toLowerCase();
         const query = searchQuery.toLowerCase();

         // Match search text
         const matchesSearch = name.includes(query) || 
                              position.includes(query) || 
                              agency.includes(query) || 
                              club.includes(query);

         // Match country filter
         const matchesCountry = !selectedCountry || profile.country === selectedCountry;

         return matchesSearch && matchesCountry;
      });

      // Filter by role-specific logic
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);

      if (activeTab === 'FREE AGENT') {
         // ONLY currently not signed players
         return filtered.filter(p => p.role === 'player' && (!p.current_club || p.current_club.trim() === '' || p.current_club.toLowerCase().includes('free')));
      } else if (activeTab === 'CONTRACT ENDING') {
         // ONLY Players with contract expiring within a year (who are currently signed)
         return filtered.filter(p => {
            if (p.role !== 'player' || !p.contract_expiry) return false;
            // Ensure they are currently signed (not a free agent)
            if (!p.current_club || p.current_club.trim() === '' || p.current_club.toLowerCase().includes('free')) return false;
            
            const expiry = new Date(p.contract_expiry);
            return expiry > now && expiry <= oneYearFromNow;
         });
      } else if (activeTab === 'AVAILABLE COACHES') {
         // ONLY Coaches not signed in a club actively
         return filtered.filter(p => p.role === 'coach' && (!p.current_club || p.current_club.trim() === '' || p.current_club.toLowerCase().includes('free')));
      }

      return filtered;
   }, [profiles, activeTab, searchQuery, selectedCountry]);

   // Reset pagination when tab or filters change
   useEffect(() => {
      setCurrentPage(1);
   }, [activeTab, searchQuery, selectedCountry]);

   // Paginate profiles
   const paginatedProfiles = useMemo(() => {
      const start = (currentPage - 1) * pageSize;
      return filteredProfiles.slice(start, start + pageSize);
   }, [filteredProfiles, currentPage]);

   const totalPages = Math.ceil(filteredProfiles.length / pageSize) || 1;

   // Use the pre-filtered news posts (already limited to 6 from DB)
   const transferNews = useMemo(() => {
      return newsPosts;
   }, [newsPosts]);

   return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
         <Navbar />

         <main className="flex-grow pt-[72px] lg:pt-[76px]">
            {/* Dark Hero Header */}
            <div className="bg-[#1a1a1a] py-8 sm:py-14 px-4 border-b-4 border-[#b50a0a]">
               <div className="max-w-[1200px] mx-auto text-white flex flex-col items-center md:items-start text-center md:text-left">
                  <span className="text-[#b50a0a] text-xs font-bold tracking-[0.3em] mb-2">Live Availability Registry</span>
                  <h1 className="text-3xl sm:text-[44px] font-bold tracking-wide leading-none drop-shadow-md">
                     TRANSFER <span className="text-[#b50a0a]">FOCUS</span>
                  </h1>
                  <p className="text-xs md:text-sm text-gray-400 mt-2 font-semibold tracking-wide">
                     Monitor verified athlete contract status, staff availability, scouts, and academies
                  </p>
               </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="bg-[#2d2d2d] border-b border-gray-800">
               <div className="max-w-[1200px] mx-auto px-4 flex items-center overflow-x-auto no-scrollbar gap-2">
                  {['FREE AGENT', 'CONTRACT ENDING', 'AVAILABLE COACHES'].map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4.5 px-6 text-xs font-bold tracking-wide whitespace-nowrap transition-all relative
 ${activeTab === tab ? 'text-[#ff3b3b]' : 'text-gray-300 hover:text-white'}`}
                     >
                        {tab}
                        {activeTab === tab && (
                           <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#ff3b3b]"></span>
                        )}
                     </button>
                  ))}
               </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 py-6 sm:py-10 flex flex-col gap-6 sm:gap-8">

               {/* Search & Filter Bar */}
               <div className="flex flex-col gap-4">
                  <div className="w-full flex items-center">
                     <div className="relative flex-grow flex items-center">
                        <div className="absolute left-6 z-10 text-[#b50a0a]">
                           <Search className="w-4 h-4" strokeWidth={3} />
                        </div>
                        <input
                           type="text"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           placeholder={`Search ${activeTab.toLowerCase()} by name, position, or club...`}
                           className="w-full pl-14 pr-6 py-4 border border-gray-200 outline-none text-gray-900 font-semibold placeholder-gray-400 text-sm shadow-sm bg-white rounded-l-2xl focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                        />
                     </div>
                     <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className="bg-white border-y border-r border-gray-200 py-4 px-8 flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-colors shadow-sm h-full rounded-r-2xl group border-l"
                     >
                        <SlidersHorizontal className="w-4 h-4 stroke-[2.5] text-gray-500 group-hover:text-red-500" />
                        <span className="ml-2 font-bold text-xs tracking-wide text-gray-500 group-hover:text-red-500">Filters</span>
                     </button>
                  </div>

                  {/* Filter Panel */}
                  {showFilters && (
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl flex flex-wrap gap-4 animate-in fade-in slide-in-from-top-4 duration-350">
                        <div className="flex flex-col min-w-[200px]">
                           <label className="text-xs font-bold text-gray-400 tracking-wide mb-1.5">Country Region</label>
                           <select 
                              value={selectedCountry} 
                              onChange={(e) => setSelectedCountry(e.target.value)}
                              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-red-500"
                           >
                              <option value="">All Countries</option>
                              {availableCountries.map(c => (
                                 <option key={c} value={c}>{c}</option>
                              ))}
                           </select>
                        </div>
                        <div className="flex items-end">
                           <button 
                              onClick={() => { setSelectedCountry(''); setSearchQuery(''); }}
                              className="text-xs font-bold text-[#b50a0a] tracking-wide hover:underline pb-3"
                           >
                              Reset Filters
                           </button>
                        </div>
                     </div>
                  )}
               </div>

               {/* Table Content */}
               <div className="w-full bg-white overflow-hidden shadow-sm border border-gray-100 rounded-3xl">
                  {loading ? (
                     <div className="text-center py-24">
                        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400 text-sm font-bold tracking-wide">Loading verified directory records...</p>
                     </div>
                  ) : filteredProfiles.length === 0 ? (
                     <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 m-6">
                        <User className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-900 font-bold tracking-wide text-sm">No active records found for {activeTab}</p>
                     </div>
                  ) : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                           <thead>
                              <tr className="bg-[#a20000] text-white">
                                 {/* Dynamic Column Headers based on Role */}
                                 {activeTab === 'FREE AGENT' ? (
                                    <>
                                       <th className="font-bold text-xs tracking-wide px-8 py-4.5 w-[30%] border-r border-white/10">Player</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[25%] border-r border-white/10">Position</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[25%] text-center border-r border-white/10">Country</th>
                                       <th className="font-bold text-xs tracking-wide px-8 py-4.5 w-[20%] text-right">Age</th>
                                    </>
                                 ) : activeTab === 'CONTRACT ENDING' ? (
                                    <>
                                       <th className="font-bold text-xs tracking-wide px-8 py-4.5 w-[25%] border-r border-white/10">Player</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[20%] border-r border-white/10">Position</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[10%] text-center border-r border-white/10">Age</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[25%] text-center border-r border-white/10">Current Club</th>
                                       <th className="font-bold text-xs tracking-wide px-8 py-4.5 w-[20%] text-right">Contract Expiry</th>
                                    </>
                                 ) : activeTab.includes('COACH') ? (
                                    <>
                                       <th className="font-bold text-xs tracking-wide px-8 py-4.5 w-[35%] border-r border-white/10">Coach / Specialist</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[35%] border-r border-white/10">Most Recent Club</th>
                                       <th className="font-bold text-xs tracking-wide px-8 py-4.5 w-[30%] text-right">WDL Record</th>
                                    </>
                                 ) : null}
                              </tr>
                           </thead>
                           <tbody>
                              {paginatedProfiles.map((profile) => {
                                 const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous Profile';
                                 const roleSlug = profile.role === 'player' ? 'players' : profile.role === 'coach' ? 'coaches' : 'agents';
                                 
                                 return (
                                    <tr key={profile.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                                       
                                       {/* Render columns dynamically based on selected role tab */}
                                       {activeTab === 'FREE AGENT' ? (
                                          <>
                                             <td className="px-8 py-4.5 border-r border-gray-100">
                                                <div className="flex items-center gap-4">
                                                   <div className="relative w-10 h-10 rounded-full overflow-hidden border border-emerald-500/20 shadow-sm shrink-0">
                                                      <img 
                                                         src={profile.avatar_url || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=150"} 
                                                         alt={name} 
                                                         className="w-full h-full object-cover" 
                                                      />
                                                   </div>
                                                   <Link href={`/${roleSlug}/${profile.slug}`} className="font-bold text-xs text-gray-900 hover:text-[#b50a0a] transition-colors cursor-pointer">
                                                      {name}
                                                   </Link>
                                                </div>
                                             </td>
                                             <td className="px-6 py-4.5 border-r border-gray-100">
                                                <span className="font-bold text-xs text-[#b50a0a] tracking-wide">{profile.position || 'Striker'}</span>
                                             </td>
                                             <td className="px-6 py-4.5 border-r border-gray-100 text-center">
                                                {renderFlags(profile.country)}
                                             </td>
                                             <td className="px-8 py-4.5 text-right font-bold text-xs text-gray-900">
                                                {calculateAge(profile.date_of_birth)}
                                             </td>
                                          </>
                                       ) : activeTab === 'CONTRACT ENDING' ? (
                                          <>
                                             <td className="px-8 py-4.5 border-r border-gray-100">
                                                <div className="flex items-center gap-4">
                                                   <div className="relative w-10 h-10 rounded-full overflow-hidden border border-emerald-500/20 shadow-sm shrink-0">
                                                      <img 
                                                         src={profile.avatar_url || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=150"} 
                                                         alt={name} 
                                                         className="w-full h-full object-cover" 
                                                      />
                                                   </div>
                                                   <Link href={`/${roleSlug}/${profile.slug}`} className="font-bold text-xs text-gray-900 hover:text-[#b50a0a] transition-colors cursor-pointer">
                                                      {name}
                                                   </Link>
                                                </div>
                                             </td>
                                             <td className="px-6 py-4.5 border-r border-gray-100">
                                                <span className="font-bold text-xs text-[#b50a0a] tracking-wide">{profile.position || 'Striker'}</span>
                                             </td>
                                             <td className="px-6 py-4.5 text-center border-r border-gray-100">
                                                <span className="font-bold text-sm text-gray-900">{calculateAge(profile.date_of_birth)}</span>
                                             </td>
                                             <td className="px-6 py-4.5 border-r border-gray-100 text-center">
                                                <span className="font-bold text-xs text-gray-600 tracking-wide">{profile.current_club}</span>
                                             </td>
                                             <td className="px-8 py-4.5 text-right font-bold text-xs text-gray-600">
                                                <span>{profile.contract_expiry ? new Date(profile.contract_expiry).toLocaleDateString() : 'Ending Soon'}</span>
                                             </td>
                                          </>
                                       ) : activeTab.includes('COACH') ? (
                                          <>
                                             {(() => {
                                                const history = profile.managerial_history || [];
                                                // Sort by date descending assuming they have dates, or just take the last element
                                                const recentClubEntry = history.length > 0 ? history[history.length - 1] : null;
                                                const recentClub = recentClubEntry ? recentClubEntry.club : (profile.current_club || 'N/A');
                                                
                                                const w = history.reduce((acc: number, curr: any) => acc + (curr.wins || 0), 0);
                                                const d = history.reduce((acc: number, curr: any) => acc + (curr.draws || 0), 0);
                                                const l = history.reduce((acc: number, curr: any) => acc + (curr.losses || 0), 0);
                                                
                                                return (
                                                   <>
                                                      <td className="px-8 py-4.5 border-r border-gray-100">
                                                         <div className="flex items-center gap-4">
                                                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-500/20 shadow-sm shrink-0">
                                                               <img 
                                                                  src={profile.avatar_url || "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=150"} 
                                                                  alt={name} 
                                                                  className="w-full h-full object-cover" 
                                                               />
                                                            </div>
                                                            <Link href={`/coaches/${profile.slug}`} className="font-bold text-xs text-gray-900 hover:text-[#b50a0a] transition-colors cursor-pointer">
                                                               {name}
                                                            </Link>
                                                         </div>
                                                      </td>
                                                      <td className="px-6 py-4.5 border-r border-gray-100">
                                                         <span className="font-bold text-xs text-gray-900 tracking-wide">{recentClub}</span>
                                                      </td>
                                                      <td className="px-8 py-4.5 text-right font-bold text-xs tracking-wide">
                                                         <span className="text-green-600">{w}W</span> / <span className="text-gray-500">{d}D</span> / <span className="text-red-600">{l}L</span>
                                                      </td>
                                                   </>
                                                )
                                             })()}
                                          </>
                                       ) : null}
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>
                  )}

                  {/* Pagination */}
                  {filteredProfiles.length > pageSize && (
                     <div className="flex items-center justify-center gap-6 py-8 border-t border-gray-100">
                        <button 
                           onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                           disabled={currentPage === 1}
                           className="text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-30"
                        >
                           <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                           {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                              <button 
                                 key={p} 
                                 onClick={() => setCurrentPage(p)}
                                 className={`w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center transition-all ${
 currentPage === p ? 'bg-[#b50a0a] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
 }`}
                              >
                                 {p}
                              </button>
                           ))}
                        </div>
                        <button 
                           onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                           disabled={currentPage === totalPages}
                           className="text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-30"
                        >
                           <ChevronRight className="w-5 h-5" />
                        </button>
                     </div>
                  )}
               </div>

               {/* Transfer News Section */}
               <div className="mt-8 mb-16">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-6 bg-[#b50a0a]"></div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800">Latest transfer news</h2>
                     </div>
                     <Link href="/news" className="text-xs font-bold text-gray-400 hover:text-[#b50a0a] tracking-wide flex items-center gap-1 transition-colors">
                        SEE ALL <ChevronRight className="w-4 h-4" />
                     </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {transferNews.map((news) => (
                        <Link href={`/news/${news.slug}`} key={`news-${news.id}`} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-xl transition-all block">
                           <div className="h-[200px] overflow-hidden relative">
                              <img src={news.cover_image_url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600'} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           </div>
                           <div className="p-6 relative">
                              <div className="absolute top-0 left-6 w-[30px] h-[3px] bg-[#b50a0a]"></div>
                              <h3 className="font-bold text-sm text-gray-900 leading-snug mb-4 group-hover:text-[#b50a0a] transition-colors line-clamp-2 tracking-tighter">
                                 {news.title}
                              </h3>
                              <span className="text-xs font-bold text-gray-400 tracking-wide">{new Date(news.published_at || news.created_at || '').toLocaleDateString()}</span>
                           </div>
                        </Link>
                     ))}
                     {transferNews.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                           <p className="text-gray-400 text-sm font-bold tracking-wide">No transfer news currently published.</p>
                        </div>
                     )}
                  </div>
               </div>

            </div>

         </main>
         <Footer />
      </div>
   );
}
