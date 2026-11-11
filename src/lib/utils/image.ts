/**
 * Utility for image optimization and thumbnail resolution.
 * Keeps standard public storage URLs safe and intact while optimizing external CDNs (like Unsplash).
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  if (!url) return '';
  const { width = 400, quality = 80 } = options;

  try {
    // 1. Unsplash CDN images: apply width and quality params
    if (url.includes('images.unsplash.com')) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      urlObj.searchParams.set('auto', 'format');
      return urlObj.toString();
    }

    // 2. Supabase Storage: Preserve exact /storage/v1/object/public/ path
    // Next.js <Image /> handles device-size resizing, AVIF/WebP conversion, and caching
    return url;
  } catch (_) {
    return url;
  }
}


