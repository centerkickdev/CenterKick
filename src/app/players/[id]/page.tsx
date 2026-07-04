import { PlayerDetailsClient } from '@/components/players/PlayerDetailsClient';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';

interface AthletePageProps {
  params: Promise<{ id: string }>;
}

export default async function AthleteDetailsPage({ params }: AthletePageProps) {
   const { id } = await params;
   const supabaseAdmin = createAdminClient();

   // Enforce slug-based access only. UUID access is forbidden.
   const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
   if (isUuid) {
      return notFound();
   }

   const { data: athlete, error } = await supabaseAdmin
      .from('profiles')
      .select('*, agent:users!profiles_agent_id_fkey(id, profiles!profiles_user_id_fkey(*))')
      .eq('slug', id)
      .single();

   // If not found or restricted
   if (error || !athlete) {
      if (error) console.error('Athlete fetch database error:', error.message);
      return notFound();
   }

   // If suspended, don't show to public
   if (athlete.status === 'suspended' || athlete.status === 'rejected') {
      return notFound();
   }

   return <PlayerDetailsClient athlete={athlete} />;
}
