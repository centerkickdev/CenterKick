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
