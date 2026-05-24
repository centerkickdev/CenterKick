import { HomeClient } from '@/components/home/HomeClient';
import { createClient } from '@/lib/supabase/server';
import { getGlobalCMSData } from '@/app/admin/manage-ui/actions';
import { getCachedData } from '@/lib/redis';

export default async function Home() {
   const supabase = await createClient();
   const { navContent, footerContent, siteSettings } = await getGlobalCMSData();
   
   // Fetch all site content for this page from cache
   const siteContentData = await getCachedData('home_site_content', async () => {
      const { data } = await supabase
         .from('site_content')
         .select('*')
         .eq('page', '/');
      return data || [];
   }, 1800);

   // Fetch latest 10 news posts (is_draft = false)
   const latestNews = await getCachedData('home_latest_news_10', async () => {
      const { data } = await supabase
         .from('cms_posts')
         .select('*')
         .eq('is_draft', false)
         .order('published_at', { ascending: false })
         .limit(10);
      return data || [];
   }, 300);

   // Fetch active players
   const playersList = await getCachedData('home_players_list', async () => {
      const { data } = await supabase
         .from('profiles')
         .select('*, users:users!profiles_user_id_fkey(role)')
         .eq('role', 'player')
         .eq('status', 'active');
      const filtered = (data || []).filter(p => {
         const userRole = (p.users as any)?.role;
         return userRole !== 'admin' && userRole !== 'superadmin';
      });
      console.log('Fetched players from DB count:', filtered.length);
      return filtered;
   }, 600);

   // Fetch active coaches
   const coachesList = await getCachedData('home_coaches_list', async () => {
      const { data } = await supabase
         .from('profiles')
         .select('*, users:users!profiles_user_id_fkey(role)')
         .eq('role', 'coach')
         .eq('status', 'active');
      const filtered = (data || []).filter(p => {
         const userRole = (p.users as any)?.role;
         return userRole !== 'admin' && userRole !== 'superadmin';
      });
      return filtered;
   }, 600);

   // Fetch active agents and scouts
   const agentsScoutsList = await getCachedData('home_agents_scouts_list', async () => {
      const { data } = await supabase
         .from('profiles')
         .select('*, users:users!profiles_user_id_fkey(role)')
         .in('role', ['agent', 'scout'])
         .eq('status', 'active');
      const filtered = (data || []).filter(p => {
         const userRole = (p.users as any)?.role;
         return userRole !== 'admin' && userRole !== 'superadmin';
      });
      return filtered;
   }, 600);

   // Fetch active organizations
   const organizationsList = await getCachedData('home_organizations_list', async () => {
      const { data } = await supabase
         .from('profiles')
         .select('*, users:users!profiles_user_id_fkey(role)')
         .eq('role', 'organization')
         .eq('status', 'active');
      const filtered = (data || []).filter(p => {
         const userRole = (p.users as any)?.role;
         return userRole !== 'admin' && userRole !== 'superadmin';
      });
      return filtered;
   }, 600);

   // Fetch 5 most recent football video highlights (tagged with "HighLights" or "highlights" case-insensitively)
   const highlightPosts = await getCachedData('home_highlight_posts_5', async () => {
      const { data, error } = await supabase
         .from('cms_posts')
         .select('*, post_tags!inner(tag:blog_tags!inner(name))')
         .eq('is_draft', false)
         .ilike('post_tags.tag.name', 'highlights')
         .order('published_at', { ascending: false })
         .limit(5);

      if (error || !data || data.length === 0) {
         // Fallback to recent posts if no highlights tag found or matches
         const { data: fallback } = await supabase
            .from('cms_posts')
            .select('*')
            .eq('is_draft', false)
            .order('published_at', { ascending: false })
            .limit(5);
         return fallback || [];
      }
      return data;
   }, 300);

   // Deterministic hash function to shuffle profiles purely without Math.random()
   const hashString = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
         hash = (hash << 5) - hash + str.charCodeAt(i);
         hash |= 0; // Convert to 32bit integer
      }
      return hash;
   };

   const pseudoShuffle = <T extends { id: string }>(array: T[]): T[] => {
      return [...array].sort((a, b) => {
         return hashString(a.id) - hashString(b.id);
      });
   };

   // Shuffle and pass profiles (capped at 10 items per section)
   const selectedPlayers = pseudoShuffle(playersList).slice(0, 10);
   const selectedCoaches = pseudoShuffle(coachesList).slice(0, 10);
   const selectedAgentsScouts = pseudoShuffle(agentsScoutsList).slice(0, 10);
   const selectedOrganizations = pseudoShuffle(organizationsList).slice(0, 10);

   return (
      <HomeClient 
        latestNews={latestNews}
        players={selectedPlayers}
        coaches={selectedCoaches}
        agentsScouts={selectedAgentsScouts}
        organizations={selectedOrganizations}
        highlights={highlightPosts}
        siteContent={Object.fromEntries((siteContentData as { section: string; content: unknown }[] | null)?.map((c) => [c.section, c.content]) || [])}
        navContent={navContent}
        footerContent={footerContent}
        siteSettings={siteSettings}
      />
   );
}
