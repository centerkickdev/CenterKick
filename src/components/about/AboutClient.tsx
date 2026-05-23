'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
   Briefcase, 
   Lightbulb, 
   ShieldCheck, 
   Eye, 
   Star, 
   UserCircle,
   ArrowRight
} from "lucide-react";
import Link from "next/link";

const heroImage = "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=2000&q=80"; // Using unsplash for better look
const missionImage = "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=1200&q=80";
const visionImage = "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80";

const philosophies = [
   { icon: <Briefcase className="w-6 h-6 text-[#ff3333]" />, title: "Professionalism", desc: "Presenting players and football content at the highest standard." },
   { icon: <Lightbulb className="w-6 h-6 text-[#ff3333]" />, title: "Innovation", desc: "Adapting to new trends and technologies in football and media." },
   { icon: <ShieldCheck className="w-6 h-6 text-[#ff3333]" />, title: "Integrity", desc: "Operating with honesty and responsibility." },
   { icon: <Eye className="w-6 h-6 text-[#ff3333]" />, title: "Transparency", desc: "Clear processes, fair visibility, and open communication." },
   { icon: <Star className="w-6 h-6 text-[#ff3333]" />, title: "Excellence", desc: "Delivering quality in every profile, story, and project." },
   { icon: <UserCircle className="w-6 h-6 text-[#ff3333]" />, title: "Personalization", desc: "Treating every football journey as unique." }
];

