'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendEmailNotification } from '../notifications/actions';
import { sanitizeString } from '@/lib/sanitize';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://centerkick.com';

async function verifyStaffAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const role = user.app_metadata?.role;
  const staffRoles = ['superadmin', 'admin', 'operations', 'finance'];
  if (!role || !staffRoles.includes(role)) {
    throw new Error('Insufficient permissions');
  }
  return user;
}

// 1. Transaction Manual Renewal / Payments Approval
export async function approvePaymentTransaction(transactionId: string, reason: string = '') {
  await verifyStaffAccess();
  const admin = createAdminClient();
  const safeReason = sanitizeString(reason);

  // Fetch transaction details with profile info
  const { data: tx, error: txError } = await admin
    .from('transactions')
    .select('*, profiles(*)')
    .eq('id', transactionId)
    .single();

  if (txError || !tx) return { success: false, error: txError?.message || 'Transaction not found' };

  // Confirm the transaction and activate the profile/subscription
  const updates = [
    admin.from('transactions').update({ 
      status: 'confirmed', 
      updated_at: new Date().toISOString(),
      metadata: {
        ...(typeof tx.metadata === 'object' && tx.metadata !== null ? tx.metadata : {}),
        approval_comment: safeReason
      }
    }).eq('id', transactionId)
  ];

  if (tx.user_id) {
    updates.push(
      admin.from('profiles').update({ status: 'active', is_subscribed: true }).eq('id', tx.user_id)
    );
    if (tx.profiles?.user_id) {
      updates.push(
        admin.from('users').update({ is_active: true }).eq('id', tx.profiles.user_id)
      );
      // Execute the subscription upsert separately to avoid TS type instantiation issues with mixed query builders
      await admin.from('subscriptions').upsert({
        user_id: tx.profiles.user_id,
        plan_name: tx.metadata?.plan || 'Professional',
        status: 'active',
        gateway: tx.method,
        external_id: tx.reference,
        updated_at: new Date().toISOString()
      });
    }
  }

  const results = await Promise.all(updates);
  const err = results.find(r => r.error);
  if (err) return { success: false, error: err.error?.message };

  // Send Email Notification
  const email = tx.profiles?.email || tx.profiles?.users?.email;
  if (email) {
    const firstName = tx.profiles?.first_name || 'Member';
    const emailBody = `Hello ${firstName},

Your manual bank transfer subscription payment has been successfully confirmed and approved by our finance team.

Payment Details:
- Amount: ${tx.amount} ${tx.currency}
- Reference: ${tx.reference}

Admin Message:
${safeReason || 'Your payment has been successfully verified. Your account is now fully active.'}

Your premium subscription is now active! You can now log in and explore full platform access.

Important: Please refresh your browser page to see the updated status.

Best regards,
The CenterKick Team`;

    await sendEmailNotification(email, "CenterKick - Subscription Payment Confirmed!", emailBody);
  }

  revalidatePath('/admin/approvals');
  return { success: true };
}

export async function rejectPaymentTransaction(transactionId: string, reason: string = '') {
  await verifyStaffAccess();
  const admin = createAdminClient();
  const safeReason = sanitizeString(reason);

  const { data: tx, error: txError } = await admin
    .from('transactions')
    .select('*, profiles(*)')
    .eq('id', transactionId)
    .single();

  if (txError || !tx) return { success: false, error: 'Transaction not found' };

  const { error } = await admin
    .from('transactions')
    .update({ 
      status: 'failed', 
      updated_at: new Date().toISOString(),
      metadata: {
        ...(typeof tx.metadata === 'object' && tx.metadata !== null ? tx.metadata : {}),
        rejection_reason: safeReason
      }
    })
    .eq('id', transactionId);

  if (error) return { success: false, error: error.message };

  if (tx.user_id) {
    await admin.from('profiles').update({ 
      verification_requested: false,
      payment_reference: null
    }).eq('id', tx.user_id);
  }

  // Send Email Notification
  const email = tx.profiles?.email || tx.profiles?.users?.email;
  if (email) {
    const firstName = tx.profiles?.first_name || 'Member';
    const emailBody = `Hello ${firstName},

We were unable to verify your manual bank transfer subscription payment on CenterKick.

Payment Reference: ${tx.reference}

Reason for Rejection:
${safeReason || 'No valid proof of payment was identified.'}

Please upload a valid receipt or contact our support team to resolve this issue.

Best regards,
The CenterKick Team`;

    await sendEmailNotification(email, "CenterKick - Payment Verification Update", emailBody);
  }

  revalidatePath('/admin/approvals');
  return { success: true };
}

