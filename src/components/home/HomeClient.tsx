'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  PlayCircle, 
  ArrowRight, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  User, 
  MapPin, 
  BadgeCheck, 
  Activity, 
  Video,
  ExternalLink,
  ShieldCheck,
  Building,
  Trophy,
  Users
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useState, useEffect, useRef } from 'react';
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

interface HomeClientProps {
  latestNews: Post[];
  players: any[];
  coaches: any[];
  agentsScouts: any[];
  organizations: any[];
  highlights: Post[];
  siteContent: Record<string, any>;
  navContent?: Record<string, any>;
  footerContent?: Record<string, any>;
  siteSettings?: Record<string, any>;
}

const IMG_HERO_DEFAULT = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop";
const IMG_NEWS_DEFAULT = "https://images.unsplash.com/photo-1431324155629-1a6d0a11f472?q=80&w=800&auto=format&fit=crop";

// Reusable Infinite Looping Carousel Component
interface ProfileCarouselProps {
  items: any[];
  renderItem: (item: any, idx: number) => React.ReactNode;
}

// Mobile: CSS snap scroll showing 1 card + peek. Desktop: JS carousel.
export function ProfileCarousel({ items, renderItem }: ProfileCarouselProps) {
  if (!items || items.length === 0) {
    return (
      <div className="w-full py-16 bg-white border border-dashed border-gray-200 rounded-[2.5rem] text-center shadow-sm">
        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">No Active Profiles Found</h4>
        <p className="text-gray-400 text-xs max-w-xs mx-auto">Be the first to register and showcase your profile on our premium homepage!</p>
      </div>
    );
  }

  return (
    <>
      {/* ---- MOBILE: CSS snap scroll ---- */}
      <div className="hidden max-sm:flex overflow-x-auto gap-4 snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4
                      [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, idx) => (
          <div key={idx} className="shrink-0 w-[80vw] snap-center">
            {renderItem(item, idx)}
          </div>
        ))}
      </div>

      {/* ---- DESKTOP: JS infinite carousel ---- */}
      <div className="hidden sm:block">
        <DesktopCarousel items={items} renderItem={renderItem} />
      </div>
    </>
  );
}

