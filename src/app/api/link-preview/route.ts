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

    // Fetch the target HTML content with a standard user-agent
    const response = await fetch(targetUrl, {
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

    // Helper functions to extract metadata
    const getMetaTag = (html: string, name: string): string => {
      const match = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
                    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i'));
      return match ? match[1] : '';
    };

    const getTitle = (html: string): string => {
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return match ? match[1] : '';
    };

    const titleRaw = getMetaTag(html, 'og:title') || getTitle(html) || domain;
    const descriptionRaw = getMetaTag(html, 'og:description') || getMetaTag(html, 'description') || targetUrl;
    const image = getMetaTag(html, 'og:image') || '';

    const cleanText = (str: string) => str.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

    return NextResponse.json({
      title: cleanText(titleRaw),
      description: cleanText(descriptionRaw),
      image,
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
