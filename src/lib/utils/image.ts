/**
 * Utility for image optimization and thumbnail resolution.
 * Transforms Supabase Storage and external URLs into lightweight, properly-sized WebP thumbnails.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: { width?: number; height?: number; quality?: number; resize?: 'cover' | 'contain' } = {}
): string {
  if (!url) return '';
  const { width = 400, height = 400, quality = 80, resize = 'cover' } = options;

  try {
    // 1. Supabase Storage: Use render endpoint for dynamic resizing/optimization
    if (url.includes('/storage/v1/object/public/')) {
      const transformedUrl = url.replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/'
      );
      const urlObj = new URL(transformedUrl);
      urlObj.searchParams.set('width', width.toString());
      if (height) urlObj.searchParams.set('height', height.toString());
      urlObj.searchParams.set('quality', quality.toString());
      urlObj.searchParams.set('resize', resize);
      return urlObj.toString();
    }

    // 2. Unsplash CDN images: apply width and quality
    if (url.includes('images.unsplash.com')) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      urlObj.searchParams.set('auto', 'format');
      return urlObj.toString();
    }
  } catch (_) {
    return url;
  }

  return url;
}

