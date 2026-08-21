'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { IMPERSONATION_COOKIE } from '@/lib/auth/impersonation';

export async function startImpersonation(targetUserId: string, reason?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Verify caller is SuperAdmin
  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isSuperAdmin = userRecord?.role === 'superadmin' || user.app_metadata?.role === 'superadmin';

  if (!isSuperAdmin) {
    return { error: 'Forbidden: Only SuperAdmin accounts can activate View-As mode.' };
  }

  // Prevent SuperAdmin from impersonating themselves
  if (user.id === targetUserId) {
    return { error: 'Cannot impersonate your own SuperAdmin account.' };
  }

  try {
    const headerStore = await headers();
    const ip = headerStore.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = headerStore.get('user-agent') || '';

    // Log to superadmin_impersonation_logs using service role client
    const adminDb = createAdminClient();
    await adminDb.from('superadmin_impersonation_logs').insert({
      superadmin_id: user.id,
      target_user_id: targetUserId,
      reason: reason || 'SuperAdmin UI Preview & Feedback Fix Verification',
      action: 'START',
      ip_address: ip,
      user_agent: userAgent,
    });

    // Set signed, HTTP-only cookie valid for 1 hour
    const cookieStore = await cookies();
    cookieStore.set(IMPERSONATION_COOKIE, targetUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour TTL
      path: '/',
    });
    return { success: true };
  } catch (err: any) {
    console.error('Failed to log or start impersonation:', err);
    return { error: err.message || 'Failed to start impersonation session.' };
  }
}

export async function stopImpersonation() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const targetUserId = cookieStore.get(IMPERSONATION_COOKIE)?.value;

  if (user && targetUserId) {
    try {
      const adminDb = createAdminClient();
      await adminDb.from('superadmin_impersonation_logs').insert({
        superadmin_id: user.id,
        target_user_id: targetUserId,
        action: 'STOP',
      });
    } catch (err) {
      console.error('Failed to log stop impersonation:', err);
    }
  }

  // Clear impersonation cookie
  cookieStore.delete(IMPERSONATION_COOKIE);
  return { success: true };
}
