/**
 * Resolves Open Graph dynamic image URLs for profile sharing (WhatsApp, Twitter, Facebook, Telegram).
 * Ensures relative Supabase storage paths and full URLs resolve to accessible absolute HTTPS image endpoints.
 */
export function resolveOgImageUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // 1. If it's already a full absolute HTTP/HTTPS URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // 2. If it's a relative Supabase storage path or bucket object key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    const cleanSupabaseBase = supabaseUrl.replace(/\/$/, '');
    if (trimmed.startsWith('/storage/v1/object/public')) {
      return `${cleanSupabaseBase}${trimmed}`;
    }
    if (trimmed.startsWith('storage/v1/object/public')) {
      return `${cleanSupabaseBase}/${trimmed}`;
    }
    return `${cleanSupabaseBase}/storage/v1/object/public/${trimmed.startsWith('/') ? trimmed.slice(1) : trimmed}`;
  }

  // 3. Fallback to site URL for root static files
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://centerkick.com';
  return `${siteUrl.replace(/\/$/, '')}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

export function getProfileOgImage(profile: any, fallbackDefaultUrl: string): string {
  if (!profile) return fallbackDefaultUrl;
  
  const candidate = 
    profile.avatar_url || 
    profile.logo_url || 
    profile.club_logo || 
    profile.cover_url || 
    (Array.isArray(profile.gallery) && profile.gallery[0] ? profile.gallery[0] : null);

  const resolved = resolveOgImageUrl(candidate);
  return resolved || fallbackDefaultUrl;
}
