import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import CoachDetailsClient from './CoachDetailsClient';
import { isProfileComplete } from '@/lib/utils/profile';
import { trackProfileView } from '@/app/actions/tracking';
import type { Metadata } from 'next';

function stripHtml(html: string): string {
   if (!html) return '';
   return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

import { getProfileOgImage, getBaseSiteUrl } from '@/lib/utils/og';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
   const { id } = await params;
   const supabaseAdmin = createAdminClient();

   const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
   if (isUuid) return {};

   const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, current_position, position, country, avatar_url, cover_url, gallery_urls, bio')
      .eq('slug', id)
      .maybeSingle();

   if (!profile) return {};

   const coachPos = (Array.isArray(profile.current_position) ? profile.current_position[0] : profile.current_position) || profile.position || 'Coach';
   const firstName = (profile.first_name || '').trim();
   const lastName = (profile.last_name || '').trim();
   const name = `${firstName} ${lastName}`.trim() || 'Coach Profile';
   const title = `${name} (${coachPos}) - CenterKick`;
   const cleanBio = stripHtml(profile.bio || '');
   const description = cleanBio || `${name} is a ${coachPos} from ${profile.country || 'Global'} on CenterKick Professional Football Network.`;
   const defaultFallback = "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=1200&auto=format&fit=crop";

   const image = getProfileOgImage(profile, defaultFallback);

   const siteUrl = getBaseSiteUrl();
   const profileUrl = `${siteUrl}/coaches/${id}`;

   return {
      title,
      description,
      openGraph: {
         title,
         description,
         url: profileUrl,
         siteName: 'CenterKick',
         images: [
            {
               url: image,
               secureUrl: image,
               width: 1200,
               height: 630,
               type: 'image/png',
               alt: name,
            },
         ],
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
export default async function CoachPage({ params }: { params: Promise<{ id: string }> }) {
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
      .select('*, users!profiles_user_id_fkey!inner(role), agent:users!profiles_agent_id_fkey(id, role, email)')
      .eq('slug', id)
      .single();

   if (error || !profile) {
      if (error) console.error('Coach fetch database error:', error.message);
      notFound();
   }

   const { data: leagues } = await supabaseAdmin.from('leagues').select('*');
   const getLeagueName = (leagueId: string) => leagues?.find(l => l.id === leagueId)?.name || leagueId;
   if (profile.league) {
      profile.league_name = getLeagueName(profile.league);
   }

   // Only show active profiles to public, or let admins/owners see pending
   const { data: { user } } = await supabaseUser.auth.getUser();
   const isOwner = user?.id === profile.user_id;
   const isAdmin = (profile.users as any)?.role === 'superadmin';

   if (profile.status !== 'active' && !isOwner && !isAdmin) {
      // Check if current user is admin correctly
      const { data: currentUser } = await supabaseAdmin
         .from('users')
         .select('role')
         .eq('id', user?.id || '')
         .single();

      if (currentUser?.role !== 'superadmin') {
         notFound();
      }
   }

   if (!isProfileComplete(profile) && !isOwner && !(profile.users as any)?.role?.includes('admin')) {
      notFound();
   }

   await trackProfileView(profile.id);

   return <CoachDetailsClient profile={profile} />;
}
