'use client';

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Trophy, Users, Target, TrendingUp, Settings2, ArrowRight, Share2, Mail, ChevronLeft, MapPin, Facebook, Instagram, X, Send, Globe, Linkedin } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import parse from 'html-react-parser';
import { ImageLightbox } from '@/components/common/ImageLightbox';

const formatAbsoluteUrl = (url: string) => {
   if (!url) return '';
   if (url.startsWith('http://') || url.startsWith('https://')) return url;
   return `https://${url}`;
};

interface CoachDetailsClientProps {
  profile: any;
}

export default function CoachDetailsClient({ profile }: CoachDetailsClientProps) {
   const mergedLinks = { ...(profile.social_links || {}), ...(profile.official_links || {}) };
   const [activeTab, setActiveTab] = useState("Profile");
   const [isContactModalOpen, setIsContactModalOpen] = useState(false);
   const [contactFormData, setContactFormData] = useState({ name: '', email: '', message: '' });
   const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
   const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
   const router = useRouter();
   const displayName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous Coach';
   const nameParts = displayName.split(' ');
   const firstName = nameParts[0];
   const restOfName = nameParts.slice(1).join(' ');

   // Use real stats if available, otherwise fallback to 0
   const managerialHistory = profile.managerial_history || [];
   const stats = {
      wins: managerialHistory.reduce((acc: number, curr: any) => acc + (curr.wins || 0), 0),
      draws: managerialHistory.reduce((acc: number, curr: any) => acc + (curr.draws || 0), 0),
      losses: managerialHistory.reduce((acc: number, curr: any) => acc + (curr.losses || 0), 0),
   };
   const totalMatches = stats.wins + stats.draws + stats.losses;
   const totalPoints = (stats.wins * 3) + (stats.draws * 1);

   const calculateAge = (dob: string | undefined | null) => {
      if (!dob) return "NIL";
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) return "NIL";
      const diff = Date.now() - birthDate.getTime();
      const ageDate = new Date(diff);
      const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
      return isNaN(calculatedAge) ? "NIL" : calculatedAge;
   };

   const profileAge = calculateAge(profile.date_of_birth);
   const profileExp = profile.years_of_experience ? `${profile.years_of_experience} yrs` : 'NIL';
   const profileFormation = profile.formation || 'NIL';
   const profileClub = profile.current_club || 'NIL';


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
               <div className="relative z-10 flex flex-col md:hidden items-center pt-10 pb-0 px-6 text-white text-center">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[#b50a0a] shadow-2xl mb-6 shrink-0">
                     <img
                        src={profile.avatar_url || "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=400&auto=format&fit=crop"}
                        alt={displayName}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                     />
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight leading-none mb-4 drop-shadow-2xl mt-4">
                     {firstName} <span className="text-white">{restOfName}</span>
                  </h1>
                  <div className="flex flex-wrap gap-3 justify-center mb-6">
                     <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-xl flex flex-col items-center min-w-[80px]">
                        <span className="text-xs font-bold text-gray-300 tracking-wide mb-0.5">Age</span>
                        <span className="text-base font-bold text-white">{profileAge}</span>
                     </div>
                     <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-xl flex flex-col items-center min-w-[80px]">
                        <span className="text-xs font-bold text-gray-300 tracking-wide mb-0.5">EXP</span>
                        <span className="text-base font-bold text-white">{profileExp}</span>
                     </div>
                     <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-xl flex flex-col items-center min-w-[80px]">
                        <span className="text-xs font-bold text-gray-300 tracking-wide mb-0.5">Formation</span>
                        <span className="text-base font-bold text-white">{profileFormation}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 text-base font-bold mb-8 text-white/80">
                     <MapPin className="w-3.5 h-3.5 text-[#b50a0a]" />
                     <span>{profileClub}</span>
                     <span className="text-white/30">—</span>
                     <span>{profile.country || 'NIL'}</span>
                  </div>
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
                     <h1 className="flex flex-col leading-none drop-shadow-2xl mb-8 mt-4">
                        <span className="text-7xl font-black tracking-tight">{firstName}</span>
                        <span className="text-8xl font-black tracking-tighter text-white">{restOfName}</span>
                     </h1>
                     <div className="flex gap-4 mb-10 flex-wrap">
                        {[
                           { label: 'Age', value: profileAge },
                           { label: 'EXP', value: profileExp },
                           { label: 'Formation', value: profileFormation },
                        ].map((s) => (
                           <div key={s.label} className="backdrop-blur-xl bg-white/5 border border-white/10 px-6 py-3.5 rounded-2xl flex flex-col min-w-[100px]">
                              <span className="text-xs font-bold text-gray-200 tracking-[0.2em] mb-1 uppercase">{s.label}</span>
                              <span className="text-xl font-bold text-white capitalize">{s.value}</span>
                           </div>
                        ))}
                     </div>
                     <div className="flex items-center gap-6">
                        <span className="font-bold tracking-wide text-base">{profileClub}</span>
                        <div className="h-6 w-[1px] bg-white/20" />
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

            {/* Tab Navigation Section */}
            <div className="bg-white border-b border-gray-100 shadow-sm z-40">
               <div className="max-w-[1000px] mx-auto flex items-center justify-between px-4 lg:px-0">
                  <div className="flex overflow-x-auto no-scrollbar py-1">
                     {["Profile", "Bio", "Statistics", "Gallery"].map((tab) => (
                        <button
                           key={tab}
                           onClick={() => setActiveTab(tab)}
                           className={`px-8 py-6 text-xs font-bold tracking-[0.2em] transition-all relative shrink-0 ${
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
                     <button onClick={() => setIsContactModalOpen(true)} className="bg-[#a20000] hover:bg-[#8a0000] text-white px-6 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all">
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
                           <h2 className="text-3xl font-bold text-gray-700 tracking-tighter inline-block relative">
                              Profile Details
                              <span className="absolute -bottom-3 left-0 w-12 border-b-2 border-gray-300"></span>
                           </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-16 border border-gray-100 rounded-3xl p-10 bg-gray-50 shadow-sm">
                           {[
                              { label: "Current League", value: profile.league_name || "N/A" },
                              { label: "Current Club", value: profile.current_club || "Free Agent" },
                              { label: "Contract Expiry", value: profile.contract_expiry ? new Date(profile.contract_expiry).toLocaleDateString() : "N/A" },
                              { label: "Current Position", value: profile.current_position?.[0] || profile.role || "Head Coach" },
                              { label: "Coaching Licenses", value: profile.coaching_licenses?.join(', ') || profile.license || "N/A" },
                              { label: "Specialization", value: profile.specializations?.join(', ') || "N/A" },
                              { label: "Country", value: profile.country || "N/A" },
                              { label: "Languages", value: profile.languages_spoken?.join(', ') || "N/A" },
                           ].map((item, idx) => (
                              <div key={idx} className="flex flex-col md:flex-row md:items-start justify-between border-b border-gray-200/50 pb-4 gap-2">
                                 <span className="text-xs font-bold text-gray-400 tracking-wide md:w-1/3 shrink-0">{item.label}</span>
                                 <span className="text-sm font-bold text-gray-900 md:text-right md:w-2/3 leading-snug">{item.value}</span>
                              </div>
                           ))}
                        </div>
                     </section>

                     {/* Honors & Achievements */}
                     <section>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-600 mb-6">Honours</h2>
                        {profile.achievements && Array.isArray(profile.achievements) && profile.achievements.length > 0 ? (
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {profile.achievements.map((item: any, i: number) => {
                                 const isString = typeof item === 'string';
                                 const title = isString ? item : item.title;
                                 const year = isString ? '' : item.year;
                                 const category = isString ? '' : item.category;

                                 return (
                                    <div key={i} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col gap-2">
                                       <div className="flex items-center gap-2">
                                          <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                                          <span className="text-base font-bold text-gray-900">{title}</span>
                                       </div>
                                       {(year || category) && (
                                          <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider ml-7">
                                             {category && <span>{category}</span>}
                                             {category && year && <span>•</span>}
                                             {year && <span>{year}</span>}
                                          </div>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        ) : (
                           <p className="text-gray-500 text-base font-medium">No honours recorded yet.</p>
                        )}
                     </section>
                  </div>
               )}

               {activeTab === "Bio" && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-700 tracking-tighter inline-block relative border-b-4 border-[#a20000] pb-2">
                           Biography
                        </h2>
                     </div>
                     <div className="prose prose-sm sm:prose-base text-gray-600 max-w-none space-y-6 font-medium leading-[2]">
                        {profile.bio ? (
                           parse(profile.bio)
                        ) : (
                           <p>No biography provided yet.</p>
                        )}
                     </div>
                  </div>
               )}

               {activeTab === "Statistics" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="mb-12">
                        
                     <div className="mb-12">
                        <section>
                           <h2 className="text-3xl font-bold text-gray-700 tracking-tighter inline-block relative mb-8">
                              Performance Status
                              <span className="absolute -bottom-3 left-0 w-12 border-b-2 border-[#b50a0a]"></span>
                           </h2>
                           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-center">
                                 <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                                    <Target className="w-6 h-6 text-[#b50a0a]" />
                                 </div>
                                 <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">Matches</p>
                                 <p className="text-3xl font-black text-gray-900">{totalMatches}</p>
                              </div>
                              <div className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-center">
                                 <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                                    <Trophy className="w-6 h-6 text-emerald-500" />
                                 </div>
                                 <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">W / D / L</p>
                                 <p className="text-2xl font-black text-gray-900">{stats.wins} <span className="text-gray-300">/</span> {stats.draws} <span className="text-gray-300">/</span> {stats.losses}</p>
                              </div>
                              <div className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-center">
                                 <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                                    <TrendingUp className="w-6 h-6 text-blue-500" />
                                 </div>
                                 <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">Points</p>
                                 <p className="text-3xl font-black text-gray-900">{totalPoints}</p>
                              </div>
                              <div className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-center">
                                 <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                                    <Settings2 className="w-6 h-6 text-amber-500" />
                                 </div>
                                 <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">Formation</p>
                                 <p className="text-xl font-black text-gray-900">{profile.formation || 'N/A'}</p>
                              </div>
                           </div>
                        </section>
                     </div>

<h2 className="text-3xl font-bold text-gray-700 tracking-tighter inline-block relative">
                           Detailed Statistics
                           <span className="absolute -bottom-3 left-0 w-12 border-b-2 border-gray-300"></span>
                        </h2>
                     </div>
                     {managerialHistory && managerialHistory.length > 0 ? (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                           <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                 <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                       <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Club / Team</th>
                                       <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                       <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Period</th>
                                       <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">W / D / L</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                    {managerialHistory.map((record: any, idx: number) => (
                                       <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                          <td className="py-4 px-6">
                                             <span className="font-bold text-gray-900">{record.club || 'N/A'}</span>
                                          </td>
                                          <td className="py-4 px-6 text-gray-600 font-medium">
                                             {record.role || 'N/A'}
                                          </td>
                                          <td className="py-4 px-6 text-center text-gray-500 font-medium">
                                             {record.startDate ? new Date(record.startDate).getFullYear() : '?'} - {record.endDate ? new Date(record.endDate).getFullYear() : 'Present'}
                                          </td>
                                          <td className="py-4 px-6 text-center font-bold text-gray-900">
                                             <span className="text-emerald-600">{record.wins || 0}</span>
                                             <span className="text-gray-300 mx-1">/</span>
                                             <span className="text-amber-500">{record.draws || 0}</span>
                                             <span className="text-gray-300 mx-1">/</span>
                                             <span className="text-red-500">{record.losses || 0}</span>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     ) : (
                        <div className="bg-gray-50 h-96 rounded-3xl border border-dashed border-gray-300 flex items-center justify-center">
                           <div className="text-center space-y-4">
                              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto" />
                              <p className="text-gray-400 font-bold tracking-wide text-sm">No detailed statistics available yet.</p>
                           </div>
                        </div>
                     )}
                  </div>
               )}
            
               {activeTab === "Gallery" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-700 tracking-tighter inline-block relative">
                           Media Gallery
                           <span className="absolute -bottom-3 left-0 w-12 border-b-2 border-gray-300"></span>
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
                                    <img src={media.url || media} alt="Action Shot" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                     
                     {(!profile.video_links || profile.video_links.length === 0) && (!profile.gallery_urls || profile.gallery_urls.length === 0) && (
                        <div className="bg-gray-50 h-96 rounded-3xl border border-dashed border-gray-300 flex items-center justify-center">
                           <div className="text-center space-y-4">
                              <Trophy className="w-12 h-12 text-gray-300 mx-auto" />
                              <p className="text-gray-400 font-bold tracking-wide text-sm">No media gallery available yet.</p>
                           </div>
                        </div>
                     )}
                     
                     {selectedImageIndex !== null && (
                        <ImageLightbox 
                          images={(profile.gallery_urls || []).map((m: any) => m.url || m)} 
                          initialIndex={selectedImageIndex} 
                          onClose={() => setSelectedImageIndex(null)} 
                        />
                     )}
                  </div>
               )}          </div>
         </main>

         {isContactModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={() => setIsContactModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                     <X className="w-6 h-6" />
                  </button>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Hire Coach</h3>
                  <p className="text-sm text-gray-500 mb-6">Send an inquiry to {displayName}. CenterKick admin will review and connect you.</p>
                  
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Your Name</label>
                        <input 
                           type="text" 
                           value={contactFormData.name}
                           onChange={(e) => setContactFormData({...contactFormData, name: e.target.value})}
                           className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#a20000] focus:border-transparent outline-none" 
                           placeholder="John Doe"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Your Email</label>
                        <input 
                           type="email" 
                           value={contactFormData.email}
                           onChange={(e) => setContactFormData({...contactFormData, email: e.target.value})}
                           className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#a20000] focus:border-transparent outline-none" 
                           placeholder="john@example.com"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Message / Proposal</label>
                        <textarea 
                           rows={4}
                           value={contactFormData.message}
                           onChange={(e) => setContactFormData({...contactFormData, message: e.target.value})}
                           className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#a20000] focus:border-transparent outline-none resize-none" 
                           placeholder="Describe your offer or interest..."
                        />
                     </div>
                     <button 
                        onClick={async () => {
                           setContactStatus('loading');
                           try {
                              const res = await fetch('/api/contact', {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ ...contactFormData, targetType: 'coach', targetId: profile.id, targetName: displayName })
                              });
                              if (res.ok) {
                                 setContactStatus('success');
                                 setTimeout(() => setIsContactModalOpen(false), 2000);
                              } else {
                                 setContactStatus('error');
                              }
                           } catch (e) {
                              setContactStatus('error');
                           }
                        }}
                        disabled={contactStatus === 'loading' || contactStatus === 'success' || !contactFormData.name || !contactFormData.email || !contactFormData.message}
                        className="w-full bg-[#a20000] hover:bg-[#8a0000] text-white font-bold tracking-wide py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                     >
                        {contactStatus === 'loading' ? 'Sending...' : contactStatus === 'success' ? 'Request Sent!' : <><Send className="w-4 h-4" /> Send Request</>}
                     </button>
                     {contactStatus === 'error' && (
                        <p className="text-red-500 text-xs text-center font-bold">Failed to send request. Please try again.</p>
                     )}
                  </div>
               </div>
            </div>
         )}

         <Footer />
      </div>
   );
}
