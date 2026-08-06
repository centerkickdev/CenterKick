'use client';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { DirectoryFilterBar } from '@/components/common/DirectoryFilterBar';

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
         const name = `${a.first_name || ''} ${a.last_name || ''} ${a.full_name || ''}`.toLowerCase();
         if (!name.includes(q) && !(a.agency_name || '').toLowerCase().includes(q)) return false;
      }
      if (selectedCountry && a.country !== selectedCountry) return false;
      return true;
   }), [agents, searchQuery, selectedCountry]);

   return (
      <div className="max-w-[1200px] mx-auto px-4 lg:px-0 py-10 sm:py-16">
         <DirectoryFilterBar 
            totalCount={agents.length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            availableCountries={availableCountries}
            searchPlaceholder="Search agents..."
            profileTypeLabel="Agents"
         />
         {filtered.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
               <p className="text-gray-500 font-bold tracking-wide text-base">No matching agents found.</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
               {filtered.map(agent => {
                  const name = agent.full_name || `${agent.first_name || ''} ${agent.last_name || ''}`.trim() || 'Agent';
                  return (
                     <Link href={`/agents/${agent.slug}`} key={agent.id}
                        className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block">
                        <div className="relative h-40 sm:h-52 overflow-hidden bg-gray-100">
                           <img src={agent.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=60&w=400&auto=format&fit=crop"}
                              alt={name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" loading="lazy" decoding="async" />
                        </div>
                        <div className="p-4">
                           <span className="text-[#a20000] text-xs font-bold tracking-wide block mb-1">{agent.country || 'Global'}</span>
                           <h3 className="text-gray-900 font-bold text-base leading-tight tracking-tight line-clamp-1 group-hover:text-[#a20000] transition-colors">{name}</h3>
                           <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                              <span className="text-gray-400 text-xs font-bold tracking-wide truncate">{agent.agency_name || ''}</span>
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