const services = [
   { num: "01", title: "Player E-Profile Creation & Management", desc: "Well-structured and easy to navigate portfolios designed to showcase player data, stats, photos, videos, and career history.", image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80" },
   { num: "02", title: "Scouting & Talent Visibility", desc: "Bridging the gap between talent and opportunity by making player profiles discoverable.", image: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=600&q=80" },
   { num: "03", title: "Media, PR & Football Coverage", desc: "Providing football news, stories, and analysis. Player features, interviews, and media PR.", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80" },
   { num: "04", title: "Marketing & Career Support", desc: "Social media management, personal branding, marketing support, and holistic career development guidance.", image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80" }
];

interface AboutClientProps {
  layout: string[];
  content: Record<string, any>;
  navContent?: any;
  footerContent?: any;
}

export function AboutClient({ layout, content, navContent, footerContent }: AboutClientProps) {
   const renderSection = (key: string) => {
      switch (key) {
         case 'hero':
            const hero = content.hero || { subtitle: "Who We Are", title: "About Us", description: "A modern football media platform." };
            return (
               <div key={key} className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 z-0 bg-[#050505]">
                     <img src={heroImage} className="w-full h-full object-cover scale-105 opacity-60" alt="Stadium" />
                     <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/90 via-[#050505]/60 to-white mix-blend-multiply"></div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 overflow-hidden pointer-events-none">
                     <h1 className="text-[15vw] font-black uppercase tracking-tighter text-transparent stroke-text opacity-10 leading-none">CENTERKICK</h1>
                  </div>
                  <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center mt-20">
                     <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-8 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                        <span className="w-2 h-2 rounded-full bg-[#ff3333] animate-pulse"></span>
                        <span className="text-white font-bold text-xs uppercase tracking-widest">{hero.subtitle}</span>
                     </div>
                     <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {hero.title?.split(' ').map((word: string, i: number) => (
                           <span key={i} className={word === 'Us' ? 'text-[#ff4d4d]' : ''}>{word} </span>
                        ))}
                     </h2>
                     <p className="text-gray-200 text-lg md:text-xl leading-relaxed max-w-[700px] mx-auto font-medium drop-shadow-md">{hero.description}</p>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white via-white/80 to-transparent z-10"></div>
               </div>
            );
         case 'mission':
            const mission = content.mission || { title: "Empowering Talent", description: "To empower footballers at all levels." };
            return (
               <div key={key} className="max-w-[1200px] mx-auto px-6 py-16 border-t border-gray-100">
                  <div className="flex flex-col lg:flex-row items-center gap-16">
                     <div className="w-full lg:w-1/2">
                        <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] aspect-[4/3] group">
                           <div className="absolute inset-0 bg-[#b50a0a]/10 mix-blend-overlay z-10 transition-opacity duration-500"></div>
                           <img src={missionImage} alt="Our Mission" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                     </div>
                     <div className="w-full lg:w-1/2">
                        <div className="inline-flex items-center gap-3 mb-6">
                           <span className="w-10 h-1 bg-[#b50a0a]"></span>
                           <h3 className="text-sm font-black text-[#b50a0a] tracking-[0.2em] uppercase">Our Mission</h3>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-8">{mission.title}</h2>
                        <p className="text-gray-600 text-xl leading-relaxed font-medium">{mission.description}</p>
                     </div>
                  </div>
               </div>
            );
         case 'vision':
            const vision = content.vision || { title: "Leading Agency", description: "To become the leading Sports Marketing Agency." };
            return (
               <div key={key} className="max-w-[1200px] mx-auto px-6 py-16">
                  <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                     <div className="w-full lg:w-1/2">
                        <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] aspect-[4/3] group">
                           <div className="absolute inset-0 bg-[#16a34a]/10 mix-blend-overlay z-10 transition-opacity duration-500"></div>
                           <img src={visionImage} alt="Our Vision" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                     </div>
                     <div className="w-full lg:w-1/2">
                        <div className="inline-flex items-center gap-3 mb-6">
                           <span className="w-10 h-1 bg-gray-800"></span>
                           <h3 className="text-sm font-black text-gray-800 tracking-[0.2em] uppercase">Our Vision</h3>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-8">{vision.title}</h2>
                        <p className="text-gray-600 text-xl leading-relaxed mb-8 font-medium">{vision.description}</p>
                     </div>
                  </div>
               </div>
            );
         case 'philosophy':
            return (
               <div key={key} className="w-full bg-gray-50 py-32 px-6 border-y border-gray-100">
                  <div className="max-w-[1200px] mx-auto">
                     <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                           <span className="text-[#b50a0a] font-bold tracking-[0.2em] uppercase mb-4 block text-sm">P.I.I.T.E.P</span>
                           <h2 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight">Our Philosophy</h2>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {philosophies.map((item, idx) => (
                           <div key={idx} className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(181,10,10,0.15)] hover:border-[#b50a0a]/20 hover:-translate-y-2 transition-all duration-300 group">
                              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-8 group-hover:bg-[#b50a0a]/5 group-hover:scale-110 transition-all border border-gray-100 group-hover:border-[#b50a0a]/20">
                                 {item.icon}
                              </div>
                              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{item.title}</h3>
                              <p className="text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            );
         case 'services':
            return (
               <div key={key} className="w-full bg-white py-32">
                  <div className="max-w-[1200px] mx-auto px-6">
                     <div className="text-center mb-24 relative">
                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-50 uppercase tracking-tighter w-full pointer-events-none select-none">WHAT WE DO</h2>
                     </div>
                     <div className="space-y-32">
                        {services.map((svc, idx) => {
                           const isEven = idx % 2 !== 0;
                           return (
                              <div key={idx} className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20 relative`}>
                                 <div className="w-full lg:w-1/2 relative z-10 mt-8 lg:mt-0">
                                    <div className="inline-block text-[#b50a0a] font-black text-sm uppercase tracking-widest mb-6 border-b-2 border-[#b50a0a] pb-1">Service {svc.num}</div>
                                    <h3 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-8 leading-tight">{svc.title}</h3>
                                    <p className="text-gray-600 text-xl leading-relaxed font-medium mb-8">{svc.desc}</p>
                                    <Link href="/transfer-focus" className="inline-flex items-center gap-2 text-[#b50a0a] font-bold uppercase tracking-wider hover:text-gray-900 group transition-colors">
                                       Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                 </div>
                                 <div className="w-full lg:w-1/2 relative z-10">
                                    <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] group aspect-square max-w-[500px] mx-auto">
                                       <div className="absolute inset-0 bg-[#b50a0a]/5 mix-blend-multiply z-10 transition-opacity duration-500"></div>
                                       <img src={svc.image} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            );
         default: return null;
      }
   };

   return (
      <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-[#b50a0a] selection:text-white">
         <Navbar content={navContent} />
         <main className="flex-grow pt-32">
            {layout.map(key => renderSection(key))}
         </main>
         <Footer content={footerContent} />
         <style dangerouslySetInnerHTML={{__html: `.stroke-text { -webkit-text-stroke: 1px rgba(255,255,255,0.6); }`}} />
      </div>
   );
}
