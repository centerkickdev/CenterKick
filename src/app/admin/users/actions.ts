'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Verifies the requesting user is a staff member before executing any admin action.
 */
async function verifyStaffAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const role = user.app_metadata?.role;
  const staffRoles = ['superadmin', 'admin', 'operations'];
  if (!role || !staffRoles.includes(role)) {
    throw new Error('Insufficient permissions');
  }
  return user;
}

/**
 * Activates a user account:
 * - Sets users.is_active = true
 * - Sets profiles.status = 'active'
 */
export async function activateUser(userId: string) {
  await verifyStaffAccess();
  const admin = createAdminClient();

  const [userResult, profileResult] = await Promise.all([
    admin.from('users').update({ is_active: true }).eq('id', userId),
    admin.from('profiles').update({ status: 'active' }).eq('user_id', userId),
  ]);

  if (userResult.error) return { error: userResult.error.message };
  if (profileResult.error) return { error: profileResult.error.message };

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

/**
 * Deactivates a user account:
 * - Sets users.is_active = false
 * Note: Profile status is preserved so history is kept.
 */
export async function deactivateUser(userId: string) {
  await verifyStaffAccess();
  const admin = createAdminClient();

  const { error } = await admin
    .from('users')
    .update({ is_active: false })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

/**
 * Changes the platform role of a user.
 * Also triggers the auth metadata sync trigger automatically.
 */
export async function changeUserRole(userId: string, newRole: string) {
  await verifyStaffAccess();
  const admin = createAdminClient();

  const { error } = await admin
    .from('users')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

/**
 * Rejects a pending user (sets profile status to rejected, deactivates account).
 */
export async function rejectUser(userId: string) {
  await verifyStaffAccess();
  const admin = createAdminClient();

  await Promise.all([
    admin.from('users').update({ is_active: false }).eq('id', userId),
    admin.from('profiles').update({ status: 'rejected' }).eq('user_id', userId),
  ]);

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

/**
 * Permanently deletes user accounts using Supabase Auth admin API.
 * This will cascade to delete their profiles and other associated data.
 */
export async function deleteUsers(userIds: string[]) {
  await verifyStaffAccess();
  const admin = createAdminClient();
  const errors = [];

  for (const id of userIds) {
    const { error } = await admin.auth.admin.deleteUser(id);
    
    // If it's a real error (not just 'User not found'), record it. 
    // We ignore 'User not found' because seeded accounts might not exist in auth.users.
    if (error && error.message !== 'User not found') {
      errors.push(`${id}: ${error.message}`);
      continue;
    }

    // Clean up stranded data in public tables
    await admin.from('profiles').delete().eq('user_id', id);
    const { error: dbError } = await admin.from('users').delete().eq('id', id);
    
    if (dbError) {
      errors.push(`${id}: failed to delete from users table (${dbError.message})`);
    }
  }

  revalidatePath('/admin/users');
  return errors.length > 0 ? { error: `Failed to delete some users: ${errors.join(', ')}` } : { success: true };
}

export async function updateMarketValue(profileId: string, marketValue: number) {
  await verifyStaffAccess();
  const admin = createAdminClient();
  const { error } = await admin.from('profiles').update({ market_value: marketValue }).eq('id', profileId);
  if (error) return { error: error.message };
  revalidatePath('/admin/users');
  return { success: true };
}

