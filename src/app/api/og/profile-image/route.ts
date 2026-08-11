import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('Missing image URL parameter', { status: 400 });
    }

    // 1. Fetch source image from remote location (Supabase CDN, etc.)
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CenterKick-OG-Proxy/1.0)',
      },
    });

    if (!response.ok) {
      console.error('OG Image fetch failed:', response.status, response.statusText);
      return new NextResponse('Failed to fetch source image', { status: 502 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // 2. Process with Sharp: 1200x630 PNG card with dark background (#0a0a0b)
    const width = 1200;
    const height = 630;

    // Resize input image to fit in a 480x480 box
    const avatarResized = await sharp(inputBuffer)
      .resize({
        width: 480,
        height: 480,
        fit: 'contain',
        background: { r: 10, g: 10, b: 11, alpha: 0 },
      })
      .toBuffer();

    // Composite onto 1200x630 canvas
    const ogPngBuffer = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 10, g: 10, b: 11, alpha: 1 }, // #0a0a0b
      },
    })
      .composite([
        {
          input: avatarResized,
          gravity: 'center',
        },
      ])
      .png({ compressionLevel: 6 })
      .toBuffer();

    // 3. Return response overriding x-robots-tag to allow WhatsApp, iMessage, Twitter & Facebook crawlers
    return new NextResponse(ogPngBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'X-Robots-Tag': 'all, index, follow, max-image-preview:large',
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Content-Length': ogPngBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error generating OG PNG image:', error);
    return new NextResponse('Internal Server Error generating OG image', { status: 500 });
  }
}
