'use client';

import { Search, ChevronDown } from "lucide-react";
import Link from 'next/link';
import { useState, useMemo } from 'react';

interface PlayersClientProps {
   athletes: any[];
}

export default function PlayersClient({ athletes }: PlayersClientProps) {
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCountry, setSelectedCountry] = useState('');

   const availableCountries = useMemo(() => {
      const set = new Set<string>();
      athletes.forEach(a => { if (a.country) set.add(a.country.trim()); });
      return Array.from(set).sort();
   }, [athletes]);

   const filtered = useMemo(() => {
      return athletes.filter(a => {
         if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const name = `${a.first_name||''} ${a.last_name||''} ${a.full_name||''}`.toLowerCase();
            if (!name.includes(q) && !(a.position||'').toLowerCase().includes(q)) return false;
         }
         if (selectedCountry && a.country !== selectedCountry) return false;
         return true;
      });
   }, [athletes, searchQuery, selectedCountry]);

   return (
      <div className="max-w-[1200px] mx-auto px-4 lg:px-0 py-10 sm:py-16">
         {/* Filter Bar */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-8 border-b border-gray-100">
            <div>
               <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter">Verified Athletes</h2>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Discover rising football talent</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                     type="text"
                     placeholder="Search athletes..."
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     className="pl-11 pr-5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#a20000] w-full sm:w-56 transition-all"
                  />
               </div>
               <div className="relative">
                  <select
                     value={selectedCountry}
                     onChange={e => setSelectedCountry(e.target.value)}
                     className="appearance-none pl-5 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#a20000] w-full sm:w-48 cursor-pointer transition-all"
                  >
                     <option value="">All Countries</option>
                     {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
               </div>
            </div>
         </div>

         {/* Grid */}
         {filtered.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
               <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No matching athlete profiles found.</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
               {filtered.map(athlete => {
                  const name = athlete.full_name || `${athlete.first_name||''} ${athlete.last_name||''}`.trim() || 'Athlete';
                  return (
                     <Link
                        href={`/players/${athlete.slug}`}
                        key={athlete.id}
                        className="relative aspect-[4/5] rounded-2xl overflow-hidden group bg-gray-900 block shadow-md hover:shadow-xl transition-all duration-300"
                     >
                        <img
                           src={athlete.avatar_url || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=60&w=400&auto=format&fit=crop"}
                           alt={name}
                           className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                           loading="lazy"
                           decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                           <span className="text-[#ff4d4d] text-[9px] font-bold uppercase tracking-widest block mb-0.5">{athlete.position || 'Player'}</span>
                           <h3 className="text-white font-black text-sm sm:text-base leading-tight uppercase tracking-tight line-clamp-2">{name}</h3>
                        </div>
                     </Link>
                  );
               })}
            </div>
         )}
      </div>
   );
}
