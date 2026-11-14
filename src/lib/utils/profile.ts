/**
 * Utility to check if a profile meets the minimum requirements to be considered "live".
 * Role-specific criteria apply.
 * Note: Always inspect users.role first as profiles.role defaults to 'player' in the schema.
 */
export function isProfileComplete(profile: any): boolean {
  if (!profile) return false;

  const rawRole =
    (Array.isArray(profile.users) ? profile.users[0]?.role : profile.users?.role) ||
    profile.userRole ||
    profile.role;
    
  const role = (rawRole || 'player').toLowerCase();

  // Basic identity requirement: must have at least one name identifier
  const hasName = Boolean(
    (profile.first_name && profile.last_name) ||
    profile.agency_name ||
    profile.full_name
  );

  if (!hasName) return false;

  if (role === 'player' || role === 'athlete') {
    // Players must have a first name, last name, and an avatar or gallery
    return Boolean(
      profile.first_name &&
      profile.last_name &&
      (profile.avatar_url || (profile.gallery_urls && profile.gallery_urls.length > 0))
    );
  }

  if (role === 'coach' || role === 'coachs') {
    return Boolean(
      (profile.first_name && profile.last_name) || profile.agency_name
    );
  }

  if (role === 'agent' || role === 'scout') {
    return Boolean(
      (profile.first_name && profile.last_name) || profile.agency_name
    );
  }

  if (role === 'organization') {
    return Boolean(
      profile.agency_name || (profile.first_name && profile.last_name) || profile.full_name
    );
  }

  if (role === 'professional') {
    return Boolean(
      (profile.first_name && profile.last_name) || profile.agency_name
    );
  }

  return true;
}
