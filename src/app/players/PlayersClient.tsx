'use client';

import { ChevronDown } from "lucide-react";
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { DirectoryFilterBar } from '@/components/common/DirectoryFilterBar';
import { getOptimizedImageUrl } from '@/lib/utils/image';
import { SkeletonImage } from '@/components/common/SkeletonImage';

interface PlayersClientProps {
   players: any[];
}

export default function PlayersClient({ players }: PlayersClientProps) {
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCountry, setSelectedCountry] = useState('');

   const availableCountries = useMemo(() => {
      const set = new Set<string>();
      players.forEach(a => { if (a.country) set.add(a.country.trim()); });
      return Array.from(set).sort();
   }, [players]);

   const filtered = useMemo(() => {
      return players.filter(a => {
         if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const name = `${a.first_name || ''} ${a.last_name || ''} ${a.full_name || ''}`.toLowerCase();
            if (!name.includes(q) && !(a.position || '').toLowerCase().includes(q)) return false;
         }
         if (selectedCountry && a.country !== selectedCountry) return false;
         return true;
      });
   }, [players, searchQuery, selectedCountry]);

   return (
      <div className="max-w-[1200px] mx-auto px-4 lg:px-0 py-10 sm:py-16">
         <DirectoryFilterBar 
            totalCount={players.length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            availableCountries={availableCountries}
            searchPlaceholder="Search players..."
            profileTypeLabel="Players"
         />

         {/* Grid */}
         {filtered.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
               <p className="text-gray-500 font-bold tracking-wide text-base">No Players found.</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
               {filtered.map((athlete, index) => {
                  const name = athlete.full_name || `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || 'Athlete';
                  return (
                     <Link
                        href={`/players/${athlete.slug}`}
                        key={athlete.id}
                        className="relative aspect-[4/5] rounded-2xl overflow-hidden group bg-gray-950 block shadow-md hover:shadow-xl transition-all duration-300"
                     >
                        <SkeletonImage
                           src={getOptimizedImageUrl(athlete.avatar_url, { width: 400, height: 500 })}
                           alt={name}
                           name={name}
                           role={athlete.position || 'Player'}
                           variant="dark"
                           priority={index < 5}
                           sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                           className="group-hover:scale-105 transition-transform duration-500"
                           containerClassName="absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 pointer-events-none">
                           <span className="text-[#ff4d4d] text-xs font-bold tracking-wide block mb-0.5">{athlete.position || 'Player'}</span>
                           <h3 className="text-white font-bold text-base sm:text-base leading-tight tracking-tight line-clamp-2">{name}</h3>
                        </div>
                     </Link>
                  );
               })}
            </div>
         )}
      </div>
   );
}
