'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function requestProfileEdit(profileId: string, changes: Record<string, { old: any; new: any; document_url?: string }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Verify the user is the managing agent or the profile owner
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, user_id, agent_id, organization_id, first_name, last_name')
    .eq('id', profileId)
    .single();

  if (profileError || !profile) {
    return { error: 'Profile not found' };
  }

  if (profile.user_id !== user.id && profile.agent_id !== user.id && profile.organization_id !== user.id) {
    return { error: 'You do not have permission to edit this profile.' };
  }

  // Insert edits
  const editsToInsert = Object.entries(changes).map(([field_name, values]) => ({
    profile_id: profileId,
    field_name,
    old_value: values.old ? String(values.old) : null,
    new_value: values.new ? String(values.new) : null,
    document_url: values.document_url || null,
    status: 'pending'
  }));

  if (editsToInsert.length === 0) return { success: true };

  const fields = editsToInsert.map(e => e.field_name);
  if (fields.length > 0) {
    await supabase
      .from('profile_edits')
      .delete()
      .eq('profile_id', profileId)
      .eq('status', 'pending')
      .in('field_name', fields);
  }

  const { error: insertError } = await supabase
    .from('profile_edits')
    .insert(editsToInsert);

  if (insertError) {
    return { error: insertError.message };
  }

  // Notify admins
  const { data: admins } = await supabase
    .from('users')
    .select('id')
    .in('role', ['admin', 'superadmin', 'operations']);

  if (admins && admins.length > 0) {
    const adminNotifications = admins.map(admin => ({
      user_id: admin.id,
      title: 'Profile Edits Requested',
      message: `${profile.first_name || 'A user'} has requested profile edits.`,
      type: 'info',
      action_url: '/admin/approvals/edits'
    }));
    await supabase.from('notifications').insert(adminNotifications);
  }

  return { success: true };
}

export async function invalidateProfileCache() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    try {
      const { redis } = await import('@/lib/redis');
      await redis.del(`user:profile:${user.id}`);
    } catch (e) {
      console.error('Failed to invalidate profile cache', e);
    }
  }
}

const isValidUUID = (id: string | null | undefined): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

export async function submitUserLeague(name: string, countryInput: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  if (!countryInput || !countryInput.trim()) {
    return { error: 'Country selection is required when adding a new league.' };
  }

  let validCountryId: string | null = null;
  if (isValidUUID(countryInput)) {
    validCountryId = countryInput;
  } else {
    const { data: countryRecord } = await supabase
      .from('countries')
      .select('id')
      .ilike('name', countryInput.trim())
      .maybeSingle();
    if (countryRecord?.id) {
      validCountryId = countryRecord.id;
    }
  }

  if (!validCountryId) {
    return { error: 'Selected country could not be found. Please select a valid country.' };
  }

  const { data, error } = await supabase
    .from('leagues')
    .insert({
      name,
      country_id: validCountryId,
      is_user_submitted: true,
      is_verified: false,
      is_active: true
    })
    .select('id, name')
    .single();

  if (error) return { error: error.message };

  // Notify admins
  const { data: admins } = await supabase.from('users').select('id').in('role', ['admin', 'superadmin', 'operations']);
  if (admins && admins.length > 0) {
    const adminNotifications = admins.map(admin => ({
      user_id: admin.id,
      title: 'New League Submitted',
      message: `A user has submitted a new league: ${name}.`,
      type: 'info',
      action_url: '/admin/settings/football-data'
    }));
    await supabase.from('notifications').insert(adminNotifications);
  }

  return { success: true, data };
}

export async function submitUserClub(name: string, leagueInput: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  let validLeagueId: string | null = null;
  if (isValidUUID(leagueInput)) {
    validLeagueId = leagueInput;
  } else if (leagueInput) {
    const { data: leagueRecord } = await supabase
      .from('leagues')
      .select('id')
      .ilike('name', leagueInput.trim())
      .maybeSingle();
    if (leagueRecord?.id) {
      validLeagueId = leagueRecord.id;
    }
  }

  const { data, error } = await supabase
    .from('clubs')
    .insert({
      name,
      league_id: validLeagueId,
      is_user_submitted: true,
      is_verified: false,
      is_active: true
    })
    .select('id, name, league_id')
    .single();

  if (error) return { error: error.message };

  // Notify admins
  const { data: admins } = await supabase.from('users').select('id').in('role', ['admin', 'superadmin', 'operations']);
  if (admins && admins.length > 0) {
    const adminNotifications = admins.map(admin => ({
      user_id: admin.id,
      title: 'New Club Submitted',
      message: `A user has submitted a new club: ${name}.`,
      type: 'info',
      action_url: '/admin/settings/football-data'
    }));
    await supabase.from('notifications').insert(adminNotifications);
  }

  return { success: true, data };
}
