/**
 * Utility to check if a profile meets the minimum requirements to be considered "live".
 * Role-specific criteria apply.
 * Note: Always inspect users.role first as profiles.role defaults to 'player' in the schema.
 */
export function isProfileComplete(profile: any): boolean {
  if (!profile) return false;

  // Non-active profiles (pending, suspended, rejected) must never appear publicly
  if (profile.status && profile.status !== 'active') return false;

  // Database-level flag fast-path if available
  if (profile.is_profile_complete !== undefined && profile.is_profile_complete !== null) {
    return Boolean(profile.is_profile_complete);
  }

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
    const hasPlayerName = Boolean(profile.first_name && profile.last_name);
    const hasAvatar = Boolean(profile.avatar_url);
    const hasGallery = Array.isArray(profile.gallery_urls) && profile.gallery_urls.length >= 2;
    const height = Number(profile.height_cm);
    const hasHeight = Boolean(profile.height_cm && !isNaN(height) && height >= 100 && height <= 230);
    const hasPosition = Boolean(profile.position && String(profile.position).trim());
    const isFreeAgent = Boolean(profile.is_free_agent || profile.current_club === 'Free Agent');
    const hasClub = isFreeAgent || Boolean(profile.current_club && String(profile.current_club).trim());
    const hasContract = isFreeAgent || Boolean(profile.current_club && profile.contract_expiry);
    const hasCountry = Boolean(profile.country && String(profile.country).trim());
    const hasFoot = Boolean(profile.foot && ['Right', 'Left', 'Both'].includes(profile.foot));

    return Boolean(
      hasPlayerName &&
      hasAvatar &&
      hasGallery &&
      hasHeight &&
      hasPosition &&
      hasClub &&
      hasContract &&
      hasCountry &&
      hasFoot
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
    const hasName = Boolean(
      (profile.first_name && profile.last_name) || profile.agency_name
    );
    const hasAvatar = Boolean(profile.avatar_url);
    const hasCountry = Boolean(profile.country && String(profile.country).trim());
    const hasContact = Boolean(profile.contact_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(profile.contact_email).trim()));
    return Boolean(hasName && hasAvatar && hasCountry && hasContact);
  }

  if (role === 'organization') {
    const hasOrgName = Boolean(
      (profile.agency_name && String(profile.agency_name).trim().length >= 2) ||
      (profile.first_name && profile.last_name)
    );
    const hasLogo = Boolean(profile.avatar_url);
    const hasCountry = Boolean(profile.country && String(profile.country).trim());
    const hasYear = profile.year_established !== null &&
      profile.year_established !== undefined &&
      profile.year_established !== '' &&
      !isNaN(Number(profile.year_established)) &&
      Number(profile.year_established) >= 1800 &&
      Number(profile.year_established) <= new Date().getFullYear();
    const hasType = Boolean(profile.organization_type && String(profile.organization_type).trim());
    const hasContact = Boolean(profile.contact_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(profile.contact_email).trim()));
    const bioText = profile.bio ? String(profile.bio).replace(/<[^>]*>?/gm, '').trim() : '';
    const hasBio = Boolean(bioText.length >= 10);

    return Boolean(hasOrgName && hasLogo && hasCountry && hasYear && hasType && hasContact && hasBio);
  }

  if (role === 'professional') {
    const hasName = Boolean(profile.first_name && profile.last_name);
    const hasAvatar = Boolean(profile.avatar_url);
    const hasCategory = Boolean(profile.profession_category && String(profile.profession_category).trim());
    const hasCountry = Boolean(profile.country && String(profile.country).trim());
    const hasContact = Boolean(profile.contact_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(profile.contact_email).trim()));
    return Boolean(hasName && hasAvatar && hasCategory && hasCountry && hasContact);
  }

  return true;
}
