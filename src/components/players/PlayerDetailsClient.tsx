'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import parse from 'html-react-parser';
import { ImageLightbox } from '@/components/common/ImageLightbox';
import { Facebook, Instagram, Twitter, ChevronLeft, MapPin, Trophy, X, Globe, Linkedin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const formatAbsoluteUrl = (url: string) => {
   if (!url) return '';
   if (url.startsWith('http://') || url.startsWith('https://')) return url;
   return `https://${url}`;
};

interface PlayerDetailsClientProps {
  athlete: any;
  careerStats?: any[];
  news?: any[];
}

export function PlayerDetailsClient({ athlete, careerStats = [], news = [] }: PlayerDetailsClientProps) {
   const mergedLinks = { ...(athlete.social_links || {}), ...(athlete.official_links || {}) };
   const [activeTab, setActiveTab] = useState("Profile");
   const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
   const router = useRouter();
   const displayName = athlete.full_name || `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || 'Anonymous Player';
   const nameParts = displayName.split(' ');
   const firstName = nameParts[0];
   const restOfName = nameParts.slice(1).join(' ');

   const calculateAge = (dob: string | undefined | null) => {
      if (!dob) return "NIL";
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) return "NIL";
      const diff = Date.now() - birthDate.getTime();
      const ageDate = new Date(diff);
      const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
      return isNaN(calculatedAge) ? "NIL" : calculatedAge;
   };

   const profileAge = calculateAge(athlete.date_of_birth);
   const profileHeight = athlete.height_cm ? `${athlete.height_cm}cm` : 'NIL';
   const profileFoot = athlete.foot || 'NIL';
   const profileClub = athlete.current_club || 'NIL';
   const profilePosition = athlete.position || 'NIL';

   return (
      <div className="min-h-screen bg-white">
         <Navbar />

         <main className="pt-[72px] lg:pt-[76px]">
            {/* Back Button */}
            <div className="bg-white border-b border-gray-100 py-3 sm:py-4">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
                  <button
                     onClick={() => router.back()}
                     className="group inline-flex items-center gap-2 text-gray-500 hover:text-black font-bold text-sm tracking-wide transition-colors"
                  >
                     <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                     Back
                  </button>
               </div>
            </div>

            {/* Hero — mobile stacked, desktop split */}
            <div className="relative w-full bg-[#0a0a0b] overflow-hidden">
               {/* Background stadium image */}
               <div className="absolute inset-0 z-0">
                  <img
                     src={athlete.cover_url || athlete.cover_image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=60&w=1200&auto=format&fit=crop"}
                     className="w-full h-full object-cover object-center opacity-20"
                     alt=""
                     loading="lazy"
                     decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/60 to-transparent" />
               </div>

               {/* Mobile: stacked layout */}
               <div className="relative z-10 flex flex-col md:hidden items-center pt-10 pb-0 px-6 text-white text-center">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[#b50a0a] shadow-2xl mb-6 shrink-0">
                     <img
                        src={athlete.avatar_url || "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=400&auto=format&fit=crop"}
                        alt={displayName}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                     />
                  </div>
                  <span className="text-[#ff4d4d] font-bold tracking-[0.3em] mb-2 text-xs uppercase">{profilePosition}</span>
                  <h1 className="text-4xl font-bold tracking-tight leading-none mb-4 drop-shadow-2xl">
                     {firstName} <span className="text-white">{restOfName}</span>
                  </h1>
                  <div className="flex flex-wrap gap-3 justify-center mb-6">
                     <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-xl flex flex-col items-center min-w-[80px]">
                        <span className="text-xs font-bold text-gray-300 tracking-wide mb-0.5">Age</span>
                        <span className="text-base font-bold text-white">{profileAge}</span>
                     </div>
                     <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-xl flex flex-col items-center min-w-[80px]">
                        <span className="text-xs font-bold text-gray-300 tracking-wide mb-0.5">Height</span>
                        <span className="text-base font-bold text-white">{profileHeight}</span>
                     </div>
                     <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-xl flex flex-col items-center min-w-[80px]">
                        <span className="text-xs font-bold text-gray-300 tracking-wide mb-0.5">Foot</span>
                        <span className="text-base font-bold text-white capitalize">{profileFoot}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 text-base font-bold mb-8 text-white/80">
                     <MapPin className="w-3.5 h-3.5 text-[#b50a0a]" />
                     <span>{profileClub}</span>
                  </div>
               </div>

               {/* Desktop: side-by-side layout */}
               <div className="hidden md:flex max-w-[1200px] mx-auto w-full h-[450px] relative px-4 lg:px-0">
                  <div className="w-[40%] h-full relative flex items-center justify-center">
                     <div className="absolute w-[300px] h-[300px] lg:w-[360px] lg:h-[360px] bg-[#b50a0a]/20 blur-[100px] rounded-full" />
                     <div className="w-[300px] h-[300px] lg:w-[360px] lg:h-[360px] rounded-full border-[6px] border-[#b50a0a] shadow-2xl overflow-hidden relative z-10 shrink-0 aspect-square">
                        <img
                           src={athlete.avatar_url || "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=600&auto=format&fit=crop"}
                           alt={displayName}
                           className="w-full h-full object-cover object-top"
                           loading="eager"
                        />
                     </div>
                  </div>
                  <div className="w-[60%] flex flex-col justify-center items-start pl-16 text-white z-20">
                     <span className="text-[#ff4d4d] font-bold tracking-[0.4em] mb-3 text-base uppercase">{profilePosition}</span>
                     <h1 className="flex flex-col leading-none drop-shadow-2xl mb-8">
                        <span className="text-7xl font-black tracking-tight">{firstName}</span>
                        <span className="text-8xl font-black tracking-tighter text-white">{restOfName}</span>
                     </h1>
                     <div className="flex gap-4 mb-10 flex-wrap">
                        {[
                           { label: 'Age', value: profileAge },
                           { label: 'Height', value: profileHeight },
                           { label: 'Main Foot', value: profileFoot },
                        ].map((s) => (
                           <div key={s.label} className="backdrop-blur-xl bg-white/5 border border-white/10 px-6 py-3.5 rounded-2xl flex flex-col min-w-[100px]">
                              <span className="text-xs font-bold text-gray-200 tracking-[0.2em] mb-1 uppercase">{s.label}</span>
                              <span className="text-xl font-bold text-white capitalize">{s.value}</span>
                           </div>
                        ))}
                     </div>
                     <div className="flex items-center gap-6">
                        <span className="font-bold tracking-wide text-base">{profileClub}</span>
                        <div className="h-6 w-[1px] bg-white/20" />
                        <div className="flex flex-wrap items-center gap-4">
                           {mergedLinks.website && (
                              <a href={formatAbsoluteUrl(mergedLinks.website)} target="_blank" rel="noopener noreferrer" title="Website" className="hover:text-[#b50a0a] transition-colors">
                                 <Globe className="w-4 h-4" />
                              </a>
                           )}
                           {mergedLinks.linkedin && (
                              <a href={formatAbsoluteUrl(mergedLinks.linkedin)} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="hover:text-[#b50a0a] transition-colors">
                                 <Linkedin className="w-4 h-4" />
                              </a>
                           )}
                           {mergedLinks.facebook && (
                              <a href={formatAbsoluteUrl(mergedLinks.facebook)} target="_blank" rel="noopener noreferrer" title="Facebook" className="hover:text-[#b50a0a] transition-colors">
                                 <Facebook className="w-4 h-4" />
                              </a>
                           )}
                           {mergedLinks.instagram && (
                              <a href={formatAbsoluteUrl(mergedLinks.instagram)} target="_blank" rel="noopener noreferrer" title="Instagram" className="hover:text-[#b50a0a] transition-colors">
                                 <Instagram className="w-4 h-4" />
                              </a>
                           )}
                           {mergedLinks.twitter && (
                              <a href={formatAbsoluteUrl(mergedLinks.twitter)} target="_blank" rel="noopener noreferrer" title="X (formerly Twitter)" className="hover:text-[#b50a0a] transition-colors">
                                 <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                              </a>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Tab Navigation */}
            <div className="z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
               <div className="max-w-[1000px] mx-auto px-4 lg:px-0">
                  <div className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden gap-1 sm:gap-0">
                     {["Profile", "Career Stat.", "Gallery"].map((tab) => (
                        <button
                           key={tab}
                           onClick={() => setActiveTab(tab)}
                           className={`relative text-sm font-bold tracking-wide whitespace-nowrap py-4 px-3 sm:px-4 hover:text-[#b50a0a] transition-colors ${activeTab === tab ? 'text-[#b50a0a] font-bold' : 'text-gray-500'}`}
                        >
                           {tab}
                           {activeTab === tab && (
                              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#b50a0a] rounded-t-full" />
                           )}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* Content */}
            <div className="max-w-[1000px] mx-auto px-4 lg:px-0 py-6 sm:py-10">
               {activeTab === "Profile" && (
                  <div className="flex flex-col">
                     <div className="mb-8 pb-8 border-b border-gray-100">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-600 mb-8">Player Data</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {[
                              { label: 'Country', value: athlete.country ? (
                                 <div className="flex items-center gap-2">
                                    {athlete.country_flag && <img src={athlete.country_flag} alt="" className="w-5 h-4 object-cover rounded-sm shadow-sm" />}
                                    <span>{athlete.country}</span>
                                 </div>
                              ) : 'N/A' },
                              { label: 'Position', value: athlete.position || 'Attack' },
                              { label: 'Main Foot', value: athlete.foot || 'Right' },
                              { label: 'Height', value: athlete.height_cm ? `${athlete.height_cm}cm` : 'N/A' },
                              { label: 'Weight', value: athlete.weight_kg ? `${athlete.weight_kg}kg` : 'N/A' },
                              { label: 'Jersey #', value: athlete.jersey_number || 'N/A' },
                              { label: 'Market Value', value: athlete.market_value || 'N/A' },
                              { label: 'Managing Agent', value: 'Independent' },
                           ].map((item, i) => (
                              <div key={i} className="flex py-3 border-b border-gray-50">
                                 <span className="w-2/5 text-sm font-bold text-gray-400 tracking-wide">{item.label}</span>
                                 <span className="w-3/5 text-base font-bold text-gray-900">{item.value}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="mb-8 pb-8 border-b border-gray-100">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-600 mb-6">Bio</h2>
                        <div className="text-base leading-relaxed text-gray-600 font-medium prose prose-sm sm:prose-base max-w-none prose-a:text-[#b50a0a] hover:prose-a:text-red-700">
                           {athlete.bio ? parse(athlete.bio) : `Meet ${athlete.first_name || ''} ${athlete.last_name || ''}, one of the talented players on CenterKick.`}
                        </div>
                     </div>

                     <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-600 mb-6">Honours</h2>
                        {athlete.achievements && Array.isArray(athlete.achievements) && athlete.achievements.length > 0 ? (
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {athlete.achievements.map((item: any, i: number) => {
                                 const isString = typeof item === 'string';
                                 const title = isString ? item : item.title;
                                 const year = isString ? '' : item.year;
                                 const category = isString ? '' : item.category;

                                 return (
                                    <div key={i} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col gap-2">
                                       <div className="flex items-center gap-2">
                                          <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                                          <span className="text-base font-bold text-gray-900">{title}</span>
                                       </div>
                                       {(year || category) && (
                                          <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider ml-7">
                                             {category && <span>{category}</span>}
                                             {category && year && <span>•</span>}
                                             {year && <span>{year}</span>}
                                          </div>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        ) : (
                           <p className="text-gray-500 text-base font-medium">No honours recorded yet.</p>
                        )}
                     </div>
                  </div>
               )}

               {activeTab === "Gallery" && (
                  <div className="animate-in fade-in duration-500">
                     <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 tracking-tighter">Media <span className="text-[#b50a0a]">Gallery</span></h2>
                     
                     {/* Videos Section */}
                     {athlete.video_links && athlete.video_links.length > 0 && (
                        <div className="mb-12">
                           <h3 className="text-sm font-bold text-gray-500 tracking-[0.2em] mb-6 uppercase">Featured Videos</h3>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {athlete.video_links.map((url: string, i: number) => {
                                 let embedUrl = url;
                                 if (url.includes('youtube.com') || url.includes('youtu.be')) {
                                    const ytIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                                    if (ytIdMatch && ytIdMatch[1]) {
                                       embedUrl = `https://www.youtube.com/embed/${ytIdMatch[1]}`;
                                    }
                                 } else if (url.includes('vimeo.com')) {
                                    const vimIdMatch = url.match(/vimeo\.com\/(?:.*#|.*\/videos\/)?([0-9]+)/);
                                    if (vimIdMatch && vimIdMatch[1]) {
                                       embedUrl = `https://player.vimeo.com/video/${vimIdMatch[1]}`;
                                    }
                                 }

                                 return (
                                    <div key={i} className={`aspect-video bg-black rounded-3xl overflow-hidden shadow-lg border border-gray-100 ${i === 0 ? 'md:col-span-3' : 'md:col-span-1'}`}>
                                       <iframe 
                                          src={embedUrl}
                                          className="w-full h-full"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                          loading="lazy"
                                       />
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     )}

                     {/* Photos Section */}
                     {athlete.gallery_urls && athlete.gallery_urls.length > 0 && (
                        <div>
                           <h3 className="text-sm font-bold text-gray-500 tracking-[0.2em] mb-6 uppercase">Action Shots</h3>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {athlete.gallery_urls.map((url: string, i: number) => (
                                 <div key={i} onClick={() => setSelectedImageIndex(i)} className="aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group cursor-pointer">
                                    <img src={url} alt="Action shot" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Lightbox */}
                     {selectedImageIndex !== null && athlete.gallery_urls && (
                        <ImageLightbox 
                           images={athlete.gallery_urls} 
                           initialIndex={selectedImageIndex} 
                           onClose={() => setSelectedImageIndex(null)} 
                        />
                     )}

                     {(!athlete.video_links || athlete.video_links.length === 0) && (!athlete.gallery_urls || athlete.gallery_urls.length === 0) && (
                        <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                           <p className="text-gray-400 text-sm font-bold tracking-wide">No media available yet.</p>
                        </div>
                     )}
                  </div>
               )}

               {activeTab === "Career Stat." && (
                  <div className="animate-in fade-in duration-500">
                     <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 tracking-tighter">Career <span className="text-[#b50a0a]">Statistics</span></h2>
                     
                     {/* Current Club / Basic Career Data */}
                     <div className="mb-8 pb-8 border-b border-gray-100">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-600 mb-6">Current Club</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="flex py-3 border-b border-gray-50">
                              <span className="w-2/5 text-sm font-bold text-gray-400 tracking-wide">Club</span>
                              <span className="w-3/5 text-base font-bold text-gray-900">
                                 {athlete.current_club ? (
                                    <div className="flex items-center gap-2">
                                       {athlete.current_club_logo && <img src={athlete.current_club_logo} alt="" className="w-5 h-5 object-contain" />}
                                       <span>{athlete.current_club}</span>
                                    </div>
                                 ) : 'Free Agent'}
                              </span>
                           </div>
                           <div className="flex py-3 border-b border-gray-50">
                              <span className="w-2/5 text-sm font-bold text-gray-400 tracking-wide">League</span>
                              <span className="w-3/5 text-base font-bold text-gray-900">{athlete.league_name || 'N/A'}</span>
                           </div>
                           <div className="flex py-3 border-b border-gray-50">
                              <span className="w-2/5 text-sm font-bold text-gray-400 tracking-wide">Contract Expiry</span>
                              <span className="w-3/5 text-base font-bold text-gray-900">{athlete.contract_expiry ? new Date(athlete.contract_expiry).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'}</span>
                           </div>
                           <div className="flex py-3 border-b border-gray-50">
                              <span className="w-2/5 text-sm font-bold text-gray-400 tracking-wide">Signed</span>
                              <span className="w-3/5 text-base font-bold text-gray-900">{athlete.is_signed ? 'Yes' : 'No'}</span>
                           </div>
                        </div>
                     </div>

                     {/* Per Season Statistics */}
                     <div className="mb-8 pb-8 border-b border-gray-100">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-600 mb-6">Per Season Statistics</h3>
                        {careerStats && careerStats.length > 0 ? (
                           <div className="overflow-x-auto rounded-[2rem] border border-gray-100 shadow-sm bg-white">
                              <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                                 <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                       <th className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-xs font-bold tracking-wide text-gray-400 uppercase text-center">S/N</th>
                                       <th className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-xs font-bold tracking-wide text-gray-400 uppercase">Season</th>
                                       <th className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-xs font-bold tracking-wide text-gray-400 uppercase">League</th>
                                       <th className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-xs font-bold tracking-wide text-gray-400 uppercase">Club</th>
                                       <th className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-xs font-bold tracking-wide text-gray-400 text-center uppercase">Apps</th>
                                       <th className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-xs font-bold tracking-wide text-gray-400 text-center uppercase">Gls</th>
                                       <th className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-xs font-bold tracking-wide text-gray-400 text-center uppercase">Ast</th>
                                       <th className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-xs font-bold tracking-wide text-gray-400 text-center uppercase">Yel</th>
                                       <th className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-xs font-bold tracking-wide text-gray-400 text-center uppercase">Red</th>
                                    </tr>
                                 </thead>
                                 <tbody className="text-xs sm:text-sm font-bold text-gray-700 divide-y divide-gray-50">
                                    {careerStats.map((stat, i) => (
                                       <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                          <td className="px-4 py-4 sm:px-6 sm:py-5 text-center align-middle text-gray-400">{i + 1}</td>
                                          <td className="px-4 py-4 sm:px-6 sm:py-5 align-middle">{stat.season}</td>
                                          <td className="px-4 py-4 sm:px-6 sm:py-5 align-middle text-gray-500 font-medium">{stat.league_name || '—'}</td>
                                          <td className="px-4 py-4 sm:px-6 sm:py-5 align-middle text-gray-900">
                                             <div className="flex items-center gap-3">
                                                {stat.club_flag && (
                                                   <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-md overflow-hidden bg-white p-1 border border-gray-100 shadow-sm shrink-0">
                                                      <img src={stat.club_flag} alt="" className="object-contain w-full h-full" />
                                                   </div>
                                                )}
                                                <span>{stat.club_name}</span>
                                             </div>
                                          </td>
                                          <td className="px-4 py-4 sm:px-6 sm:py-5 text-center align-middle">{stat.appearances || 0}</td>
                                          <td className="px-4 py-4 sm:px-6 sm:py-5 text-center align-middle">{stat.goals || 0}</td>
                                          <td className="px-4 py-4 sm:px-6 sm:py-5 text-center align-middle">{stat.assists || 0}</td>
                                          <td className="px-4 py-4 sm:px-6 sm:py-5 text-center align-middle">
                                             <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-yellow-100/50 text-yellow-700 rounded-md border border-yellow-200">{stat.yellow_cards || 0}</span>
                                          </td>
                                          <td className="px-4 py-4 sm:px-6 sm:py-5 text-center align-middle">
                                             <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-red-100/50 text-red-700 rounded-md border border-red-200">{stat.red_cards || 0}</span>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        ) : (
                           <p className="text-gray-500 text-base font-medium">No per season statistics available.</p>
                        )}
                     </div>

                     {/* Transfer History */}
                     <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-600 mb-6">Transfer History</h3>
                        {athlete.transfer_history && Array.isArray(athlete.transfer_history) && athlete.transfer_history.length > 0 ? (
                           <div className="overflow-x-auto rounded-[2rem] border border-gray-100 shadow-sm bg-white">
                              <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                                 <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                       <th className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-xs font-bold tracking-wide text-gray-400 uppercase text-center">S/N</th>
                                       <th className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-xs font-bold tracking-wide text-gray-400 uppercase">Date</th>
                                       <th className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-xs font-bold tracking-wide text-gray-400 uppercase">From</th>
                                       <th className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-xs font-bold tracking-wide text-gray-400 uppercase">To</th>
                                       <th className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-xs font-bold tracking-wide text-gray-400 uppercase text-right">Fee</th>
                                       <th className="px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-xs font-bold tracking-wide text-gray-400 uppercase text-right">Market Value</th>
                                    </tr>
                                 </thead>
                                 <tbody className="text-xs sm:text-sm font-bold text-gray-700 divide-y divide-gray-50">
                                    {athlete.transfer_history.map((transfer: any, i: number) => (
                                       <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                          <td className="px-4 py-4 sm:px-6 sm:py-5 text-center align-middle text-gray-400">{i + 1}</td>
                                          <td className="px-4 py-4 sm:px-6 sm:py-5 align-middle font-medium text-gray-500">
                                             {transfer.date ? (isNaN(Date.parse(transfer.date)) ? transfer.date : new Date(transfer.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })) : 'Unknown'}
                                          </td>
                                          <td className="px-4 py-4 sm:px-6 sm:py-5 align-middle text-gray-900">
                                             <div className="flex items-center gap-2">
                                                {transfer.from_club_logo && <img src={transfer.from_club_logo} alt="" className="w-5 h-5 object-contain shrink-0" />}
                                                <span>{transfer.from_club || 'Unknown'}</span>
                                             </div>
                                          </td>
                                          <td className="px-4 py-4 sm:px-6 sm:py-5 align-middle text-gray-900">
                                             <div className="flex items-center gap-2">
                                                {transfer.to_club_logo && <img src={transfer.to_club_logo} alt="" className="w-5 h-5 object-contain shrink-0" />}
                                                <span>{transfer.to_club || 'Unknown'}</span>
                                             </div>
                                          </td>
                                          <td className="px-4 py-4 sm:px-6 sm:py-5 align-middle text-right text-[#b50a0a]">{transfer.fee || '—'}</td>
                                          <td className="px-4 py-4 sm:px-6 sm:py-5 align-middle text-right text-gray-500 font-medium">{transfer.market_value || '—'}</td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        ) : (
                           <p className="text-gray-500 text-base font-medium">No transfer history recorded yet.</p>
                        )}
                     </div>
                  </div>
               )}

               {activeTab !== "Profile" && activeTab !== "Gallery" && activeTab !== "Career Stat." && (
                  <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                     <p className="text-gray-400 text-sm font-bold tracking-wide">{activeTab} — Coming Soon</p>
                  </div>
               )}
            </div>
         </main>
         <Footer />
      </div>
   );
}

