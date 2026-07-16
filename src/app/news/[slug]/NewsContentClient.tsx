'use client';

import parse, { Element } from 'html-react-parser';
import { Tweet } from 'react-tweet';
import { InstagramEmbed, YouTubeEmbed, TikTokEmbed, FacebookEmbed } from 'react-social-media-embed';

function renderContentWithCaptions(content: string): string {
  if (!content) return '';
  return content.replace(/<img([^>]+)>/g, (match, attributes) => {
    const altMatch = attributes.match(/alt="([^"]*)"/) || attributes.match(/alt='([^']*)'/);
    const titleMatch = attributes.match(/title="([^"]*)"/) || attributes.match(/title='([^']*)'/);
    const caption = (altMatch && altMatch[1]) || (titleMatch && titleMatch[1]);
    
    if (caption && caption.trim() !== '') {
      return `<figure class="blog-figure my-8 flex flex-col items-center">
        <img ${attributes}>
        <figcaption class="text-center text-xs font-bold text-gray-400  tracking-wide mt-3  font-sans bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100/50">${caption}</figcaption>
      </figure>`;
    }
    return match;
  });
}

export function NewsContentClient({ content }: { content: string }) {
  return (
    <div className="prose max-w-none md:prose-lg prose-p:font-sans prose-headings:font-sans prose-li:font-sans prose-headings:font-bold prose-headings:tracking-tighter prose-a:text-[#b50a0a] prose-strong:text-gray-900 prose-img:rounded-3xl prose-img:w-full prose-img:mx-auto prose-blockquote:border-[#b50a0a] prose-blockquote:bg-red-50/50 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-p:text-gray-800 prose-p:leading-relaxed prose-li:text-gray-800 prose-ul:text-gray-800">
      {parse(renderContentWithCaptions(content), {
         replace: (domNode) => {
            if (domNode instanceof Element && domNode.name === 'a' && domNode.attribs && domNode.attribs.href) {
               const url = domNode.attribs.href;
               
               // If the anchor text is exactly the URL, it's likely a raw embed link
               const isRawLink = domNode.children && domNode.children.length === 1 && domNode.children[0].type === 'text' && (domNode.children[0] as any).data === url;

               if (isRawLink || domNode.attribs['data-link-preview']) {
                  if (url.includes('twitter.com') || url.includes('x.com')) {
                     const match = url.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/);
                     if (match && match[3]) {
                        return <div className="my-10 flex justify-center w-full max-w-2xl mx-auto"><Tweet id={match[3]} /></div>;
                     }
                  }
                  
                  if (url.includes('youtube.com') || url.includes('youtu.be')) {
                     return <div className="my-10 flex justify-center w-full max-w-3xl mx-auto overflow-hidden rounded-3xl"><YouTubeEmbed url={url} width="100%" /></div>;
                  }
                  
                  if (url.includes('instagram.com')) {
                     return <div className="my-10 flex justify-center w-full max-w-md mx-auto"><InstagramEmbed url={url} width="100%" /></div>;
                  }
                  
                  if (url.includes('tiktok.com')) {
                     return <div className="my-10 flex justify-center w-full max-w-sm mx-auto"><TikTokEmbed url={url} width="100%" /></div>;
                  }
                  
                  if (url.includes('facebook.com')) {
                     return <div className="my-10 flex justify-center w-full max-w-lg mx-auto"><FacebookEmbed url={url} width="100%" /></div>;
                  }
               }
            }
         }
      })}
    </div>
  );
}