function DesktopCarousel({ items, renderItem }: ProfileCarouselProps) {
  let baseItems = [...items];
  while (baseItems.length < 5) baseItems = [...baseItems, ...items];
  const list = [...baseItems, ...baseItems, ...baseItems];

  const [currentIndex, setCurrentIndex] = useState(baseItems.length);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setItemsPerView(window.innerWidth >= 1024 ? 5 : 2);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const next = () => { setIsTransitioning(true); setCurrentIndex(p => p + 1); };
  const prev = () => { setIsTransitioning(true); setCurrentIndex(p => p - 1); };

  const handleTransitionEnd = () => {
    const len = baseItems.length;
    if (currentIndex >= len * 2) { setIsTransitioning(false); setCurrentIndex(currentIndex - len); }
    else if (currentIndex < len) { setIsTransitioning(false); setCurrentIndex(currentIndex + len); }
  };

  useEffect(() => {
    if (!isTransitioning) { if (containerRef.current) { const _ = containerRef.current.offsetHeight; } setIsTransitioning(true); }
  }, [isTransitioning]);

  useEffect(() => {
    if (isHovered || items.length <= 1) return;
    const interval = setInterval(next, 3000);
    return () => clearInterval(interval);
  }, [isHovered, items.length, currentIndex]);

  const shiftPercent = 100 / itemsPerView;
  const shiftPx = 24 / itemsPerView;

  return (
    <div className="relative w-full overflow-hidden group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div ref={containerRef} onTransitionEnd={handleTransitionEnd}
        className={`flex gap-6 pb-6 pt-2 px-1 ${isTransitioning ? 'transition-transform duration-500 ease-out' : ''}`}
        style={{ transform: `translateX(calc(-${currentIndex} * (${shiftPercent}% + ${shiftPx}px)))` }}>
        {list.map((item, idx) => (
          <div key={idx} className="shrink-0 w-[calc(50%-12px)] lg:w-[calc(20%-20px)]">
            {renderItem(item, idx % baseItems.length)}
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <div className="absolute top-1/2 -translate-y-1/2 -left-3 -right-3 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={prev} className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all pointer-events-auto">
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </button>
          <button onClick={next} className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all pointer-events-auto">
            <ChevronRight className="w-5 h-5 text-gray-900" />
          </button>
        </div>
      )}
    </div>
  );
}

const getDisplayName = (profile: any) => {

  if (!profile) return '';
  return profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous';
};

export function HomeClient({ 
  latestNews, 
  players, 
  coaches, 
  agentsScouts, 
  organizations, 
  highlights, 
  siteContent, 
  navContent, 
  footerContent, 
  siteSettings 
}: HomeClientProps) {

  // Fetch real data directly from Supabase DB props
  const playersData = players;
  const coachesData = coaches;
  const agentsData = agentsScouts;
  const organizationsData = organizations;

  // News components separation
  const mainNews = latestNews[0] || null;
  const stackedNews = latestNews.slice(1, 3);
  const carouselNews = latestNews.slice(3, 10);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 selection:bg-[#b50a0a]/10 selection:text-[#b50a0a]">
      <Navbar content={navContent} settings={siteSettings} />

      <main className="pt-32 sm:pt-40 pb-24 overflow-hidden">
        
        {/* ==================== A. HERO GRID SECTION ==================== */}
        <section className="max-w-[1200px] mx-auto px-4 lg:px-0 mb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-[2px] bg-[#b50a0a]"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b50a0a]">Global Updates</span>
          </div>
          
          {mainNews ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
              
              {/* Row 1 Col 1: Main News Card (60%) */}
              <div className="lg:col-span-7">
                <Link href={`/news/${mainNews.slug}`} className="group relative block w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-[500px] rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 bg-black">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                  <Image 
                    src={mainNews.cover_image_url || IMG_HERO_DEFAULT} 
                    alt={mainNews.title} 
                    fill
                    priority
                    sizes="(max-width:1024px) 100vw, 60vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                  />
                  <div className="absolute top-6 left-6 z-20">
                    <span className="bg-[#b50a0a] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                      Featured News
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 p-8 sm:p-10 z-20 w-full">
                    <DateDisplay date={mainNews.published_at} className="text-white/70 text-[9px] font-bold uppercase tracking-widest mb-3 block" />
                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4 tracking-tighter uppercase italic drop-shadow-md">
                      {mainNews.title}
                    </h2>
                    <p className="text-white/80 text-sm font-medium leading-relaxed line-clamp-2 max-w-xl group-hover:text-white transition-colors">
                      {mainNews.excerpt}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Row 1 Col 2: Stacked news cards (40%) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                {stackedNews.map((news, idx) => (
                  <Link 
                    key={news.id} 
                    href={`/news/${news.slug}`} 
                    className="group relative flex-1 min-h-[235px] rounded-[2rem] overflow-hidden shadow-md border border-gray-100 bg-black block"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                    <Image 
                      src={news.cover_image_url || IMG_NEWS_DEFAULT} 
                      alt={news.title} 
                      fill
                      sizes="(max-width:1024px) 100vw, 40vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                    />
                    <div className="absolute top-6 left-6 z-20">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                        Hot Story
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 p-6 sm:p-8 z-20 w-full">
                      <DateDisplay date={news.published_at} className="text-white/70 text-[9px] font-bold uppercase tracking-widest mb-2 block" />
                      <h3 className="text-lg sm:text-xl font-black text-white leading-snug tracking-tight uppercase line-clamp-2">
                        {news.title}
                      </h3>
                    </div>
                  </Link>
                ))}
                {stackedNews.length === 0 && (
                  <div className="h-full flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-[2rem] p-8 text-center">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No extra stacked stories available.</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="w-full py-24 bg-white border border-gray-100 rounded-[2.5rem] text-center shadow-sm mb-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-wider mb-2">No News Available</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">Check back later for recent football news, updates, and releases.</p>
            </div>
          )}

          {/* Row 2: 7 news cards with auto scrolling carousel */}
          {carouselNews.length > 0 && (
            <div className="mt-12 bg-white/50 backdrop-blur-sm border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
              <h4 className="text-xs font-black tracking-widest uppercase text-gray-400 mb-6">More Recent Stories</h4>
              <ProfileCarousel 
                items={carouselNews}
                renderItem={(news) => (
                  <Link href={`/news/${news.slug}`} className="group relative block aspect-[4/5] rounded-[1.8rem] overflow-hidden bg-black border border-gray-100 shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                    <Image 
                      src={news.cover_image_url || IMG_NEWS_DEFAULT} 
                      alt={news.title} 
                      fill
                      sizes="256px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                    />
                    <div className="absolute bottom-0 left-0 p-5 z-20 w-full">
                      <DateDisplay date={news.published_at} className="text-white/60 text-[8px] font-bold uppercase tracking-widest mb-1.5 block" />
                      <h5 className="text-xs font-black text-white leading-snug uppercase line-clamp-3 group-hover:text-[#b50a0a] transition-colors">
                        {news.title}
                      </h5>
                    </div>
                  </Link>
                )}
              />
            </div>
          )}
        </section>


        {/* ==================== B. PLAYER PROFILES SECTION ==================== */}
        <section className="max-w-[1200px] mx-auto px-4 lg:px-0 mb-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b50a0a]">TALENT DISCOVERY</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">
                Players <span className="text-[#b50a0a] font-black">Profiles</span>
              </h2>
            </div>
            <Link 
              href="/athletes" 
              className="group/link inline-flex items-center gap-2 text-xs font-black text-[#b50a0a] uppercase tracking-widest hover:text-black transition-colors"
            >
              Explore All Players <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <ProfileCarousel 
            items={playersData}
            renderItem={(player) => (
              <Link href={`/athletes/${player.slug}`} className="group relative block aspect-[4/5] rounded-3xl overflow-hidden bg-black shadow-lg border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                <Image 
                  src={player.avatar_url || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop"} 
                  alt={getDisplayName(player)} 
                  fill
                  sizes="(max-width:640px) 90vw, (max-width:1024px) 50vw, 256px"
                  className="object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105 opacity-85"
                />
                
                <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 border border-white/10">
                  <span className="text-[8px] font-black text-white tracking-wider uppercase">Active</span>
                </div>

                <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                  <span className="text-[#b50a0a] text-xs font-black uppercase tracking-[0.2em] block mb-1">
                    {player.position || 'Footballer'}
                  </span>
                  <h3 className="text-xl font-black text-white leading-tight uppercase italic tracking-tight group-hover:text-[#b50a0a] transition-colors">
                    {getDisplayName(player)}
                  </h3>
                  <div className="flex items-center gap-1.5 text-white/60 text-[9px] font-bold uppercase tracking-widest mt-2.5">
                    <MapPin className="w-3 h-3 text-[#b50a0a]" />
                    <span>{player.country || 'Global'}</span>
                  </div>
                </div>
              </Link>
            )}
          />

          {/* Player Full-Width CTA Sub-section */}
          <div className="mt-12 bg-gradient-to-r from-gray-900 to-black rounded-[2.5rem] p-8 md:p-12 border border-gray-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-[#b50a0a]/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#b50a0a]/15 transition-colors"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="bg-[#b50a0a]/10 border border-[#b50a0a]/20 text-[#ff4d4d] text-[8px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full mb-4 inline-block">
                  Athlete Management
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
                  Take Your Football Career <span className="text-[#b50a0a]">To The Next Level</span>
                </h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed">
                  Register your profile to build a digital football portfolio, showcase match tapes, record certified statistics, and match with verified agents and academy scouts.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 shrink-0">
                <Link href="/register">
                  <button className="bg-[#b50a0a] hover:bg-white text-white hover:text-black font-black text-[10px] tracking-[0.2em] uppercase px-8 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-2 hover:-translate-y-0.5 active:scale-95">
                    Register Profile <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* ==================== C. COACHES PROFILES SECTION ==================== */}
        <section className="max-w-[1200px] mx-auto px-4 lg:px-0 mb-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b50a0a]">TACTICAL EXPERTS</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">
                Coaches <span className="text-[#b50a0a] font-black">Profiles</span>
              </h2>
            </div>
            <Link 
              href="/coaches" 
              className="group/link inline-flex items-center gap-2 text-xs font-black text-[#b50a0a] uppercase tracking-widest hover:text-black transition-colors"
            >
              Explore All Coaches <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <ProfileCarousel 
            items={coachesData}
            renderItem={(coach) => (
              <Link href={`/coaches/${coach.slug}`} className="group relative block aspect-[4/5] rounded-3xl overflow-hidden bg-white shadow-lg border border-gray-100 hover:border-[#b50a0a]/30 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/10 to-transparent z-10" />
                <Image 
                  src={coach.avatar_url || "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=600&auto=format&fit=crop"} 
                  alt={getDisplayName(coach)} 
                  fill
                  sizes="(max-width:640px) 90vw, (max-width:1024px) 50vw, 256px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-white/95 text-gray-900 text-[8px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-[#b50a0a]" /> Certified
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                  <span className="text-[#b50a0a] text-xs font-black uppercase tracking-[0.2em] block mb-1">
                    {coach.position || 'Professional Coach'}
                  </span>
                  <h3 className="text-xl font-black text-white leading-tight uppercase italic tracking-tight">
                    {getDisplayName(coach)}
                  </h3>
                  <div className="flex items-center gap-1.5 text-white/70 text-[9px] font-bold uppercase tracking-widest mt-2.5">
                    <MapPin className="w-3 h-3 text-[#b50a0a]" />
                    <span>{coach.country || 'Global'}</span>
                  </div>
                </div>
              </Link>
            )}
          />

          {/* Coach Full-Width CTA Sub-section */}
          <div className="mt-12 bg-gradient-to-r from-[#b50a0a] to-[#800000] rounded-[2.5rem] p-8 md:p-12 border border-[#b50a0a]/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-white/10 transition-colors"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="bg-white/10 border border-white/20 text-white text-[8px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full mb-4 inline-block">
                  Staff Recruitment
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
                  Join Our Global <span className="underline decoration-white/20 underline-offset-8">Coaching Registry</span>
                </h3>
                <p className="text-white/80 text-sm font-medium leading-relaxed">
                  Connect with football academies, colleges, and clubs looking for technical managers, athletic trainers, and tactical staff globally.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 shrink-0">
                <Link href="/register">
                  <button className="bg-white hover:bg-black text-black hover:text-white font-black text-[10px] tracking-[0.2em] uppercase px-8 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-2 hover:-translate-y-0.5 active:scale-95">
                    Create Coach Profile <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* ==================== D. AGENTS & SCOUTS SECTION ==================== */}
        <section className="max-w-[1200px] mx-auto px-4 lg:px-0 mb-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b50a0a]">REPRESENTATION NETWORK</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">
                Agents & Scouts <span className="text-[#b50a0a] font-black">Profiles</span>
              </h2>
            </div>
            <Link 
              href="/agents" 
              className="group/link inline-flex items-center gap-2 text-xs font-black text-[#b50a0a] uppercase tracking-widest hover:text-black transition-colors"
            >
              Explore All Representatives <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <ProfileCarousel 
            items={agentsData}
            renderItem={(agent) => (
              <div className="group bg-white border border-gray-100 rounded-[2rem] p-6 shadow-md hover:shadow-xl transition-all duration-500 h-full flex flex-col justify-between">
                <div>
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 border border-gray-100">
                    <Image 
                      src={agent.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop"} 
                      alt={getDisplayName(agent)} 
                      fill
                      sizes="80px"
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  
                  <div className="text-center mb-4">
                    <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2 ${
                      (agent.users?.role === 'scout') 
                        ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                        : 'bg-[#b50a0a]/5 text-[#b50a0a] border border-[#b50a0a]/10'
                    }`}>
                      {agent.users?.role === 'scout' ? 'Scout' : 'Agent'}
                    </span>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight line-clamp-1 group-hover:text-[#b50a0a] transition-colors">
                      {getDisplayName(agent)}
                    </h3>
                    <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider block mt-1">
                      {agent.country || 'Global Representative'}
                    </span>
                  </div>

                  <p className="text-gray-500 text-xs text-center font-medium leading-relaxed line-clamp-3 mb-6">
                    {agent.bio || 'Verified representative dedicated to scouting academy stars and negotiating professional club deals.'}
                  </p>
                </div>

                <Link href={`/agents/${agent.slug}`} className="w-full">
                  <button className="w-full bg-gray-50 hover:bg-[#b50a0a] text-gray-700 hover:text-white border border-gray-100 hover:border-[#b50a0a] text-[9px] font-black uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-1.5">
                    View Portfolio <ExternalLink className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            )}
          />

          {/* Agents/Scouts CTA Section */}
          <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-950 rounded-[2.5rem] p-8 md:p-12 border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="bg-white/5 border border-white/10 text-white/90 text-[8px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full mb-4 inline-block">
                  Recruit Talent
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
                  Access Premium <span className="text-blue-400">Scouting Intelligence</span>
                </h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed">
                  Join as an agent or scout to view athlete catalogs, inspect verify-stamped athletic metrics, request player trials, and contact academy networks directly.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 shrink-0">
                <Link href="/register">
                  <button className="bg-white hover:bg-[#b50a0a] text-black hover:text-white font-black text-[10px] tracking-[0.2em] uppercase px-8 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-2 hover:-translate-y-0.5 active:scale-95">
                    Join As Scout / Agent <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* ==================== E. ORGANISATIONS PROFILES SECTION ==================== */}
        <section className="max-w-[1200px] mx-auto px-4 lg:px-0 mb-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b50a0a]">DEVELOPMENT CENTERS</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">
                Organizations <span className="text-[#b50a0a] font-black">Profiles</span>
              </h2>
            </div>
            <Link 
              href="/register" 
              className="group/link inline-flex items-center gap-2 text-xs font-black text-[#b50a0a] uppercase tracking-widest hover:text-black transition-colors"
            >
              Partner Academies <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <ProfileCarousel 
            items={organizationsData}
            renderItem={(org) => (
              <div className="group bg-white border border-gray-100 rounded-3xl p-6 shadow-md hover:shadow-xl hover:border-amber-500/10 transition-all duration-500 h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4 border border-amber-100 group-hover:scale-105 transition-transform">
                    <Building className="w-6 h-6 text-amber-600" />
                  </div>
                  
                  <div className="text-center mb-4">
                    <span className="inline-block bg-amber-50 text-amber-600 border border-amber-100 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-2">
                      Academy Partner
                    </span>
                    <h3 className="text-base font-black text-gray-900 uppercase tracking-tight line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {getDisplayName(org)}
                    </h3>
                    <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider block mt-1">
                      {org.country || 'Global Club'}
                    </span>
                  </div>

                  <p className="text-gray-500 text-xs text-center font-medium leading-relaxed line-clamp-3 mb-6">
                    {org.bio || 'Premium sports organization committed to developing academy prospects and providing professional infrastructure.'}
                  </p>
                </div>

                <Link href={`/organizations/${org.slug}`} className="w-full">
                  <button className="w-full bg-gray-50 hover:bg-amber-600 text-gray-700 hover:text-white border border-gray-100 hover:border-amber-600 text-[9px] font-black uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-1.5">
                    View Portfolio <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            )}
          />

          {/* Organizations CTA Section */}
          <div className="mt-12 bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-200 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="bg-amber-50 border border-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full mb-4 inline-block">
                  Academy Development
                </span>
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4 leading-tight">
                  List Your Academy <span className="text-amber-600">On CenterKick</span>
                </h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  Manage youth squads, create official tryouts announcements, verify player metrics, and establish direct channels with international scouting departments.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 shrink-0">
                <Link href="/register">
                  <button className="bg-gray-900 hover:bg-amber-600 text-white font-black text-[10px] tracking-[0.2em] uppercase px-8 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-2 hover:-translate-y-0.5 active:scale-95">
                    Register Organisation <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* ==================== F. HIGHLIGHTS VIDEO SECTION ==================== */}
        <section className="max-w-[1200px] mx-auto px-4 lg:px-0 mb-28">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-[2px] bg-[#b50a0a]"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b50a0a]">Skill Showreel</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">
              Featured <span className="text-[#b50a0a]">Highlights</span>
            </h2>
            <Link 
              href="/news" 
              className="group/link inline-flex items-center gap-2 text-xs font-black text-[#b50a0a] uppercase tracking-widest hover:text-black transition-colors"
            >
              Browse All Reels <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {highlights.map((post) => (
              <Link 
                href={`/news/${post.slug}`} 
                key={post.id} 
                className="group relative rounded-2xl overflow-hidden aspect-video sm:aspect-[4/5] bg-black border border-gray-100 shadow-md block"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
                <Image 
                  src={post.cover_image_url || IMG_NEWS_DEFAULT} 
                  alt={post.title} 
                  fill
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 20vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-90 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#b50a0a] group-hover:border-[#b50a0a] transition-all shadow-lg">
                    <PlayCircle className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 p-5 z-20 w-full">
                  <span className="text-[#ff4d4d] text-[8px] font-black uppercase tracking-widest mb-1.5 block flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> video clip
                  </span>
                  <h3 className="text-xs font-black text-white leading-snug uppercase line-clamp-2 drop-shadow-sm group-hover:text-[#ff4d4d] transition-colors">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
            
            {highlights.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white border border-dashed border-gray-200 rounded-[2rem] p-8">
                <PlayCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">No highlight clips currently active.</h4>
              </div>
            )}
          </div>
        </section>


        {/* ==================== G. PERSISTENT PARTNERSHIP CTA ==================== */}
        <section className="max-w-[1200px] mx-auto px-4 lg:px-0">
          <div className="bg-gradient-to-br from-[#b50a0a] via-[#900000] to-black rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,#b50a0a_0%,transparent_60%)] opacity-30 pointer-events-none"></div>
            
            <div className="flex flex-col items-center relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              
              <span className="text-white/80 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-4">
                Corporate & Sponsorship Network
              </span>
              
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight uppercase tracking-tighter italic mb-8 max-w-3xl">
                Partner with CenterKick to <span className="underline decoration-white/20 underline-offset-8">Grow Football Talents</span>
              </h2>
              
              <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed max-w-2xl mb-12">
                We work alongside corporate sponsors, state sports organizations, scouts associations, and global media outlets to provide premium scouting systems and athlete logistics.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <Link href="/contact">
                  <button className="w-full sm:w-auto bg-white hover:bg-black text-[#b50a0a] hover:text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                    Contact Business Team <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/about">
                  <button className="w-full sm:w-auto bg-transparent text-white border-2 border-white/20 hover:bg-white/10 px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-0.5 active:scale-95">
                    View Partnership Deck
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Ambient Lighting elements */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 left-0 w-80 h-80 bg-white rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-black rounded-full blur-[150px] translate-x-1/3 translate-y-1/3"></div>
            </div>
          </div>
        </section>

      </main>

      <Footer content={footerContent} settings={siteSettings} />
    </div>
  );
}
