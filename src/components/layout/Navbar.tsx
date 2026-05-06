'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signout } from '@/app/login/actions';

export function Navbar({ content }: { content?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('player');
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const pathname = usePathname();
  const supabase = createClient();

  // Use content from CMS if available, otherwise defaults
  const navContent = content || {
     brand: "CenterKick",
     links: [
        { label: "Home", href: "/" },
        { label: "Profiles", dropdown: [
           { label: "Athletes", href: "/athletes" },
           { label: "Coaches", href: "/coaches" },
           { label: "Agents", href: "/agents" }
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
  };

  useEffect(() => {
    // Instantly remove PKCE authorization codes or tokens from the URL for security
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => pathname === path;

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  const resolveUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${baseUrl}/storage/v1/object/public${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const brandName = siteSettings?.siteTitle || navContent.brand;
  const logoUrl = resolveUrl(siteSettings?.logoUrl);

  const adminRoles = ['superadmin', 'admin', 'blogger', 'operations', 'finance'];
  const dashboardHref = user ? (adminRoles.includes(userRole) ? "/admin" : "/dashboard") : "/login";

  return (
    <nav className="fixed w-full z-50 top-0 start-0 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-[1400px] flex flex-wrap items-center justify-between mx-auto p-4 sm:px-6 lg:px-8 h-20">
         
         {/* LOGO */}
         <Link href="/" className="flex items-center group">
           {logoUrl ? (
             <div className="relative h-7 w-auto min-w-[2rem] flex items-center justify-center transition-all">
               <img src={logoUrl} alt={brandName} className="h-full w-auto object-contain" />
             </div>
           ) : (
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-[#b50a0a] flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                  <svg className="w-4 h-4 text-white font-black" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.49 0-4.5-2.01-4.5-4.5S8.51 7.5 11 7.5s4.5 2.01 4.5 4.5c0 .34-.04.68-.11 1h-2.12c.15-.31.23-.65.23-1 0-1.38-1.12-2.5-2.5-2.5S8.5 10.62 8.5 12 9.62 14.5 11 14.5c.66 0 1.25-.26 1.7-.68l1.45 1.45c-.83.76-1.92 1.23-3.15 1.23z"/>
                  </svg>
               </div>
               <span className="self-center text-xl font-black whitespace-nowrap text-gray-900 group-hover:text-[#b50a0a] transition-all uppercase tracking-tighter">
                 {brandName}
               </span>
             </div>
           )}
         </Link>

         {/* MOBILE MENU BUTTON */}
         <div className="flex md:hidden order-2">
           <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none"
           >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
         </div>

         {/* NAVIGATION LINKS */}
         <div className={`items-center justify-center w-full md:flex md:w-auto md:order-1 ${isOpen ? 'block' : 'hidden'} absolute md:relative top-20 md:top-0 left-0 bg-white md:bg-transparent shadow-lg md:shadow-none border-t md:border-0 border-gray-100 max-h-[calc(100vh-80px)] overflow-y-auto md:overflow-visible`}>
           <ul className="flex flex-col p-6 md:p-0 mt-0 font-medium md:space-x-8 rtl:space-x-reverse md:flex-row text-sm uppercase tracking-widest text-[11px] font-black">
             {navContent.links.map((link: any, idx: number) => (
                <li key={idx} className={link.dropdown ? "relative group/drop" : ""}>
                   {link.dropdown ? (
                      <>
                        <button 
                           onClick={() => toggleDropdown(link.label)}
                           className={`flex items-center justify-between w-full py-4 md:py-2 ${link.dropdown.some((d: any) => pathname.includes(d.href)) ? 'text-[#b50a0a]' : 'text-gray-700 hover:text-[#b50a0a] transition-colors gap-1'}`}
                        >
                           {link.label} <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`${activeDropdown === link.label ? 'block' : 'hidden'} md:group-hover/drop:block md:absolute top-full left-0 bg-white md:shadow-xl md:border border-gray-100 rounded-xl md:min-w-[200px] overflow-hidden z-[100] transition-all animate-in fade-in slide-in-from-top-2 duration-300`}>
                           <div className="flex flex-col md:py-2">
                              {link.dropdown.map((d: any, dIdx: number) => (
                                 <Link key={dIdx} href={d.href} className="px-6 py-4 md:py-3 hover:bg-gray-50 text-gray-700 hover:text-[#b50a0a] transition-colors border-l-4 border-transparent hover:border-[#b50a0a]">{d.label}</Link>
                              ))}
                           </div>
                        </div>
                      </>
                   ) : (
                      <Link href={link.href} className={`block py-4 md:py-2 ${isActive(link.href) ? 'text-[#b50a0a]' : 'text-gray-700 hover:text-[#b50a0a] transition-colors'}`}>{link.label}</Link>
                   )}
                </li>
             ))}

             <li className="md:hidden mt-8">
                <Link href={dashboardHref} className="block w-full text-center text-white bg-[#b50a0a] hover:bg-[#990000] font-black rounded-lg text-xs px-6 py-4 transition-all">
                   {user ? 'Dashboard' : 'Get Started'}
                </Link>
             </li>
           </ul>
         </div>

         {/* CTA BUTTON */}
          <div className="hidden md:flex order-3">
            <Link href={dashboardHref}>
              <button type="button" className="text-white bg-[#b50a0a] hover:bg-[#990000] font-black rounded-lg text-[10px] tracking-widest uppercase px-8 py-3.5 shadow-md transition-all hover:shadow-xl transform active:scale-95">
                {user ? 'Dashboard' : 'Get Started'}
              </button>
            </Link>
          </div>

      </div>
    </nav>
  );
}
