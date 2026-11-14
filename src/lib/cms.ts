import { createAdminClient } from '@/lib/supabase/admin';
import { getCachedData } from './redis';

/**
 * Fetches site settings (logos, titles, etc) with Redis caching.
 * Uses createAdminClient to ensure public ISR compatibility without cookie evaluation.
 */
export async function getCachedSettings() {
  return getCachedData('site_settings', async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('site_content')
      .select('content')
      .eq('page', 'settings')
      .eq('section', 'system')
      .single();
    
    return data?.content || null;
  }, 3600);
}

/**
 * Fetches global CMS data (Navbar, Footer, and Settings) in a single cached call.
 * This is the most efficient way to fetch branding for any page.
 * Uses createAdminClient to prevent Next.js from bailing out of ISR / Edge CDN caching.
 */
export async function getGlobalCMSData() {
  return getCachedData('global_cms_data_v2', async () => {
    const supabase = createAdminClient();
    
    const { data: globalData } = await supabase
      .from('site_content')
      .select('page, section, content')
      .in('page', ['navbar', 'footer', 'settings']);

    const navContent = globalData?.find(c => c.page === 'navbar' && c.section === 'navbar')?.content || null;
    const footerContent = globalData?.find(c => c.page === 'footer' && c.section === 'footer')?.content || null;
    const siteSettings = globalData?.find(c => c.page === 'settings' && c.section === 'system')?.content || null;

    return { navContent, footerContent, siteSettings };
  }, 3600);
}

/**
 * Purges all news-related cache keys across L1 (Memory) and L2 (Upstash Redis)
 */
export async function invalidateNewsCaches() {
  const { redis } = await import('./redis');
  await Promise.all([
    redis.del('recent_news'),
    redis.del('news_all_posts'),
    redis.del('news_layout'),
    redis.del('blog_categories'),
    redis.del('blog_tags'),
  ]);
}
