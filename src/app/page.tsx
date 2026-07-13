import { HomeClient } from '@/components/home/HomeClientNew';
import { createClient } from '@/lib/supabase/server';
import { getGlobalCMSData } from '@/app/admin/manage-ui/actions';
import { getCachedData } from '@/lib/redis';
import { isProfileComplete } from '@/lib/utils/profile';

// Recompilation trigger - v3

export default async function Home() {
   const supabase = await createClient();
   // Fetch everything in parallel
   const [
      { navContent, footerContent, siteSettings },
      siteContentData,
      latestNews,
      playersList,
      coachesList,
      agentsScoutsList,
      organizationsList,
      highlightPosts
   ] = await Promise.all([
      getGlobalCMSData(),
      getCachedData('home_site_content', async () => {
         const { data } = await supabase
            .from('site_content')
            .select('*')
            .eq('page', '/');
         return data || [];
      }, 1800),
      getCachedData('home_latest_news_16', async () => {
         const { data } = await supabase
            .from('cms_posts')
            .select('*, author:users(email), category:blog_categories(name), post_tags(tag:blog_tags(name))')
            .eq('is_draft', false)
            .order('published_at', { ascending: false })
            .limit(50);
            
         const filtered = (data || []).filter(post => {
            const catName = (post.category as any)?.name?.toLowerCase() || '';
            const tags = (post.post_tags as any[])?.map(pt => pt.tag?.name?.toLowerCase()) || [];
            const isHighlight = catName.includes('highlight') || tags.some((t: string) => t?.includes('highlight'));
            return !isHighlight;
         });
         
         return filtered.slice(0, 16);
      }, 300),
      getCachedData('home_players_list_v2', async () => {
         const { data, error } = await supabase
            .from('profiles')
            .select('*, users:users!profiles_user_id_fkey!inner(role)')
            .eq('users.role', 'player')
            .eq('status', 'active');
         if (error) console.error('home_players_list error:', error);
         const filtered = (data || []).filter(p => {
            const userRole = (p.users as any)?.role;
            if (['admin', 'superadmin', 'blogger', 'operations', 'finance'].includes(userRole)) return false;
            return isProfileComplete(p);
         });
         console.log('Fetched players from DB count:', filtered.length);
         return filtered;
      }, 600),
      getCachedData('home_coaches_list_v2', async () => {
         const { data, error } = await supabase
            .from('profiles')
            .select('*, users:users!profiles_user_id_fkey!inner(role)')
            .eq('users.role', 'coach')
            .eq('status', 'active');
         if (error) console.error('home_coaches_list error:', error);
         const filtered = (data || []).filter(p => {
            const userRole = (p.users as any)?.role;
            if (['admin', 'superadmin', 'blogger', 'operations', 'finance'].includes(userRole)) return false;
            return isProfileComplete(p);
         });
         return filtered;
      }, 600),
      getCachedData('home_agents_scouts_list_v2', async () => {
         const { data, error } = await supabase
            .from('profiles')
            .select('*, users:users!profiles_user_id_fkey!inner(role)')
            .in('users.role', ['agent', 'scout'])
            .eq('status', 'active');
         if (error) console.error('home_agents_scouts_list error:', error);
         const filtered = (data || []).filter(p => {
            const userRole = (p.users as any)?.role;
            if (['admin', 'superadmin', 'blogger', 'operations', 'finance'].includes(userRole)) return false;
            return isProfileComplete(p);
         });
         return filtered;
      }, 600),
      getCachedData('home_organizations_list_v2', async () => {
         const { data, error } = await supabase
            .from('profiles')
            .select('*, users:users!profiles_user_id_fkey!inner(role)')
            .eq('users.role', 'organization')
            .eq('status', 'active');
         if (error) console.error('home_organizations_list error:', error);
         const filtered = (data || []).filter(p => {
            const userRole = (p.users as any)?.role;
            if (['admin', 'superadmin', 'blogger', 'operations', 'finance'].includes(userRole)) return false;
            return isProfileComplete(p);
         });
         return filtered;
      }, 600),
      getCachedData('home_highlight_posts_v5', async () => {
         const { data, error } = await supabase
            .from('cms_posts')
            .select('*, category:blog_categories(name), post_tags(tag:blog_tags(name))')
            .eq('is_draft', false)
            .order('published_at', { ascending: false })
            .limit(100);

         if (error) {
            console.error('Highlights query error:', error);
            return [];
         }
         
         const filtered = (data || []).filter(post => {
            const catName = (post.category as any)?.name?.toLowerCase() || '';
            const tags = (post.post_tags as any[])?.map(pt => pt.tag?.name?.toLowerCase()) || [];
            const isHighlight = catName.includes('highlight') || tags.some((t: string) => t?.includes('highlight'));
            const hasVideoLink = post.excerpt?.startsWith('http') || post.excerpt?.includes('youtube.com');
            return isHighlight && hasVideoLink;
         });
         
         return filtered.slice(0, 3);
      }, 300)
   ]);

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

   // Rotate array based on UTC day so all profiles eventually get visibility
   const cycleProfiles = <T extends { id: string }>(array: T[], limit: number): T[] => {
      if (!array || array.length === 0) return [];
      const shuffled = pseudoShuffle(array);
      if (shuffled.length <= limit) return shuffled;
      
      const dayNumber = Math.floor(Date.now() / 86400000);
      const offset = (dayNumber * limit) % shuffled.length;
      
      // Rotate the array by the offset
      const rotated = [...shuffled.slice(offset), ...shuffled.slice(0, offset)];
      return rotated.slice(0, limit);
   };

   // Shuffle, cycle and cap at 10 items per section
   const selectedPlayers = cycleProfiles(playersList, 10);
   const selectedCoaches = cycleProfiles(coachesList, 10);
   const selectedAgentsScouts = cycleProfiles(agentsScoutsList, 10);
   const selectedOrganizations = cycleProfiles(organizationsList, 10);

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
