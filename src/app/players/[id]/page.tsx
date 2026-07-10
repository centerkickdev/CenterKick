import { PlayerDetailsClient } from '@/components/players/PlayerDetailsClient';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { trackProfileView } from '@/app/actions/tracking';

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

   // Fetch career stats
   const { data: careerStats } = await supabaseAdmin
      .from('career_stats')
      .select('*')
      .eq('player_id', athlete.id)
      .order('season', { ascending: false });

   // Fetch related news (blog posts)
   let news: any[] = [];
   if (athlete.tags && athlete.tags.length > 0) {
      const { data: relatedNews } = await supabaseAdmin
         .from('blog_posts')
         .select('id, title, excerpt, cover_image, slug, created_at')
         .eq('status', 'published')
         .overlaps('tags', athlete.tags)
         .order('created_at', { ascending: false })
         .limit(4);
      if (relatedNews) {
         news = relatedNews;
      }
   }

   // Track profile view asynchronously without blocking page load
   trackProfileView(athlete.id);

   return <PlayerDetailsClient athlete={athlete} careerStats={careerStats || []} news={news} />;
}
