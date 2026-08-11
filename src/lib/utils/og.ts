/**
 * Resolves Open Graph dynamic image URLs for profile sharing (WhatsApp, Twitter, Facebook, Telegram).
 * Ensures WebP images and relative Supabase storage paths convert to 100% compatible JPEG Open Graph endpoints.
 */
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
      const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://centerkick.com';
      fullUrl = `${siteUrl.replace(/\/$/, '')}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
    }
  }

  // 2. Route image through dynamic JPEG generator endpoint to guarantee WhatsApp/iMessage compatibility
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://centerkick.com';
  const cleanSite = siteUrl.replace(/\/$/, '');
  return `${cleanSite}/api/og/profile-image?url=${encodeURIComponent(fullUrl)}`;
}

export function getProfileOgImage(profile: any, fallbackDefaultUrl: string): string {
  if (!profile) {
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://centerkick.com';
    return `${siteUrl.replace(/\/$/, '')}/api/og/profile-image?url=${encodeURIComponent(fallbackDefaultUrl)}`;
  }
  
  const candidate = 
    profile.avatar_url || 
    profile.logo_url || 
    profile.club_logo || 
    profile.cover_url || 
    (Array.isArray(profile.gallery) && profile.gallery[0] ? profile.gallery[0] : null) ||
    fallbackDefaultUrl;

  return resolveOgImageUrl(candidate) || fallbackDefaultUrl;
}
