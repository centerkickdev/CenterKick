'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

interface NavLink {
  label: string;
  href?: string;
  dropdown?: { label: string; href: string }[];
}

interface NavbarContent {
  brand: string;
  links: NavLink[];
}

interface SiteSettings {
  siteTitle?: string;
  logoUrl?: string;
}

export function Navbar({ content, settings }: { content?: Record<string, unknown> | null; settings?: Record<string, unknown> | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('player');
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(settings || null);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  const navContent = (content || {
     brand: "CenterKick",
     links: [
        { label: "Home", href: "/" },
        { label: "Profiles", dropdown: [
           { label: "Athletes", href: "/players" },
           { label: "Coaches", href: "/coaches" },
           { label: "Agents", href: "/agents" },
           { label: "Scouts", href: "/scouts" },
           { label: "Organizations", href: "/organizations" }
        ]},
        { label: "Updates", dropdown: [
           { label: "News", href: "/news" },
           { label: "Transfer Focus", href: "/transfer-focus" }
        ]},
        { label: "About", dropdown: [
           { label: "Who We Are", href: "/about" },
           { label: "Contact Us", href: "/contact" }
        ]}
     ]
  }) as unknown as NavbarContent;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('code') || url.searchParams.has('token_hash') || url.searchParams.has('error')) {
        url.searchParams.delete('code');
        url.searchParams.delete('token_hash');
        url.searchParams.delete('error');
        url.searchParams.delete('error_code');
        url.searchParams.delete('error_description');
        url.searchParams.delete('sb');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      }
    }

    const getSettings = async () => {
       if (settings) {
         setSiteSettings(settings);
         return;
       }
       const { data } = await supabase
         .from('site_content')
         .select('content')
         .eq('page', 'settings')
         .eq('section', 'system')
         .single();
       if (data?.content) setSiteSettings(data.content);
    };
    getSettings();

    const getUser = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       setUser(user);
       if (user) {
          const { data } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
          setUserRole(data?.role || 'player');
       }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
       setUser(session?.user ?? null);
       if (session?.user) {
          const { data } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
          setUserRole(data?.role || 'player');
       }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, [supabase, settings]);

  const isActive = (path: string | undefined) => {
    if (!path) return false;
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const resolveUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${baseUrl}/storage/v1/object/public${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const brandName = (siteSettings?.siteTitle || navContent.brand || 'CenterKick') as string;
  const logoUrl = resolveUrl(siteSettings?.logoUrl as string | undefined);

  const adminRoles = ['superadmin', 'admin', 'blogger', 'operations', 'finance'];
  const userMetadataRole = user?.app_metadata?.role;
  const dashboardHref = user ? (adminRoles.includes(userMetadataRole || userRole) ? "/admin" : "/dashboard") : "/login";

  return (
    <>
      <nav suppressHydrationWarning className={`fixed z-50 left-0 right-0 mx-auto transition-all duration-500 ease-out backdrop-blur-xl ${
 isScrolled 
 ? 'top-3 lg:top-4 w-[calc(100%-1.5rem)] lg:w-[calc(100%-2rem)] max-w-[1300px] bg-white/95 border border-gray-200/50 shadow-2xl py-1.5 lg:py-2 rounded-full' 
 : 'top-0 w-full bg-white lg:bg-white/95 border-b border-gray-100 shadow-sm py-3 lg:py-3.5 rounded-none'
 }`}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 sm:px-8 h-12">
           
           {/* LOGO */}
           <Link href="/" className="flex items-center group">
             {logoUrl ? (
               <div className="relative h-7 w-auto min-w-[2rem] flex items-center justify-center transition-all group-hover:scale-105">
                 <img src={logoUrl} alt={brandName} className="h-full w-auto object-contain" />
               </div>
             ) : (
               <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-full bg-[#b50a0a] flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden transition-transform group-hover:rotate-12">
                    <svg className="w-5 h-5 text-white font-black" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.49 0-4.5-2.01-4.5-4.5S8.51 7.5 11 7.5s4.5 2.01 4.5 4.5c0 .34-.04.68-.11 1h-2.12c.15-.31.23-.65.23-1 0-1.38-1.12-2.5-2.5-2.5S8.5 10.62 8.5 12 9.62 14.5 11 14.5c.66 0 1.25-.26 1.7-.68l1.45 1.45c-.83.76-1.92 1.23-3.15 1.23z"/>
                    </svg>
                 </div>
                 <span className="self-center text-lg font-black whitespace-nowrap text-gray-900 group-hover:text-[#b50a0a] transition-all tracking-tighter">
                   {brandName}
                 </span>
               </div>
             )}
           </Link>

           {/* MOBILE & TABLET MENU BUTTON */}
           <div className="flex lg:hidden">
             <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="inline-flex items-center p-2 w-10 h-10 justify-center text-gray-500 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
             >
                <span className="sr-only">Open main menu</span>
                <Menu className="w-5 h-5 text-gray-800" />
             </button>
           </div>

           {/* NAVIGATION LINKS */}
           <div className="hidden lg:flex items-center justify-center">
              <ul className="flex flex-row space-x-7 text-sm font-semibold tracking-wide text-gray-600">
                {navContent.links.map((link: NavLink, idx: number) => (
                  <li key={idx} className="relative group/drop py-2">
                     {link.dropdown ? (
                        <>
                           <button 
                              onClick={() => toggleDropdown(link.label)}
                              className={`flex items-center gap-1.5 transition-colors duration-300 hover:text-[#b50a0a] ${
 link.dropdown.some((d: { label: string; href: string }) => pathname.startsWith(d.href)) 
 ? 'text-[#b50a0a]' 
 : 'text-gray-600'
 }`}
                           >
                              {link.label} 
                              <ChevronDown className="w-3 h-3 opacity-60 transition-transform duration-300 group-hover/drop:rotate-180" />
                           </button>
                           <div className="absolute top-[120%] left-1/2 -translate-x-1/2 bg-white/95 border border-gray-100 shadow-2xl rounded-2xl min-w-[200px] p-2 z-[100] scale-95 opacity-0 invisible group-hover/drop:scale-100 group-hover/drop:opacity-100 group-hover/drop:visible transition-all duration-300 transform origin-top">
                              <div className="flex flex-col">
                                  {link.dropdown.map((d: { label: string; href: string }, dIdx: number) => (
                                     <Link 
                                       key={dIdx} 
                                       href={d.href} 
                                       className="px-5 py-3 hover:bg-gray-50 text-sm font-semibold tracking-wide text-gray-600 hover:text-[#b50a0a] transition-all rounded-xl border-l-2 border-transparent hover:border-[#b50a0a]"
                                     >
                                       {d.label}
                                     </Link>
                                  ))}
                              </div>
                           </div>
                        </>
                     ) : (
                        <Link 
                          href={link.href || '#'} 
                          className={`transition-colors duration-300 hover:text-[#b50a0a] relative ${
 isActive(link.href) ? 'text-[#b50a0a]' : 'text-gray-600'
 }`}
                        >
                           {link.label}
                           {isActive(link.href) && (
                             <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-[#b50a0a] rounded-full animate-in fade-in zoom-in-50 duration-500"></span>
                           )}
                        </Link>
                     )}
                  </li>
                ))}
              </ul>
           </div>

           {/* CTA BUTTON */}
           <div className="hidden lg:flex items-center gap-4">
             {user ? (
               <Link href={dashboardHref}>
                 <button type="button" className="text-white bg-[#b50a0a] hover:bg-black font-semibold rounded-full text-sm tracking-wide px-8 py-3 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-[1px] active:scale-95">
                   Dashboard
                 </button>
               </Link>
             ) : (
               <>
                 <Link href="/login">
                   <button type="button" className="text-gray-600 hover:text-[#b50a0a] font-semibold text-sm tracking-wide px-4 transition-all hover:scale-105">
                     Login
                   </button>
                 </Link>
                 <Link href="/register">
                   <button type="button" className="text-white bg-[#b50a0a] hover:bg-black font-semibold rounded-full text-sm tracking-wide px-8 py-3 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-[1px] active:scale-95">
                     Register
                   </button>
                 </Link>
               </>
             )}
           </div>

        </div>
      </nav>

      {/* MOBILE & TABLET NAV — FULL SCREEN OVERLAY */}
      <div className={`lg:hidden fixed inset-0 z-[200] transition-all duration-300 ${
 isOpen ? 'visible' : 'invisible pointer-events-none'
 }`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        />
        {/* Panel */}
        <div className={`absolute inset-0 w-full h-full bg-white flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center group">
              {logoUrl ? (
                <div className="relative h-7 w-[120px] sm:w-[150px] flex items-center justify-start transition-all group-hover:scale-105">
                  <Image src={logoUrl} alt={brandName} fill className="object-contain object-left" priority sizes="(max-width: 1024px) 120px, 150px" />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#b50a0a] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.49 0-4.5-2.01-4.5-4.5S8.51 7.5 11 7.5s4.5 2.01 4.5 4.5c0 .34-.04.68-.11 1h-2.12c.15-.31.23-.65.23-1 0-1.38-1.12-2.5-2.5-2.5S8.5 10.62 8.5 12 9.62 14.5 11 14.5c.66 0 1.25-.26 1.7-.68l1.45 1.45c-.83.76-1.92 1.23-3.15 1.23z"/>
                    </svg>
                  </div>
                  <span className="self-center text-base font-black whitespace-nowrap text-gray-900 group-hover:text-[#b50a0a] transition-all tracking-tighter">
                    {brandName}
                  </span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-800" />
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <ul className="flex flex-col gap-1">
              {navContent.links.map((link: NavLink, idx: number) => (
                <li key={idx}>
                  {link.dropdown ? (
                    <div className="flex flex-col">
                      <button
                        onClick={() => toggleDropdown(link.label)}
                        className="flex items-center justify-between w-full py-4 text-base font-black tracking-wide text-gray-800 border-b border-gray-50"
                      >
                        <span>{link.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === link.label ? 'rotate-180 text-[#b50a0a]' : 'text-gray-400'}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${activeDropdown === link.label ? 'max-h-64' : 'max-h-0'}`}>
                        <div className="pl-4 py-2 flex flex-col gap-1">
                          {link.dropdown.map((d: { label: string; href: string }, dIdx: number) => (
                            <Link
                              key={dIdx}
                              href={d.href}
                              onClick={() => setIsOpen(false)}
                              className={`py-3 text-sm font-bold tracking-wide border-l-2 pl-4 transition-colors ${
 pathname.startsWith(d.href) ? 'text-[#b50a0a] border-[#b50a0a]' : 'text-gray-500 border-gray-100 hover:text-[#b50a0a] hover:border-[#b50a0a]'
 }`}
                            >
                              {d.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={link.href || '#'}
                      onClick={() => setIsOpen(false)}
                      className={`block py-4 text-base font-black tracking-wide border-b border-gray-50 transition-colors ${
 isActive(link.href) ? 'text-[#b50a0a]' : 'text-gray-800 hover:text-[#b50a0a]'
 }`}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="px-6 pb-10 pt-4 border-t border-gray-100 flex flex-col gap-3 shrink-0">
            {user ? (
              <Link href={dashboardHref} onClick={() => setIsOpen(false)}>
                <button className="w-full bg-[#b50a0a] text-white font-black rounded-2xl text-sm tracking-wide py-4 shadow-md transition-all hover:bg-black">
                  Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <button className="w-full bg-[#b50a0a] text-white font-black rounded-2xl text-sm tracking-wide py-4 shadow-md transition-all hover:bg-black">
                    Register
                  </button>
                </Link>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <button className="w-full border border-gray-200 text-gray-700 font-black rounded-2xl text-sm tracking-wide py-4 transition-all hover:border-[#b50a0a] hover:text-[#b50a0a]">
                    Login
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
