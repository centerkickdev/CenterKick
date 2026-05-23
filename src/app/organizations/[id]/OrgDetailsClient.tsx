'use client';

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
   Building2, 
   MapPin, 
   Award, 
   Globe, 
   Mail, 
   Phone, 
   ShieldCheck, 
   Users2, 
   ArrowRight,
   ChevronLeft
} from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface OrgDetailsClientProps {
  profile: any;
}

export default function OrgDetailsClient({ profile }: OrgDetailsClientProps) {
   const [activeTab, setActiveTab] = useState("Profile");
   const router = useRouter();

   const displayName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous Organization';

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
            {/* Hero Banner */}
            <div className="relative h-[400px] w-full bg-gray-900 overflow-hidden">
               <img 
                  src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2000&auto=format&fit=crop" 
                  className="absolute inset-0 w-full h-full object-cover opacity-35 grayscale" 
                  alt="Training Ground" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent"></div>

               <div className="absolute inset-0 flex flex-col items-center justify-center pt-20">
                  <div className="w-48 h-48 rounded-full border-8 border-white/10 overflow-hidden bg-white/5 flex items-center justify-center relative shadow-2xl z-10">
                     {profile.avatar_url ? (
                        <img 
                           src={profile.avatar_url} 
                           className="w-full h-full object-cover" 
                           alt={displayName} 
                        />
                     ) : (
                        <Building2 className="w-20 h-20 text-white/50" />
                     )}
                  </div>
                  <div className="mt-6 text-center z-20">
                     <h1 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                        {displayName}
                     </h1>
                     <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="inline-block bg-[#a20000] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                           {profile.role === 'organization' ? 'Academy Partner' : 'Club Partner'}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-32 z-40">
               <div className="max-w-[1000px] mx-auto flex items-center justify-between px-4 lg:px-0">
                  <div className="flex overflow-x-auto no-scrollbar py-1">
                     {["Profile", "Bio", "Achievements"].map((tab) => (
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
                     <Link href="/register">
                        <button className="bg-[#a20000] hover:bg-[#8a0000] text-white px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">
                           Connect Partner
                        </button>
                     </Link>
                  </div>
               </div>
            </div>

            {/* Content Body */}
            <div className="max-w-[1000px] mx-auto px-4 lg:px-0 py-16">
               {activeTab === "Profile" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                     <div className="md:col-span-2 space-y-12">
                        {/* Summary Details */}
                        <section>
                           <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 pb-2 border-b border-gray-100">
                              Overview Info
                           </h2>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                              <div className="flex items-start gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                 </div>
                                 <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Country / Region</span>
                                    <span className="text-sm font-black text-gray-800 uppercase mt-0.5 block">{profile.country || 'Global'}</span>
                                 </div>
                              </div>

                              <div className="flex items-start gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                                    <ShieldCheck className="w-5 h-5 text-gray-500" />
                                 </div>
                                 <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Registration / License</span>
                                    <span className="text-sm font-black text-gray-800 uppercase mt-0.5 block">{profile.license || 'Verified Organization'}</span>
                                 </div>
                              </div>

                              <div className="flex items-start gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                                    <Award className="w-5 h-5 text-gray-500" />
                                 </div>
                                 <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">League / Association</span>
                                    <span className="text-sm font-black text-gray-800 uppercase mt-0.5 block">{profile.league || 'Development League'}</span>
                                 </div>
                              </div>

                              <div className="flex items-start gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                                    <Users2 className="w-5 h-5 text-gray-500" />
                                 </div>
                                 <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Preferred Formation</span>
                                    <span className="text-sm font-black text-gray-800 uppercase mt-0.5 block">{profile.formation || '4-3-3 / Development'}</span>
                                 </div>
                              </div>
                           </div>
                        </section>

                        {/* Description */}
                        <section>
                           <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 pb-2 border-b border-gray-100">
                              About Our Academy
                           </h2>
                           <p className="text-gray-600 text-sm leading-relaxed font-medium">
                              {profile.bio || 'Premium sports organization committed to developing academy prospects and providing professional infrastructure.'}
                           </p>
                        </section>
                     </div>

                     {/* Sidebar Contact Info */}
                     <div className="space-y-8 bg-gray-50 p-8 rounded-3xl border border-gray-100 h-fit">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">
                           Contact Office
                        </h3>

                        <div className="space-y-4">
                           <div className="flex items-center gap-3 text-xs text-gray-600">
                              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="truncate">{profile.contact_email || 'office@centerkick.com'}</span>
                           </div>
                           <div className="flex items-center gap-3 text-xs text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                              <span>{profile.phone_number || '+234 Verified Phone'}</span>
                           </div>
                           <div className="flex items-center gap-3 text-xs text-gray-600">
                              <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                              <span>www.centerkick.com</span>
                           </div>
                        </div>

                        <Link href="/register" className="block w-full">
                           <button className="w-full bg-[#a20000] hover:bg-black text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2">
                              Send Message <ArrowRight className="w-3.5 h-3.5" />
                           </button>
                        </Link>
                     </div>
                  </div>
               )}

               {activeTab === "Bio" && (
                  <div className="max-w-[700px]">
                     <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 pb-2 border-b border-gray-100">
                        Academy Bio / History
                     </h2>
                     <p className="text-gray-600 text-sm leading-relaxed font-medium">
                        {profile.bio || 'This organization has not completed its full historical biography. Sign up to manage this profile and update details.'}
                     </p>
                  </div>
               )}

               {activeTab === "Achievements" && (
                  <div className="max-w-[700px]">
                     <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 pb-2 border-b border-gray-100">
                        Registered Achievements
                     </h2>
                     {profile.achievements && profile.achievements.length > 0 ? (
                        <ul className="space-y-4">
                           {profile.achievements.map((ach: string, i: number) => (
                              <li key={i} className="flex gap-3 text-sm text-gray-600">
                                 <Award className="w-5 h-5 text-amber-500 shrink-0" />
                                 <span>{ach}</span>
                              </li>
                           ))}
                        </ul>
                     ) : (
                        <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                           <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                           <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No achievements registered yet.</p>
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
