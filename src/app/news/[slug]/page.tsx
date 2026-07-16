import { createClient } from '@/lib/supabase/server';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Calendar as CalendarIcon, User, Tag, Share2, ArrowLeft, ChevronRight, Newspaper, Clock } from "lucide-react";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import { NewsContentClient } from './NewsContentClient';

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

         <main className="pt-32 lg:pt-40 pb-32">
            <article className="max-w-3xl mx-auto px-4 lg:px-0">
               {/* Article Header */}
               <header className="mb-12 space-y-8 text-left">
                  <Link
                     href="/news"
                     className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-gray-400 hover:text-[#b50a0a] transition-all group mb-4"
                  >
                     <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                     All News
                  </Link>

                  <div className="space-y-4">
                     <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-tight lg:leading-[1.1]">
                        {post.title}
                     </h1>
                     <p className="text-lg lg:text-xl text-gray-500 font-bold leading-relaxed lg:max-w-3xl">
                        {post.excerpt}
                     </p>
                     {post.category && (
                        <span className="text-xs font-bold tracking-[0.3em] text-[#b50a0a] bg-red-50 px-4 py-1.5 rounded-full inline-block">
                           {post.category.name}
                        </span>
                     )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100">
                     <div className="flex flex-wrap items-center gap-8">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                              <User className="w-5 h-5 text-gray-400" />
                           </div>
                           <div className="text-left">
                              <p className="text-xs font-bold text-gray-400 tracking-wide">Authored By</p>
                              <p className="text-xs font-bold text-gray-900">CenterKick Editor</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-gray-400" />
                           </div>
                           <div className="text-left">
                              <p className="text-xs font-bold text-gray-400 tracking-wide">Published On</p>
                              <p className="text-xs font-bold text-gray-900">{new Date(post.published_at || post.created_at).toLocaleDateString()}</p>
                           </div>
                        </div>
                     </div>
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
               <NewsContentClient content={post.content} />

               {/* Tags */}
               {post.post_tags && post.post_tags.length > 0 && (
                  <div className="mt-20 pt-12 border-t border-gray-100">
                     <div className="flex flex-wrap gap-3">
                        <span className="text-xs font-bold text-gray-300 tracking-wide mr-2 flex items-center gap-2">
                           <Tag className="w-3.5 h-3.5" /> Filed Under:
                        </span>
                        {post.post_tags.map((pt: any) => (
                           <span key={pt.tag.name} className="bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold tracking-wide hover:bg-gray-100 transition-colors cursor-default">
                              #{pt.tag.name}
                           </span>
                        ))}
                     </div>
                  </div>
               )}

               {/* Related Posts */}
               {relatedPosts && relatedPosts.length > 0 && (
                  <section className="mt-32 pt-20 border-t-2 border-gray-900">
                     <h3 className="text-2xl font-bold text-gray-900 tracking-tighter mb-10 flex items-center justify-between">
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
                              <h4 className="text-base font-bold text-gray-900 tracking-tighter group-hover:text-[#b50a0a] transition-colors leading-tight line-clamp-2">
                                 {related.title}
                              </h4>
                              <p className="text-xs font-bold text-gray-400 tracking-wide">
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
