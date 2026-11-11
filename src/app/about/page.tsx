import { AboutClient } from '@/components/about/AboutClient';
import { createAdminClient } from '@/lib/supabase/admin';
import { getGlobalCMSData } from '@/app/admin/manage-ui/actions';
import { getCachedData } from '@/lib/redis';

export const revalidate = 300;

export default async function AboutUsPage() {
   const adminSupabase = createAdminClient();

   // Fetch everything in parallel with caching
   const [
      { navContent, footerContent },
      layout,
      siteContent
   ] = await Promise.all([
      getGlobalCMSData(),
      getCachedData('about_layout', async () => {
         const { data: pageData } = await adminSupabase
            .from('site_pages')
            .select('*')
            .eq('slug', '/about')
            .single();
         return pageData?.layout || ["hero", "intro", "mission-vision", "philosophy", "services"];
      }, 3600),
      getCachedData('about_site_content', async () => {
         const { data: siteContentData } = await adminSupabase
            .from('site_content')
            .select('*')
            .eq('page', '/about');
         return Object.fromEntries(siteContentData?.map(c => [c.section, c.content]) || []);
      }, 1800)
   ]);

   return (
      <AboutClient 
         layout={layout}
         content={siteContent}
         navContent={navContent}
         footerContent={footerContent}
      />
   );
}

