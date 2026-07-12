import { PlayerDetailsClient } from '@/components/players/PlayerDetailsClient';
import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { trackProfileView } from '@/app/actions/tracking';
import { createClient } from '@/lib/supabase/server';
import { isProfileComplete } from '@/lib/utils/profile';

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

   const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*, agent:users!profiles_agent_id_fkey(id, role, email)')
      .eq('slug', id)
      .limit(1);

   const athlete = data?.[0];

   // If not found or restricted
   if (error || !athlete) {
      if (error) console.error('Athlete fetch database error:', error.message);
      return notFound();
   }

   // If suspended, don't show to public
   if (athlete.status === 'suspended' || athlete.status === 'rejected') {
      return notFound();
   }

   const supabaseUser = await createClient();
   const { data: { user } } = await supabaseUser.auth.getUser();
   const isOwner = user?.id === athlete.user_id;

   if (!isProfileComplete(athlete) && !isOwner) {
      return notFound();
   }

   // Fetch reference data for enrichment
   const [{ data: clubs }, { data: leagues }, { data: countries }] = await Promise.all([
      supabaseAdmin.from('clubs').select('*'),
      supabaseAdmin.from('leagues').select('*'),
      supabaseAdmin.from('countries').select('*')
   ]);

   // Helpers
   const getClubLogo = (clubName: string) => clubs?.find(c => c.name === clubName)?.logo_url || null;
   const getLeagueName = (leagueId: string) => leagues?.find(l => l.id === leagueId)?.name || leagueId;
   const getCountryFlag = (countryName: string) => countries?.find(c => c.name === countryName)?.flag_url || null;

   // Enrich athlete data
   athlete.league_name = getLeagueName(athlete.league);
   athlete.current_club_logo = getClubLogo(athlete.current_club);
   athlete.country_flag = getCountryFlag(athlete.country);

   // Enrich career stats (mapping 'club' to 'club_name' and 'apps' to 'appearances' for backward compatibility)
   const careerStats = (athlete.career_stats || []).map((stat: any) => ({
      ...stat,
      club_name: stat.club || stat.club_name,
      appearances: stat.apps || stat.appearances,
      club_flag: getClubLogo(stat.club || stat.club_name),
      league_name: stat.league ? getLeagueName(stat.league) : null,
   }));

   // Enrich transfer history
   if (athlete.transfer_history && Array.isArray(athlete.transfer_history)) {
      athlete.transfer_history = athlete.transfer_history.map((t: any) => ({
         ...t,
         fee: t.transfer_fee || t.fee,
         from_club_logo: getClubLogo(t.from_club),
         to_club_logo: getClubLogo(t.to_club),
      }));
   }

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

   return <PlayerDetailsClient athlete={athlete} careerStats={careerStats} news={news} />;
}
