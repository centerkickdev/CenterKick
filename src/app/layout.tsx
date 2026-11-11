import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ["latin"] });

import { createClient } from '@/lib/supabase/server';
import { getCachedData } from '@/lib/redis';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getCachedData('site_system_settings_metadata', async () => {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase
        .from('site_content')
        .select('content')
        .eq('page', 'settings')
        .eq('section', 'system')
        .single();

      return data?.content || {};
    }, 3600);

    
    const resolveUrl = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http')) return url;
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      return `${baseUrl}/storage/v1/object/public${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const faviconUrl = resolveUrl(settings.faviconUrl) || "/favicon.ico";
    
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://centerkick.com'),
      title: settings.siteTitle || "CenterKick | Sports Profile Management",
      description: "Premium sports profile management and subscription platform.",
      icons: {
        icon: [
          { url: faviconUrl, type: 'image/png' },
          { url: '/favicon.png', type: 'image/png' },
          { url: '/icon.png', type: 'image/png' },
          { url: '/favicon.ico' },
        ],
        shortcut: [{ url: faviconUrl, type: 'image/png' }, { url: '/favicon.ico' }],
        apple: [{ url: faviconUrl, type: 'image/png' }, { url: '/icon.png', type: 'image/png' }],
      }
    };
  } catch (err) {
    console.error("Warning: Could not fetch metadata settings during build-time:", err);
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://centerkick.com'),
      title: "CenterKick | Sports Profile Management",
      description: "Premium sports profile management and subscription platform.",
      icons: {
        icon: [
          { url: "/favicon.png", type: 'image/png' },
          { url: "/icon.png", type: 'image/png' },
          { url: "/favicon.ico" },
        ],
        shortcut: ["/favicon.ico"],
        apple: ["/icon.png"],
      }
    };
  }
}

import { ToastProvider } from "@/context/ToastContext";
import NextTopLoader from 'nextjs-toploader';
import { SupportWidget } from '@/components/support/SupportWidget';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <NextTopLoader
          color="#b50a0a"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #b50a0a,0 0 5px #b50a0a"
        />
        <ToastProvider>
          {children}
          <SupportWidget />
        </ToastProvider>
        {/* <SpeedInsights /> */}
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
