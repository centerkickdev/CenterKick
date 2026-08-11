'use client';

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Briefcase, Users, Globe, ArrowRight, Share2, Mail, CheckCircle2, Award, ChevronLeft, Facebook, Instagram, Linkedin, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import parse from 'html-react-parser';
import { useToast } from '@/context/ToastContext';

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
   const { showToast } = useToast();
   const mergedLinks = { ...(profile.social_links || {}), ...(profile.official_links || {}) };
   const [activeTab, setActiveTab] = useState("Bio");
   const [showLicense, setShowLicense] = useState(false);
   const router = useRouter();

   const displayName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous Agent';
   const nameParts = displayName.split(' ');
   const firstName = nameParts[0];
   const restOfName = nameParts.slice(1).join(' ');

   const rawAgency = profile.agency_name;
   const profileAgency = (rawAgency && rawAgency.toLowerCase() !== 'free agent') ? rawAgency : null;

   const handleShareProfile = async () => {
      const currentUrl = window.location.href;
      const shareTitle = `${displayName} | CenterKick Profile`;
      const shareText = `Check out ${displayName}${profileAgency ? ` (${profileAgency})` : ' (Football Agent)'} on CenterKick!`;

      if (typeof navigator !== 'undefined' && navigator.share) {
         try {
            await navigator.share({
               title: shareTitle,
               text: shareText,
               url: currentUrl,
            });
         } catch (e: any) {
            if (e?.name !== 'AbortError') {
               try {
                  await navigator.clipboard.writeText(currentUrl);
                  showToast('Profile link copied to clipboard!', 'success');
               } catch (err) {
                  showToast('Failed to share profile', 'error');
               }
            }
         }
      } else {
         try {
            await navigator.clipboard.writeText(currentUrl);
            showToast('Profile link copied to clipboard!', 'success');
         } catch (e) {
            showToast('Failed to copy link', 'error');
         }
      }
   };

   const regionsArr = profile.regions_of_operation || [];
   const allRegionsSelected = regionsArr.length === 5 && !regionsArr.includes('Global');
   const isGlobal = regionsArr.length === 0 || regionsArr.includes('Global') || allRegionsSelected;
   const displayRegions = isGlobal ? ['Global'] : regionsArr;

   const calculatePortfolioValue = () => {
      let total = 0;
      managedClients.forEach(client => {
         const mv = client.market_value;
         if (!mv) return;
         let num = parseFloat(mv.toString().replace(/[^0-9.]/g, ''));
         if (isNaN(num)) return;
         if (mv.toString().toUpperCase().includes('M')) num *= 1000000;
         else if (mv.toString().toUpperCase().includes('K')) num *= 1000;
         total += num;
      });
      if (total === 0) return "N/A";
      if (total >= 1000000) return `€${(total / 1000000).toFixed(1)}M`;
      if (total >= 1000) return `€${(total / 1000).toFixed(1)}K`;
      return `€${total}`;
   };

   const manualTransfers = profile.notable_transfers || [];

   const metrics = {
      transfers: manualTransfers.length,
      talent: managedClients.length,
      value: calculatePortfolioValue()
   };

   return (
      <div className="min-h-screen bg-white">
         <Navbar />

         <main className="pt-[72px] lg:pt-[76px]">
            {/* Back Button Bar */}
            <div className="bg-white border-b border-gray-100 py-4">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0 flex items-center justify-between">
                  <button 
                     onClick={() => router.back()}
                     className="group inline-flex items-center gap-2 text-gray-500 hover:text-black font-bold text-sm tracking-wide transition-colors"
                  >
                     <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
                     Back
                  </button>
                  <button
                     onClick={handleShareProfile}
                     className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm"
                  >
                     <Share2 className="w-3.5 h-3.5" />
                     Share Profile
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
                  {profileAgency && <span className="text-[#ff4d4d] font-bold tracking-[0.3em] mb-2 text-xs uppercase">{profileAgency}</span>}
                  <h1 className="text-4xl font-bold tracking-tight leading-none mb-6 drop-shadow-2xl mt-2">
                     {firstName} <span className="text-white">{restOfName}</span>
                  </h1>
                  <button
                     onClick={handleShareProfile}
                     className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold tracking-wide transition-all backdrop-blur-md shadow-sm"
                  >
                     <Share2 className="w-4 h-4" />
                     Share Profile
                  </button>
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
                     {profileAgency && <span className="text-[#ff4d4d] font-bold tracking-[0.4em] mb-3 text-base uppercase">{profileAgency}</span>}
                     <h1 className="flex flex-col leading-none drop-shadow-2xl mb-8 mt-2">
                        <span className="text-7xl font-black tracking-tight">{firstName}</span>
                        <span className="text-8xl font-black tracking-tighter text-white">{restOfName}</span>
                     </h1>
                     
                     <div className="flex items-center gap-6">
                        <button
                           onClick={handleShareProfile}
                           className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold tracking-wide transition-all backdrop-blur-md shadow-sm"
                        >
                           <Share2 className="w-4 h-4" />
                           Share Profile
                        </button>
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
                     {["Bio", "Portfolio"].map((tab) => (
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                           {managedClients.map((client) => {
                              const isCoach = client.users?.role === 'coach';
                              const roleUrl = isCoach ? 'coaches' : 'players';
                              
                              return (
                                 <Link href={`/${roleUrl}/${client.slug}`} key={client.id}>
                                    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 hover:border-[#a20000] hover:shadow-xl transition-all group cursor-pointer">
                                       <div className="flex items-center gap-4">
                                          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-200">
                                             {client.avatar_url ? (
                                                <img src={client.avatar_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={client.full_name || 'Client Avatar'} />
                                             ) : (
                                                <div className="w-full h-full bg-white flex items-center justify-center">
                                                   <Users className="w-6 h-6 text-gray-300" />
                                                </div>
                                             )}
                                          </div>
                                          <div>
                                             <h3 className="text-base font-bold text-gray-900 tracking-tight line-clamp-1 group-hover:text-[#a20000] transition-colors">
                                                {client.first_name} {client.last_name}
                                             </h3>
                                             <p className="text-xs font-bold text-gray-500 tracking-wide mt-1 capitalize">
                                                {isCoach ? 'Coach' : 'Player'} • {client.position || client.country || 'Global'}
                                             </p>
                                          </div>
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
                     {manualTransfers.length > 0 && (
                        <div className="pt-16 mt-8 border-t border-gray-100">
                           <div className="flex items-center justify-between mb-8">
                              <h2 className="text-3xl font-bold text-gray-700 tracking-tighter inline-block relative border-b-4 border-[#a20000] pb-2">
                                 Notable Transfers
                              </h2>
                           </div>
                           <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left border-collapse">
                                    <thead>
                                       <tr className="bg-gray-50/50">
                                          <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Player</th>
                                          <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                                          <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">From Club</th>
                                          <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">To Club</th>
                                          <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Fee</th>
                                          <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Agent Role</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                       {manualTransfers.map((transfer: any, index: number) => (
                                          <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                                             <td className="p-5 text-sm font-bold text-gray-900 whitespace-nowrap">{transfer.playerName}</td>
                                             <td className="p-5 text-sm font-bold text-gray-500 whitespace-nowrap">{transfer.date}</td>
                                             <td className="p-5 text-sm font-bold text-gray-900 whitespace-nowrap">{transfer.fromClub}</td>
                                             <td className="p-5 text-sm font-bold text-[#a20000] whitespace-nowrap">{transfer.toClub}</td>
                                             <td className="p-5 text-sm font-bold text-gray-900 whitespace-nowrap">{transfer.fee}</td>
                                             <td className="p-5 text-sm font-bold text-gray-500 whitespace-nowrap">{transfer.agentRole}</td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               )}

               {activeTab === "Bio" && (
                  <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     {/* Overview Section */}
                     <div className="bg-gray-50 border border-gray-100 rounded-[40px] p-10 shadow-sm mb-16">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">Overview</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                           <div className="flex flex-col gap-2">
                              <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">Total Transfers</span>
                              <span className="text-2xl font-black text-gray-900">{metrics.transfers}</span>
                           </div>
                           <div className="flex flex-col gap-2 border-l border-gray-200 pl-8">
                              <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">Managed Talent</span>
                              <span className="text-2xl font-black text-[#a20000]">{metrics.talent}</span>
                           </div>
                           <div className="flex flex-col gap-2 border-l border-gray-200 pl-8">
                              <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">Portfolio Value</span>
                              <span className="text-2xl font-black text-gray-900">{metrics.value}</span>
                           </div>
                           <div className="flex flex-col gap-2 border-l border-gray-200 pl-8">
                              <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">Country</span>
                              <span className="text-xl font-bold text-gray-900">{profile.country || "Global"}</span>
                           </div>
                           
                           <div className="flex flex-col gap-2 pt-8 border-t border-gray-200 col-span-1">
                              <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">License</span>
                              <div className="flex items-center gap-2">
                                 {showLicense ? (
                                    <span className="text-lg font-bold text-gray-900">{profile.fa_license_number || profile.license_code || "N/A"}</span>
                                 ) : (
                                    <span className="px-3 py-1 bg-green-100 border border-green-200 rounded-full text-xs font-bold text-green-700 uppercase">Licensed</span>
                                 )}
                                 {(profile.fa_license_number || profile.license_code) && (
                                    <button 
                                       onClick={() => setShowLicense(!showLicense)}
                                       className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                                       title={showLicense ? "Hide ID" : "Show ID"}
                                    >
                                       {showLicense ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                 )}
                              </div>
                           </div>
                           <div className="flex flex-col gap-2 pt-8 border-t border-gray-200 border-l pl-8 col-span-1">
                              <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">Agency Role</span>
                              <span className="text-lg font-bold text-gray-900">{profileAgency}</span>
                           </div>
                           <div className="flex flex-col gap-2 pt-8 border-t border-gray-200 border-l pl-8 col-span-2">
                              <span className="text-xs font-bold text-gray-400 tracking-wide uppercase">Regions of Operations</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                 {displayRegions.map((region: string, i: number) => (
                                    <span key={i} className={region === 'Global' ? "text-base font-bold text-gray-900" : "px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600"}>
                                       {region}
                                    </span>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Agent's Philosophy (Bio) */}
                     <div className="space-y-8">
                        <div>
                           <h2 className="text-3xl font-bold text-gray-700 tracking-tighter inline-block relative border-b-4 border-[#a20000] pb-2">
                              Agent&apos;s Philosophy
                           </h2>
                        </div>
                        <div className="text-base leading-relaxed text-gray-600 font-medium prose prose-sm sm:prose-base max-w-none prose-a:text-[#b50a0a] hover:prose-a:text-red-700">
                           {profile.bio ? (
                             parse(profile.bio)
                           ) : (
                             <p>No biography provided yet.</p>
                           )}
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
