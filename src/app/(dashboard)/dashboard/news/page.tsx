import { createClient } from '@/lib/supabase/server';
import { Newspaper, Search, Calendar, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MyNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in</div>;
  }

  // Get current user's profile to know who is tagged
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, slug, first_name, last_name')
    .eq('user_id', user.id)
    .single();

  const name = profile ? `${profile.first_name} ${profile.last_name}` : 'You';
  
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const search = typeof params.search === 'string' ? params.search : '';
  const sort = typeof params.sort === 'string' ? params.sort : 'newest';
  
  const limit = 20;
  const offset = (page - 1) * limit;

  // In a real implementation, you would query a joining table or use text search 
  // on a tagged_profiles array. For now we will fetch posts and filter by search.
  // Ideally: .contains('tagged_profile_ids', [profile.id])
  // Assuming a column or logic for tagged news. We will fetch all published news 
  // for demonstration if no specific tag system exists yet. 
  // Let's assume we filter by search query for now.
  let query = supabase
    .from('site_content')
    .select('*', { count: 'exact' })
    .eq('type', 'blog_post')
    .eq('status', 'published');

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  if (sort === 'oldest') {
    query = query.order('published_at', { ascending: true });
  } else {
    query = query.order('published_at', { ascending: false });
  }

  const { data: news, count } = await query.range(offset, offset + limit - 1);
  const totalPages = count ? Math.ceil(count / limit) : 0;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tighter flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-[#b50a0a]" /> My News
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-2">
            News and updates tagged for {name}.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            name="search"
            defaultValue={search}
            placeholder="Search news..." 
            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#b50a0a] focus:bg-white outline-none transition-all"
          />
          {sort && <input type="hidden" name="sort" value={sort} />}
        </form>
        
        <div className="w-full md:w-auto">
          <form className="flex items-center gap-2">
            {search && <input type="hidden" name="search" value={search} />}
            <select 
              name="sort" 
              defaultValue={sort}
              className="w-full md:w-auto bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <button type="submit" className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all">
              Apply
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        {news && news.length > 0 ? (
          news.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-[#b50a0a] rounded-full text-xs font-bold tracking-widest uppercase">
                  <Tag className="w-3 h-3" /> Mention
                </span>
                <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> 
                  {new Date(item.published_at || item.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#b50a0a] transition-colors">
                {item.title}
              </h3>
              {item.excerpt && (
                <p className="text-sm font-medium text-gray-500 line-clamp-2 leading-relaxed">
                  {item.excerpt}
                </p>
              )}
              <div className="mt-4 pt-4 border-t border-gray-50">
                <Link href={`/news/${item.slug}`} className="text-xs font-bold tracking-wide text-[#b50a0a] hover:underline">
                  Read Full Article &rarr;
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No News Found</h3>
            <p className="text-sm font-bold text-gray-500">There are no news articles tagged with your profile yet.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && (
            <Link 
              href={`?page=${page - 1}${search ? `&search=${search}` : ''}${sort ? `&sort=${sort}` : ''}`}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </Link>
          )}
          <span className="text-xs font-bold text-gray-500 px-4">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link 
              href={`?page=${page + 1}${search ? `&search=${search}` : ''}${sort ? `&sort=${sort}` : ''}`}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
