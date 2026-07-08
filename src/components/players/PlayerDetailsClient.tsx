'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Facebook, Instagram, Twitter, ChevronLeft, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PlayerDetailsClientProps {
  athlete: any;
}

export function PlayerDetailsClient({ athlete }: PlayerDetailsClientProps) {
   const [activeTab, setActiveTab] = useState("Profile");
   const router = useRouter();
   const displayName = athlete.full_name || `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || 'Anonymous Player';
   const nameParts = displayName.split(' ');
   const firstName = nameParts[0];
   const restOfName = nameParts.slice(1).join(' ');

   return (
      <div className="min-h-screen bg-white">
         <Navbar />

         <main className="pt-32 sm:pt-40">
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

            {/* Hero â€” mobile stacked, desktop split */}
            <div className="relative w-full bg-[#0a0a0b] overflow-hidden">
               {/* Background stadium image */}
               <div className="absolute inset-0 z-0">
                  <img
                     src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=60&w=1200&auto=format&fit=crop"
                     className="w-full h-full object-cover object-center opacity-20"
                     alt=""
                     loading="lazy"
                     decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/60 to-transparent" />
               </div>

               {/* Mobile: stacked layout */}
               <div className="relative z-10 flex flex-col md:hidden items-center pt-10 pb-0 px-6 text-white text-center">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[#b50a0a]/40 shadow-2xl mb-6 shrink-0">
                     <img
                        src={athlete.avatar_url || "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=400&auto=format&fit=crop"}
                        alt={displayName}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                     />
                  </div>
                  <span className="text-[#ff4d4d] font-bold tracking-[0.3em] mb-2 text-xs">{athlete.position || 'Elite Player'}</span>
                  <h1 className="text-4xl font-bold tracking-tight leading-none mb-4 drop-shadow-2xl">
                     {firstName} <span className="text-white">{restOfName}</span>
                  </h1>
                  <div className="flex flex-wrap gap-3 justify-center mb-6">
                     <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-xl flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-300 tracking-wide mb-0.5">Status</span>
                        <span className="text-base font-bold text-white capitalize">{athlete.status || 'Active'}</span>
                     </div>
                     <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-xl flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-300 tracking-wide mb-0.5">Height</span>
                        <span className="text-base font-bold text-white">{athlete.height_cm ? `${athlete.height_cm}cm` : 'N/A'}</span>
                     </div>
                     <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-xl flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-300 tracking-wide mb-0.5">Foot</span>
                        <span className="text-base font-bold text-white">{athlete.foot || 'Right'}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 text-base font-bold mb-8 text-white/80">
                     <MapPin className="w-3.5 h-3.5 text-[#b50a0a]" />
                     <span>{athlete.current_club || 'Free Agent'}</span>
                     <span className="text-white/30">Â·</span>
                     <span>{athlete.country || 'Global'}</span>
                  </div>
               </div>

               {/* Desktop: side-by-side layout */}
               <div className="hidden md:flex max-w-[1200px] mx-auto w-full h-[450px] relative px-4 lg:px-0">
                  <div className="w-[40%] h-full relative flex items-end justify-center">
                     <div className="absolute bottom-0 w-[120%] h-[80%] bg-[#b50a0a]/20 blur-[100px] rounded-full" />
                     <img
                        src={athlete.avatar_url || "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=600&auto=format&fit=crop"}
                        alt={displayName}
                        className="h-[105%] w-auto object-cover object-top drop-shadow-[0_20px_50px_rgba(181,10,10,0.3)] relative z-10"
                        loading="eager"
                     />
                  </div>
                  <div className="w-[60%] flex flex-col justify-center items-start pl-16 text-white z-20">
                     <span className="text-[#ff4d4d] font-bold tracking-[0.4em] mb-3 text-base">{athlete.position || 'Elite Player'}</span>
                     <h1 className="flex flex-col leading-none drop-shadow-2xl mb-8">
                        <span className="text-7xl font-black tracking-tight">{firstName}</span>
                        <span className="text-8xl font-black tracking-tighter text-white">{restOfName}</span>
                     </h1>
                     <div className="flex gap-4 mb-10 flex-wrap">
                        {[
                           { label: 'Status', value: athlete.status || 'Active' },
                           { label: 'Height', value: athlete.height_cm ? `${athlete.height_cm}cm` : 'N/A' },
                           { label: 'Main Foot', value: athlete.foot || 'Right' },
                        ].map((s) => (
                           <div key={s.label} className="backdrop-blur-xl bg-white/5 border border-white/10 px-6 py-3.5 rounded-2xl flex flex-col">
                              <span className="text-xs font-bold text-gray-200 tracking-[0.2em] mb-1">{s.label}</span>
                              <span className="text-xl font-bold text-white capitalize">{s.value}</span>
                           </div>
                        ))}
                     </div>
                     <div className="flex items-center gap-6">
                        <span className="font-bold tracking-wide text-base">{athlete.current_club || 'Free Agent'}</span>
                        <div className="h-6 w-[1px] bg-white/20" />
                        <div className="flex items-center gap-4">
                           {athlete.social_links?.facebook && (
                              <a href={athlete.social_links.facebook} target="_blank" rel="noopener noreferrer">
                                 <Facebook className="w-4 h-4 hover:text-[#b50a0a] transition-colors" />
                              </a>
                           )}
                           {athlete.social_links?.instagram && (
                              <a href={athlete.social_links.instagram} target="_blank" rel="noopener noreferrer">
                                 <Instagram className="w-4 h-4 hover:text-[#b50a0a] transition-colors" />
                              </a>
                           )}
                           {athlete.social_links?.twitter && (
                              <a href={athlete.social_links.twitter} target="_blank" rel="noopener noreferrer">
                                 <Twitter className="w-4 h-4 hover:text-[#b50a0a] transition-colors" />
                              </a>
                           )}
                           {!athlete.social_links && (
                              <>
                                 <Facebook className="w-4 h-4 text-white/20" />
                                 <Instagram className="w-4 h-4 text-white/20" />
                                 <Twitter className="w-4 h-4 text-white/20" />
                              </>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Tab Navigation */}
            <div className="sticky top-20 sm:top-32 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
               <div className="max-w-[1000px] mx-auto px-4 lg:px-0">
                  <div className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden gap-1 sm:gap-0">
                     {["Profile", "Career Stat.", "Gallery", "News", "Shop"].map((tab) => (
                        <button
                           key={tab}
                           onClick={() => setActiveTab(tab)}
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

            {/* Content */}
            <div className="max-w-[1000px] mx-auto px-4 lg:px-0 py-10 sm:py-16">
               {activeTab === "Profile" && (
                  <div className="flex flex-col">
                     <div className="mb-12 pb-12 border-b border-gray-100 flex flex-col lg:flex-row gap-10 lg:gap-24">
                        <div className="w-full lg:w-[60%]">
                           <h2 className="text-2xl sm:text-3xl font-bold text-gray-600 mb-6">Bio</h2>
                           <p className="text-base leading-relaxed text-gray-600 font-medium">
                              {athlete.bio || `Meet ${athlete.first_name || ''} ${athlete.last_name || ''}, one of the talented players on CenterKick.`}
                           </p>
                        </div>
                        <div className="w-full lg:w-[40%]">
                           <h2 className="text-2xl sm:text-3xl font-bold text-gray-600 mb-6">Honours</h2>
                           {athlete.achievements && Array.isArray(athlete.achievements) && athlete.achievements.length > 0 ? (
                              <div className="space-y-3">
                                 {athlete.achievements.map((item: any, i: number) => (
                                    <div key={i} className="text-base font-bold text-gray-900 flex items-center gap-2">
                                       <div className="w-1.5 h-1.5 bg-[#b50a0a] rounded-full shrink-0" />
                                       {item.title || item}
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <p className="text-gray-500 text-base font-medium">No honours recorded yet.</p>
                           )}
                        </div>
                     </div>

                     <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-600 mb-8">Player Data</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {[
                              { label: 'Country', value: athlete.country || 'N/A' },
                              { label: 'Position', value: athlete.position || 'Attack' },
                              { label: 'Weight', value: athlete.weight_kg ? `${athlete.weight_kg}kg` : 'N/A' },
                              { label: 'Height', value: athlete.height_cm ? `${athlete.height_cm}cm` : 'N/A' },
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
                  </div>
               )}

               {activeTab === "Gallery" && (
                  <div className="animate-in fade-in duration-500">
                     <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 tracking-tighter">Media <span className="text-[#b50a0a]">Gallery</span></h2>
                     
                     {/* Videos Section */}
                     {athlete.video_links && athlete.video_links.length > 0 && (
                        <div className="mb-12">
                           <h3 className="text-sm font-bold text-gray-500 tracking-[0.2em] mb-6 uppercase">Featured Videos</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <div key={i} className="aspect-video bg-black rounded-3xl overflow-hidden shadow-lg border border-gray-100">
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
                                 <div key={i} className="aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group cursor-pointer">
                                    <img src={url} alt="Action shot" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {(!athlete.video_links || athlete.video_links.length === 0) && (!athlete.gallery_urls || athlete.gallery_urls.length === 0) && (
                        <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                           <p className="text-gray-400 text-sm font-bold tracking-wide">No media available yet.</p>
                        </div>
                     )}
                  </div>
               )}

               {activeTab !== "Profile" && activeTab !== "Gallery" && (
                  <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                     <p className="text-gray-400 text-sm font-bold tracking-wide">{activeTab} â€” Coming Soon</p>
                  </div>
               )}
            </div>
         </main>
         <Footer />
      </div>
   );
}
