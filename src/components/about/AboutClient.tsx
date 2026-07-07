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

const defaultPhilosophies = [
   { icon: <Briefcase className="w-6 h-6 text-[#ff3333]" />, title: "Professionalism", desc: "Presenting players and football content at the highest standard." },
   { icon: <Lightbulb className="w-6 h-6 text-[#ff3333]" />, title: "Innovation", desc: "Adapting to new trends and technologies in football and media." },
   { icon: <ShieldCheck className="w-6 h-6 text-[#ff3333]" />, title: "Integrity", desc: "Operating with honesty and responsibility." },
   { icon: <Eye className="w-6 h-6 text-[#ff3333]" />, title: "Transparency", desc: "Clear processes, fair visibility, and open communication." },
   { icon: <Star className="w-6 h-6 text-[#ff3333]" />, title: "Excellence", desc: "Delivering quality in every profile, story, and project." },
   { icon: <UserCircle className="w-6 h-6 text-[#ff3333]" />, title: "Personalization", desc: "Treating every football journey as unique." }
];

const defaultServices = [
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
            const heroBg = hero.image || heroImage;
            return (
               <div key={key} className="relative w-full h-[450px] lg:h-[500px] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 z-0 bg-[#050505]">
                     <img src={heroBg} className="w-full h-full object-cover opacity-60" alt="Stadium" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 overflow-hidden pointer-events-none">
                     <h1 className="text-[15vw] font-black tracking-tighter text-transparent stroke-text opacity-10 leading-none">ABOUT US</h1>
                  </div>
                  <div className="relative z-10 w-full max-w-[1000px] mx-auto px-6 text-center flex flex-col justify-center h-full">
                     <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                           <span className="w-2 h-2 rounded-full bg-[#ff3333] animate-pulse"></span>
                           <span className="text-white font-bold text-sm tracking-wide">{hero.subtitle}</span>
                        </div>
                     </div>
                     <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-8 drop-shadow-xl">
                        {hero.title?.split(' ').map((word: string, i: number) => (
                           <span key={i} className={word === 'Us' ? 'text-[#ff4d4d]' : ''}>{word} </span>
                        ))}
                     </h2>
                     <p className="text-gray-200 text-lg md:text-xl lg:text-2xl leading-relaxed max-w-[800px] mx-auto font-medium drop-shadow-md text-justify sm:text-center text-center-last">
                        {hero.description}
                     </p>
                  </div>
               </div>
            );
         case 'intro':
            const intro = content.intro || { description: "CenterKick is a football media, sports marketing, and player visibility platform dedicated to helping football talent gain recognition, exposure, and opportunities. We combine football storytelling, digital media, player profiling, scouting visibility, and transfer-focused content to connect players, clubs, scouts, agents, coaches, and football stakeholders across Africa and beyond. Our platform serves as a bridge between talent and opportunity, creating an ecosystem where players can showcase their abilities, build their football identity, and increase their chances of being discovered." };
            return (
               <div key={key} className="w-full bg-white py-16 md:py-24 px-4 sm:px-6 relative">
                  <div className="max-w-[1100px] mx-auto bg-white rounded-[3rem] p-10 md:p-16 lg:p-20 border border-gray-100 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#b50a0a]/5 to-transparent rounded-bl-full pointer-events-none"></div>
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#b50a0a]/5 to-transparent rounded-tr-full pointer-events-none"></div>
                     
                     <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-1.5 bg-[#b50a0a] mb-8 rounded-full"></div>
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight md:leading-snug tracking-tight mb-8">
                           {intro.description.split('. ')[0]}.
                        </h3>
                        <p className="text-lg md:text-xl leading-relaxed text-gray-600 font-medium max-w-[800px]">
                           {intro.description.substring(intro.description.indexOf('.') + 1).trim()}
                        </p>
                     </div>
                  </div>
               </div>
            );
         case 'mission-vision':
            const mvData = content['mission-vision'] || {};
            const missionData = mvData.mission || content.mission || {};
            const visionData = mvData.vision || content.vision || {};
            
            const missionTitle = missionData.title || "Empowering Talent Through Visibility";
            const missionDesc = missionData.description || "To empower footballers at all levels by providing the tools, media exposure, and opportunities needed to showcase their talent and advance their careers. We believe that talent deserves visibility, and visibility creates opportunities.";
            const mImage = missionData.image || missionImage;
            
            const visionTitle = visionData.title || "Building Africa's Leading Football Visibility Ecosystem";
            const visionDesc = visionData.description || "To become Africa's leading football media, sports marketing, player visibility, and talent promotion platform by connecting football stakeholders through innovation, storytelling, and technology.";
            const vImage = visionData.image || visionImage;
            
            return (
               <div key={key} className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                     {/* Mission */}
                     <div className="group rounded-[2.5rem] p-8 md:p-12 bg-white border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-[#b50a0a]/10 hover:border-[#b50a0a]/20 transition-all duration-500 relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#b50a0a]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                        <div className="relative z-10">
                           <div className="inline-flex items-center gap-3 mb-6 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                              <span className="w-2 h-2 rounded-full bg-[#b50a0a] animate-pulse"></span>
                              <h3 className="text-sm font-black text-[#b50a0a] tracking-[0.2em]">Our Mission</h3>
                           </div>
                           <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-6 tracking-tight group-hover:text-[#b50a0a] transition-colors duration-300">{missionTitle}</h2>
                           <p className="text-gray-600 text-lg leading-relaxed font-medium">{missionDesc}</p>
                        </div>
                     </div>
                     {/* Vision */}
                     <div className="group rounded-[2.5rem] p-8 md:p-12 bg-white border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-green-600/10 hover:border-green-600/20 transition-all duration-500 relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-600/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                        <div className="relative z-10">
                           <div className="inline-flex items-center gap-3 mb-6 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                              <h3 className="text-sm font-black text-green-600 tracking-[0.2em]">Our Vision</h3>
                           </div>
                           <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-6 tracking-tight group-hover:text-green-600 transition-colors duration-300">{visionTitle}</h2>
                           <p className="text-gray-600 text-lg leading-relaxed font-medium">{visionDesc}</p>
                        </div>
                     </div>
                  </div>
               </div>
            );
         case 'philosophy':
            const philosophyTitle = content.philosophy?.title || "Our Philosophy";
            const philosophySubtitle = content.philosophy?.subtitle || "P.I.I.T.E.P";
            const philosophiesList = content.philosophy?.items || defaultPhilosophies;
            
            return (
               <div key={key} className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                  <div className="bg-gray-50 rounded-[2.5rem] lg:rounded-[3rem] p-8 md:p-16 border border-gray-100 shadow-sm">
                     <div className="max-w-[1200px] mx-auto">
                     <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                           <span className="text-[#b50a0a] font-bold tracking-[0.2em] mb-4 block text-base">{philosophySubtitle}</span>
                           <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">{philosophyTitle}</h2>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {philosophiesList.map((item: any, idx: number) => (
                           <div key={idx} className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(181,10,10,0.15)] hover:border-[#b50a0a]/20 hover:-translate-y-2 transition-all duration-300 group">
                              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-8 group-hover:bg-[#b50a0a]/5 group-hover:scale-110 transition-all border border-gray-100 group-hover:border-[#b50a0a]/20">
                                 {/* Fallback to default icons if DB doesn't have an icon, or just render a standard icon */}
                                 {item.icon ? (typeof item.icon === 'string' ? <Star className="w-6 h-6 text-[#ff3333]" /> : item.icon) : <Star className="w-6 h-6 text-[#ff3333]" />}
                              </div>
                              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{item.title}</h3>
                              <p className="text-gray-500 leading-relaxed font-medium">{item.desc || item.description}</p>
                           </div>
                        ))}
                     </div>
                     </div>
                  </div>
               </div>
            );
         case 'services':
            const servicesTitle = content.services?.title || "WHAT WE DO";
            const servicesList = content.services?.items || defaultServices;
            
            return (
               <div key={key} className="w-full bg-white py-32">
                  <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
                     <div className="text-center mb-24 relative">
                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-50 tracking-tighter w-full pointer-events-none select-none">{servicesTitle}</h2>
                     </div>
                     <div className="space-y-32">
                        {servicesList.map((svc: any, idx: number) => {
                           const isEven = idx % 2 !== 0;
                           return (
                              <div key={idx} className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20 relative`}>
                                 <div className="w-full lg:w-1/2 relative z-10 mt-8 lg:mt-0">
                                    <div className="inline-block text-[#b50a0a] font-black text-base tracking-wide mb-6 border-b-2 border-[#b50a0a] pb-1">Service {svc.num}</div>
                                    <h3 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-8 leading-tight">{svc.title}</h3>
                                    <p className="text-gray-600 text-xl leading-relaxed font-medium mb-8">{svc.desc}</p>
                                    <Link href="/transfer-focus" className="inline-flex items-center gap-2 text-[#b50a0a] font-bold tracking-wide hover:text-gray-900 group transition-colors">
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
         <main className="flex-grow">
            {layout.map(key => renderSection(key))}
         </main>
         <Footer content={footerContent} />
         <style dangerouslySetInnerHTML={{ __html: `.stroke-text { -webkit-text-stroke: 1px rgba(255,255,255,0.6); }` }} />
      </div>
   );
}
