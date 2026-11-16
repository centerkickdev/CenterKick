import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import ScoutDetailsClient from './ScoutDetailsClient';
import { isProfileComplete } from '@/lib/utils/profile';
import { getCachedData } from '@/lib/redis';
import { cache } from 'react';
import type { Metadata } from 'next';
import { getProfileOgImage, getBaseSiteUrl } from '@/lib/utils/og';

export const revalidate = 120;

function stripHtml(html: string): string {
   if (!html) return '';
   return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

const getScoutBySlug = cache(async (slug: string) => {
   return getCachedData(`scout_profile_${slug}`, async () => {
      const supabaseAdmin = createAdminClient();
      const { data, error } = await supabaseAdmin
         .from('profiles')
         .select('*, users!profiles_user_id_fkey!inner(role)')
         .eq('slug', slug)
         .maybeSingle();
      if (error || !data) return null;
      return data;
   }, 600);
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
   const { id } = await params;

   const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
   if (isUuid) return {};

   const profile = await getScoutBySlug(id);
   if (!profile) return {};

   const firstName = (profile.first_name || '').trim();
   const lastName = (profile.last_name || '').trim();
   const name = `${firstName} ${lastName}`.trim() || 'Scout Profile';
   const title = `${name} (Professional Scout) - CenterKick`;
   const cleanBio = stripHtml(profile.bio || '');
   const description = (cleanBio.length > 160 ? `${cleanBio.slice(0, 157)}...` : cleanBio) || `${name} is a verified talent scout based in ${profile.country || 'Global'} on CenterKick Professional Football Network.`;
   const defaultFallback = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop";

   const image = getProfileOgImage(profile, defaultFallback);

   const siteUrl = getBaseSiteUrl();
   const profileUrl = `${siteUrl}/scouts/${id}`;

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

export default async function ScoutPage({ params }: { params: Promise<{ id: string }> }) {
   const { id } = await params;
   const supabaseAdmin = createAdminClient();

   // Enforce slug-based access only. UUID access is forbidden.
   const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
   if (isUuid) {
      return notFound();
   }

   const profile = await getScoutBySlug(id);

   if (!profile) {
      notFound();
   }

   // Only perform dynamic auth checks if the profile is NOT active or NOT complete
   const isStandardPublic = profile.status === 'active' && isProfileComplete(profile);
   if (!isStandardPublic) {
      const supabaseUser = await createClient();
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
   }

   return <ScoutDetailsClient profile={profile} />;
}
