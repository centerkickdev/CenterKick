import { createClient } from '@/lib/supabase/server';
import BlogFeedClient from "@/components/news/BlogFeedClient";
import { getCachedData } from '@/lib/redis';
import { getGlobalCMSData } from '@/lib/cms';

export default async function NewsPage() {
   const supabase = await createClient();
   // Fetch everything in parallel
   const [
      { navContent, footerContent, siteSettings },
      layout,
      siteContent,
      posts,
      categories,
      tags
   ] = await Promise.all([
      getGlobalCMSData(),
      getCachedData('news_layout', async () => {
         const { data: pageData } = await supabase
            .from('site_pages')
            .select('*')
            .eq('slug', '/news')
            .single();
         return pageData?.layout || ["header", "featured", "feed"];
      }, 3600),
      getCachedData('news_site_content', async () => {
         const { data } = await supabase
            .from('site_content')
            .select('*')
            .eq('page', '/news');
         return Object.fromEntries(data?.map(c => [c.section, c.content]) || []);
      }, 1800),
      getCachedData('news_all_posts_v2', async () => {
         const { data } = await supabase
            .from('cms_posts')
            .select('id, title, slug, excerpt, cover_image_url, published_at, category_id, is_draft, category:blog_categories(name), post_tags(tag_id, tag:blog_tags(name))')
            .eq('is_draft', false)
            .order('published_at', { ascending: false });
            
         const filtered = (data || []).filter(post => {
            const catName = (post.category as any)?.name?.toLowerCase() || '';
            const tags = (post.post_tags as any[])?.map(pt => pt.tag?.name?.toLowerCase()) || [];
            const isHighlight = catName.includes('highlight') || tags.some((t: string) => t?.includes('highlight'));
            return !isHighlight;
         });
         
         return filtered;
      }, 600),
      getCachedData('blog_categories', async () => {
         const { data } = await supabase
            .from('blog_categories')
            .select('*')
            .order('name');
         return data || [];
      }, 3600),
      getCachedData('blog_tags', async () => {
         const { data } = await supabase
            .from('blog_tags')
            .select('*')
            .order('name');
         return data || [];
      }, 3600)
   ]);

   return (
      <BlogFeedClient 
         layout={layout}
         siteContent={siteContent}
         initialPosts={(posts || []) as any} 
         categories={categories || []} 
         tags={tags || []} 
         navContent={navContent}
         footerContent={footerContent}
         siteSettings={siteSettings}
      />
   );
}
