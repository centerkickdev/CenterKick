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

    // 1. Fetch the raw image from remote source (Supabase, Unsplash, etc.)
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'CenterKick-OG-Fetcher/1.0',
      },
    });

    if (!response.ok) {
      console.error('OG Image fetch failed:', response.status, response.statusText);
      return new NextResponse('Failed to fetch source image', { status: 502 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // 2. Process with Sharp: create standard 1200x630 JPEG Open Graph card with dark branded background
    const width = 1200;
    const height = 630;

    // Resize input image to fit neatly within 500x500 square box
    const avatarResized = await sharp(inputBuffer)
      .resize({
        width: 480,
        height: 480,
        fit: 'contain',
        background: { r: 10, g: 10, b: 11, alpha: 0 },
      })
      .toBuffer();

    // Create a 1200x630 dark canvas (#0a0a0b) with CenterKick styling
    const ogJpegBuffer = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 10, g: 10, b: 11 }, // #0a0a0b
      },
    })
      .composite([
        {
          input: avatarResized,
          gravity: 'center',
        },
      ])
      .jpeg({ quality: 90, progressive: true })
      .toBuffer();

    // 3. Return response with strictly JPEG headers for WhatsApp/iMessage compatibility
    return new NextResponse(ogJpegBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Content-Length': ogJpegBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error generating OG JPEG image:', error);
    return new NextResponse('Internal Server Error generating OG image', { status: 500 });
  }
}
