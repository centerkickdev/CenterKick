'use client';

import parse, { Element } from 'html-react-parser';
import { Tweet } from 'react-tweet';
import { InstagramEmbed, YouTubeEmbed, TikTokEmbed, FacebookEmbed } from 'react-social-media-embed';
import { useState, useEffect } from 'react';

function LinkPreviewCard({
   url,
   initialTitle,
   initialDescription,
   initialImage,
}: {
   url: string;
   initialTitle?: string;
   initialDescription?: string;
   initialImage?: string;
}) {
   const [title, setTitle] = useState(initialTitle || '');
   const [description, setDescription] = useState(initialDescription || '');
   const [image, setImage] = useState(initialImage || '');

   useEffect(() => {
      // Fetch live OpenGraph metadata if initial data is incomplete or generic
      if (!title || title === 'External Link' || title === url || !description) {
         fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
            .then((res) => res.json())
            .then((data) => {
               if (data.title && data.title !== 'External Link') setTitle(data.title);
               if (data.description) setDescription(data.description);
               if (data.image) {
                  // The API already extracts direct URLs from OG proxy, but unwrap as a safety net
                  let img = data.image as string;
                  if (img.includes('/api/og/profile-image')) {
                     try {
                        const u = new URL(img);
                        img = decodeURIComponent(u.searchParams.get('url') || img);
                     } catch {}
                  }
                  setImage(img);
               }
            })
            .catch(() => {});
      }
   }, [url]);  // only depend on url — run once per card

   const displayTitle = title && title !== 'External Link' ? title : url;

   return (
      <span className="block my-6 not-prose">
         <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
               display: 'flex',
               flexDirection: 'row',
               alignItems: 'center',
               gap: '20px',
               textDecoration: 'none',
               border: '1px solid #e2e8f0',
               borderRadius: '16px',
               padding: '20px',
               background: '#fff',
               maxWidth: '42rem',
               margin: '0 auto',
               cursor: 'pointer',
               boxShadow: '0 1px 3px 0 rgba(0,0,0,.07)',
            }}
         >
            <span style={{ flex: 1, minWidth: 0, display: 'block' }}>
               <span style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: '#111827', lineHeight: 1.3, marginBottom: '6px' }}>
                  {displayTitle}
               </span>
               {description && (
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5 }}>
                     {description}
                  </span>
               )}
            </span>
            {image && (
               <span
                  style={{
                     width: '96px',
                     height: '96px',
                     flexShrink: 0,
                     borderRadius: '10px',
                     overflow: 'hidden',
                     border: '1px solid #e2e8f0',
                     display: 'block',
                  }}
               >
                  <img
                     src={image}
                     alt=""
                     style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top center',
                        display: 'block',
                     }}
                  />
               </span>
            )}
         </a>
      </span>
   );
}

function renderContentWithCaptions(content: string): string {
  if (!content) return '';
  return content.replace(/<img([^>]+)>/g, (match, attributes) => {
    const altMatch = attributes.match(/alt="([^"]*)"/) || attributes.match(/alt='([^']*)'/);
    const titleMatch = attributes.match(/title="([^"]*)"/) || attributes.match(/title='([^']*)'/);
    const caption = (altMatch && altMatch[1]) || (titleMatch && titleMatch[1]);
    if (caption && caption.trim() !== '') {
      return `<figure class="blog-figure my-8 flex flex-col items-center">
        <img ${attributes}>
        <figcaption class="text-center text-xs font-bold text-gray-400 tracking-wide mt-3 font-sans bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100/50">${caption}</figcaption>
      </figure>`;
    }
    return match;
  });
}

/**
 * Pre-processes stored HTML before parsing.
 * Handles legacy link-preview cards (old format uses href only, no data-link-preview attr).
 * Deduplicates multiple identical link preview cards by href URL.
 */