// 2. Profile Update approvals
export async function approveProfileEdit(editId: string, reason: string = '') {
  await verifyStaffAccess();
  const admin = createAdminClient();
  const safeReason = sanitizeString(reason);

  // Get edit details
  const { data: edit, error: editError } = await admin
    .from('profile_edits')
    .select('*, profiles(*)')
    .eq('id', editId)
    .single();

  if (editError || !edit) return { success: false, error: editError?.message || 'Edit request not found' };

  // Update profile field and set edit status to approved
  const [profileResult, editResult] = await Promise.all([
    admin.from('profiles').update({ [edit.field_name]: edit.new_value }).eq('id', edit.profile_id),
    admin.from('profile_edits').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', editId)
  ]);

  if (profileResult.error) return { success: false, error: profileResult.error.message };
  if (editResult.error) return { success: false, error: editResult.error.message };

  // Send Email Notification
  const email = edit.profiles?.email;
  if (email) {
    const firstName = edit.profiles?.first_name || 'Member';
    const fieldLabel = edit.field_name.split('_').map((w: string) => w.toUpperCase()).join(' ');
    
    const emailBody = `Hello ${firstName},

Your proposed profile change request has been reviewed and approved by our moderation team.

Update Details:
- Field: ${fieldLabel}
- New Value: ${edit.new_value}

Admin Remarks:
${safeReason || 'Your update complies with platform guidelines and has been applied.'}

This change is now live on your directory profile.

Best regards,
The CenterKick Team`;

    await sendEmailNotification(email, "CenterKick - Profile Change Approved", emailBody);
  }

  revalidatePath('/admin/approvals');
  return { success: true };
}

export async function rejectProfileEdit(editId: string, reason: string = '') {
  await verifyStaffAccess();
  const admin = createAdminClient();
  const safeReason = sanitizeString(reason);

  const { data: edit, error: editError } = await admin
    .from('profile_edits')
    .select('*, profiles(*)')
    .eq('id', editId)
    .single();

  if (editError || !edit) return { success: false, error: 'Edit request not found' };

  const { error } = await admin
    .from('profile_edits')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', editId);

  if (error) return { success: false, error: error.message };

  // Send Email Notification
  const email = edit.profiles?.email;
  if (email) {
    const firstName = edit.profiles?.first_name || 'Member';
    const fieldLabel = edit.field_name.split('_').map((w: string) => w.toUpperCase()).join(' ');

    const emailBody = `Hello ${firstName},

We have reviewed your proposed profile change request and it has been declined by our moderation team.

Update Details:
- Field: ${fieldLabel}
- Proposed Value: ${edit.new_value}

Reason for Rejection:
${safeReason || 'The proposed change does not comply with our verification guidelines.'}

No edits have been applied to your active directory profile.

Best regards,
The CenterKick Team`;

    await sendEmailNotification(email, "CenterKick - Profile Change Update", emailBody);
  }

  revalidatePath('/admin/approvals');
  return { success: true };
}



// 4. Staff/Admin Verification approvals
export async function approveStaffVerification(userId: string, targetRole: string, reason: string = '') {
  await verifyStaffAccess();
  const admin = createAdminClient();
  const safeReason = sanitizeString(reason);

  const { data: userRecord, error: userError } = await admin
    .from('users')
    .select('*, profiles(*)')
    .eq('id', userId)
    .single();

  if (userError || !userRecord) return { success: false, error: 'User not found' };

  const { error } = await admin
    .from('users')
    .update({ 
      role: targetRole, 
      is_active: true, 
      is_verification_requested: false 
    })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };

  // Send Email Notification
  const email = userRecord.email;
  if (email) {
    const firstName = userRecord.profiles?.first_name || 'Staff Member';
    const roleLabel = targetRole.toUpperCase();
    const emailBody = `Hello ${firstName},

Your request for administrative/staff permission on CenterKick has been approved!

Assigned Role: ${roleLabel}

Admin Remarks:
${safeReason || 'Welcome to the staff team. Your permissions are now active.'}

You can now log in and access your administrative tools at:
${SITE_URL}/admin

Best regards,
The CenterKick Team`;

    await sendEmailNotification(email, "CenterKick - Staff Access Approved!", emailBody);
  }

  revalidatePath('/admin/approvals');
  return { success: true };
}

export async function rejectStaffVerification(userId: string, reason: string = '') {
  await verifyStaffAccess();
  const admin = createAdminClient();
  const safeReason = sanitizeString(reason);

  const { data: userRecord, error: userError } = await admin
    .from('users')
    .select('*, profiles(*)')
    .eq('id', userId)
    .single();

  if (userError || !userRecord) return { success: false, error: 'User not found' };

  const { error } = await admin
    .from('users')
    .update({ 
      is_verification_requested: false,
      is_active: false
    })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };

  // Send Email Notification
  const email = userRecord.email;
  if (email) {
    const firstName = userRecord.profiles?.first_name || 'Staff Member';
    const emailBody = `Hello ${firstName},

Your request for administrative staff privileges on CenterKick has been declined.

Reason for Rejection:
${safeReason || 'The request does not meet our administrative enrollment criteria.'}

If you believe this was an error, please reach out to the system administrator.

Best regards,
The CenterKick Team`;

    await sendEmailNotification(email, "CenterKick - Staff Request Status", emailBody);
  }

  revalidatePath('/admin/approvals');
  return { success: true };
}
