'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { DirectoryFilterBar } from '@/components/common/DirectoryFilterBar';
import { getOptimizedImageUrl } from '@/lib/utils/image';

export default function ProfessionalsClient({ professionals }: { professionals: any[] }) {
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCountry, setSelectedCountry] = useState('');

   const availableCountries = useMemo(() => {
      const set = new Set<string>();
      professionals.forEach(p => { if (p.country) set.add(p.country.trim()); });
      return Array.from(set).sort();
   }, [professionals]);

   const filtered = useMemo(() => professionals.filter(p => {
      if (searchQuery) {
         const q = searchQuery.toLowerCase();
         const name = `${p.first_name || ''} ${p.last_name || ''} ${p.full_name || ''}`.toLowerCase();
         const title = (p.profession_title || p.profession_category || '').toLowerCase();
         if (!name.includes(q) && !title.includes(q)) return false;
      }
      if (selectedCountry && p.country !== selectedCountry) return false;
      return true;
   }), [professionals, searchQuery, selectedCountry]);

   return (
      <div className="max-w-[1200px] mx-auto px-4 lg:px-0 py-10 sm:py-16">
         <DirectoryFilterBar
            totalCount={professionals.length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            availableCountries={availableCountries}
            searchPlaceholder="Search professionals..."
            profileTypeLabel="Professionals"
         />
         {filtered.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
               <p className="text-gray-500 font-bold tracking-wide text-base">No Professional Profiles Found.</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
               {filtered.map(pro => {
                  const name = pro.full_name || `${pro.first_name || ''} ${pro.last_name || ''}`.trim() || 'Professional';
                  return (
                     <Link href={`/professionals/${pro.slug}`} key={pro.id}
                        className="group relative h-[280px] sm:h-[360px] rounded-2xl overflow-hidden bg-gray-900 block shadow-md hover:shadow-xl transition-all duration-300">
                        <img src={getOptimizedImageUrl(pro.avatar_url, { width: 400, height: 500 }) || "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=60&w=400&auto=format&fit=crop"}
                           alt={name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" loading="lazy" decoding="async" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                           <span className="text-[#ff4d4d] text-xs font-bold tracking-wide block mb-0.5">{pro.profession_title || pro.profession_category || 'Professional'}</span>
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
