import { ContactClient } from '@/components/contact/ContactClient';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCachedData } from '@/lib/redis';
import { getGlobalCMSData } from '@/lib/cms';

export const revalidate = 300;

export default async function ContactPage() {
   const adminSupabase = createAdminClient();
   // Fetch everything in parallel
   const [
      { navContent, footerContent, siteSettings },
      layout,
      siteContent
   ] = await Promise.all([
      getGlobalCMSData(),
      getCachedData('contact_layout', async () => {
         const { data: pageData } = await adminSupabase
            .from('site_pages')
            .select('*')
            .eq('slug', '/contact')
            .single();
         return pageData?.layout || ["header", "info", "form", "faqs"];
      }, 3600),
      getCachedData('contact_site_content', async () => {
         const { data } = await adminSupabase
            .from('site_content')
            .select('*')
            .eq('page', '/contact');
         return Object.fromEntries(data?.map(c => [c.section, c.content]) || []);
      }, 1800)
   ]);

   return (
      <ContactClient 
         layout={layout}
         content={siteContent}
         navContent={navContent}
         footerContent={footerContent}
         siteSettings={siteSettings}
      />
   );
}
