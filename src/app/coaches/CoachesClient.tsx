'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { DirectoryFilterBar } from '@/components/common/DirectoryFilterBar';
import { getOptimizedImageUrl } from '@/lib/utils/image';
import { SkeletonImage } from '@/components/common/SkeletonImage';

export default function CoachesClient({ coaches }: { coaches: any[] }) {
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCountry, setSelectedCountry] = useState('');

   const availableCountries = useMemo(() => {
      const set = new Set<string>();
      coaches.forEach(c => { if (c.country) set.add(c.country.trim()); });
      return Array.from(set).sort();
   }, [coaches]);

   const filtered = useMemo(() => coaches.filter(c => {
      if (searchQuery) {
         const q = searchQuery.toLowerCase();
         const name = `${c.first_name || ''} ${c.last_name || ''} ${c.full_name || ''}`.toLowerCase();
         if (!name.includes(q) && !(c.position || '').toLowerCase().includes(q)) return false;
      }
      if (selectedCountry && c.country !== selectedCountry) return false;
      return true;
   }), [coaches, searchQuery, selectedCountry]);

   return (
      <div className="max-w-[1200px] mx-auto px-4 lg:px-0 py-10 sm:py-16">
         <DirectoryFilterBar 
            totalCount={coaches.length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            availableCountries={availableCountries}
            searchPlaceholder="Search coaches..."
            profileTypeLabel="Coaches"
         />
         {filtered.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
               <p className="text-gray-500 font-bold tracking-wide text-base">No Coach Profiles Found.</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
               {filtered.map(coach => {
                  const name = coach.full_name || `${coach.first_name || ''} ${coach.last_name || ''}`.trim() || 'Coach';
                  return (
                     <Link href={`/coaches/${coach.slug}`} key={coach.id}
                        className="group relative h-[280px] sm:h-[360px] rounded-2xl overflow-hidden bg-gray-950 block shadow-md hover:shadow-xl transition-all duration-300">
                        <SkeletonImage
                           src={getOptimizedImageUrl(coach.avatar_url, { width: 400, height: 500 })}
                           alt={name}
                           name={name}
                           role={coach.position || 'Coach'}
                           variant="dark"
                           className="group-hover:scale-105 transition-transform duration-500"
                           containerClassName="absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                           <span className="text-[#ff4d4d] text-xs font-bold tracking-wide block mb-0.5">{coach.position || 'Coach'}</span>
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
