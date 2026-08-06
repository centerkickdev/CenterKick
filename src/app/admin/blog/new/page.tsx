import { createClient } from '@/lib/supabase/server';
import NewPostClient from '@/components/admin/blog/NewPostClient';
import { getGlobalTags } from '@/app/admin/blog/actions';

export default async function NewPostPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: blogTags }, { tags: globalTags }] = await Promise.all([
    supabase.from('blog_categories').select('*').order('name'),
    supabase.from('blog_tags').select('*').order('name'),
    getGlobalTags()
  ]);

  // Combine tags (ensuring name/slug structure)
  const allTags = [
    ...(blogTags || []),
    ...(globalTags || []).map(t => ({ name: t, slug: t.toLowerCase().replace(/ /g, '-') }))
  ];

  return (
    <div className="p-2 sm:p-6 md:p-8">
      <NewPostClient 
        categories={categories || []} 
        tags={allTags} 
      />
    </div>
  );
}
