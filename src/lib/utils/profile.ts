/**
 * Utility to check if a profile meets the minimum requirements to be considered "live".
 * Role-specific criteria apply.
 * Note: Always inspect users.role first as profiles.role defaults to 'player' in the schema.
 */
export function isProfileComplete(profile: any): boolean {
  if (!profile) return false;

  // Non-active profiles (pending, suspended, rejected) must never appear publicly
  if (profile.status && profile.status !== 'active') return false;

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

  // Profile picture is mandatory across all user account types to be listed live
  const hasAvatar = Boolean(profile.avatar_url || profile.logo_url);
  if (!hasAvatar) return false;

  if (role === 'player' || role === 'athlete') {
    return Boolean(
      profile.first_name &&
      profile.last_name &&
      profile.avatar_url
    );
  }

  if (role === 'coach' || role === 'coachs') {
    const hasCoachName = Boolean(profile.first_name && profile.last_name);
    if (!hasCoachName) return false;

    let hasValidAge = false;
    if (profile.date_of_birth) {
      const dobDate = new Date(profile.date_of_birth);
      if (!isNaN(dobDate.getTime())) {
        const ageDiff = Date.now() - dobDate.getTime();
        const age = Math.floor(ageDiff / (365.25 * 24 * 60 * 60 * 1000));
        hasValidAge = age >= 18 && age <= 90;
      }
    }
    if (!hasValidAge) return false;

    const hasFreeAgent = Boolean(profile.is_free_agent || profile.current_club === 'Free Agent');
    const hasValidContract = hasFreeAgent || Boolean(profile.current_club && profile.contract_expiry);
    const hasLanguages = Array.isArray(profile.languages_spoken) && profile.languages_spoken.length > 0;
    const hasPosition = Array.isArray(profile.current_position)
      ? profile.current_position.length > 0
      : Boolean(profile.current_position || profile.position);
    const hasValidExp = profile.years_of_experience !== null &&
      profile.years_of_experience !== undefined &&
      profile.years_of_experience !== '' &&
      !isNaN(Number(profile.years_of_experience)) &&
      Number(profile.years_of_experience) >= 0;
    const hasFormation = Boolean(profile.formation && String(profile.formation).trim());
    const hasCountry = Boolean(profile.country && String(profile.country).trim());

    return Boolean(
      profile.avatar_url &&
      hasValidExp &&
      hasFormation &&
      hasValidContract &&
      hasCountry &&
      hasLanguages &&
      hasPosition
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
