'use client';
import { Search, ChevronDown, ArrowRight, Globe } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';

export default function AgentsClient({ agents }: { agents: any[] }) {
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCountry, setSelectedCountry] = useState('');

   const availableCountries = useMemo(() => {
      const set = new Set<string>();
      agents.forEach(a => { if (a.country) set.add(a.country.trim()); });
      return Array.from(set).sort();
   }, [agents]);

   const filtered = useMemo(() => agents.filter(a => {
      if (searchQuery) {
         const q = searchQuery.toLowerCase();
         const name = `${a.first_name||''} ${a.last_name||''} ${a.full_name||''}`.toLowerCase();
         if (!name.includes(q) && !(a.agency_name||'').toLowerCase().includes(q)) return false;
      }
      if (selectedCountry && a.country !== selectedCountry) return false;
      return true;
   }), [agents, searchQuery, selectedCountry]);

   return (
      <div className="max-w-[1200px] mx-auto px-4 lg:px-0 py-10 sm:py-16">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-8 border-b border-gray-100">
            <div>
               <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter">Certified Agents</h2>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Connect with verified representatives</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search agents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
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
               <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No matching agents found.</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
               {filtered.map(agent => {
                  const name = agent.full_name || `${agent.first_name||''} ${agent.last_name||''}`.trim() || 'Agent';
                  return (
                     <Link href={`/agents/${agent.slug}`} key={agent.id}
                        className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block">
                        <div className="relative h-40 sm:h-52 overflow-hidden bg-gray-100">
                           <img src={agent.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=60&w=400&auto=format&fit=crop"}
                              alt={name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" loading="lazy" decoding="async" />
                        </div>
                        <div className="p-4">
                           <span className="text-[#a20000] text-[9px] font-black uppercase tracking-widest block mb-1">{agent.country || 'Global'}</span>
                           <h3 className="text-gray-900 font-black text-sm leading-tight uppercase tracking-tight line-clamp-1 group-hover:text-[#a20000] transition-colors">{name}</h3>
                           <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                              <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider truncate">{agent.agency_name || 'Independent'}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#a20000] group-hover:translate-x-0.5 transition-all shrink-0" />
                           </div>
                        </div>
                     </Link>
                  );
               })}
            </div>
         )}
      </div>
   );
}
