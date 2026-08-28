'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { generateCouponCodePrefix } from '@/types/coupons';

/**
 * Fetch all coupon codes for admin dashboard
 */
export async function getAdminCoupons() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('coupon_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin coupons:', error);
    return { success: false, coupons: [], error: error.message };
  }

  return { success: true, coupons: data || [] };
}

/**
 * Create a new promotional / discount coupon code
 */
export async function createAdminCoupon(formData: {
  code?: string;
  title: string;
  couponType: 'FULL_COVER' | 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  durationMonths: number;
  targetTier: string;
  maxRedemptions: number;
  expiryDate?: string;
}) {
  const supabase = createAdminClient();

  const code = formData.code ? formData.code.trim().toUpperCase() : generateCouponCodePrefix('PROMO');

  // Check uniqueness
  const { data: existing } = await supabase
    .from('coupon_codes')
    .select('id')
    .eq('code', code)
    .maybeSingle();

  if (existing) {
    return { success: false, error: 'Coupon code already exists.' };
  }

  const { data: coupon, error } = await supabase
    .from('coupon_codes')
    .insert({
      code,
      title: formData.title,
      coupon_type: formData.couponType,
      discount_value: formData.discountValue,
      duration_months: formData.durationMonths,
      target_tier: formData.targetTier,
      max_redemptions: formData.maxRedemptions,
      redemption_count: 0,
      expiry_date: formData.expiryDate || null,
      status: 'AVAILABLE',
      is_gift: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating coupon:', error);
    return { success: false, error: error.message };
  }

  // Audit log
  await supabase.from('coupon_audit_logs').insert({
    actor_email: 'ADMIN',
    action: 'CREATED',
    target_id: coupon.id,
    target_type: 'COUPON_CODE',
    metadata: { code, title: formData.title },
  });

  revalidatePath('/admin/coupons');
  return { success: true, coupon };
}

/**
 * Toggle Revoke / Activate Status of a Coupon
 */
export async function toggleCouponStatus(couponId: string, currentStatus: string) {
  const supabase = createAdminClient();
  const newStatus = currentStatus === 'AVAILABLE' ? 'REVOKED' : 'AVAILABLE';

  const { error } = await supabase
    .from('coupon_codes')
    .update({ status: newStatus })
    .eq('id', couponId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Audit Log
  await supabase.from('coupon_audit_logs').insert({
    actor_email: 'ADMIN',
    action: newStatus === 'REVOKED' ? 'REVOKED' : 'UPDATED',
    target_id: couponId,
    target_type: 'COUPON_CODE',
    metadata: { status: newStatus },
  });

  revalidatePath('/admin/coupons');
  return { success: true, newStatus };
}

/**
 * Fetch Velocity Logs & Security Audit Trail
 */
export async function getCouponSecurityLogs() {
  const supabase = createAdminClient();

  const [{ data: auditLogs }, { data: velocityLogs }] = await Promise.all([
    supabase
      .from('coupon_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('coupon_velocity_logs')
      .select('*')
      .order('attempted_at', { ascending: false })
      .limit(50),
  ]);

  return {
    auditLogs: auditLogs || [],
    velocityLogs: velocityLogs || [],
  };
}
