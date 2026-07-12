import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import CoachDetailsClient from './CoachDetailsClient';

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

   return <CoachDetailsClient profile={profile} />;
}
