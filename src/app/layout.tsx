import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ["latin"] });

import { createClient } from '@/lib/supabase/server';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_content')
    .select('content')
    .eq('page', 'settings')
    .eq('section', 'system')
    .single();

  const settings = data?.content || {};
  
  const resolveUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${baseUrl}/storage/v1/object/public${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const faviconUrl = resolveUrl(settings.faviconUrl) || "/favicon.ico";
  
  return {
    title: settings.siteTitle || "CenterKick | Sports Profile Management",
    description: "Premium sports profile management and subscription platform.",
    icons: {
      icon: faviconUrl,
    }
  };
}

import { ToastProvider } from "@/context/ToastContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
