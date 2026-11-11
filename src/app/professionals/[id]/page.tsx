import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import ProfessionalDetailsClient from './ProfessionalDetailsClient';
import { isProfileComplete } from '@/lib/utils/profile';
import type { Metadata } from 'next';

export const revalidate = 120;

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
      .select('first_name, last_name, profession_title, profession_category, country, avatar_url, cover_url, gallery_urls, bio')
      .eq('slug', id)
      .maybeSingle();

   if (!profile) return {};

   const proTitle = profile.profession_title || profile.profession_category || 'Sports Professional';
   const firstName = (profile.first_name || '').trim();
   const lastName = (profile.last_name || '').trim();
   const name = `${firstName} ${lastName}`.trim() || 'Professional Profile';
   const title = `${name} (${proTitle}) - CenterKick`;
   const cleanBio = stripHtml(profile.bio || '');
   const description = (cleanBio.length > 160 ? `${cleanBio.slice(0, 157)}...` : cleanBio) || `${name} is a ${proTitle} from ${profile.country || 'Global'} on CenterKick Professional Football Network.`;
   const defaultFallback = "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=1200&auto=format&fit=crop";

   const image = getProfileOgImage(profile, defaultFallback);

   const siteUrl = getBaseSiteUrl();
   const profileUrl = `${siteUrl}/professionals/${id}`;

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

export default async function ProfessionalPage({ params }: { params: Promise<{ id: string }> }) {
   const { id } = await params;
   const supabaseAdmin = createAdminClient();

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
      if (error) console.error('Professional fetch database error:', error.message);
      notFound();
   }

   // Only perform dynamic auth checks if the profile is NOT active or NOT complete
   const isStandardPublic = profile.status === 'active' && isProfileComplete(profile);
   if (!isStandardPublic) {
      const supabaseUser = await createClient();
      const { data: { user } } = await supabaseUser.auth.getUser();
      const isOwner = user?.id === profile.user_id;
      const isAdmin = (profile.users as any)?.role === 'superadmin';

      if (profile.status !== 'active' && !isOwner && !isAdmin) {
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
   }

   return <ProfessionalDetailsClient profile={profile} />;
}
