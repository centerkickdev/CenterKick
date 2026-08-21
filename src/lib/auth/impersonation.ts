import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const IMPERSONATION_COOKIE = 'ck_impersonated_user_id';

export interface EffectiveUserSession {
  /** The ID of the user whose dashboard data is rendered */
  effectiveUserId: string;
  /** The authenticated real user ID (SuperAdmin if impersonating) */
  realSuperAdminId: string;
  /** Whether View-As mode is active */
  isImpersonating: boolean;
  /** Email of target user when impersonating */
  targetUserEmail?: string;
  /** Role of target user when impersonating */
  targetUserRole?: string;
}

/**
 * Resolves the active user session context for server components and actions.
 * If a SuperAdmin is actively impersonating another user, returns the target user's ID
 * while setting `isImpersonating` to true.
 */
export async function getEffectiveUserSession(): Promise<EffectiveUserSession | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Check if current user is SuperAdmin
  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isSuperAdmin = userRecord?.role === 'superadmin' || user.app_metadata?.role === 'superadmin';

  if (isSuperAdmin) {
    const cookieStore = await cookies();
    const impersonatedId = cookieStore.get(IMPERSONATION_COOKIE)?.value;

    if (impersonatedId) {
      try {
        const adminClient = createAdminClient();
        const { data: targetUserAuth } = await adminClient.auth.admin.getUserById(impersonatedId);

        const { data: targetUserRecord } = await adminClient
          .from('users')
          .select('role')
          .eq('id', impersonatedId)
          .single();

        return {
          effectiveUserId: impersonatedId,
          realSuperAdminId: user.id,
          isImpersonating: true,
          targetUserEmail: targetUserAuth?.user?.email ?? impersonatedId,
          targetUserRole: targetUserRecord?.role || 'player',
        };
      } catch (err) {
        console.error('Failed to resolve impersonated user:', err);
      }
    }
  }

  return {
    effectiveUserId: user.id,
    realSuperAdminId: user.id,
    isImpersonating: false,
  };
}
