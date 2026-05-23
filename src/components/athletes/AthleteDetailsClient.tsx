'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Facebook, Instagram, Twitter, Settings2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AthleteDetailsClientProps {
  athlete: any;
}

export function AthleteDetailsClient({ athlete }: AthleteDetailsClientProps) {
   const [activeTab, setActiveTab] = useState("Profile");
   const router = useRouter();
   const displayName = athlete.full_name || `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || 'Anonymous Player';
   const nameParts = displayName.split(' ');
   const firstName = nameParts[0];
   const restOfName = nameParts.slice(1).join(' ');

   return (
      <div className="min-h-screen bg-white">
         <Navbar />

         <main className="pt-32">
            {/* Back Button Bar */}
            <div className="bg-white border-b border-gray-100 py-4">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
                  <button 
                     onClick={() => router.back()}
                     className="group inline-flex items-center gap-2 text-gray-500 hover:text-black font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                     <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
                     Back
                  </button>
               </div>
            </div>

            {/* Premium Custom Player Header */}
            <div className="relative w-full h-[350px] md:h-[450px] bg-[#0a0a0b] flex overflow-hidden group">
               <div className="absolute inset-0 z-0">
                  <img
                     src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop"
                     className="w-full h-full object-cover object-center opacity-30 scale-105 group-hover:scale-100 transition-transform duration-1000"
                     alt="stadium background"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#b50a0a]/40 via-transparent to-[#0a0a0b] lg:to-transparent lg:bg-gradient-to-r lg:from-[#b50a0a]/30 lg:via-background/5 lg:to-[#0a0a0b]/90"></div>
                  <div className="absolute inset-0 bg-[#0a0a0b]/20"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent"></div>
               </div>

               <div className="max-w-[1200px] mx-auto w-full h-full relative flex px-4 lg:px-0">
                  <div className="w-[40%] h-full relative flex items-end justify-center">
                     <div className="absolute bottom-0 w-[120%] h-[80%] bg-[#b50a0a]/20 blur-[100px] rounded-full"></div>
                     <img
                        src={athlete.avatar_url || "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=600&auto=format&fit=crop"}
                        alt={displayName}
                        className="h-[105%] w-auto object-cover object-top drop-shadow-[0_20px_50px_rgba(181,10,10,0.3)] relative z-10 transition-transform duration-500 hover:scale-105"
                     />
                  </div>

                  <div className="w-[60%] flex flex-col justify-center items-start pl-8 md:pl-16 text-white z-20">
                     <div className="flex flex-col mb-8">
                        <span className="text-[#ff4d4d] font-bold tracking-[0.4em] uppercase mb-3 text-xs md:text-sm drop-shadow-sm">{athlete.position || 'Elite Player'}</span>
                        <h1 className="flex flex-col leading-none drop-shadow-2xl">
                           <span className="text-4xl md:text-7xl font-black uppercase tracking-tight">{firstName}</span>
                           <span className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white">{restOfName}</span>
                        </h1>
                     </div>

                     <div className="flex gap-4 mb-10 flex-wrap">
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 px-6 py-3.5 rounded-2xl flex flex-col hover:bg-white/10 transition-colors shadow-2xl">
                           <span className="text-[9px] uppercase font-bold text-gray-200 tracking-[0.2em] mb-1">Status</span>
                           <span className="text-xl font-black text-white capitalize">{athlete.status}</span>
                        </div>
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 px-6 py-3.5 rounded-2xl flex flex-col hover:bg-white/10 transition-colors shadow-2xl">
                           <span className="text-[9px] uppercase font-bold text-gray-200 tracking-[0.2em] mb-1">Height</span>
                           <span className="text-xl font-black text-white">{athlete.height_cm ? `${athlete.height_cm}cm` : 'N/A'}</span>
                        </div>
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 px-6 py-3.5 rounded-2xl flex flex-col hover:bg-white/10 transition-colors shadow-2xl">
                           <span className="text-[9px] uppercase font-bold text-gray-200 tracking-[0.2em] mb-1">Main Foot</span>
                           <span className="text-xl font-black text-white">{athlete.foot || 'Right'}</span>
                        </div>
                     </div>

                     <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                           <span className="font-bold tracking-widest text-sm uppercase">{athlete.current_club || 'Free Agent'}</span>
                        </div>
                        <div className="h-6 w-[1px] bg-white/20"></div>
                        <div className="flex items-center gap-4">
                           {athlete.social_links?.facebook && (
                              <a href={athlete.social_links.facebook} target="_blank" rel="noopener noreferrer">
                                 <Facebook className="w-4 h-4 cursor-pointer hover:text-[#b50a0a] transition-colors" />
                              </a>
                           )}
                           {athlete.social_links?.instagram && (
                              <a href={athlete.social_links.instagram} target="_blank" rel="noopener noreferrer">
                                 <Instagram className="w-4 h-4 cursor-pointer hover:text-[#b50a0a] transition-colors" />
                              </a>
                           )}
                           {athlete.social_links?.twitter && (
                              <a href={athlete.social_links.twitter} target="_blank" rel="noopener noreferrer">
                                 <Twitter className="w-4 h-4 cursor-pointer hover:text-[#b50a0a] transition-colors" />
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

            {/* Integrated Navigation */}
            <div className="sticky top-32 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
               <div className="max-w-[700px] mx-auto px-4 lg:px-0">
                  <div className="flex items-center justify-between overflow-x-auto [&::-webkit-scrollbar]:hidden pt-5 pb-0">
                     {["Profile", "Career Stat.", "Gallery", "News", "Shop"].map((tab) => (
                        <button
                           key={tab}
                           onClick={() => setActiveTab(tab)}
                           className={`relative text-[12px] font-bold uppercase tracking-widest whitespace-nowrap pb-4 px-2 hover:text-[#b50a0a] transition-colors ${activeTab === tab ? 'text-[#b50a0a] font-black' : 'text-gray-500'}`}
                        >
                           {tab}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 lg:px-0 py-16">
               {activeTab === "Profile" && (
                  <div className="flex flex-col">
                     <div className="mb-16 pb-16 border-b border-gray-100 flex flex-col lg:flex-row gap-16 lg:gap-24">
                        <div className="w-full lg:w-[60%]">
                           <div className="mb-8">
                              <h2 className="text-3xl font-black text-gray-600 inline-block relative">Bio</h2>
                           </div>
                           <div className="space-y-4 text-[13px] leading-relaxed text-gray-600 font-medium mb-8">
                              <p>{athlete.bio || `Meet ${athlete.first_name || ''} ${athlete.last_name || ''}, one of the talented players on CenterKick.`}</p>
                           </div>
                        </div>
                        <div className="w-full lg:w-[40%]">
                           <div className="mb-8 lg:pl-4">
                              <h2 className="text-3xl font-black text-gray-600 inline-block relative">Honours</h2>
                           </div>
                           {athlete.achievements && Array.isArray(athlete.achievements) && athlete.achievements.length > 0 ? (
                              <div className="space-y-4 lg:pl-4">
                                 {athlete.achievements.map((item: any, i: number) => (
                                    <div key={i} className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                       <div className="w-1.5 h-1.5 bg-[#b50a0a] rounded-full"></div>
                                       {item.title || item}
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <p className="text-gray-900 text-sm font-medium italic lg:pl-4">No honours recorded yet.</p>
                           )}
                        </div>
                     </div>

                     <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                        <div className="w-full lg:w-[45%]">
                           <div className="mb-10">
                              <h2 className="text-3xl font-black text-gray-600 inline-block relative">Player Data</h2>
                           </div>
                           <div className="space-y-6">
                              {[
                                 { label: 'Country', value: athlete.country || 'N/A' },
                                 { label: 'Position', value: athlete.position || 'Attack' },
                                 { label: 'Weight', value: athlete.weight_kg ? `${athlete.weight_kg}kg` : 'N/A' },
                                 { label: 'Height', value: athlete.height_cm ? `${athlete.height_cm}cm` : 'N/A' },
                                 { label: 'Jersey #', value: athlete.jersey_number || 'N/A' },
                                 { label: 'Market Value', value: athlete.market_value || 'N/A' },
                                 { 
                                   label: 'Managing Agent', 
                                   value: athlete.agent?.profiles ? (
                                     <Link href={`/agents/${athlete.agent.id}`} className="hover:text-[#b50a0a] transition-colors underline">
                                       {athlete.agent.profiles.first_name} {athlete.agent.profiles.last_name}
                                       <span className="text-[10px] ml-2 text-gray-900 font-bold">({athlete.agent.profiles.agency_name || 'Independent'})</span>
                                     </Link>
                                   ) : 'Independent' 
                                 }
                              ].map((item, i) => (
                                 <div key={i} className="flex">
                                    <span className="w-1/3 text-[13px] font-bold text-gray-900">{item.label}</span>
                                    <span className="w-2/3 text-[14px] font-black text-gray-900">{item.value}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </main>
         <Footer />
      </div>
   );
}
