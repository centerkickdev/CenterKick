'use server';

import { createClient } from '@/lib/supabase/server';
import { sendEmailNotification } from '../admin/notifications/actions';

export type AccountStatus = 'REGISTERED' | 'PROSPECT' | 'NONE';

/**
 * Checks the status of an email in the system.
 * REGISTERED: Has a record in auth.users
 * PROSPECT: Has a record in public.profiles but no user_id (or unlinked)
 * NONE: No record found
 */
export async function checkAccountStatus(email: string): Promise<{ status: AccountStatus; role?: string; id?: string }> {
  const supabase = await createClient();

  // 1. Check if user exists in public.profiles (our source of truth for all members)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, user_id, role, email')
    .eq('email', email)
    .maybeSingle();

  if (error || !profile) {
    return { status: 'NONE' };
  }

  // 2. Check if linked to auth
  if (profile.user_id) {
    return { status: 'REGISTERED', role: profile.role, id: profile.id };
  }

  return { status: 'PROSPECT', role: profile.role, id: profile.id };
}

/**
 * Retrieves "prospect" profiles (those not yet linked to an auth user)
 * Supports optional filtering by role.
 */
export async function getProspects(role?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('profiles')
    .select('*, transactions(status)')
    .is('user_id', null)
    .not('email', 'is', null);

  if (role) {
    query = query.eq('role', role);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prospects:', error);
    return [];
  }

  return data;
}

/**
 * Resends the invitation/onboarding email or a subscription reminder
 */
export async function resendInvitation(email: string, role: string, lastName: string, type: 'invite' | 'reminder' = 'invite') {
  const supabase = await createClient();
  
  // Get the profile to ensure we have the right ID for the link
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name')
    .eq('email', email)
    .maybeSingle();

  if (!profile) return { success: false, error: "Profile not found" };

  // Fetch dynamic payment settings from DB
  const { data: settingsRecord } = await supabase
    .from('site_content')
    .select('content')
    .eq('page', 'settings')
    .eq('section', 'payment')
    .maybeSingle();

  const settings = (settingsRecord?.content as any) || {};
  const normalizedRole = role === 'athlete' ? 'player' : role;
  const rolePlan = settings?.plans?.[normalizedRole];
  const amountStr = rolePlan?.amount ? `₦${Number(rolePlan.amount).toLocaleString()}` : '';
  const priceNotice = amountStr ? ` (${amountStr})` : '';

  const link = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://centerkick.com'}/register?email=${encodeURIComponent(email)}&role=${role}`;
  
  const subject = type === 'reminder' 
    ? `Action Required: Renew your CenterKick ${role} Subscription`
    : `Complete your CenterKick ${role} Registration`;

  const message = type === 'reminder'
    ? `Hello ${profile.first_name || lastName}, 

We noticed your CenterKick ${role} subscription${priceNotice} has expired. 
To continue enjoying full access to our professional network and tools, please re-activate your account.

You can log in and manage your subscription here:
${link}

Best regards,
The CenterKick Team`
    : `Hello ${profile.first_name || (role === 'athlete' ? 'Player' : role)} ${lastName}, 
  
An admin has invited you to join CenterKick as a ${role}. 
Your professional profile is ready and waiting for you!

Please use the link below to set your password and activate your account:
${link}

If the link above doesn't work, copy and paste this into your browser.

Best regards,
The CenterKick Team`;

  const res = await sendEmailNotification(email, subject, message);
  return res;
}

/**
 * Allows a user with 'unassigned' role to request account verification
 */
export async function requestVerification() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userRecord?.role !== 'unassigned') {
    return { success: false, error: "Verification can only be requested by unassigned accounts." };
  }

  const { error } = await supabase
    .from('users')
    .update({ is_verification_requested: true })
    .eq('id', user.id);

  if (error) {
    console.error('Error requesting verification:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
