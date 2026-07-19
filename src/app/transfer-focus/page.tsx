'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

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
            // 1. Fetch active profiles, filtering out admin and superadmin roles
            const { data: profilesData, error: profError } = await supabase
               .from('profiles')
               .select('*')
               .eq('status', 'active')
               .not('role', 'in', '("admin","superadmin")');
            
            if (profError) throw profError;
            setProfiles(profilesData || []);

            // 2. Fetch CMS news
            const { data: newsData, error: newsError } = await supabase
               .from('cms_posts')
               .select('*')
               .eq('is_draft', false)
               .order('published_at', { ascending: false });

            if (newsError) throw newsError;
            setNewsPosts(newsData || []);

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
      if (activeTab === 'FREE AGENT') {
         return filtered.filter(p => p.role === 'player' && (!p.current_club || p.current_club.toLowerCase().includes('free')));
      } else if (activeTab === 'CONTRACT ENDING') {
         return filtered.filter(p => p.role === 'player' && p.current_club && !p.current_club.toLowerCase().includes('free'));
      } else if (activeTab === 'AVAILABLE COACHES') {
         return filtered.filter(p => p.role === 'coach');
      } else if (activeTab === 'SCOUTS') {
         return filtered.filter(p => p.role === 'scout');
      } else if (activeTab === 'ORGANIZATIONS') {
         return filtered.filter(p => p.role === 'organization');
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

   // Divide news posts into Rumors (Transfer Focus category) and Top news
   const rumorsNews = useMemo(() => {
      // Find posts in Transfer Focus / Transfers categories first
      const transferCategoryIds = ['2978eee7-d598-4097-b11a-805a280c7b06', '82ad8313-7dad-451b-86fc-8f22e0d61703'];
      const matched = newsPosts.filter(p => p.category_id && transferCategoryIds.includes(p.category_id));
      if (matched.length === 0) {
         // Fallback to top news
         return newsPosts.slice(0, 3);
      }
      return matched.slice(0, 3);
   }, [newsPosts]);

   const topTransferNews = useMemo(() => {
      // Exclude rumors from top news if possible, or just slice next 3
      const rumorIds = rumorsNews.map(r => r.id);
      const matched = newsPosts.filter(p => !rumorIds.includes(p.id));
      if (matched.length === 0) {
         return newsPosts.slice(3, 6);
      }
      return matched.slice(0, 3);
   }, [newsPosts, rumorsNews]);

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
                  {['FREE AGENT', 'CONTRACT ENDING', 'AVAILABLE COACHES', 'SCOUTS', 'ORGANIZATIONS'].map((tab) => (
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
                                 {activeTab.includes('AGENT') || activeTab.includes('ENDING') ? (
                                    <>
                                       <th className="font-bold text-xs tracking-wide px-8 py-4.5 w-[25%] border-r border-white/10">Player</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[20%] border-r border-white/10">Position</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[15%] text-center border-r border-white/10">Country</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[10%] text-center border-r border-white/10">Age</th>
                                       <th className="font-bold text-xs tracking-wide px-8 py-4.5 w-[30%] text-right">
                                          {activeTab === 'FREE AGENT' ? 'Out of Contract Since' : 'Contract Expiry'}
                                       </th>
                                    </>
                                 ) : activeTab.includes('COACH')  ? (
                                    <>
                                       <th className="font-bold text-xs tracking-wide px-8 py-4.5 w-[30%] border-r border-white/10">Coach / Specialist</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[25%] border-r border-white/10">Preferred Formation</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[15%] text-center border-r border-white/10">Country</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[15%] text-center border-r border-white/10">License</th>
                                       <th className="font-bold text-xs tracking-wide px-8 py-4.5 w-[15%] text-right">Primary Tactics</th>
                                    </>
                                 ) : activeTab === 'SCOUTS' ? (
                                    <>
                                       <th className="font-bold text-xs tracking-wide px-8 py-4.5 w-[30%] border-r border-white/10">Talent Scout</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[25%] border-r border-white/10">Agency Name</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[15%] text-center border-r border-white/10">Country</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[15%] text-center border-r border-white/10">Verification</th>
                                       <th className="font-bold text-xs tracking-wide px-8 py-4.5 w-[15%] text-right">Status</th>
                                    </>
                                 ) : (
                                    <>
                                       <th className="font-bold text-xs tracking-wide px-8 py-4.5 w-[35%] border-r border-white/10">Organization / Academy</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[25%] border-r border-white/10">League / Level</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[15%] text-center border-r border-white/10">Country</th>
                                       <th className="font-bold text-xs tracking-wide px-6 py-4.5 w-[15%] text-center border-r border-white/10">Formation</th>
                                       <th className="font-bold text-xs tracking-wide px-8 py-4.5 w-[10%] text-right">Status</th>
                                    </>
                                 )}
                              </tr>
                           </thead>
                           <tbody>
                              {paginatedProfiles.map((profile) => {
                                 const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous Profile';
                                 const roleSlug = profile.role === 'player' ? 'players' : profile.role === 'coach' ? 'coaches' : 'agents';
                                 
                                 return (
                                    <tr key={profile.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                                       
                                       {/* Render columns dynamically based on selected role tab */}
                                       {activeTab.includes('AGENT') || activeTab.includes('ENDING') ? (
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
                                             <td className="px-6 py-4.5 border-r border-gray-100">
                                                {renderFlags(profile.country)}
                                             </td>
                                             <td className="px-6 py-4.5 text-center border-r border-gray-100">
                                                <span className="font-bold text-sm text-gray-900">{calculateAge(profile.date_of_birth)}</span>
                                             </td>
                                             <td className="px-8 py-4.5 text-right font-bold text-xs text-gray-600">
                                                {activeTab === 'FREE AGENT' ? (
                                                   <span className="text-red-500">Free Agent</span>
                                                ) : (
                                                   <span>{profile.contract_expiry ? new Date(profile.contract_expiry).toLocaleDateString() : 'Ending Soon'}</span>
                                                )}
                                             </td>
                                          </>
                                       ) : activeTab.includes('COACH') ? (
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
                                                <span className="font-bold text-xs text-gray-900 tracking-wide">{profile.tactics?.preferred_formation || profile.formation || '4-3-3 Attacking'}</span>
                                             </td>
                                             <td className="px-6 py-4.5 border-r border-gray-100">
                                                {renderFlags(profile.country)}
                                             </td>
                                             <td className="px-6 py-4.5 text-center border-r border-gray-100">
                                                <span className="font-bold text-xs text-[#b50a0a] tracking-wide">{profile.license || 'UEFA A License'}</span>
                                             </td>
                                             <td className="px-8 py-4.5 text-right font-bold text-xs text-gray-500 tracking-wide">
                                                {profile.tactics?.defense_style || 'Pressing'}
                                             </td>
                                          </>
                                       ) : activeTab === 'SCOUTS' ? (
                                          <>
                                             <td className="px-8 py-4.5 border-r border-gray-100">
                                                <div className="flex items-center gap-4">
                                                   <div className="relative w-10 h-10 rounded-full overflow-hidden border border-blue-500/20 shadow-sm shrink-0">
                                                      <img 
                                                         src={profile.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150"} 
                                                         alt={name} 
                                                         className="w-full h-full object-cover" 
                                                      />
                                                   </div>
                                                   <Link href={`/agents/${profile.slug}`} className="font-bold text-xs text-gray-900 hover:text-[#b50a0a] transition-colors cursor-pointer">
                                                      {name}
                                                   </Link>
                                                </div>
                                             </td>
                                             <td className="px-6 py-4.5 border-r border-gray-100">
                                                <span className="font-bold text-xs text-gray-900 tracking-wide">{profile.agency_name || 'Independent Scout'}</span>
                                             </td>
                                             <td className="px-6 py-4.5 border-r border-gray-100">
                                                {renderFlags(profile.country)}
                                             </td>
                                             <td className="px-6 py-4.5 text-center border-r border-gray-100">
                                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-blue-100">Verified</span>
                                             </td>
                                             <td className="px-8 py-4.5 text-right">
                                                <span className="text-sm font-bold text-emerald-600 tracking-wide">Active</span>
                                             </td>
                                          </>
                                       ) : (
                                          <>
                                             <td className="px-8 py-4.5 border-r border-gray-100">
                                                <div className="flex items-center gap-4">
                                                   <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-500/20 shadow-sm shrink-0">
                                                      <img 
                                                         src={profile.avatar_url || "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=150"} 
                                                         alt={name} 
                                                         className="w-full h-full object-cover" 
                                                      />
                                                   </div>
                                                   <Link href={`/organizations/${profile.slug}`} className="font-bold text-xs text-gray-900 hover:text-[#b50a0a] transition-colors cursor-pointer">
                                                      {name}
                                                   </Link>
                                                </div>
                                             </td>
                                             <td className="px-6 py-4.5 border-r border-gray-100">
                                                <span className="font-bold text-xs text-[#b50a0a] tracking-wide">{profile.league || 'Elite Youth League'}</span>
                                             </td>
                                             <td className="px-6 py-4.5 border-r border-gray-100">
                                                {renderFlags(profile.country)}
                                             </td>
                                             <td className="px-6 py-4.5 text-center border-r border-gray-100">
                                                <span className="font-bold text-xs text-gray-900 tracking-wide">{profile.formation || 'Academy Standard'}</span>
                                             </td>
                                             <td className="px-8 py-4.5 text-right">
                                                <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-amber-100">Partner</span>
                                             </td>
                                          </>
                                       )}
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

               {/* Latest Transfer Rumors News Section */}
               <div className="mt-8">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-6 bg-[#b50a0a]"></div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800">Latest transfer rumors news</h2>
                     </div>
                     <Link href="/news" className="text-xs font-bold text-gray-400 hover:text-[#b50a0a] tracking-wide flex items-center gap-1 transition-colors">
                        SEE ALL <ChevronRight className="w-4 h-4" />
                     </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {rumorsNews.map((news) => (
                        <Link href={`/news/${news.slug}`} key={`rumor-${news.id}`} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-xl transition-all block">
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
                     {rumorsNews.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                           <p className="text-gray-400 text-sm font-bold tracking-wide">No transfer rumors currently published.</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Top Football Transfer News Section */}
               <div className="mt-8 mb-16">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-6 bg-[#b50a0a]"></div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800">Top football transfer news</h2>
                     </div>
                     <Link href="/news" className="text-xs font-bold text-gray-400 hover:text-[#b50a0a] tracking-wide flex items-center gap-1 transition-colors">
                        SEE ALL <ChevronRight className="w-4 h-4" />
                     </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {topTransferNews.map((news) => (
                        <Link href={`/news/${news.slug}`} key={`top-${news.id}`} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-xl transition-all block">
                           <div className="h-[200px] overflow-hidden relative">
                              <img src={news.cover_image_url || 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=600'} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                     {topTransferNews.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                           <p className="text-gray-400 text-sm font-bold tracking-wide">No top transfer articles currently published.</p>
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
