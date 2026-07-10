'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
   Mail, 
   Briefcase, 
   Send,
   ChevronDown,
   MessageSquare,
   Globe,
   Instagram,
   Twitter,
   Facebook
} from "lucide-react";
import { useState } from "react";

interface ContactContent {
  header?: { title: string; description: string };
  faqs?: { q: string; a: string }[];
}

interface ContactClientProps {
  layout: string[];
  content: ContactContent;
  navContent?: any;
  footerContent?: any;
  siteSettings?: any;
}

export function ContactClient({ layout, content, navContent, footerContent, siteSettings }: ContactClientProps) {
   const [openFaq, setOpenFaq] = useState<number | null>(0);

   const renderSection = (key: string) => {
      switch (key) {
         case 'header':
            const header = content.header || { title: "Get in Touch", description: "Have questions? We're here to help." };
            return (
               <div key={key} className="w-full bg-gray-50 py-24 md:py-32 relative overflow-hidden border-b border-gray-100">
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#b50a0a]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  <div className="max-w-[1200px] mx-auto px-4 lg:px-0 text-center relative z-10">
                     <span className="text-[#b50a0a] font-bold tracking-[0.2em] mb-4 block text-base">Contact Us</span>
                     <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-8 drop-shadow-sm">
                        {header.title?.split(' ').map((word: string, i: number) => (
                           <span key={i} className={word === 'Touch' ? 'text-[#ff4d4d]' : ''}>{word} </span>
                        ))}
                     </h1>
                     <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-[600px] mx-auto font-medium">{header.description}</p>
                  </div>
               </div>
            );
         case 'info':
            return (
               <div key={key} className="w-full lg:w-1/3 flex flex-col gap-12">
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Direct Contacts</h2>
                     <div className="space-y-8">
                        <div className="group flex items-start gap-4 p-4 -ml-4 rounded-2xl hover:bg-gray-50 transition-colors">
                           <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[#b50a0a]/10 group-hover:text-[#b50a0a] transition-colors border border-gray-200 group-hover:border-[#b50a0a]/20">
                              <Mail className="w-5 h-5 text-gray-600 group-hover:text-[#b50a0a]" />
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-900 mb-1">General Support</h3>
                              <a href="mailto:support@centerkick.com" className="block text-gray-500 hover:text-[#b50a0a] font-medium transition-colors">support@centerkick.com</a>
                           </div>
                        </div>
                        <div className="group flex items-start gap-4 p-4 -ml-4 rounded-2xl hover:bg-gray-50 transition-colors">
                           <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[#b50a0a]/10 group-hover:text-[#b50a0a] transition-colors border border-gray-200 group-hover:border-[#b50a0a]/20">
                              <Briefcase className="w-5 h-5 text-gray-600 group-hover:text-[#b50a0a]" />
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-900 mb-1">Partnerships</h3>
                              <a href="mailto:partnerships@centerkick.com" className="block text-gray-500 hover:text-[#b50a0a] font-medium transition-colors">partnerships@centerkick.com</a>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     {[Instagram, function XIcon(props: any) { return <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className || "w-5 h-5 fill-current"}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>; }, Facebook, Globe].map((Icon: any, i) => (
                        <a key={i} href="#" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-black hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100 group">
                           <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </a>
                     ))}
                  </div>
               </div>
            );
         case 'form':
            return (
               <div key={key} className="w-full lg:w-2/3">
                  <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#b50a0a] to-[#ff4d4d]"></div>
                     <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-[#b50a0a]" /> Send a Message
                     </h2>
                     <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <input type="text" placeholder="Full Name" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#b50a0a] text-black placeholder:text-gray-900" />
                           <input type="email" placeholder="Email Address" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#b50a0a] text-black placeholder:text-gray-900" />
                        </div>
                        <input type="text" placeholder="Subject" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#b50a0a] text-black placeholder:text-gray-900" />
                        <textarea rows={6} placeholder="Message" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#b50a0a] resize-none text-black placeholder:text-gray-900"></textarea>
                        <button type="submit" className="bg-[#b50a0a] text-white font-bold tracking-wide px-10 py-5 rounded-xl shadow-lg transition-all hover:-translate-y-1 group flex items-center gap-3">
                            Send Message <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                     </form>
                  </div>
               </div>
            );
         case 'faqs':
            const faqs = content.faqs || [
               { q: "What is CenterKick?", a: "CenterKick is a football media and talent exposure platform that helps players, coaches, clubs, agents, and scouts connect through professional e-profiles, football news, and scouting visibility." },
               { q: "Who can create a profile on CenterKick?", a: "Footballers (male and female), coaches, clubs, academies, agents, and football organizations can create profiles on CenterKick." },
               { q: "Is CenterKick only for professional footballers?", a: "No. CenterKick works with both amateur and professional footballers at all levels, including grassroots and youth players." },
               { q: "How does the player e-profile work?", a: "A player e-profile showcases your football information such as bio, career history, stats, photos, videos, and availability status. It can be shared directly with scouts, agents, and clubs." },
               { q: "Can scouts and agents find players on CenterKick?", a: "Yes. Scouts and agents can explore player profiles, add players to their watchlist, and receive updates when profiles are updated." },
               { q: "Do I need to pay to use CenterKick?", a: "Some features may require a subscription, especially for profile management, visibility, and premium tools. Details are available during signup." },
               { q: "Does CenterKick help with transfers or trials?", a: "CenterKick does not directly sign players to clubs, but we provide the visibility, tools, and platform that help players connect with the right football decision-makers." },
               { q: "Can CenterKick promote my club, event, or tournament?", a: "Yes. CenterKick offers media and PR services for clubs, academies, leagues, tournaments, and football events." },
               { q: "How do I contact support?", a: "You can reach us via email or through the contact form on this page. Our team will respond as quickly as possible." },
               { q: "Is CenterKick active on social media?", a: "Yes. CenterKick is active across multiple platforms where we share football news, player features, highlights, and exclusive content." }
            ];
            return (
               <div key={key} className="w-full bg-gray-50 py-32 px-6 border-y border-gray-200">
                  <div className="max-w-[800px] mx-auto">
                     <div className="text-center mb-16">
                        <span className="text-[#b50a0a] font-bold tracking-[0.2em] mb-4 block text-base">Got Questions?</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">â” FAQs</h2>
                     </div>
                     <div className="space-y-4">
                        {faqs.map((faq: { q: string; a: string }, idx: number) => (
                           <div key={idx} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${openFaq === idx ? 'border-[#b50a0a]' : 'border-gray-200'}`}>
                              <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full flex items-center justify-between p-6 md:p-8 text-left outline-none">
                                 <div className="flex items-center gap-4">
                                    <span className={`font-bold text-lg ${openFaq === idx ? 'text-[#b50a0a]' : 'text-gray-300'}`}>{(idx + 1).toString().padStart(2, '0')}</span>
                                    <h3 className="font-bold text-gray-900">{faq.q}</h3>
                                 </div>
                                 <ChevronDown className={`w-6 h-6 transition-transform ${openFaq === idx ? 'rotate-180 text-[#b50a0a]' : 'text-gray-400'}`} />
                              </button>
                              {openFaq === idx && (
                                 <div className="p-6 md:p-8 pt-0 border-t border-gray-50">
                                    <p className="text-gray-600 ml-12">{faq.a}</p>
                                 </div>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            );
         default: return null;
      }
   };

   return (
      <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-[#b50a0a] selection:text-white">
         <Navbar content={navContent} settings={siteSettings} />
         <main className="flex-grow pt-32">
            {layout.includes('header') && renderSection('header')}
            {(layout.includes('info') || layout.includes('form')) && (
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0 py-24 md:py-32">
                  <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                     {layout.includes('info') && renderSection('info')}
                     {layout.includes('form') && renderSection('form')}
                  </div>
               </div>
            )}
            {layout.includes('faqs') && renderSection('faqs')}
         </main>
         <Footer content={footerContent} settings={siteSettings} />
      </div>
   );
}
