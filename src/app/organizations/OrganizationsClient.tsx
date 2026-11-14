'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { DirectoryFilterBar } from '@/components/common/DirectoryFilterBar';
import { getOptimizedImageUrl } from '@/lib/utils/image';
import { SkeletonImage } from '@/components/common/SkeletonImage';

export default function OrganizationsClient({ organizations }: { organizations: any[] }) {
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCountry, setSelectedCountry] = useState('');

   const availableCountries = useMemo(() => {
      const set = new Set<string>();
      organizations.forEach(o => { if (o.country) set.add(o.country.trim()); });
      return Array.from(set).sort();
   }, [organizations]);

   const filtered = useMemo(() => organizations.filter(o => {
      if (searchQuery) {
         const q = searchQuery.toLowerCase();
         const name = `${o.first_name || ''} ${o.last_name || ''} ${o.full_name || ''}`.toLowerCase();
         if (!name.includes(q) && !(o.agency_name || '').toLowerCase().includes(q)) return false;
      }
      if (selectedCountry && o.country !== selectedCountry) return false;
      return true;
   }), [organizations, searchQuery, selectedCountry]);

   return (
      <div className="max-w-[1200px] mx-auto px-4 lg:px-0 py-10 sm:py-16">
         <DirectoryFilterBar 
            totalCount={organizations.length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            availableCountries={availableCountries}
            searchPlaceholder="Search organizations..."
            profileTypeLabel="Organizations"
         />
         {filtered.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
               <p className="text-gray-500 font-bold tracking-wide text-base">No Organization profile.</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
               {filtered.map((org, index) => {
                  const name = org.full_name || `${org.first_name || ''} ${org.last_name || ''}`.trim() || 'Organization';
                  return (
                     <Link href={`/organizations/${org.slug}`} key={org.id}
                        className="group relative h-[260px] sm:h-[340px] rounded-2xl overflow-hidden bg-gray-950 block shadow-md hover:shadow-xl transition-all duration-300">
                        <SkeletonImage
                           src={getOptimizedImageUrl(org.avatar_url, { width: 400, height: 500 })}
                           alt={name}
                           name={name}
                           role={org.country || 'Organization'}
                           variant="dark"
                           priority={index < 4}
                           sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                           className="group-hover:scale-105 transition-transform duration-500 opacity-90"
                           containerClassName="absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                           <span className="text-amber-400 text-xs font-bold tracking-wide block mb-0.5">{org.country || 'Global'}</span>
                           <h3 className="text-white font-bold text-base leading-tight tracking-tight line-clamp-2">{name}</h3>
                        </div>
                     </Link>
                  );
               })}
            </div>
         )}
      </div>
   );
}
