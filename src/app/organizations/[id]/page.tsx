import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import OrgDetailsClient from './OrgDetailsClient';
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
      .select('first_name, last_name, club_name, organization_name, country, avatar_url, cover_url, bio')
      .eq('slug', id)
      .maybeSingle();

   if (!profile) return {};

   const orgName = profile.club_name || profile.organization_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Sports Organization';
   const title = `${orgName} - CenterKick`;
   const cleanBio = stripHtml(profile.bio || '');
   const description = cleanBio || `${orgName} sports club and academy based in ${profile.country || 'Global'} on CenterKick Professional Football Network.`;
   const image = profile.cover_url || profile.avatar_url || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200&auto=format&fit=crop";

   return {
      title,
      description,
      openGraph: {
         title,
         description,
         images: [{ url: image, width: 1200, height: 630, alt: orgName }],
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

export default async function OrgPage({ params }: { params: Promise<{ id: string }> }) {
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

   if (error || !profile) {
      if (error) console.error('Org fetch database error:', error.message);
      notFound();
   }

   // Only show active profiles to public, or let admins/owners see pending
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
      const { data: currentUser } = await supabaseAdmin
         .from('users')
         .select('role')
         .eq('id', user?.id || '')
         .single();
      if (currentUser?.role !== 'superadmin') {
         notFound();
      }
   }

   const { data: members } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name, last_name, role, slug, avatar_url, position, market_value, country')
      .eq('organization_id', profile.user_id)
      .eq('status', 'active');



   return <OrgDetailsClient profile={profile} members={members || []} />;
}
