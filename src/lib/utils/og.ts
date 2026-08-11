/**
 * Resolves Open Graph dynamic image URLs for profile sharing (WhatsApp, Twitter, Facebook, Telegram).
 * Ensures Supabase storage URLs and WebP images convert to 100% compatible Open Graph image cards with correct X-Robots-Tag permissions.
 */

export function getBaseSiteUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.startsWith('http')) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    const vUrl = process.env.VERCEL_URL.replace(/\/$/, '');
    return vUrl.startsWith('http') ? vUrl : `https://${vUrl}`;
  }
  return 'https://www.centerkick.com';
}

export function resolveOgImageUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  let fullUrl = trimmed;

  // 1. Resolve relative paths to absolute HTTPS URLs
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const cleanSupabaseBase = supabaseUrl.replace(/\/$/, '');
      if (trimmed.startsWith('/storage/v1/object/public')) {
        fullUrl = `${cleanSupabaseBase}${trimmed}`;
      } else if (trimmed.startsWith('storage/v1/object/public')) {
        fullUrl = `${cleanSupabaseBase}/${trimmed}`;
      } else {
        fullUrl = `${cleanSupabaseBase}/storage/v1/object/public/${trimmed.startsWith('/') ? trimmed.slice(1) : trimmed}`;
      }
    } else {
      const siteUrl = getBaseSiteUrl();
      fullUrl = `${siteUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
    }
  }

  // 2. Route image through dynamic Open Graph PNG generator endpoint to bypass Supabase x-robots-tag restrictions
  const cleanSite = getBaseSiteUrl();
  return `${cleanSite}/api/og/profile-image?url=${encodeURIComponent(fullUrl)}`;
}

export function getProfileOgImage(profile: any, fallbackDefaultUrl: string): string {
  if (!profile) {
    const cleanSite = getBaseSiteUrl();
    return `${cleanSite}/api/og/profile-image?url=${encodeURIComponent(fallbackDefaultUrl)}`;
  }
  
  const candidate = 
    profile.avatar_url || 
    profile.cover_url || 
    (Array.isArray(profile.gallery_urls) && profile.gallery_urls[0] ? profile.gallery_urls[0] : null) ||
    fallbackDefaultUrl;

  return resolveOgImageUrl(candidate) || fallbackDefaultUrl;
}
