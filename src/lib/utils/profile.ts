/**
 * Utility to check if a profile meets the minimum requirements to be considered "live".
 * Role-specific criteria apply.
 */
export function isProfileComplete(profile: any): boolean {
  if (!profile) return false;

  const role = profile.role?.toLowerCase() || 'player';

  // Base checks that apply to ALL roles
  const baseChecks = [
    Boolean(profile.avatar_url),
    Boolean(profile.cover_url || profile.cover_image_url),
  ];

  if (role === 'player' || role === 'coach') {
    const checks = [
      ...baseChecks,
      Boolean(profile.first_name),
      Boolean(profile.last_name),
      Boolean(profile.gallery_urls && profile.gallery_urls.length >= 2),
      Boolean(profile.video_links && profile.video_links.length >= 1)
    ];
    return checks.filter(Boolean).length === checks.length;
  } 
  
  if (role === 'agent' || role === 'scout') {
    const checks = [
      ...baseChecks,
      Boolean(profile.first_name),
      Boolean(profile.last_name),
    ];
    return checks.filter(Boolean).length === checks.length;
  }
  
  if (role === 'organization') {
    // Organizations might use first_name/last_name for their name or agency_name
    const hasName = Boolean(profile.agency_name) || Boolean(profile.first_name && profile.last_name);
    const checks = [
      ...baseChecks,
      hasName
    ];
    return checks.filter(Boolean).length === checks.length;
  }

  // Fallback for unknown roles (require full base)
  return baseChecks.filter(Boolean).length === baseChecks.length;
}
