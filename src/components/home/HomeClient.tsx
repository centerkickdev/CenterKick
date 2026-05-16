'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle, ArrowRight, Star, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useState, useEffect } from 'react';
import { DateDisplay } from '@/components/common/DateDisplay';

interface Post {
  id: string;
  title: string;
  slug: string;
  type: string;
  cover_image_url: string;
  excerpt: string;
  published_at: string;
}

interface Testimonial {
  name: string;
  role: string;
  text: string;
}

interface Player {
  img: string;
  num: string;
  name: string;
}

interface HomeClientProps {
  layout: string[];
  heroPosts: Post[];
  storyPosts: Post[];
  dummyPlayers: Player[];
  highlightPosts: Post[];
  siteContent: any;
  navContent?: any;
  footerContent?: any;
}

const IMG_HERO_DEFAULT = "https://images.unsplash.com/photo-1518605368461-1ee7e537d45c?auto=format&fit=crop&w=1200&q=80";
const IMG_NEWS_DEFAULT = "https://images.unsplash.com/photo-1431324155629-1a6d0a11f472?auto=format&fit=crop&w=600&q=80";

export function HomeClient({ layout, heroPosts, storyPosts, dummyPlayers, highlightPosts, siteContent, navContent, footerContent }: HomeClientProps) {
   const [heroSlide, setHeroSlide] = useState(0);
   const [storyPage, setStoryPage] = useState(1);
   const [currentIdx, setCurrentIdx] = useState(0);

   useEffect(() => {
      const interval = setInterval(() => {
         setCurrentIdx((prev) => (prev + 1) % (dummyPlayers.length - 3));
      }, 3000);
      return () => clearInterval(interval);
   }, [dummyPlayers]);

   const handleHeroScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const scrollLeft = e.currentTarget.scrollLeft;
      const width = e.currentTarget.clientWidth;
      if (width > 0) {
         const currentSlide = Math.round(scrollLeft / width);
         if (currentSlide !== heroSlide) {
            setHeroSlide(currentSlide);
         }
      }
   };

   const storiesPerPage = 3;
   const currentStories = storyPosts.slice((storyPage - 1) * storiesPerPage, storyPage * storiesPerPage);
   const totalStoryPages = Math.ceil(storyPosts.length / storiesPerPage);

   // Section Components
   const renderSection = (key: string) => {
      switch (key) {
         case 'hero':
            return (
               <div key={key} className="lg:col-span-12 relative rounded-xl bg-gray-900 border border-transparent overflow-hidden h-[450px] md:h-[500px]">
                  {heroPosts.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900">
                       <PlayCircle className="w-12 h-12 mb-4 opacity-20" />
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-40">No Featured Posts</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden w-full h-full cursor-grab active:cursor-grabbing" onScroll={handleHeroScroll}>
                         {heroPosts.map((post, idx) => (
                            <Link href={`/news/${post.slug}`} key={idx} className="relative w-full h-full shrink-0 snap-center group block">
                               <div className="absolute inset-0 bg-gradient-to-t from-[#8b0000]/90 via-black/40 to-transparent z-10" />
                               <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${post.cover_image_url || IMG_HERO_DEFAULT})` }} />
                               <div className="absolute bottom-0 left-0 p-8 z-20 w-full flex flex-col h-full justify-end">
                                  <div className="bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 flex items-center gap-1.5 w-max mb-3 rounded shadow-sm">
                                     <div className="w-3.5 h-3.5 bg-blue-100 rounded-sm flex items-center justify-center">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                     </div>
                                     Featured
                                  </div>
                                  <h1 className="text-[28px] md:text-[32px] font-extrabold text-white leading-[1.15] mb-2 max-w-sm drop-shadow-md italic">{post.title}</h1>
                                  <div className="flex items-center gap-4 text-white/90 text-[10px] font-bold uppercase tracking-widest mt-1 mb-2">
                                     <DateDisplay date={post.published_at} />
                                  </div>
                               </div>
                            </Link>
                         ))}
                      </div>
                      <div className="absolute bottom-6 left-8 z-30 flex gap-1.5 pointer-events-none">
                         {heroPosts.map((_, dot) => (
                            <div key={dot} className={`w-1.5 h-1.5 rounded-full shadow-md transition-all duration-300 ${heroSlide === dot ? 'w-6 bg-white' : 'bg-white/40'}`}></div>
                         ))}
                      </div>
                    </>
                  )}
               </div>
            );
         case 'stories':
            return (
               <div key={key} className="lg:col-span-12 flex flex-col bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.06)] border border-gray-100 p-8 h-auto justify-between relative overflow-hidden mt-8">
                  <div>
                     <h2 className="text-xs font-black tracking-widest uppercase mb-8 text-gray-900 border-b border-gray-50 pb-4">
                        {siteContent.stories?.title || 'TOP STORIES'}
                     </h2>
                     <div className="flex flex-col gap-8">
                        {currentStories.length === 0 ? (
                           <div className="py-10 text-center text-gray-300">
                             <p className="text-[10px] font-black uppercase tracking-widest">Feed Empty</p>
                           </div>
                        ) : (
                          currentStories.map((post) => (
                             <Link href={`/news/${post.slug}`} key={post.id} className="group cursor-pointer block">
                                <DateDisplay date={post.published_at} className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2 block group-hover:text-[#b50a0a] transition-colors" />
                                <h3 className="text-[13px] md:text-[14px] font-black text-gray-800 leading-[1.3] group-hover:text-[#b50a0a] transition-colors line-clamp-2">{post.title}</h3>
                             </Link>
                          ))
                        )}
                     </div>
                  </div>
                  {storyPosts.length > storiesPerPage && (
                    <div className="flex items-center gap-4 mt-4">
                       <button onClick={() => setStoryPage(prev => Math.max(1, prev - 1))} className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shadow-md hover:bg-red-800 transition-colors disabled:opacity-50" disabled={storyPage === 1}>
                          <ChevronLeft className="w-3.5 h-3.5" />
                       </button>
                       <div className="flex items-center gap-3 text-xs font-black text-gray-900">
                          {Array.from({ length: Math.min(3, totalStoryPages) }).map((_, i) => (
                             <span key={i} onClick={() => setStoryPage(i + 1)} className={`cursor-pointer transition-colors ${storyPage === i + 1 ? 'text-[#b50a0a] scale-110' : 'text-gray-300 hover:text-gray-900'}`}>{i + 1}</span>
                          ))}
                       </div>
                       <button onClick={() => setStoryPage(prev => Math.min(totalStoryPages, prev + 1))} className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shadow-md hover:bg-red-800 transition-colors disabled:opacity-50" disabled={storyPage === totalStoryPages}>
                          <ChevronRight className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  )}
               </div>
            );
         case 'players':
            return (
               <section key={key} className="w-full lg:col-span-12 mt-16 mb-8 overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#b50a0a] flex items-center justify-center shadow-lg shadow-red-900/20"><Star className="w-5 h-5 text-white" /></div>
                        <div>
                           <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{siteContent.highlights_intro?.subtitle || 'Featured'}</span>
                           <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter italic">
                              {siteContent.highlights_intro?.title?.split(' ')[0] || 'Players'} <span className="text-[#b50a0a]">{siteContent.highlights_intro?.title?.split(' ').slice(1).join(' ') || 'Profiles'}</span>
                           </h2>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 bg-white hover:bg-gray-50 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                        <button onClick={() => setCurrentIdx(prev => (prev + 1) % (dummyPlayers.length - 3))} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 bg-white hover:bg-gray-50 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                     </div>
                  </div>
                  <div className="relative w-full overflow-hidden">
                     <div className="flex transition-transform duration-700 ease-in-out gap-6" style={{ transform: `translateX(calc(-${currentIdx * 25}% - ${currentIdx * 6}px))` }}>
                        {dummyPlayers.map((player, idx) => (
                           <div key={idx} className="relative rounded-xl overflow-hidden aspect-[4/5] bg-gray-900 shadow-xl group border border-gray-800 shrink-0 w-[calc((100%-18px)/1)] md:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/4)]">
                              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${player.img})` }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                              <div className="absolute bottom-0 left-0 p-6">
                                 <span className="text-[#b50a0a] text-5xl font-black italic block leading-none">{player.num}</span>
                                 <h3 className="text-2xl font-black text-white leading-tight mt-2 whitespace-pre-line italic uppercase tracking-tighter">{player.name}</h3>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>
            );
         case 'coach_agents':
            return (
               <section key={key} className="w-full lg:col-span-12 mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Link href="/coaches" className="group relative h-[450px] rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 block transform transition-all hover:-translate-y-2 hover:shadow-red-900/10">
                     <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: `url('/images/coach_card.png')` }} />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                     <div className="absolute bottom-0 left-0 p-12 w-full z-10">
                        <span className="text-[#b50a0a] text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Professional Elite</span>
                        <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none mb-6">Expert <br /><span className="text-[#b50a0a]">Coaches</span></h3>
                        <div className="flex items-center gap-3 text-white/60 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                           Explore Coaching Staff <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                     </div>
                  </Link>
                  <Link href="/agents" className="group relative h-[450px] rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 block transform transition-all hover:-translate-y-2 hover:shadow-blue-900/10">
                     <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{ backgroundImage: `url('/images/agent_card.png')` }} />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                     <div className="absolute bottom-0 left-0 p-12 w-full z-10">
                        <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Dedicated Representation</span>
                        <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none mb-6">Global <br /><span className="text-blue-500">Agents</span></h3>
                        <div className="flex items-center gap-3 text-white/60 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                           Meet Our Agents <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                     </div>
                  </Link>
               </section>
            );
         case 'news':
            return (
               <div key={key} className="lg:col-span-12 flex flex-col relative overflow-hidden bg-white border border-gray-100 rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.06)] p-5 h-auto mt-8">
                  <div className="mb-4">
                    <h2 className="text-xs font-black tracking-widest uppercase text-gray-900 underline underline-offset-8 decoration-[#b50a0a] decoration-2">{siteContent.news?.title || 'Match Fixtures'}</h2>
                  </div>
                  <div className="flex-1 flex flex-col gap-0 -mx-2 px-2">
                     {[1, 2, 3, 4].map((match) => (
                        <div key={match} className="flex flex-col py-3 border-b border-gray-50 last:border-0 relative">
                           <div className="absolute top-3 left-0 flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-[7px] font-extrabold text-red-500 uppercase tracking-widest">Live</span>
                           </div>
                           <div className="text-center text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-2">Today, 20:00</div>
                           <div className="flex justify-between items-center px-1">
                              <div className="flex items-center gap-2 w-[40%] justify-end">
                                 <span className="font-bold text-[10px] text-gray-800 truncate">Chelsea</span>
                                 <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/1200px-Chelsea_FC.svg.png" className="w-4 h-4 object-contain opacity-90" alt="Chelsea" />
                              </div>
                              <div className="font-black text-[11px] text-[#b50a0a] w-[20%] text-center px-1 py-0.5 rounded italic">2 - 1</div>
                              <div className="flex items-center gap-2 w-[40%] justify-start">
                                 <img src="https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png" className="w-4 h-4 object-contain opacity-90" alt="Arsenal" />
                                 <span className="font-bold text-[10px] text-gray-800 truncate">Arsenal</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
                  <div className="mt-4 pt-3 flex justify-center shrink-0">
                     <Link href="/news" className="text-[9px] font-black text-[#b50a0a] uppercase tracking-widest hover:underline flex items-center gap-1">View More Live Matches <ArrowRight className="w-3 h-3" /></Link>
                  </div>
               </div>
            );
         case 'highlights':
            return (
               <div key={key} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 w-full lg:col-span-12">
                  {(highlightPosts && highlightPosts.length > 0) ? highlightPosts.slice(0, 4).map((post) => (
                     <Link href={`/news/${post.slug}`} key={post.id} className="relative rounded-xl overflow-hidden h-[180px] group cursor-pointer shadow-sm border border-gray-100 block">
                        <div className="absolute inset-0 bg-black/30 z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${post.cover_image_url || IMG_NEWS_DEFAULT})` }} />
                        <div className="absolute bottom-0 left-0 p-4 z-20 w-full">
                           <div className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1 block flex items-center gap-1 italic">
                              <PlayCircle className="w-3 h-3" /> <DateDisplay date={post.published_at} />
                           </div>
                           <h3 className="text-xs md:text-sm font-black text-white leading-tight uppercase line-clamp-2">{post.title}</h3>
                        </div>
                     </Link>
                  )) : [1, 2, 3, 4].map(i => <div key={i} className="h-[180px] bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />)}
               </div>
            );
         case 'cta':
            const ctaContent = siteContent.cta || {};
            return (
               <section key={key} className="w-full lg:col-span-12 mt-24">
                  <div className="bg-[#b50a0a] rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-red-900/20">
                     <div className="flex flex-col items-center relative z-10">
                        <div className="flex -space-x-3 mb-8">
                           {[1, 2, 3].map((i) => (
                              <div key={i} className="w-12 h-12 rounded-full border-4 border-[#b50a0a] bg-gray-200 overflow-hidden shadow-xl">
                                 <img src={`https://i.pravatar.cc/150?u=ck${i}`} alt="User" className="w-full h-full object-cover" />
                              </div>
                           ))}
                        </div>
                        <span className="text-white/80 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-4">{ctaContent.subtitle || 'I have a question?'}</span>
                        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight uppercase tracking-tighter italic mb-10 max-w-2xl">{ctaContent.title || 'Our agency works with athletes of all levels'}</h2>
                        <Link href={ctaContent.primaryButtonLink || "/contact"}>
                           <button className="bg-white text-[#b50a0a] px-12 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-gray-50 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2">
                              {ctaContent.primaryButtonText || 'Partner With Us'} <ArrowRight className="w-4 h-4" />
                           </button>
                        </Link>
                     </div>
                     <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black rounded-full blur-[150px] translate-x-1/3 translate-y-1/3"></div>
                     </div>
                  </div>
               </section>
            );
         case 'testimonials':
            return (
               <section key={key} className="w-full lg:col-span-12 mt-24">
                  <div className="flex items-center justify-between mb-10">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#b50a0a] flex items-center justify-center shadow-lg shadow-red-900/20"><CheckCircle2 className="w-5 h-5 text-white" /></div>
                        <div>
                           <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Reviews</span>
                           <h2 className="text-2xl md:text-3xl font-black text-gray-900 max-w-[250px] leading-tight uppercase tracking-tighter italic">Client <span className="text-[#b50a0a]">Feedback</span></h2>
                        </div>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {(Array.isArray(siteContent.testimonials) ? siteContent.testimonials : [
                        { name: 'Samuel Ejoor', role: 'Elite Player', text: 'CenterKick has revolutionized how I manage my professional identity.' },
                        { name: 'Coach Adebayo', role: 'Head Coach', text: 'The tactical dashboard and recruitment tools are world-class.' }
                     ]).map((rev: Testimonial, i: number) => (
                        <div key={i} className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm relative hover:shadow-xl transition-all group">
                           <Star className="absolute top-10 right-10 w-6 h-6 text-[#b50a0a]/10 group-hover:text-[#b50a0a]/40" />
                           <p className="text-gray-600 font-bold italic leading-relaxed mb-8">&quot;{rev.text}&quot;</p>
                           <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[#b50a0a] font-black">{rev.name?.[0]}</div>
                              <div>
                                 <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs italic">{rev.name}</h4>
                                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{rev.role}</p>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
            );
         default: return null;
      }
   };

   return (
      <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary/20">
         <Navbar content={navContent} />
         <main className="pt-32 pb-0 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               {layout.map(key => renderSection(key))}
            </div>
         </main>
         

         <Footer content={footerContent} />
      </div>
   );
}
