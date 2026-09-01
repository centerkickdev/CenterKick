import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const urlObj = new URL(targetUrl);
    const domain = urlObj.hostname;

    let fetchUrl = targetUrl;

    // In local development, redirect requests for production domain (www.centerkick.com) to local server localhost:3000
    const hostHeader = request.headers.get('host') || '';
    if (hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1')) {
      if (urlObj.hostname.includes('centerkick.com')) {
        fetchUrl = `http://${hostHeader}${urlObj.pathname}${urlObj.search}`;
      }
    }

    // Fetch the target HTML content with a standard user-agent
    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      next: { revalidate: 3600 } // Cache results for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json({
        title: domain,
        description: targetUrl,
        image: '',
        domain
      });
    }

    const html = await response.text();

    // Robust helper function to extract meta tags (og:title, twitter:title, description, og:image, etc.)
    const getMetaTag = (html: string, names: string[]): string => {
      for (const name of names) {
        const regex1 = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i');
        const regex2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i');
        const match = html.match(regex1) || html.match(regex2);
        if (match && match[1]) return match[1];
      }
      return '';
    };

    const getTitle = (html: string): string => {
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return match ? match[1] : '';
    };

    const titleRaw = getMetaTag(html, ['og:title', 'twitter:title', 'title']) || getTitle(html) || domain;
    const descriptionRaw = getMetaTag(html, ['og:description', 'twitter:description', 'description']) || '';
    let imageRaw = getMetaTag(html, ['og:image', 'twitter:image', 'og:image:secure_url']);

    // Make relative image URLs absolute
    if (imageRaw && !/^https?:\/\//i.test(imageRaw)) {
      try {
        imageRaw = new URL(imageRaw, targetUrl).toString();
      } catch (e) {}
    }

    // If og:image is the CenterKick /api/og/profile-image proxy, extract the underlying direct image URL
    // so the preview card shows the actual photo without the OG black-background wrapper
    if (imageRaw && imageRaw.includes('/api/og/profile-image')) {
      try {
        const proxyParams = new URL(imageRaw).searchParams;
        const directUrl = proxyParams.get('url');
        if (directUrl) imageRaw = decodeURIComponent(directUrl);
      } catch (e) {}
    }

    const cleanText = (str: string) => str.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

    return NextResponse.json({
      title: cleanText(titleRaw),
      description: cleanText(descriptionRaw),
      image: imageRaw,
      domain
    });

  } catch (error: any) {
    console.error('Link preview error:', error);
    try {
      const domain = new URL(targetUrl).hostname;
      return NextResponse.json({
        title: domain,
        description: targetUrl,
        image: '',
        domain
      });
    } catch {
      return NextResponse.json({
        title: 'External Link',
        description: targetUrl,
        image: '',
        domain: 'external'
      });
    }
  }
}