function prepareContent(content: string): string {
  if (!content) return '';
  let processed = renderContentWithCaptions(content);

  // Strip inner DOM children from all link-preview-card anchors
  // (card data lives in data-* attrs or href; inner spans/imgs are redundant)
  processed = processed.replace(
    /(<a[^>]*class="[^"]*link-preview-card[^"]*"[^>]*>)[\s\S]*?(<\/a>)/gi,
    '$1$2'
  );

  // Deduplicate link-preview-card blocks by href — keep only first occurrence per URL
  // Handles cards wrapped in any block tag: <p>, <h4>, <div>, etc.
  const seenHrefs = new Set<string>();
  processed = processed.replace(
    /(?:<(?:p|h[1-6]|div)[^>]*>\s*)?(<a[^>]*class="[^"]*link-preview-card[^"]*"[^>]*href="([^"]*)"[^>]*>\s*<\/a>)\s*(?:<\/(?:p|h[1-6]|div)>)?/gi,
    (match, aTag, href) => {
      if (seenHrefs.has(href)) return ''; // discard duplicate
      seenHrefs.add(href);
      return `<div class="link-preview-wrapper">${aTag}</div>`;
    }
  );

  return processed;
}

export function NewsContentClient({ content }: { content: string }) {
  return (
    <div className="prose max-w-none md:prose-lg prose-p:font-sans prose-headings:font-sans prose-li:font-sans prose-headings:font-bold prose-headings:tracking-tighter prose-a:text-[#b50a0a] prose-strong:text-gray-900 prose-img:rounded-3xl prose-img:w-full prose-img:mx-auto prose-blockquote:border-[#b50a0a] prose-blockquote:bg-red-50/50 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-p:text-gray-800 prose-p:leading-relaxed prose-li:text-gray-800 prose-ul:text-gray-800">
      {parse(prepareContent(content), {
         replace: (domNode) => {
            if (domNode instanceof Element && domNode.name === 'a' && domNode.attribs && domNode.attribs.href) {
               const url = domNode.attribs.href;

               const isLinkPreview = Boolean(
                  domNode.attribs['data-link-preview'] || 
                  (domNode.attribs.class && domNode.attribs.class.includes('link-preview-card'))
               );

               if (isLinkPreview) {
                  const title = domNode.attribs['data-title'] || '';
                  const description = domNode.attribs['data-description'] || '';
                  const rawImage = domNode.attribs['data-image'] || '';

                  // If stored image is an OG proxy URL, extract the underlying image URL
                  let image = rawImage;
                  if (rawImage && rawImage.includes('url=')) {
                     try {
                        const searchParams = new URLSearchParams(rawImage.split('?')[1] || '');
                        const underlyingUrl = searchParams.get('url');
                        if (underlyingUrl) image = underlyingUrl;
                     } catch (e) {}
                  }

                  return (
                     <LinkPreviewCard
                        url={url}
                        initialTitle={title}
                        initialDescription={description}
                        initialImage={image}
                     />
                  );
               }

               // Social media embeds — only for raw URL links (anchor text === href)
               const isRawLink = domNode.children && domNode.children.length === 1 && domNode.children[0].type === 'text' && (domNode.children[0] as any).data === url;

               if (isRawLink) {
                  if (url.includes('twitter.com') || url.includes('x.com')) {
                     const match = url.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/);
                     if (match && match[3]) {
                        return <span className="block my-10 max-w-2xl mx-auto"><Tweet id={match[3]} /></span>;
                     }
                  }
                  if (url.includes('youtube.com') || url.includes('youtu.be')) {
                     return <span className="block my-10 max-w-3xl mx-auto overflow-hidden rounded-3xl"><YouTubeEmbed url={url} width="100%" /></span>;
                  }
                  if (url.includes('instagram.com')) {
                     return <span className="block my-10 max-w-md mx-auto"><InstagramEmbed url={url} width="100%" /></span>;
                  }
                  if (url.includes('tiktok.com')) {
                     return <span className="block my-10 max-w-sm mx-auto"><TikTokEmbed url={url} width="100%" /></span>;
                  }
                  if (url.includes('facebook.com')) {
                     return <span className="block my-10 max-w-lg mx-auto"><FacebookEmbed url={url} width="100%" /></span>;
                  }
               }
            }
         }
      })}
    </div>
  );
}
