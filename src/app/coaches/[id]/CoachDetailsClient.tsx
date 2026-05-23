'use client';

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
   Trophy, 
   Users, 
   Target, 
   TrendingUp, 
   Settings2, 
   ArrowRight,
   Share2,
   Mail,
   ChevronLeft
} from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CoachDetailsClientProps {
  profile: any;
}

export default function CoachDetailsClient({ profile }: CoachDetailsClientProps) {
   const [activeTab, setActiveTab] = useState("Profile");
   const router = useRouter();

   // Mock stats if not in database (for UI completeness as per landing page request)
   const stats = profile.stats || {
      matches: 56,
      goalsFor: 143,
      goalsAgainst: 51,
      wins: 41,
      draws: 11,
      losses: 4,
      points: 86
   };

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
            {/* Hero Section / Banner */}
            <div className="relative h-[450px] w-full bg-gray-900 overflow-hidden">
               <img 
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop" 
                  className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale" 
                  alt="Stadium" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent"></div>

               <div className="absolute inset-0 flex flex-col items-center justify-center pt-24">
                  <div className="w-56 h-56 rounded-full border-8 border-gray-100/10 overflow-hidden relative shadow-2xl z-10">
                     <img 
                        src={profile.avatar_url || "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=800&auto=format&fit=crop"} 
                        className="w-full h-full object-cover" 
                        alt={profile.full_name} 
                     />
                  </div>
                  <div className="mt-8 text-center z-20">
                     <h1 className="text-5xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                        {profile.first_name} <br /> 
                        <span className="text-[#a20000]">{profile.last_name}</span>
                     </h1>
                  </div>
               </div>
            </div>

            {/* Tab Navigation Section */}
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-32 z-40">
               <div className="max-w-[1000px] mx-auto flex items-center justify-between px-4 lg:px-0">
                  <div className="flex overflow-x-auto no-scrollbar py-1">
                     {["Profile", "Bio", "Statistics"].map((tab) => (
                        <button
                           key={tab}
                           onClick={() => setActiveTab(tab)}
                           className={`px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative shrink-0 ${
                              activeTab === tab ? "text-[#a20000]" : "text-gray-400 hover:text-gray-600"
                           }`}
                        >
                           {tab}
                           {activeTab === tab && (
                              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#a20000]"></span>
                           )}
                        </button>
                     ))}
                  </div>
                  <div className="hidden lg:flex items-center gap-4">
                     <button className="bg-[#a20000] hover:bg-[#8a0000] text-white px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">
                        Hire Coach
                     </button>
                  </div>
               </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-4 lg:px-0 py-16">
               
               {activeTab === "Profile" && (
                  <div className="flex flex-col space-y-24">
                     
                     <section>
                        <div className="mb-12">
                           <h2 className="text-3xl font-black text-gray-700 uppercase tracking-tighter inline-block relative">
                              Performance Status
                              <span className="absolute -bottom-3 left-0 w-12 border-b-2 border-gray-300"></span>
                           </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                           <div className="space-y-12">
                              <div className="relative group">
                                 <div className="mb-6">
                                    <h3 className="text-2xl font-black text-[#a20000] uppercase tracking-tight">2023/2024 Season</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 underline decoration-[#a20000]/20 underline-offset-4 decoration-2">Manager Performance Statistics</p>
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 gap-8">
                                 <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                                       <Users className="w-6 h-6 text-[#a20000]" />
                                    </div>
                                    <div>
                                       <span className="text-3xl font-black text-gray-900 block leading-none">{stats.matches}</span>
                                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Matches</span>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                                       <Target className="w-6 h-6 text-[#a20000]" />
                                    </div>
                                    <div>
                                       <span className="text-3xl font-black text-gray-900 block leading-none">{stats.goalsFor}:{stats.goalsAgainst}</span>
                                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Goals F/A</span>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                                       <TrendingUp className="w-6 h-6 text-[#a20000]" />
                                    </div>
                                    <div>
                                       <span className="text-3xl font-black text-gray-900 block leading-none">{stats.wins}:{stats.draws}:{stats.losses}</span>
                                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">W/D/L</span>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                                       <Trophy className="w-6 h-6 text-[#a20000]" />
                                    </div>
                                    <div>
                                       <span className="text-3xl font-black text-gray-900 block leading-none">{stats.points}</span>
                                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Points</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="relative group">
                              <div className="mb-6">
                                 <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter underline underline-offset-8 decoration-[#a20000]/30">Primary Formation</h3>
                              </div>
                              <div className="bg-[#1a472a] rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl relative border-4 border-gray-200">
                                 <div className="absolute inset-0 flex items-center justify-center p-8">
                                    <div className="w-full h-full border-2 border-white/20 rounded-md relative opacity-50">
                                       <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2"></div>
                                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white/20 rounded-full w-24 h-24"></div>
                                    </div>
                                 </div>
                                 <div className="absolute bottom-6 left-8 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest block">Main Formation</span>
                                    <span className="text-2xl font-black text-white leading-none">{profile.formation || "4-3-3"}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </section>

                     <section>
                        <div className="mb-12">
                           <h2 className="text-3xl font-black text-gray-700 uppercase tracking-tighter inline-block relative">
                              Profile Details
                              <span className="absolute -bottom-3 left-0 w-12 border-b-2 border-gray-300"></span>
                           </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-16 border border-gray-100 rounded-3xl p-10 bg-gray-50 shadow-sm">
                           {[
                              { label: "Jersey #", value: profile.jersey_number || "N/A" },
                              { label: "Market Value", value: profile.market_value || "N/A" },
                              { 
                                 label: "Managing Agent", 
                                 value: profile.agent?.profiles ? (
                                   <Link href={`/agents/${profile.agent.id}`} className="hover:text-[#a20000] transition-all underline">
                                     {profile.agent.profiles.first_name} {profile.agent.profiles.last_name}
                                     <span className="text-[10px] ml-2 text-gray-400 font-bold">({profile.agent.profiles.agency_name || 'Independent'})</span>
                                   </Link>
                                 ) : "Independent" 
                              },
                              { label: "Date Of Birth", value: profile.date_of_birth || "N/A" },
                              { label: "Country", value: profile.country || "N/A" },
                              { label: "Height", value: profile.height_cm ? `${profile.height_cm}cm` : "N/A" },
                              { label: "Weight", value: profile.weight_kg ? `${profile.weight_kg}kg` : "N/A" },
                              { label: "Manager Title", value: "Verified Coach" },
                              { label: "Joined", value: new Date(profile.created_at).toLocaleDateString() },
                              { label: "Technical License", value: profile.license || "Professional" }
                           ].map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between border-b border-gray-200/50 pb-4">
                                 <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                                 <span className="text-[13px] font-black text-gray-900">{item.value}</span>
                              </div>
                           ))}
                        </div>
                     </section>
                  </div>
               )}

               {activeTab === "Bio" && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="mb-12">
                        <h2 className="text-3xl font-black text-gray-700 uppercase tracking-tighter inline-block relative border-b-4 border-[#a20000] pb-2">
                           Biography
                        </h2>
                     </div>
                     <div className="prose prose-lg text-gray-600 max-w-none space-y-6 font-medium leading-[2]">
                        {profile.bio ? (
                           <p className="whitespace-pre-line">{profile.bio}</p>
                        ) : (
                           <p>No biography provided yet.</p>
                        )}
                     </div>
                  </div>
               )}

               {activeTab === "Statistics" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="mb-12">
                        <h2 className="text-3xl font-black text-gray-700 uppercase tracking-tighter inline-block relative">
                           Detailed Statistics
                           <span className="absolute -bottom-3 left-0 w-12 border-b-2 border-gray-300"></span>
                        </h2>
                     </div>
                     <div className="bg-gray-50 h-96 rounded-3xl border border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center space-y-4">
                           <TrendingUp className="w-12 h-12 text-gray-300 mx-auto" />
                           <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Detailed statistics arriving soon...</p>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Support Message / CTA Section */}
            <div className="bg-[#fcfafa] py-24 mb-10 w-full overflow-hidden relative">
               <div className="max-w-[1000px] mx-auto px-4 lg:px-0">
                  <div className="bg-gray-950 rounded-[40px] shadow-2xl relative text-center py-24 px-8 border-[12px] border-gray-900">
                     <span className="text-[#a20000] text-[10px] font-black uppercase tracking-[0.3em] mt-6 block mb-4">
                        Join CenterKick
                     </span>
                     <h2 className="text-4xl md:text-5xl font-black text-white mb-10 tracking-tighter uppercase leading-tight drop-shadow-2xl">
                        Design a profile to <br />
                        <span className="text-[#a20000]">Showcase Your Talent NOW</span>
                     </h2>
                     <Link href="/register">
                       <button className="bg-white text-gray-900 hover:text-[#a20000] font-black text-xs uppercase tracking-[0.2em] px-12 py-5 rounded-2xl shadow-xl hover:shadow-[0_20px_40px_rgba(162,0,0,0.2)] transition-all inline-flex items-center gap-4 group">
                          Get Started <ArrowRight className="w-5 h-5 text-[#a20000] group-hover:translate-x-2 transition-transform" />
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
