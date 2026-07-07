'use client';

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
   Eye,
   Users, 
   Globe, 
   ArrowRight,
   Mail,
   CheckCircle2,
   Award,
   ChevronLeft
} from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ScoutDetailsClientProps {
  profile: Record<string, any>;
}

export default function ScoutDetailsClient({ profile }: ScoutDetailsClientProps) {
   const [activeTab, setActiveTab] = useState("Bio");
   const router = useRouter();

   const displayName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous Scout';

   return (
      <div className="min-h-screen bg-white">
         <Navbar />

         <main className="pt-32 sm:pt-40">
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

            {/* Header / Hero Section */}
            <div className="relative h-[320px] sm:h-[500px] w-full bg-[#0a0a0a] overflow-hidden">
               <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,#a20000,transparent)]"></div>
               </div>

               <div className="max-w-[1200px] mx-auto px-4 lg:px-0 h-full flex flex-col sm:flex-row items-center gap-6 sm:gap-12 relative z-10 py-6 sm:py-0">
                  <div className="relative group shrink-0">
                     <div className="w-56 h-56 lg:w-72 lg:h-72 rounded-[48px] overflow-hidden border-4 border-white/5 shadow-2xl transition-all duration-700 group-hover:rounded-[24px]">
                        <img 
                           src={profile.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop"} 
                           className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                           alt={displayName} 
                        />
                     </div>
                     <div className="absolute -bottom-4 -right-4 bg-[#a20000] p-4 rounded-2xl shadow-xl">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                     </div>
                  </div>

                  <div className="flex-1 space-y-4 sm:space-y-6">
                     <span className="text-[#a20000] font-black text-sm tracking-[0.4em] block">Verified Talent Scout</span>
                     <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">
                        {profile.first_name} <br />
                        <span className="text-[#a20000]">{profile.last_name}</span>
                     </h1>
                     <div className="flex flex-wrap items-center gap-8 text-white/60 pt-4">
                        <div className="flex items-center gap-2">
                           <Eye className="w-4 h-4 text-[#a20000]" />
                           <span className="text-sm font-bold tracking-wide">{profile.agency_name || 'Independent Scout'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Globe className="w-4 h-4 text-[#a20000]" />
                           <span className="text-sm font-bold tracking-wide">{profile.country || 'Global Operations'}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white border-b border-gray-100 sticky top-32 z-40 shadow-sm overflow-x-auto no-scrollbar">
               <div className="max-w-[1200px] mx-auto flex items-center gap-12 h-20 px-4 lg:px-0">
                  {["Bio", "Affiliations"].map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-[10px] font-black tracking-[0.25em] h-full relative transition-all ${
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
                           <h2 className="text-3xl font-black text-gray-700 tracking-tighter inline-block relative border-b-4 border-[#a20000] pb-2">
                              Scouting Philosophy
                           </h2>
                        </div>
                        <div className="prose prose-xl text-gray-500 font-medium leading-[1.8]">
                           {profile.bio ? (
                             <p className="whitespace-pre-line">{profile.bio}</p>
                           ) : (
                             <p>No biography or scouting philosophy provided yet.</p>
                           )}
                        </div>
                     </div>
                     <div className="space-y-8">
                        <div className="bg-gray-50 rounded-[40px] p-10 border border-gray-100 shadow-sm">
                           <h3 className="text-base font-black text-gray-900 tracking-wide mb-8 border-b border-gray-200 pb-4">Professional Data</h3>
                           <div className="space-y-6">
                              {[
                                 { label: "License Status", value: profile.license || "Certified Scout" },
                                 { label: "Agency Name", value: profile.agency_name || "Independent" },
                                 { label: "Country Focus", value: profile.country || "Global" }
                              ].map((item, i) => (
                                 <div key={i}>
                                    <span className="text-[10px] font-bold text-gray-400 tracking-wide block mb-1">{item.label}</span>
                                    <span className="text-base font-black text-gray-900">{item.value}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === "Affiliations" && (
                  <div className="max-w-[700px] animate-in fade-in duration-500">
                     <h2 className="text-sm font-black text-gray-900 tracking-wide mb-6 pb-2 border-b border-gray-100">
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

            {/* Bottom CTA Overlay Banner */}
            <div className="bg-[#a20000] py-24 mb-10 mx-4 lg:mx-0 rounded-none lg:rounded-[100px] shadow-[0_40px_80px_rgba(162,0,0,0.3)] relative overflow-hidden">
               <div className="max-w-[1000px] mx-auto px-4 text-center relative z-10">
                  <h2 className="text-4xl lg:text-5xl font-black text-white mb-10 tracking-tighter leading-tight">
                     Partner with premier talent scouts <br />
                     <span className="opacity-60">To build your scouting network.</span>
                  </h2>
                  <div className="flex flex-wrap justify-center gap-6">
                     <Link href="/register">
                        <button className="bg-white text-black px-12 py-5 rounded-2xl font-black tracking-wide text-sm hover:bg-black hover:text-white transition-all shadow-2xl">
                           Partner With Us
                        </button>
                     </Link>
                  </div>
               </div>
            </div>
         </main>

         <Footer />
      </div>
   );
}
