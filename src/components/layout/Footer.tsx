'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface FooterColumn {
  title: string;
  links?: { label: string; href: string }[];
  details?: { icon: string; text: string; href?: string }[];
}

interface FooterContent {
  description: string;
  columns: FooterColumn[];
}

export function Footer({ content }: { content?: FooterContent }) {
  const [siteSettings, setSiteSettings] = useState<{ footerLogoUrl?: string; logoUrl?: string; siteTitle?: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getSettings = async () => {
       const { data } = await supabase
         .from('site_content')
         .select('content')
         .eq('page', 'settings')
         .eq('section', 'system')
         .single();
       if (data?.content) setSiteSettings(data.content);
    };
    getSettings();
  }, [supabase]);

  const resolveUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${baseUrl}/storage/v1/object/public${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const footerContent = content || {
     description: "CenterKick is a football media and talent exposure platform built to empower footballers at all levels.",
     columns: [
        {
           title: "Pages",
           links: [
              { label: "Home", href: "/" },
              { label: "About", href: "/about" },
              { label: "Coaches", href: "/coaches" },
              { label: "Athletes", href: "/athletes" }
           ]
        },
        {
           title: "Legal",
           links: [
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" }
           ]
        },
        {
           title: "Contact",
           details: [
              { icon: "phone", text: "(406) 555-0120" },
              { icon: "mail", text: "centrekick123@gmail.com", href: "mailto:centrekick123@gmail.com" },
              { icon: "map", text: "2972 Westheimer Rd. Santa Ana, Illinois 85486" }
           ]
        }
     ]
  };

  const footerLogoUrl = resolveUrl(siteSettings?.footerLogoUrl || siteSettings?.logoUrl);
  const brandName = siteSettings?.siteTitle || "CenterKick";

  return (
    <footer className="bg-[#a20000] text-white pt-16 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">
          
          {/* Column 1: Logo & Description */}
          <div className="w-full lg:w-[45%]">
             <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                {footerLogoUrl ? (
                   <div className="relative h-7 w-auto flex items-center justify-center">
                      <img src={footerLogoUrl} alt={brandName} className="h-full w-auto object-contain" />
                   </div>
                ) : (
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                         <svg className="w-4 h-4 text-[#a20000]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.49 0-4.5-2.01-4.5-4.5S8.51 7.5 11 7.5s4.5 2.01 4.5 4.5c0 .34-.04.68-.11 1h-2.12c.15-.31.23-.65.23-1 0-1.38-1.12-2.5-2.5-2.5S8.5 10.62 8.5 12 9.62 14.5 11 14.5c.66 0 1.25-.26 1.7-.68l1.45 1.45c-.83.76-1.92 1.23-3.15 1.23z"/>
                         </svg>
                      </div>
                      <span className="text-[22px] font-bold tracking-wide">{brandName}</span>
                   </div>
                )}
             </Link>
             <p className="text-white/80 text-[13px] leading-[1.8] pr-8 mb-8 font-light italic">
                {footerContent.description}
             </p>
             
             {/* Social Icons (Keeping static for now unless requested) */}
             <div className="flex items-center gap-5">
                <a href="#" className="text-white hover:text-white/70 transition-colors">
                   <svg width="12" height="18" viewBox="0 0 320 512" fill="currentColor"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/></svg>
                </a>
                <a href="#" className="text-white hover:text-white/70 transition-colors">
                   <svg width="18" height="15" viewBox="0 0 512 512" fill="currentColor"><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.671 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/></svg>
                </a>
             </div>
          </div>
          
          {/* Columns */}
          {footerContent.columns.map((col: FooterColumn, idx: number) => (
             <div key={idx} className="w-full lg:w-auto">
                <h3 className="mb-5 text-[14px] font-bold text-white tracking-wide uppercase">{col.title}</h3>
                {col.links ? (
                   <ul className="text-white/80 space-y-3 text-[12px] font-light">
                      {col.links.map((link: { label: string; href: string }, lIdx: number) => (
                         <li key={lIdx}><Link href={link.href} className="hover:text-white transition-colors uppercase tracking-widest">{link.label}</Link></li>
                      ))}
                   </ul>
                ) : col.details ? (
                   <ul className="text-white/80 space-y-3 text-[12px] font-light">
                      {col.details.map((detail: { icon: string; text: string; href?: string }, dIdx: number) => (
                         <li key={dIdx} className="flex items-start gap-2">
                            {detail.href ? (
                               <a href={detail.href} className="hover:text-white transition-colors">{detail.text}</a>
                            ) : (
                               <span className="leading-[1.4]">{detail.text}</span>
                            )}
                         </li>
                      ))}
                   </ul>
                ) : null}
             </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
