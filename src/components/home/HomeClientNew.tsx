'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  PlayCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
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
  category?: any;
  author?: any;
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

interface ProfileCarouselProps {
  items: any[];
  renderItem: (item: any, idx: number) => React.ReactNode;
  mobileLimit?: number;
}

// Unified Native CSS Carousel
export function ProfileCarousel({ items, renderItem, mobileLimit }: ProfileCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) {
    return (
      <div className="w-full py-16 bg-white border border-dashed border-gray-200 rounded-[2.5rem] text-center shadow-sm">
        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-gray-400 tracking-wide mb-1">No Active Profiles Found</h4>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">Be the first to register and showcase your profile on our premium homepage!</p>
      </div>
    );
  }


  const next = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth, behavior: 'smooth' });
    }
  };
  const prev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full group">
      {/* Mobile/Tablet: Vertical Stack / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden pb-6">
        {items.slice(0, mobileLimit || items.length).map((item, idx) => (
          <div key={idx} className="w-full">
            {renderItem(item, idx)}
          </div>
        ))}
      </div>

      {/* Desktop: Carousel */}
      <div
        ref={scrollRef}
        className="hidden lg:flex gap-6 pb-6 pt-2 overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            className="snap-start shrink-0"
            style={{ width: 'calc(25% - 18px)' }}
          >
            {renderItem(item, idx)}
          </div>
        ))}
      </div>

      {items.length > 4 && (
        <>
          <button
            onClick={prev}
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2 w-12 h-12 rounded-full bg-white border border-gray-100 items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-30 text-[#b50a0a]"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 w-12 h-12 rounded-full bg-white border border-gray-100 items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-30 text-[#b50a0a]"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
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
  siteContent: _siteContent,
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
  const stackedNews = latestNews.slice(1, 6);
  const carouselNews = latestNews.slice(6, 10);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 selection:bg-[#b50a0a]/10 selection:text-[#b50a0a]">
      <Navbar content={navContent} settings={siteSettings} />

      <main className="pt-24 sm:pt-28 lg:pt-32 pb-24 overflow-hidden">

        {/* ==================== A. HERO GRID SECTION ==================== */}
        <section className="max-w-[1200px] mx-auto px-4 lg:px-0 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-[2px] bg-[#b50a0a]"></span>
            <span suppressHydrationWarning className="text-xs font-bold tracking-[0.3em] text-[#b50a0a]">Featured News</span>
          </div>

          {mainNews ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">

              {/* Row 1 Col 1: Main News Card (60%) */}
              <div className="lg:col-span-7 h-[400px] lg:h-[500px]">
                <Link
                  href={`/news/${mainNews.slug}`}
                  className="group block relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl"
                >
                  <img
                    src={mainNews.cover_image_url || IMG_HERO_DEFAULT}
                    alt={mainNews.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute top-6 left-6 z-20 flex gap-2">
                    {mainNews.category && (
                      <span className="bg-[#b50a0a] text-white text-xs font-bold tracking-wide px-3 py-1.5 rounded-full shadow-lg">
                        {(mainNews.category as any)?.name || 'Update'}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 w-full p-8 lg:p-10 z-20 flex flex-col justify-end">
                    <div className="flex items-center gap-3 mb-3">
                      <DateDisplay date={mainNews.published_at} className="text-[#ff4d4d] text-xs font-bold tracking-wide" />
                      <span className="text-white/60 text-xs font-bold tracking-wide">â€¢</span>
                      <span className="text-white/80 text-xs font-bold tracking-wide">
                        {(mainNews.author as any)?.email ? (mainNews.author as any).email.split('@')[0] : 'CenterKick Editor'}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-[1.1] mb-4 tracking-tighter group-hover:text-[#ff4d4d] transition-colors line-clamp-3">
                      {mainNews.title}
                    </h2>
                    <p className="text-white/80 text-base font-medium leading-relaxed line-clamp-2 max-w-2xl">
                      {mainNews.excerpt}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Row 1 Col 2: Stacked news lists (40%) */}
              <div className="lg:col-span-5 h-auto min-h-[400px] lg:h-[500px]">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold tracking-wide text-[#b50a0a] flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#b50a0a]" /> Trending Stories
                    </h3>
                  </div>

                  <div className="flex flex-col flex-1 justify-center gap-4 lg:gap-6">
                    {stackedNews.map((news) => (
                      <Link
                        key={news.id}
                        href={`/news/${news.slug}`}
                        className="group block pl-5 py-2 border-l border-[#b50a0a] hover:pl-6 transition-all duration-300"
                      >
                        <h4 className="text-base lg:text-base font-bold text-gray-900 leading-snug tracking-tight group-hover:text-[#b50a0a] transition-colors line-clamp-2">
                          {news.title}
                        </h4>
                      </Link>
                    ))}
                    {stackedNews.length === 0 && (
                      <div className="py-10 text-center">
                        <p className="text-gray-400 text-sm font-bold tracking-wide">No stories available.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="w-full py-24 bg-white border border-gray-100 rounded-[2.5rem] text-center shadow-sm mb-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-gray-800 tracking-wide mb-2">No News Available</h3>
              <p className="text-gray-400 text-base max-w-sm mx-auto">Check back later for recent football news, updates, and releases.</p>
            </div>
          )}

        </section>

        {/* Row 2: More stories (carousel on desktop/tablet, vertical stack on mobile) */}
        {carouselNews.length > 0 && (
          <section className="mt-12 mb-20 w-full overflow-hidden">
            <div className="max-w-[1200px] mx-auto px-4 lg:px-0 mb-6 flex items-center justify-between">
              <h4 className="text-sm font-bold tracking-wide text-gray-400 text-left">More Recent Stories</h4>
              <Link href="/news" className="text-xs font-bold text-[#b50a0a] tracking-wide hover:text-black transition-colors flex items-center gap-1.5">
                Read More <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Responsive Profile Carousel */}
            <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
              <ProfileCarousel
                items={carouselNews}
                renderItem={(news) => (
                  <Link
                    href={`/news/${news.slug}`}
                    className="group flex flex-col bg-white rounded-[1.8rem] overflow-hidden border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 h-full"
                  >
                    {/* Image Area */}
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-black shrink-0">
                      <Image
                        src={news.cover_image_url || IMG_NEWS_DEFAULT}
                        alt={news.title}
                        fill
                        sizes="256px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    {/* Text Area */}
                    <div className="p-5 text-left flex-1 flex flex-col justify-between">
                      <div>
                        <DateDisplay date={news.published_at} className="text-gray-400 text-xs font-bold tracking-wide mb-2 block" />
                        <h5 className="text-base font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-[#b50a0a] transition-colors">
                          {news.title}
                        </h5>
                      </div>
                    </div>
                  </Link>
                )}
              />
            </div>
          </section>
        )}


        {/* ==================== B. PLAYER PROFILES SECTION ==================== */}
        <section className="max-w-[1200px] mx-auto px-4 lg:px-0 mb-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold tracking-[0.25em] text-[#b50a0a]">Talent Discovery</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tighter">
                Player's <span className="text-[#b50a0a] font-bold">Profiles</span>
              </h2>
            </div>
            <Link
              href="/players"
              className="group/link inline-flex items-center gap-2 text-sm font-bold text-[#b50a0a] tracking-wide hover:text-black transition-colors"
            >
              View More <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <ProfileCarousel
            items={playersData}
            mobileLimit={5}
            renderItem={(player) => (
              <Link href={`/players/${player.slug}`} className="group relative block aspect-[4/5] rounded-3xl overflow-hidden bg-black shadow-lg border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                <Image
                  src={player.avatar_url || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop"}
                  alt={getDisplayName(player)}
                  fill
                  sizes="(max-width:640px) 90vw, (max-width:1024px) 50vw, 256px"
                  className="object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105 opacity-85"
                />

                <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 border border-white/10">
                  <span className="text-xs font-bold text-white tracking-wide">Active</span>
                </div>

                <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                  <span className="text-red-500 text-sm font-bold tracking-[0.2em] block mb-1">
                    {player.position || 'Footballer'}
                  </span>
                  <h3 className="text-xl font-bold text-white leading-tight tracking-tight group-hover:text-[#b50a0a] transition-colors">
                    {getDisplayName(player)}
                  </h3>
                  <div className="flex items-center gap-1.5 text-white/60 text-xs font-bold tracking-wide mt-2.5">
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
                <span className="bg-[#b50a0a]/10 border border-[#b50a0a]/20 text-[#ff4d4d] text-xs font-bold tracking-[0.2em] px-3.5 py-1.5 rounded-full mb-4 inline-block">
                  Player's Management
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tighter mb-4 leading-tight">
                  Take Your Football Career <span className="text-[#b50a0a]">To The Next Level</span>
                </h3>
                <p className="text-gray-400 text-base font-medium leading-relaxed">
                  Join now to build a digital football portfolio, showcase your skills and match reels, record certified statistics, and match with verified agents and academy scouts.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 shrink-0">
                <Link href="/register">
                  <button className="bg-[#b50a0a] hover:bg-white text-white hover:text-black font-bold text-xs tracking-[0.2em] px-8 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-2 hover:-translate-y-0.5 active:scale-95">
                    Create Profile <ArrowRight className="w-4 h-4" />
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
                <span className="text-xs font-bold tracking-[0.25em] text-[#b50a0a]">Tactical Experts</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tighter">
                Coaches <span className="text-[#b50a0a] font-bold">Profiles</span>
              </h2>
            </div>
            <Link
              href="/coaches"
              className="group/link inline-flex items-center gap-2 text-sm font-bold text-[#b50a0a] tracking-wide hover:text-black transition-colors"
            >
              View More <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <ProfileCarousel
            items={coachesData}
            mobileLimit={4}
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
                  <span className="bg-white/95 text-gray-900 text-xs font-bold tracking-wide px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-[#b50a0a]" /> Certified
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                  <span className="text-red-500 text-sm font-bold tracking-[0.2em] block mb-1">
                    {coach.position || 'Professional Coach'}
                  </span>
                  <h3 className="text-xl font-bold text-white leading-tight tracking-tight">
                    {getDisplayName(coach)}
                  </h3>
                  <div className="flex items-center gap-1.5 text-white/70 text-xs font-bold tracking-wide mt-2.5">
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
                <span className="bg-white/10 border border-white/20 text-white text-xs font-bold tracking-[0.2em] px-3.5 py-1.5 rounded-full mb-4 inline-block">
                  Professional Coaches
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tighter mb-4 leading-tight">
                  Join Our Global <span className="underline decoration-white/20 underline-offset-8">Coaching Directory</span>
                </h3>
                <p className="text-white/80 text-base font-medium leading-relaxed">
                  Connect with football academies, colleges, clubs and countries looking for technical managers, athletic trainers, and tactical staff globally.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 shrink-0">
                <Link href="/register">
                  <button className="bg-white hover:bg-black text-black hover:text-white font-bold text-xs tracking-[0.2em] px-8 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-2 hover:-translate-y-0.5 active:scale-95">
                    Create Profile <ArrowRight className="w-4 h-4" />
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
                <span className="text-xs font-bold tracking-[0.25em] text-[#b50a0a]">Scouting Network</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tighter">
                Agents & Scouts <span className="text-[#b50a0a] font-bold">Profiles</span>
              </h2>
            </div>
            <Link
              href="/agents"
              className="group/link inline-flex items-center gap-2 text-sm font-bold text-[#b50a0a] tracking-wide hover:text-black transition-colors"
            >
              View More <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <ProfileCarousel
            items={agentsData}
            mobileLimit={3}
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
                    <span className={`inline-block text-xs font-bold tracking-wide px-2.5 py-1 rounded-full mb-2 ${(agent.users?.role === 'scout')
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'bg-[#b50a0a]/5 text-[#b50a0a] border border-[#b50a0a]/10'
                      }`}>
                      {agent.users?.role === 'scout' ? 'Scout' : 'Agent'}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight line-clamp-1 group-hover:text-[#b50a0a] transition-colors">
                      {getDisplayName(agent)}
                    </h3>
                    <span className="text-gray-400 text-xs font-bold tracking-wide block mt-1">
                      {agent.country || 'Global Representative'}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm text-center font-medium leading-relaxed line-clamp-3 mb-6">
                    {agent.bio || 'Verified representative dedicated to scouting academy stars and negotiating professional club deals.'}
                  </p>
                </div>

                <Link href={`/agents/${agent.slug}`} className="w-full">
                  <button className="w-full bg-gray-50 hover:bg-[#b50a0a] text-gray-700 hover:text-white border border-gray-100 hover:border-[#b50a0a] text-xs font-bold tracking-wide py-3 rounded-xl transition-all flex items-center justify-center gap-1.5">
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
                <span className="bg-white/5 border border-white/10 text-white/90 text-xs font-bold tracking-[0.2em] px-3.5 py-1.5 rounded-full mb-4 inline-block">
                  Recruit Talents
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tighter mb-4 leading-tight">
                  Access Premium <span className="text-blue-400">Scouting Network</span>
                </h3>
                <p className="text-gray-400 text-base font-medium leading-relaxed">
                  Join as an agent or scout to view player's and coaches profiles, verified metrics and statistics, request player trials, and contact academy networks directly.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 shrink-0">
                <Link href="/register">
                  <button className="bg-white hover:bg-[#b50a0a] text-black hover:text-white font-bold text-xs tracking-[0.2em] px-8 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-2 hover:-translate-y-0.5 active:scale-95">
                    Create Profile <ArrowRight className="w-4 h-4" />
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
                <span className="text-xs font-bold tracking-[0.25em] text-[#b50a0a]">Sport Organizations</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tighter">
                Clubs and Academy <span className="text-[#b50a0a] font-bold">Profiles</span>
              </h2>
            </div>
            <Link
              href="/organizations"
              className="group/link inline-flex items-center gap-2 text-sm font-bold text-[#b50a0a] tracking-wide hover:text-black transition-colors"
            >
              View More <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform" />
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
                    <h3 className="text-base font-bold text-gray-900 tracking-tight line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {getDisplayName(org)}
                    </h3>
                    <span className="text-gray-400 text-xs font-bold tracking-wide block mt-1">
                      {org.country || 'Global Club'}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm text-center font-medium leading-relaxed line-clamp-3 mb-6">
                    {org.bio || 'Premium sports organization committed to developing academy prospects and providing professional infrastructure.'}
                  </p>
                </div>

                <Link href={`/organizations/${org.slug}`} className="w-full">
                  <button className="w-full bg-gray-50 hover:bg-amber-600 text-gray-700 hover:text-white border border-gray-100 hover:border-amber-600 text-xs font-bold tracking-wide py-3 rounded-xl transition-all flex items-center justify-center gap-1.5">
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
                <span className="bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold tracking-[0.2em] px-3.5 py-1.5 rounded-full mb-4 inline-block">
                  Clubs and Academy
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tighter mb-4 leading-tight">
                  List Your Clubs and Academies <span className="text-amber-600">On CenterKick</span>
                </h3>
                <p className="text-gray-500 text-base font-medium leading-relaxed">
                  Manage clubs and academy talents, get your talents verified, and establish direct channels with scouting agents.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 shrink-0">
                <Link href="/register">
                  <button className="bg-gray-900 hover:bg-amber-600 text-white font-bold text-xs tracking-[0.2em] px-8 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-2 hover:-translate-y-0.5 active:scale-95">
                    Create Profile <ArrowRight className="w-4 h-4" />
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
            <span className="text-xs font-bold tracking-[0.3em] text-[#b50a0a]">Talents Reels</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tighter">
              Featured <span className="text-[#b50a0a]">Highlights</span>
            </h2>
            <Link
              href="https://www.youtube.com/@CenterKick"
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-2 text-sm font-bold text-[#b50a0a] tracking-wide hover:text-black transition-colors"
            >
              View More <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {highlights.map((post) => (
              <Link
                href={post.excerpt || '#'}
                target="_blank"
                rel="noopener noreferrer"
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
                  <span className="text-[#ff4d4d] text-xs font-bold tracking-wide mb-1.5 block flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> video clip
                  </span>
                  <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 drop-shadow-sm group-hover:text-[#ff4d4d] transition-colors">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}

            {highlights.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white border border-dashed border-gray-200 rounded-[2rem] p-8">
                <PlayCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-gray-400 tracking-wide">No highlight clips currently.</h4>
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

              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-8 max-w-3xl">
                Partner with CenterKick to <span className="underline decoration-white/20 underline-offset-8">Grow Football Talents</span>
              </h2>

              <p className="text-white/80 text-base md:text-base font-medium leading-relaxed max-w-2xl mb-12">
                We work with organizations, clubs, academies, sponsors, scouts, agents, and media outlets to identify and manage the next generation of global football talents.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <Link href="/contact">
                  <button className="w-full sm:w-auto bg-white hover:bg-black text-[#b50a0a] hover:text-white px-12 py-5 rounded-2xl text-xs font-bold tracking-[0.2em] shadow-2xl transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                    Contact Us <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/about">
                  <button className="w-full sm:w-auto bg-transparent text-white border-2 border-white/20 hover:bg-white/10 px-12 py-5 rounded-2xl text-xs font-bold tracking-[0.2em] transition-all hover:-translate-y-0.5 active:scale-95">
                    About Us
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
