'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, ChevronDown, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ScoutsPage() {
   const [scouts, setScouts] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCountry, setSelectedCountry] = useState('');

   const supabase = createClient();

   useEffect(() => {
      async function fetchScouts() {
         try {
            const { data, error } = await supabase
               .from('profiles')
               .select('*')
               .eq('role', 'scout')
               .eq('status', 'active')
               .not('role', 'in', '("admin","superadmin")')
               .order('created_at', { ascending: false });

            if (error) throw error;
            setScouts(data || []);
         } catch (err) {
            console.error('Error fetching scouts:', err);
         } finally {
            setLoading(false);
         }
      }
      fetchScouts();
   }, []);

   // Get unique list of countries for filter dropdown
   const availableCountries = useMemo(() => {
      const countriesSet = new Set<string>();
      scouts.forEach(s => {
         if (s.country) {
            countriesSet.add(s.country.trim());
         }
      });
      return Array.from(countriesSet).sort();
   }, [scouts]);

   // Filter scouts based on search and country
   const filteredScouts = useMemo(() => {
      return scouts.filter(s => {
         if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const fullName = `${s.first_name || ''} ${s.last_name || ''} ${s.full_name || ''}`.toLowerCase();
            const agency = (s.agency_name || '').toLowerCase();
            if (!fullName.includes(query) && !agency.includes(query)) {
               return false;
            }
         }
         if (selectedCountry && s.country !== selectedCountry) {
            return false;
         }
         return true;
      });
   }, [scouts, searchQuery, selectedCountry]);

   return (
      <div className="min-h-screen bg-white">
         <Navbar />

         <main className="pt-32">
            {/* Split Hero Section */}
            <div className="bg-gray-50 py-16">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0 flex flex-col lg:flex-row items-center gap-12">
                  <div className="w-full lg:w-1/2">
                     <span className="text-[#a20000] font-bold text-xs uppercase tracking-[0.2em] mb-4 block">Talent Identifiers</span>
                     <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-6 uppercase tracking-tight">
                        Spot <br />
                        <span className="text-[#a20000]">Elite Talent</span>
                     </h1>
                     <p className="text-gray-900 text-lg leading-relaxed mb-8 max-w-lg">
                        Connect with certified scouts and talent identifiers. Our verified network of scouting professionals covers grassroots to professional tiers to find the next generation of football stars.
                     </p>
                     <Link href="/register">
                        <button className="bg-[#a20000] hover:bg-[#8a0000] text-white px-8 py-4 rounded-lg font-bold uppercase tracking-widest text-xs transition-all transform hover:scale-105 shadow-xl">
                           Join As A Scout
                        </button>
                     </Link>
                  </div>

                  <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4 h-[500px]">
                     <div className="h-full overflow-hidden rounded-2xl relative group">
                        <img 
                           src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" 
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                           alt="Scouting match" 
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                     </div>
                     <div className="h-full grid grid-rows-2 gap-4">
                        <div className="overflow-hidden rounded-2xl relative group">
                           <img 
                              src="https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=600&auto=format&fit=crop" 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                              alt="Football pitch analysis" 
                           />
                           <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <div className="overflow-hidden rounded-2xl relative group">
                           <img 
                              src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop" 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                              alt="Scout analysis" 
                           />
                           <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Scouts Grid Section */}
            <div className="max-w-[1200px] mx-auto px-4 lg:px-0 py-24">
               {/* Interactive Filter Bar */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-gray-100 pb-8">
                  <div>
                     <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Verified Scouts</h2>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Spot certified scouts</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                     {/* Search Input */}
                     <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                           type="text"
                           placeholder="Search scouts..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="pl-11 pr-6 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-900 focus:outline-none focus:border-[#a20000] focus:ring-1 focus:ring-[#a20000] w-64 transition-all"
                        />
                     </div>

                     {/* Country Selector */}
                     <div className="relative">
                        <select
                           value={selectedCountry}
                           onChange={(e) => setSelectedCountry(e.target.value)}
                           className="appearance-none pl-6 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-900 focus:outline-none focus:border-[#a20000] focus:ring-1 focus:ring-[#a20000] min-w-[200px] transition-all cursor-pointer"
                        >
                           <option value="">All Countries</option>
                           {availableCountries.map((c) => (
                              <option key={c} value={c}>{c}</option>
                           ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                     </div>
                  </div>
               </div>

               {loading ? (
                  <div className="text-center py-20">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a20000] mx-auto"></div>
                     <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-4">Loading scouts...</p>
                  </div>
               ) : !filteredScouts || filteredScouts.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                     <p className="text-gray-900 font-bold uppercase tracking-widest">No matching scouts found.</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                     {filteredScouts.map((scout) => {
                        const displayName = scout.full_name || `${scout.first_name || ''} ${scout.last_name || ''}`.trim() || 'Anonymous Scout';
                        return (
                           <Link 
                              href={`/scouts/${scout.slug}`}
                              key={scout.id} 
                              className="group relative h-[400px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-gray-200 block"
                           >
                              <img 
                                 src={scout.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop"} 
                                 alt={displayName} 
                                 className="absolute inset-0 w-full h-full object-cover grayscale-0 group-hover:scale-110 transition-transform duration-700" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/10 to-transparent"></div>
                              <div className="absolute bottom-8 left-8 right-8">
                                 <h3 className="text-2xl font-black text-white leading-tight mb-2 drop-shadow-md">
                                    {displayName}
                                 </h3>
                                 <div className="h-0.5 bg-[#a20000] w-12 group-hover:w-full transition-all duration-500 mb-4 px-0"></div>
                                 <div className="flex items-center justify-between">
                                    <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{scout.country || 'Nigeria'}</span>
                                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">{scout.agency_name || 'Independent Scout'}</span>
                                 </div>
                              </div>
                           </Link>
                        );
                     })}
                  </div>
               )}
            </div>

            {/* Bottom CTA Section */}
            <div className="bg-[#a20000] py-24 mb-10 overflow-hidden relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white opacity-5 select-none uppercase tracking-tighter whitespace-nowrap">
                  Scout Network
               </div>
               <div className="max-w-[900px] mx-auto px-4 text-center relative z-10">
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter uppercase leading-tight">
                     Are you a professional scout looking to build <span className="underline decoration-white/30 decoration-8 underline-offset-8">your network?</span>
                  </h2>
                  <Link href="/register">
                     <button className="bg-white text-gray-900 px-12 py-5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-3">
                        Join CenterKick Scouts <ArrowRight className="w-5 h-5 text-[#a20000]" />
                     </button>
                  </Link>
               </div>
            </div>
         </main>

         <Footer />
      </div>
   );
}
