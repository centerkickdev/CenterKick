'use client';

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Eye, EyeOff, Users, Globe, ArrowRight, Mail, CheckCircle2, Award, ChevronLeft, Facebook, Instagram, Linkedin, Search } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import parse from 'html-react-parser';
import { ImageLightbox } from '@/components/common/ImageLightbox';

const formatAbsoluteUrl = (url: string) => {
   if (!url) return '';
   if (url.startsWith('http://') || url.startsWith('https://')) return url;
   return `https://${url}`;
};

interface ScoutDetailsClientProps {
  profile: Record<string, any>;
}

export default function ScoutDetailsClient({ profile }: ScoutDetailsClientProps) {
   const mergedLinks = { ...(profile.social_links || {}), ...(profile.official_links || {}) };
   const [activeTab, setActiveTab] = useState("Bio");
   const [showLicense, setShowLicense] = useState(false);
   const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
   const [searchQuery, setSearchQuery] = useState("");
   const [currentPage, setCurrentPage] = useState(1);
   const [sortOrder, setSortOrder] = useState<"asc"|"desc">("desc");
   const itemsPerPage = 20;

   const router = useRouter();

   const displayName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous Scout';
   const nameParts = displayName.split(' ');
   const firstName = nameParts[0];
   const restOfName = nameParts.slice(1).join(' ');

   const profileAgency = profile.agency_name || profile.current_affiliation?.name || 'Free Agent';

   // Discoveries logic
   const pastDiscoveries = profile.past_discoveries || [];
   const filteredDiscoveries = pastDiscoveries.filter((d: any) => 
      (d.playerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.recommendedTo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.currentStatus || '').toLowerCase().includes(searchQuery.toLowerCase())
   ).sort((a: any, b: any) => {
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      if (sortOrder === 'desc') return yearB - yearA;
      return yearA - yearB;
   });

   const totalPages = Math.max(1, Math.ceil(filteredDiscoveries.length / itemsPerPage));
   const currentDiscoveries = filteredDiscoveries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

   return (
      <div className="min-h-screen bg-white">
         <Navbar />

         <main className="pt-[72px] lg:pt-[76px]">
            {/* Back Button Bar */}
            <div className="bg-white border-b border-gray-100 py-4">
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
                     src={profile.cover_url || profile.cover_image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=60&w=1200&auto=format&fit=crop"}
                     className="w-full h-full object-cover object-center opacity-20"
                     alt=""
                     loading="lazy"
                     decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/60 to-transparent" />
               </div>

               {/* Mobile: stacked layout */}
               <div className="relative z-10 flex flex-col md:hidden items-center pt-10 pb-8 px-6 text-white text-center">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[#b50a0a] shadow-2xl mb-6 shrink-0">
                     <img
                        src={profile.avatar_url || "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=400&auto=format&fit=crop"}
                        alt={displayName}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                     />
                  </div>
                  <span className="text-[#ff4d4d] font-bold tracking-[0.3em] mb-2 text-xs uppercase">{profileAgency}</span>
                  <h1 className="text-4xl font-bold tracking-tight leading-none mb-8 drop-shadow-2xl mt-4">
                     {firstName} <span className="text-white">{restOfName}</span>
                  </h1>
               </div>

               {/* Desktop: side-by-side layout */}
               <div className="hidden md:flex max-w-[1200px] mx-auto w-full h-[450px] relative px-4 lg:px-0">
                  <div className="w-[40%] h-full relative flex items-center justify-center">
                     <div className="absolute w-[300px] h-[300px] lg:w-[360px] lg:h-[360px] bg-[#b50a0a]/20 blur-[100px] rounded-full" />
                     <div className="w-[300px] h-[300px] lg:w-[360px] lg:h-[360px] rounded-full border-[6px] border-[#b50a0a] shadow-2xl overflow-hidden relative z-10 shrink-0 aspect-square">
                        <img
                           src={profile.avatar_url || "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=600&auto=format&fit=crop"}
                           alt={displayName}
                           className="w-full h-full object-cover object-top"
                           loading="eager"
                        />
                     </div>
                  </div>
                  <div className="w-[60%] flex flex-col justify-center items-start pl-16 text-white z-20">
                     <span className="text-[#ff4d4d] font-bold tracking-[0.4em] mb-3 text-base uppercase">{profileAgency}</span>
                     <h1 className="flex flex-col leading-none drop-shadow-2xl mb-12 mt-4">
                        <span className="text-7xl font-black tracking-tight">{firstName}</span>
                        <span className="text-8xl font-black tracking-tighter text-white">{restOfName}</span>
                     </h1>
                     
                     <div className="flex items-center gap-6">
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

            {/* Tabs Navigation */}
            <div className="z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
                  <div className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden gap-1 sm:gap-0">
                     {["Bio", "Discoveries", "Gallery"].map((tab) => (
                        <button
                           key={tab}
                           onClick={() => { setActiveTab(tab); setCurrentPage(1); setSearchQuery(""); }}
                           className={`relative text-xs font-bold tracking-wide whitespace-nowrap py-4 px-3 sm:px-4 hover:text-[#b50a0a] transition-colors ${activeTab === tab ? 'text-[#b50a0a] font-bold' : 'text-gray-500'}`}
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

            {/* Content Area */}
            <div className="max-w-[1200px] mx-auto px-4 lg:px-0 py-20">
               {activeTab === "Bio" && (
                  <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     {/* Overview Section */}
                     <div className="bg-gray-50 border border-gray-100 rounded-[40px] p-10 shadow-sm mb-16">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">Professional Data</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                           <div className="flex flex-col gap-2">
                              <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">License Status</span>
                              {profile.fa_license_number || profile.license_code || profile.license ? (
                                 <div className="flex items-center gap-2">
                                    {showLicense ? (
                                       <span className="text-xl font-black text-gray-900">{profile.fa_license_number || profile.license_code || profile.license}</span>
                                    ) : (
                                       <span className="px-3 py-1 bg-green-100 border border-green-200 rounded-full text-xs font-bold text-green-700 uppercase">Licensed</span>
                                    )}
                                    <button 
                                       onClick={() => setShowLicense(!showLicense)}
                                       className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                                       title={showLicense ? "Hide ID" : "Show ID"}
                                    >
                                       {showLicense ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                 </div>
                              ) : (
                                 <span className="text-xl font-black text-gray-400">Unlicensed</span>
                              )}
                           </div>
                           <div className="flex flex-col gap-2 border-l border-gray-200 pl-8">
                              <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">Agency Name</span>
                              {profile.organization_id ? (
                                 <Link href={`/organizations/${profile.organization_id}`} className="text-xl font-black text-[#a20000] hover:underline">
                                    {profileAgency}
                                 </Link>
                              ) : (
                                 <span className="text-xl font-black text-[#a20000]">{profileAgency}</span>
                              )}
                           </div>
                           <div className="flex flex-col gap-2 border-l border-gray-200 pl-8">
                              <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">Specialized Regions</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                 {(profile.specialized_regions || []).map((region: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-[#b50a0a]/5 border border-[#b50a0a]/10 text-[#b50a0a] rounded-full text-xs font-bold">
                                       {region}
                                    </span>
                                 ))}
                                 {(!profile.specialized_regions || profile.specialized_regions.length === 0) && (
                                    <span className="text-sm font-medium text-gray-500">Global</span>
                                 )}
                              </div>
                           </div>
                           
                           <div className="flex flex-col gap-2 pt-8 border-t border-gray-200 col-span-2">
                              <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">Qualifications</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                 {(profile.scouting_qualifications || []).map((qual: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600">
                                       {qual}
                                    </span>
                                 ))}
                                 {(!profile.scouting_qualifications || profile.scouting_qualifications.length === 0) && (
                                    <span className="text-sm font-medium text-gray-500">N/A</span>
                                 )}
                              </div>
                           </div>
                           <div className="flex flex-col gap-2 pt-8 border-t border-gray-200 col-span-2">
                              <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">Methodologies</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                 {(profile.scouting_methodologies || []).map((method: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600">
                                       {method}
                                    </span>
                                 ))}
                                 {(!profile.scouting_methodologies || profile.scouting_methodologies.length === 0) && (
                                    <span className="text-sm font-medium text-gray-500">N/A</span>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Agent's Philosophy (Bio) */}
                     <div className="space-y-8">
                        <div>
                           <h2 className="text-3xl font-bold text-gray-700 tracking-tighter inline-block relative border-b-4 border-[#a20000] pb-2">
                              Scouting Philosophy
                           </h2>
                        </div>
                        <div className="text-base leading-relaxed text-gray-600 font-medium prose prose-sm sm:prose-base max-w-none prose-a:text-[#b50a0a] hover:prose-a:text-red-700">
                           {profile.bio ? (
                             parse(profile.bio)
                           ) : (
                             <p>No biography or scouting philosophy provided yet.</p>
                           )}
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === "Discoveries" && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <h2 className="text-3xl font-bold text-gray-700 tracking-tighter inline-block relative border-b-4 border-[#a20000] pb-2">
                           Past Discoveries
                        </h2>
                        <div className="flex items-center gap-4">
                           <div className="relative">
                              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input 
                                 type="text" 
                                 placeholder="Search discoveries..." 
                                 className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#b50a0a] transition-colors w-full sm:w-64"
                                 value={searchQuery}
                                 onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                              />
                           </div>
                           <button 
                              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                              className="px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-sm font-bold text-gray-700 transition-colors whitespace-nowrap"
                           >
                              Sort Year ({sortOrder.toUpperCase()})
                           </button>
                        </div>
                     </div>

                     {currentDiscoveries.length > 0 ? (
                        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                           <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                 <thead>
                                    <tr className="bg-gray-50/50">
                                       <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Player Name</th>
                                       <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Year</th>
                                       <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Recommended To</th>
                                       <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Current Club</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                    {currentDiscoveries.map((discovery: any, index: number) => (
                                       <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                                          <td className="p-5 text-sm font-bold text-gray-900 whitespace-nowrap">{discovery.playerName || '-'}</td>
                                          <td className="p-5 text-sm font-bold text-[#b50a0a] whitespace-nowrap">{discovery.year || '-'}</td>
                                          <td className="p-5 text-sm font-bold text-gray-900 whitespace-nowrap">{discovery.recommendedTo || '-'}</td>
                                          <td className="p-5 text-sm font-bold text-gray-600 whitespace-nowrap">{discovery.currentStatus || '-'}</td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     ) : (
                        <div className="py-24 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                           <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                           <p className="text-gray-500 text-sm font-bold tracking-wide">No discoveries matched your criteria.</p>
                        </div>
                     )}

                     {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                           <button 
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(p => p - 1)}
                              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-gray-50 transition-colors"
                           >
                              Previous
                           </button>
                           <span className="text-sm font-bold text-gray-500">Page {currentPage} of {totalPages}</span>
                           <button 
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(p => p + 1)}
                              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-gray-50 transition-colors"
                           >
                              Next
                           </button>
                        </div>
                     )}
                  </div>
               )}

               {activeTab === "Gallery" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-700 tracking-tighter inline-block relative border-b-4 border-[#a20000] pb-2">
                           Media Gallery
                        </h2>
                     </div>
                     {/* Videos Section */}
                     {profile.video_links && profile.video_links.length > 0 && (
                        <div className="mb-12">
                           <h3 className="text-sm font-bold text-gray-500 tracking-[0.2em] mb-6 uppercase">Featured Videos</h3>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {profile.video_links.map((url: string, i: number) => {
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
                     {profile.gallery_urls && profile.gallery_urls.length > 0 && (
                        <div>
                           <h3 className="text-sm font-bold text-gray-500 tracking-[0.2em] mb-6 uppercase">Action Shots</h3>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {profile.gallery_urls.map((media: any, i: number) => (
                                 <div key={i} className="relative aspect-square rounded-3xl overflow-hidden group cursor-pointer" onClick={() => setSelectedImageIndex(i)}>
                                    <Image
                                       src={media.url || media}
                                       alt={`Gallery image ${i + 1}`}
                                       fill
                                       className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {(!profile.video_links?.length && !profile.gallery_urls?.length) && (
                        <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                           <Eye className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                           <p className="text-gray-500 text-sm font-bold tracking-wide">No media gallery available.</p>
                        </div>
                     )}

                     {selectedImageIndex !== null && profile.gallery_urls && (
                        <ImageLightbox 
                           images={profile.gallery_urls.map((m: any) => m.url || m)} 
                           currentIndex={selectedImageIndex} 
                           onClose={() => setSelectedImageIndex(null)} 
                        />
                     )}
                  </div>
               )}
            </div>
         </main>

         <Footer />
      </div>
   );
}
