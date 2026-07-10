'use client';

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
   Briefcase, 
   Users, 
   Globe, 
   ArrowRight,
   Share2,
   Mail,
   CheckCircle2,
   Award,
   ChevronLeft
} from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface AgentDetailsClientProps {
  profile: Record<string, any>;
  managedClients: Record<string, any>[];
}

export default function AgentDetailsClient({ profile, managedClients }: AgentDetailsClientProps) {
   const [activeTab, setActiveTab] = useState("Bio");
   const router = useRouter();

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
                  <div className="relative group shrink-0 hidden sm:block">
                     <div className="w-56 h-56 lg:w-72 lg:h-72 rounded-[48px] overflow-hidden border-4 border-white/5 shadow-2xl transition-all duration-700 group-hover:rounded-[24px]">
                        <Image 
                           src={profile.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop"} 
                           className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                           alt={profile.full_name || 'Agent Avatar'} 
                           fill
                        />
                     </div>
                     <div className="absolute -bottom-4 -right-4 bg-[#a20000] p-4 rounded-2xl shadow-xl">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                     </div>
                  </div>

                  <div className="flex-1 space-y-4 sm:space-y-6">
                     <span className="text-[#a20000] font-bold text-sm tracking-[0.4em] block">Certified Lead Agent</span>
                     <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">
                        {profile.first_name} <br />
                        <span className="text-[#a20000]">{profile.last_name}</span>
                     </h1>
                     <div className="flex flex-wrap items-center gap-8 text-white/60 pt-4">
                        <div className="flex items-center gap-2">
                           <Briefcase className="w-4 h-4 text-[#a20000]" />
                           <span className="text-sm font-bold tracking-wide">{profile.agency_name || 'Professional Agent'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Globe className="w-4 h-4 text-[#a20000]" />
                           <span className="text-sm font-bold tracking-wide">{profile.country || 'Global Operations'}</span>
                        </div>
                     </div>
                  </div>

                  <div className="hidden lg:flex flex-col gap-4 shrink-0">
                     <button className="bg-white text-black px-10 py-4 rounded-xl font-bold tracking-wide text-xs hover:bg-[#a20000] hover:text-white transition-all shadow-xl">
                        Schedule Consultation
                     </button>
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
            <div className="bg-white border-b border-gray-100 sticky top-32 z-40 shadow-sm overflow-x-auto no-scrollbar">
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
                        <div className="prose prose-xl text-gray-500 font-medium leading-[1.8]">
                           {profile.bio ? (
                             <p className="whitespace-pre-line">{profile.bio}</p>
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

            {/* Bottom CTA Overlay Banner */}
            <div className="bg-[#a20000] py-24 mb-10 mx-4 lg:mx-0 rounded-none lg:rounded-[100px] shadow-[0_40px_80px_rgba(162,0,0,0.3)] relative overflow-hidden">
               <div className="max-w-[1000px] mx-auto px-4 text-center relative z-10">
                  <h2 className="text-4xl lg:text-5xl font-black text-white mb-10 tracking-tighter leading-tight">
                     Professional representation <br />
                     <span className="opacity-60">Is just a few clicks away.</span>
                  </h2>
                  <div className="flex flex-wrap justify-center gap-6">
                     <Link href="/register">
                        <button className="bg-white text-black px-12 py-5 rounded-2xl font-bold tracking-wide text-sm hover:bg-black hover:text-white transition-all shadow-2xl">
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
