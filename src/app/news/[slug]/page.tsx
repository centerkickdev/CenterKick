import { createClient } from '@/lib/supabase/server';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Calendar as CalendarIcon, User, Tag, Share2, ArrowLeft, ChevronRight, Newspaper, Clock } from "lucide-react";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('cms_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.og_image_url ? [post.og_image_url] : post.cover_image_url ? [post.cover_image_url] : [],
      type: 'article',
      publishedTime: post.published_at || post.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.og_image_url ? [post.og_image_url] : post.cover_image_url ? [post.cover_image_url] : [],
    }
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('cms_posts')
    .select('*, author:users(email), category:blog_categories(name), post_tags(tag:blog_tags(name))')
    .eq('slug', slug)
    .single();

  if (!post) notFound();

  // Fetch related posts (same category)
  const { data: relatedPosts } = await supabase
    .from('cms_posts')
    .select('*, category:blog_categories(name)')
    .eq('category_id', post.category_id)
    .eq('is_draft', false)
    .neq('id', post.id)
    .limit(3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.cover_image_url,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: [{
        '@type': 'Person',
        name: 'CenterKick Editor',
        url: 'https://centerkick.com/news'
    }]
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="pt-36 pb-32">
        <article className="max-w-4xl mx-auto px-4 lg:px-0">
          {/* Article Header */}
          <header className="mb-12 space-y-8 text-center lg:text-left">
            <Link 
              href="/news" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#b50a0a] transition-all group mb-4"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Platform Newsroom
            </Link>

            <div className="space-y-4">
               {post.category && (
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b50a0a] bg-red-50 px-4 py-1.5 rounded-full inline-block">
                     {post.category.name}
                  </span>
               )}
               <h1 className="text-4xl lg:text-6xl font-black text-gray-900 uppercase italic tracking-tighter leading-[0.9] lg:leading-[0.85]">
                  {post.title}
               </h1>
               <p className="text-lg lg:text-xl text-gray-500 font-bold leading-relaxed lg:max-w-3xl italic">
                  {post.excerpt}
               </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-4 border-t border-gray-50">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                     <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-left">
                     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Authored By</p>
                     <p className="text-[10px] font-black text-gray-900 uppercase">CenterKick Editor</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                     <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-left">
                     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Published On</p>
                     <p className="text-[10px] font-black text-gray-900 uppercase">{new Date(post.published_at || post.created_at).toLocaleDateString()}</p>
                  </div>
               </div>
               <div className="flex-1" />
               <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                     <Share2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.cover_image_url && (
            <div className="mb-16 -mx-4 lg:-mx-12">
               <div className="aspect-[21/9] rounded-none lg:rounded-[3rem] overflow-hidden shadow-2xl shadow-red-900/10">
                  <img 
                    src={post.cover_image_url} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                  />
               </div>
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-a:text-[#b50a0a] prose-strong:text-gray-900 prose-img:rounded-3xl prose-blockquote:border-[#b50a0a] prose-blockquote:bg-red-50/50 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-blockquote:italic">
             <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Tags */}
          {post.post_tags && post.post_tags.length > 0 && (
             <div className="mt-20 pt-12 border-t border-gray-100">
                <div className="flex flex-wrap gap-3">
                   <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mr-2 flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5" /> Filed Under:
                   </span>
                   {post.post_tags.map((pt: any) => (
                      <span key={pt.tag.name} className="bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors cursor-default">
                         #{pt.tag.name}
                      </span>
                   ))}
                </div>
             </div>
          )}

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <section className="mt-32 pt-20 border-t-2 border-gray-900">
               <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter mb-10 flex items-center justify-between">
                  Continue Reading
                  <ChevronRight className="w-6 h-6 text-[#b50a0a]" />
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {relatedPosts.map((related) => (
                     <Link href={`/news/${related.slug}`} key={related.id} className="group space-y-4">
                        <div className="aspect-video rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                           <img 
                             src={related.cover_image_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800'} 
                             alt={related.title}
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                           />
                        </div>
                        <h4 className="text-sm font-black text-gray-900 uppercase italic tracking-tighter group-hover:text-[#b50a0a] transition-colors leading-tight line-clamp-2">
                           {related.title}
                        </h4>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                           {new Date(related.published_at || related.created_at).toLocaleDateString()}
                        </p>
                     </Link>
                  ))}
               </div>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
}
