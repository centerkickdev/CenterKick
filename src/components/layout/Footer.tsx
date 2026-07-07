'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Facebook, Instagram, Youtube } from 'lucide-react';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function Footer({ content, settings }: { content?: any; settings?: any }) {
   const [siteSettings, setSiteSettings] = useState<{
      footerLogoUrl?: string;
      logoUrl?: string;
      siteTitle?: string;
      facebookUrl?: string;
      instagramUrl?: string;
      twitterUrl?: string;
      youtubeUrl?: string;
   } | null>(settings || null);
   const [footerContent, setFooterContent] = useState<any>(content || null);
   const supabase = createClient();

   useEffect(() => {
      const fetchData = async () => {
         if (!settings && !content) {
            const { data } = await supabase
               .from('site_content')
               .select('page, section, content')
               .in('page', ['settings', 'footer']);
            
            if (data) {
               const sysSettings = data.find((d: any) => d.page === 'settings' && d.section === 'system')?.content;
               if (sysSettings) setSiteSettings(sysSettings);
               
               // Combine footer sections
               const fContent: any = {};
               data.filter((d: any) => d.page === 'footer').forEach((d: any) => {
                  fContent[d.section] = d.content;
               });
               setFooterContent(fContent);
            }
         } else {
            if (settings) setSiteSettings(settings);
            if (content) setFooterContent(content);
         }
      };
      fetchData();
   }, [supabase, settings, content]);

   const resolveUrl = (url: string | undefined) => {
      if (!url) return '';
      if (url.startsWith('http')) return url;
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      return `${baseUrl}/storage/v1/object/public${url.startsWith('/') ? '' : '/'}${url}`;
   };

   const footerLogoUrl = resolveUrl(siteSettings?.footerLogoUrl || siteSettings?.logoUrl);
   const brandName = siteSettings?.siteTitle || "CenterKick";

   const desc = footerContent?.about?.description || "CenterKick is a football media, sports marketing, and player visibility platform dedicated to helping football talent gain recognition, exposure, and opportunities.";
   
   const contactEmail = footerContent?.contact?.email || "info.centerkick@gmail.com";
   const contactPhone = footerContent?.contact?.phone || "+234 911 260 0300";

   const quickLinks = footerContent?.links?.quickLinks || [
      { title: 'Home', url: '/' },
      { title: 'About Us', url: '/about' },
      { title: 'News', url: '/news' },
      { title: 'Player Profiles', url: '/players' },
      { title: 'Contact Us', url: '/contact' }
   ];

   const services = footerContent?.links?.services || [
      { title: 'Player E-Profiles', url: '#' },
      { title: 'Scouting & Talent Visibility', url: '#' },
      { title: 'Media, PR & Football Coverage', url: '#' },
      { title: 'Transfer Focus', url: '/transfer-focus' },
      { title: 'Marketing & Career Support', url: '#' }
   ];

   const fbUrl = siteSettings?.facebookUrl || '#';
   const igUrl = siteSettings?.instagramUrl || '#';
   const twUrl = siteSettings?.twitterUrl || '#';
   const ytUrl = siteSettings?.youtubeUrl || '#';

   return (
      <footer className="bg-[#a20000] text-white pt-16">
         <div className="max-w-[1200px] mx-auto px-4 lg:px-0 pb-6">
            {/* Top Row: Brand & Socials */}
            <div className="w-full flex flex-col items-center text-center border-b border-white/10 pb-12 mb-12">
               <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                  {footerLogoUrl ? (
                     <div className="relative h-10 w-auto flex items-center justify-center">
                        <img src={footerLogoUrl} alt={brandName} className="h-full w-auto object-contain" />
                     </div>
                  ) : (
                     <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                           <span className="text-[#a20000] font-black text-lg">C</span>
                        </div>
                        <span className="text-[26px] font-bold tracking-wide">{brandName}</span>
                     </div>
                  )}
               </Link>
               <p className="text-white/80 text-[14px] leading-[1.8] max-w-[700px] mb-8 font-light text-center">
                  {desc}
               </p>

               <h3 className="mb-5 text-[12px] font-bold text-white tracking-wide">FOLLOW US</h3>
               <div className="flex items-center justify-center gap-6">
                  <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/70 transition-colors">
                     <Facebook className="w-6 h-6" />
                  </a>
                  <a href={igUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/70 transition-colors">
                     <Instagram className="w-6 h-6" />
                  </a>
                  <a href={twUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/70 transition-colors">
                     <XIcon className="w-5 h-5" />
                  </a>
                  <a href={ytUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/70 transition-colors">
                     <Youtube className="w-6 h-6" />
                  </a>
               </div>
            </div>

            {/* Bottom Row: Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 justify-items-center md:justify-items-start text-center md:text-left">
               {/* Column 1: Quick Links */}
               <div className="w-full">
                  <h3 className="mb-6 text-[14px] font-bold text-white tracking-wide">Quick Links</h3>
                  <ul className="text-white/80 space-y-3 text-[12px] font-light">
                     {quickLinks.map((link: any, i: number) => (
                        <li key={i}>
                           <Link href={link.url || '#'} className="hover:text-white transition-colors tracking-wide block">
                              {link.title}
                           </Link>
                        </li>
                     ))}
                  </ul>
               </div>

               {/* Column 3: Services */}
               <div className="w-full">
                  <h3 className="mb-6 text-[14px] font-bold text-white tracking-wide">SERVICES</h3>
                  <ul className="text-white/80 space-y-3 text-[12px] font-light">
                     {services.map((svc: any, i: number) => (
                        <li key={i}>
                           {svc.url && svc.url !== '#' ? (
                              <Link href={svc.url} className="hover:text-white transition-colors tracking-wide block opacity-80 hover:opacity-100">
                                 {svc.title}
                              </Link>
                           ) : (
                              <span className="tracking-wide opacity-80 block">{svc.title}</span>
                           )}
                        </li>
                     ))}
                  </ul>
               </div>

               {/* Column 3: Legal */}
               <div className="w-full">
                  <h3 className="mb-6 text-[14px] font-bold text-white tracking-wide">LEGAL</h3>
                  <ul className="text-white/80 space-y-3 text-[12px] font-light">
                     <li><Link href="/privacy" className="hover:text-white transition-colors tracking-wide block">Privacy Policy</Link></li>
                     <li><Link href="/terms" className="hover:text-white transition-colors tracking-wide block">Terms of Service</Link></li>
                  </ul>
               </div>

               {/* Column 4: Contact */}
               <div className="w-full">
                  <h3 className="mb-6 text-[14px] font-bold text-white tracking-wide">CONTACT INFORMATION</h3>
                  <ul className="text-white/80 space-y-4 text-[12px] font-light">
                     <li>
                        <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors flex flex-col md:items-start items-center gap-1">
                           <span className="tracking-wide opacity-60 text-[10px]">Email</span>
                           <span>{contactEmail}</span>
                        </a>
                     </li>
                     <li>
                        <div className="flex flex-col md:items-start items-center gap-1">
                           <span className="tracking-wide opacity-60 text-[10px]">Phone / WhatsApp</span>
                           <span>{contactPhone}</span>
                        </div>
                     </li>
                  </ul>
               </div>
            </div>
         </div>

         {/* Developers Tag Bar */}
         <div className="bg-[#8b0000] border-t border-white/10 py-6 md:py-8">
            <div className="max-w-[1200px] mx-auto px-4 lg:px-0 text-center flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0">
               <span className="text-[10px] font-black text-white/60 tracking-[0.2em]">
                  &copy; {new Date().getFullYear()} {brandName}. All Rights Reserved.
               </span>
               <span className="hidden md:inline text-[10px] font-black text-white/40 px-2 tracking-[0.2em]">|</span>
               <span className="text-[10px] font-black text-white/60 tracking-[0.2em]">
                  <a href="https://devunomieta.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-white/80 mx-1">@DEVUNOMIETA</a>
                  <span className="opacity-40 px-1">|</span>
                  <a href="https://cortdevs.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-white/80 mx-1">CORTDEVS</a>
                  <span className="opacity-40 px-1">|</span>
                  <a href="https://cortdevs.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-white/80 mx-1">HACHSTACKS</a>
               </span>
            </div>
         </div>
      </footer>
   );
}
