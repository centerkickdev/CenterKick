import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import AgentDetailsClient from './AgentDetailsClient';
import { isProfileComplete } from '@/lib/utils/profile';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

function stripHtml(html: string): string {
   if (!html) return '';
   return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
   const { id } = await params;
   const supabaseAdmin = createAdminClient();

   const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
   if (isUuid) return {};

   const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, agency_name, country, avatar_url, cover_url, bio')
      .eq('slug', id)
      .maybeSingle();

   if (!profile) return {};

   const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.agency_name || 'Agent Profile';
   const title = `${name} ${profile.agency_name ? `(${profile.agency_name})` : ''} - CenterKick`;
   const cleanBio = stripHtml(profile.bio || '');
   const description = cleanBio || `${name} is a licensed football agent based in ${profile.country || 'Global'} on CenterKick.`;
   const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://centerkick.com';
   const getAbsoluteUrl = (urlStr?: string | null) => {
      if (!urlStr) return null;
      if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) return urlStr;
      return `${siteUrl.replace(/\/$/, '')}${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
   };

   const image = getAbsoluteUrl(profile.avatar_url) || getAbsoluteUrl(profile.cover_url) || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1200&auto=format&fit=crop";

   return {
      title,
      description,
      openGraph: {
         title,
         description,
         images: [{ url: image, width: 1200, height: 630, alt: name }],
         type: 'profile',
      },
      twitter: {
         card: 'summary_large_image',
         title,
         description,
         images: [image],
      },
   };
}

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
   const { id } = await params;
   const supabaseUser = await createClient();
   const supabaseAdmin = createAdminClient();

   // Enforce slug-based access only. UUID access is forbidden.
   const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
   if (isUuid) {
      return notFound();
   }

   const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*, users!profiles_user_id_fkey!inner(role)')
      .eq('slug', id)
      .single();

   // Fetch managed clients (Players & Coaches)
   const { data: managedClients } = await supabaseAdmin
      .from('profiles')
      .select('*, users!profiles_user_id_fkey!inner(role)')
      .eq('agent_id', profile?.user_id || '');

   if (error || !profile) {
      if (error) console.error('Agent fetch database error:', error.message);
      notFound();
   }

   // Only show active profiles to public, or let admins/owners see pending
   const { data: { user } } = await supabaseUser.auth.getUser();
   const isOwner = user?.id === profile.user_id;

   if (profile.status !== 'active' && !isOwner) {
      const { data: currentUser } = await supabaseAdmin
         .from('users')
         .select('role')
         .eq('id', user?.id || '')
         .single();
      
      if (currentUser?.role !== 'superadmin') {
         notFound();
      }
   }

   if (!isProfileComplete(profile) && !isOwner) {
      const { data: currentUser } = await supabaseAdmin
         .from('users')
         .select('role')
         .eq('id', user?.id || '')
         .single();
      if (currentUser?.role !== 'superadmin') {
         notFound();
      }
   }

   return <AgentDetailsClient profile={profile} managedClients={managedClients || []} />;
}
