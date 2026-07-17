'use client';

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Briefcase, Users, Globe, ArrowRight, Share2, Mail, CheckCircle2, Award, ChevronLeft, Facebook, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import parse from 'html-react-parser';

const formatAbsoluteUrl = (url: string) => {
   if (!url) return '';
   if (url.startsWith('http://') || url.startsWith('https://')) return url;
   return `https://${url}`;
};

interface AgentDetailsClientProps {
  profile: Record<string, any>;
  managedClients: Record<string, any>[];
}

export default function AgentDetailsClient({ profile, managedClients }: AgentDetailsClientProps) {
   const mergedLinks = { ...(profile.social_links || {}), ...(profile.official_links || {}) };
   const [activeTab, setActiveTab] = useState("Bio");
   const router = useRouter();

   const displayName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous Agent';
   const nameParts = displayName.split(' ');
   const firstName = nameParts[0];
   const restOfName = nameParts.slice(1).join(' ');

   const profileAgency = profile.agency_name || 'NIL';

   // Metrics can be derived from managedClients if available
   const metrics = {
      transfers: profile.total_transfers || 0,
      talent: managedClients.length,
      value: profile.portfolio_value || "N/A",
      success: profile.success_rate || "N/A"
   };

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
                  <h1 className="text-4xl font-bold tracking-tight leading-none mb-8 drop-shadow-2xl">
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
                     <h1 className="flex flex-col leading-none drop-shadow-2xl mb-12">
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

            {/* Quick Metrics Bar */}
            <div className="bg-gray-50 border-y border-gray-100 py-8 sm:py-12">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12">
                     <div className="text-center md:text-left">
                        <span className="text-xs font-bold text-gray-400 tracking-wide block mb-2">Total Transfers</span>
                        <span className="text-4xl font-bold text-gray-900 leading-none">{metrics.transfers}+</span>
                     </div>
                     <div className="text-center md:text-left border-l border-gray-200 md:pl-12">
                        <span className="text-xs font-bold text-gray-400 tracking-wide block mb-2">Managed Talent</span>
                        <span className="text-4xl font-bold text-gray-900 leading-none">{metrics.talent}</span>
                     </div>
                     <div className="text-center md:text-left border-l border-gray-200 md:pl-12">
                        <span className="text-xs font-bold text-gray-400 tracking-wide block mb-2">Portfolio Value</span>
                        <span className="text-4xl font-bold text-[#a20000] leading-none">{metrics.value}</span>
                     </div>
                     <div className="text-center md:text-left border-l border-gray-200 md:pl-12">
                        <span className="text-xs font-bold text-gray-400 tracking-wide block mb-2">Success Rate</span>
                        <span className="text-4xl font-bold text-gray-900 leading-none">{metrics.success}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white border-b border-gray-100 z-40 shadow-sm overflow-x-auto no-scrollbar">
               <div className="max-w-[1200px] mx-auto flex items-center gap-12 h-20 px-4 lg:px-0">
                  {["Bio", "Portfolio"].map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-xs font-bold tracking-[0.25em] h-full relative transition-all ${
 activeTab === tab ? "text-[#a20000]" : "text-gray-400 hover:text-gray-900"
 }`}
                     >
                        {tab}
                        {activeTab === tab && (
                           <span className="absolute bottom-0 left-0 w-full h-1 bg-[#a20000] rounded-t-full shadow-[0_-4px_10px_rgba(162,0,0,0.3)]"></span>
                        )}
                     </button>
                  ))}
               </div>
            </div>

            {/* Content Area */}
            <div className="max-w-[1200px] mx-auto px-4 lg:px-0 py-20">
               
               {activeTab === "Portfolio" && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-700 tracking-tighter inline-block relative border-b-4 border-[#a20000] pb-2">
                           Managed Talent Network
                        </h2>
                        <span className="text-xs font-bold text-gray-400 tracking-wide">{managedClients.length} Profiles Found</span>
                     </div>

                     {managedClients.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {managedClients.map((client) => {
                              const isCoach = client.users?.role === 'coach';
                              const roleUrl = isCoach ? 'coaches' : 'players';
                              
                              return (
                                 <Link 
                                    key={client.id} 
                                    href={`/${roleUrl}/${client.slug}`}
                                    className="group bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2"
                                 >
                                    <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                                       <Image 
                                          src={client.avatar_url || "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=600&auto=format&fit=crop"} 
                                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                          alt={client.full_name || 'Client Avatar'} 
                                          fill
                                       />
                                       <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white tracking-wide border border-white/20">
                                          {client.position || (isCoach ? 'Tactician' : 'Attack')}
                                       </div>
                                    </div>
                                    <div className="p-6">
                                       <span className="text-xs font-bold text-[#a20000] tracking-[0.3em] mb-1 block">
                                          {isCoach ? 'Technical Staff' : 'Professional Athlete'}
                                       </span>
                                       <h4 className="text-lg font-bold text-gray-900 tracking-tighter group-hover:text-[#a20000] transition-colors">
                                          {client.first_name} {client.last_name}
                                       </h4>
                                       <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 text-xs font-bold text-gray-400 tracking-wide">
                                          <div className="flex items-center gap-2">
                                             <Globe className="w-3 h-3" />
                                             {client.country || 'Nigeria'}
                                          </div>
                                          <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-[#a20000] group-hover:translate-x-1 transition-all" />
                                       </div>
                                    </div>
                                 </Link>
                              );
                           })}
                        </div>
                     ) : (
                        <div className="py-24 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                              <Users className="w-8 h-8 text-gray-300" />
                           </div>
                           <p className="text-gray-400 font-bold tracking-wide text-base">No talent managed yet.</p>
                        </div>
                     )}
                  </div>
               )}

               {activeTab === "Bio" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="lg:col-span-2 space-y-12">
                        <div>
                           <h2 className="text-3xl font-bold text-gray-700 tracking-tighter inline-block relative border-b-4 border-[#a20000] pb-2">
                              Agent&apos;s Philosophy
                           </h2>
                        </div>
                        <div className="prose prose-sm sm:prose-base text-gray-500 font-medium leading-[1.8] max-w-none">
                           {profile.bio ? (
                             parse(profile.bio)
                           ) : (
                             <p>No biography provided yet.</p>
                           )}
                        </div>
                     </div>
                     <div className="space-y-8">
                        <div className="bg-gray-50 rounded-[40px] p-10 border border-gray-100 shadow-sm">
                           <h3 className="text-base font-bold text-gray-900 tracking-wide mb-8 border-b border-gray-200 pb-4">Affiliations</h3>
                           <div className="space-y-6">
                              {[
                                 { label: "License", value: profile.license_code || "FIFA Licensed Agent" },
                                 { label: "Agency", value: profile.agency_name || "Independent" },
                                 { label: "Country", value: profile.country || "Global" }
                              ].map((item, i) => (
                                 <div key={i}>
                                    <span className="text-xs font-bold text-gray-400 tracking-wide block mb-1">{item.label}</span>
                                    <span className="text-base font-bold text-gray-900">{item.value}</span>
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
