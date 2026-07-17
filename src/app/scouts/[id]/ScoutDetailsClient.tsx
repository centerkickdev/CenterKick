'use client';

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Eye, Users, Globe, ArrowRight, Mail, CheckCircle2, Award, ChevronLeft, Facebook, Instagram, Linkedin } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import parse from 'html-react-parser';

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
   const router = useRouter();

   const displayName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous Scout';
   const nameParts = displayName.split(' ');
   const firstName = nameParts[0];
   const restOfName = nameParts.slice(1).join(' ');

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
            <div className="bg-white border-b border-gray-100 z-40 shadow-sm overflow-x-auto no-scrollbar">
               <div className="max-w-[1200px] mx-auto flex items-center gap-12 h-20 px-4 lg:px-0">
                  {["Bio", "Affiliations"].map((tab) => (
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
            <div className="max-w-[1200px] mx-auto px-4 lg:px-0 py-6 sm:py-20">
               {activeTab === "Bio" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="lg:col-span-2 space-y-12">
                        <div>
                           <h2 className="text-3xl font-bold text-gray-700 tracking-tighter inline-block relative border-b-4 border-[#a20000] pb-2">
                              Scouting Philosophy
                           </h2>
                        </div>
                        <div className="prose prose-sm sm:prose-base text-gray-500 font-medium leading-[1.8] max-w-none">
                           {profile.bio ? (
                             parse(profile.bio)
                           ) : (
                             <p>No biography or scouting philosophy provided yet.</p>
                           )}
                        </div>
                     </div>
                     <div className="space-y-8">
                        <div className="bg-gray-50 rounded-[40px] p-10 border border-gray-100 shadow-sm">
                           <h3 className="text-base font-bold text-gray-900 tracking-wide mb-8 border-b border-gray-200 pb-4">Professional Data</h3>
                           <div className="space-y-6">
                              {[
                                 { label: "License Status", value: profile.license || "Certified Scout" },
                                 { label: "Agency Name", value: profile.agency_name || "Independent" },
                                 { label: "Country Focus", value: profile.country || "Global" }
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

               {activeTab === "Affiliations" && (
                  <div className="max-w-[700px] animate-in fade-in duration-500">
                     <h2 className="text-sm font-bold text-gray-900 tracking-wide mb-6 pb-2 border-b border-gray-100">
                        Registered Achievements & Licenses
                     </h2>
                     {profile.achievements && profile.achievements.length > 0 ? (
                        <ul className="space-y-4">
                           {profile.achievements.map((ach: string, i: number) => (
                              <li key={i} className="flex gap-3 text-base text-gray-600">
                                 <Award className="w-5 h-5 text-amber-500 shrink-0" />
                                 <span>{ach}</span>
                              </li>
                           ))}
                        </ul>
                     ) : (
                        <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                           <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                           <p className="text-gray-500 text-sm font-bold tracking-wide">No certifications registered yet.</p>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </main>

         <Footer />
      </div>
   );
}
