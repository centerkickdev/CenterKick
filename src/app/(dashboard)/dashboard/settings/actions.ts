'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getEffectiveUserSession } from '@/lib/auth/impersonation';
import { revalidatePath } from 'next/cache';

export async function getEffectiveSettingsData() {
  const session = await getEffectiveUserSession();
  if (!session) return { error: 'Unauthorized' };

  const activeUserId = session.effectiveUserId;
  const db = session.isImpersonating ? createAdminClient() : await createClient();

  const [
    { data: userRecord },
    { data: profileRecord }
  ] = await Promise.all([
    db.from('users').select('email, role').eq('id', activeUserId).single(),
    db.from('profiles').select('visibility, email_reminders_enabled, profile_reminders_enabled, subscription_reminders_enabled').eq('user_id', activeUserId).single()
  ]);

  return {
    email: userRecord?.email || '',
    profile: profileRecord || null,
    isImpersonating: session.isImpersonating
  };
}

export async function updateEffectiveNotificationSettings(payload: {
  visibility?: string;
  email_reminders_enabled: boolean;
  profile_reminders_enabled: boolean;
  subscription_reminders_enabled: boolean;
}) {
  const session = await getEffectiveUserSession();
  if (!session) return { error: 'Unauthorized' };

  const activeUserId = session.effectiveUserId;
  const db = session.isImpersonating ? createAdminClient() : await createClient();

  const { error } = await db
    .from('profiles')
    .update({
      visibility: payload.visibility || 'public',
      email_reminders_enabled: payload.email_reminders_enabled,
      profile_reminders_enabled: payload.profile_reminders_enabled,
      subscription_reminders_enabled: payload.subscription_reminders_enabled,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', activeUserId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/settings');
  return { success: true };
}
