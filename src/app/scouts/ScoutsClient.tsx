'use client';
import { Search, ChevronDown } from "lucide-react";
import Link from 'next/link';
import { useState, useMemo } from 'react';

export default function ScoutsClient({ scouts }: { scouts: any[] }) {
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCountry, setSelectedCountry] = useState('');

   const availableCountries = useMemo(() => {
      const set = new Set<string>();
      scouts.forEach(s => { if (s.country) set.add(s.country.trim()); });
      return Array.from(set).sort();
   }, [scouts]);

   const filtered = useMemo(() => scouts.filter(s => {
      if (searchQuery) {
         const q = searchQuery.toLowerCase();
         const name = `${s.first_name||''} ${s.last_name||''} ${s.full_name||''}`.toLowerCase();
         if (!name.includes(q) && !(s.agency_name||'').toLowerCase().includes(q)) return false;
      }
      if (selectedCountry && s.country !== selectedCountry) return false;
      return true;
   }), [scouts, searchQuery, selectedCountry]);

   return (
      <div className="max-w-[1200px] mx-auto px-4 lg:px-0 py-10 sm:py-16">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-8 border-b border-gray-100">
            <div>
               <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter">Verified Scouts</h2>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Certified talent identifiers</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search scouts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                     className="pl-11 pr-5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#a20000] w-full sm:w-56 transition-all" />
               </div>
               <div className="relative">
                  <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}
                     className="appearance-none pl-5 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#a20000] w-full sm:w-48 cursor-pointer transition-all">
                     <option value="">All Countries</option>
                     {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
               </div>
            </div>
         </div>
         {filtered.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
               <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No matching scouts found.</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
               {filtered.map(scout => {
                  const name = scout.full_name || `${scout.first_name||''} ${scout.last_name||''}`.trim() || 'Scout';
                  return (
                     <Link href={`/scouts/${scout.slug}`} key={scout.id}
                        className="group relative h-[260px] sm:h-[340px] rounded-2xl overflow-hidden bg-gray-900 block shadow-md hover:shadow-xl transition-all duration-300">
                        <img src={scout.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=60&w=400&auto=format&fit=crop"}
                           alt={name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" loading="lazy" decoding="async" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                           <span className="text-[#ff4d4d] text-[9px] font-bold uppercase tracking-widest block mb-0.5">{scout.country || 'Global'}</span>
                           <h3 className="text-white font-black text-sm leading-tight uppercase tracking-tight line-clamp-2">{name}</h3>
                        </div>
                     </Link>
                  );
               })}
            </div>
         )}
      </div>
   );
}
