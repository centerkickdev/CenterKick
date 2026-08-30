'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CouponCode, ValidationResult, ResolutionMode, generateCouponCodePrefix } from '@/types/coupons';
import { sendGiftVoucherEmail, sendGiftReceiptToBuyerEmail } from '@/lib/resend';
import { redis } from '@/lib/redis';
import { revalidatePath } from 'next/cache';

/**
 * Validate a coupon code for redemption, checking rate limits and user eligibility
 */
export async function validateCouponCode(
  code: string,
  userId?: string,
  userIp: string = '127.0.0.1'
): Promise<ValidationResult> {
  const adminClient = createAdminClient();
  const cleanCode = code.trim().toUpperCase();

  if (!cleanCode) {
    return { valid: false, error: 'INVALID_CODE' };
  }

  // 1. Fetch Coupon Record using adminClient to bypass RLS policies on coupon_codes
  const { data: coupon, error } = await adminClient
    .from('coupon_codes')
    .select('*')
    .ilike('code', cleanCode)
    .maybeSingle();

  if (error || !coupon) {
    // Log failed attempt for rate limiting / velocity tracking
    await adminClient.from('coupon_velocity_logs').insert({
      ip_address: userIp,
      user_id: userId || null,
      attempted_code: cleanCode,
      is_success: false,
      error_reason: 'INVALID_CODE',
    });
    return { valid: false, error: 'INVALID_CODE' };
  }

  // 2. Check Expiry and Status
  if (coupon.status !== 'AVAILABLE') {
    return { valid: false, error: `CODE_${coupon.status}` };
  }

  if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
    // Auto-expire
    await adminClient.from('coupon_codes').update({ status: 'EXPIRED' }).eq('id', coupon.id);
    return { valid: false, error: 'CODE_EXPIRED' };
  }

  if (coupon.redemption_count >= coupon.max_redemptions) {
    return { valid: false, error: 'MAX_REDEMPTIONS_REACHED' };
  }

  // Fetch Redeemer Profile safely matching either profile.id OR profile.user_id
  let redeemerProfile: any = null;
  if (userId) {
    const { data: pById } = await adminClient
      .from('profiles')
      .select('id, user_id, email, is_subscribed')
      .eq('id', userId)
      .maybeSingle();

    if (pById) {
      redeemerProfile = pById;
    } else {
      const { data: pByUserId } = await adminClient
        .from('profiles')
        .select('id, user_id, email, is_subscribed')
        .eq('user_id', userId)
        .maybeSingle();
      redeemerProfile = pByUserId;
    }
  }

  // Check Restricted User Email(s)
  if (coupon.recipient_email && userId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const redeemerEmail = (redeemerProfile?.email || user?.email || '').toLowerCase().trim();
    const restrictedEmails = coupon.recipient_email
      .split(',')
      .map((e: string) => e.toLowerCase().trim());

    if (redeemerEmail && !restrictedEmails.includes(redeemerEmail)) {
      return { valid: false, error: 'RESTRICTED_RECIPIENT_ONLY' };
    }
  }

  // 3. Block Redemption if User has Active Subscription
  if (redeemerProfile && redeemerProfile.subscription_status) {
    if (
      ['ACTIVE', 'SPONSORED', 'GIFT_COVERED'].includes(redeemerProfile.subscription_status) &&
      redeemerProfile.valid_until &&
      new Date(redeemerProfile.valid_until) > new Date()
    ) {
      const formattedExpiry = new Date(redeemerProfile.valid_until).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      return {
        valid: false,
        error: 'ACTIVE_SUBSCRIPTION_BLOCKED',
        active_subscription: {
          tier: redeemerProfile.subscription_tier || 'FREE',
          valid_until: redeemerProfile.valid_until,
          formatted_expiry: formattedExpiry,
        },
      };
    }
  }

  // Log successful validation attempt
  await adminClient.from('coupon_velocity_logs').insert({
    ip_address: userIp,
    user_id: userId || null,
    attempted_code: cleanCode,
    is_success: true,
  });

  return {
    valid: true,
    coupon: coupon as CouponCode,
  };
}

/**
 * Execute Atomic Coupon Redemption via PostgreSQL function
 */
export async function redeemCouponCode(
  code: string,
  userId: string,
  userEmail: string,
  resolutionMode: ResolutionMode = 'DEFAULT'
) {
  const adminClient = createAdminClient();
  const cleanCode = code.trim().toUpperCase();

  // Ensure p_user_id refers to profiles.id for foreign key constraints
  let targetProfileId = userId;
  const { data: prof } = await adminClient
    .from('profiles')
    .select('id')
    .or(`id.eq.${userId},user_id.eq.${userId}`)
    .maybeSingle();

  if (prof) {
    targetProfileId = prof.id;
  }

  const { data, error } = await adminClient.rpc('redeem_coupon_code', {
    p_code: cleanCode,
    p_user_id: targetProfileId,
    p_user_email: userEmail,
    p_resolution_mode: resolutionMode,
  });

  if (error) {
    console.error('RPC redeem_coupon_code error:', error);

    // Fallback: If RPC fails due to missing valid_until in legacy schema or function mismatch
    if (error.message?.includes('valid_until') || error.message?.includes('v_user_profile')) {
      // 1. Fetch Coupon
      const { data: coupon } = await adminClient
        .from('coupon_codes')
        .select('*')
        .ilike('code', cleanCode)
        .maybeSingle();

      if (!coupon || coupon.status !== 'AVAILABLE') {
        return { success: false, error: 'CODE_UNAVAILABLE' };
      }

      // 2. Increment redemption count
      const newCount = (coupon.redemption_count || 0) + 1;
      const newStatus = newCount >= coupon.max_redemptions ? 'REDEEMED' : 'AVAILABLE';
      await adminClient
        .from('coupon_codes')
        .update({ redemption_count: newCount, status: newStatus })
        .eq('id', coupon.id);

      // 3. Update user profile entitlement safely
      const durationMs = (coupon.duration_months || 12) * 30 * 24 * 60 * 60 * 1000;
      const newExpiryDate = new Date(Date.now() + durationMs).toISOString();

      await adminClient
        .from('profiles')
        .update({
          is_subscribed: true,
          subscription_status: 'SPONSORED',
          subscription_tier: coupon.target_tier,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetProfileId);

      // Log redemption
      await adminClient.from('coupon_redemptions').insert({
        coupon_code_id: coupon.id,
        redeemer_id: targetProfileId,
        redeemer_email: userEmail,
        resolution_mode: resolutionMode,
        previous_tier: 'FREE',
        new_tier: coupon.target_tier,
        redeemed_at: new Date().toISOString(),
      });

      // Clear Redis cache for instant live UI reflection
      try {
        await redis.del(`user:profile:${userId}`);
        if (targetProfileId !== userId) {
          await redis.del(`user:profile:${targetProfileId}`);
        }
      } catch (err) {
        console.warn('Redis cache clear error:', err);
      }

      revalidatePath('/dashboard');
      revalidatePath('/dashboard/subscription');

      return {
        success: true,
        code_id: coupon.id,
        target_tier: coupon.target_tier,
        valid_until: newExpiryDate,
      };
    }

    return { success: false, error: error.message || 'REDEMPTION_FAILED' };
  }

  // Clear Redis cache for instant live UI reflection on RPC success path
  try {
    await redis.del(`user:profile:${userId}`);
    if (targetProfileId !== userId) {
      await redis.del(`user:profile:${targetProfileId}`);
    }
  } catch (err) {
    console.warn('Redis cache clear error:', err);
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/subscription');

  return data;
}

/**
 * Purchase Gift Voucher (Public Frontend Gifter)
 */
export async function purchaseGiftVoucher(params: {
  buyerName: string;
  buyerEmail: string;
  recipientEmail?: string;
  giftMessage?: string;
  targetTier: string;
  durationMonths: number;
  paymentReference: string;
}) {
  const adminClient = createAdminClient();
  const code = generateCouponCodePrefix('GIFT');

  const { data: voucher, error } = await adminClient
    .from('coupon_codes')
    .insert({
      code,
      title: `Gift Voucher for ${params.targetTier}`,
      coupon_type: 'FULL_COVER',
      discount_value: 100.00,
      duration_months: params.durationMonths,
      target_tier: params.targetTier,
      max_redemptions: 1,
      redemption_count: 0,
      status: 'AVAILABLE',
      buyer_name: params.buyerName,
      buyer_email: params.buyerEmail,
      recipient_email: params.recipientEmail || null,
      gift_message: params.giftMessage || null,
      is_gift: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error purchasing gift voucher:', error);
    return { success: false, error: 'VOUCHER_CREATION_FAILED' };
  }

  // Dispatch Email to recipient if provided
  if (params.recipientEmail) {
    try {
      await sendGiftVoucherEmail({
        recipientEmail: params.recipientEmail,
        buyerName: params.buyerName,
        code,
        targetTier: params.targetTier,
        durationMonths: params.durationMonths,
        giftMessage: params.giftMessage,
      });
    } catch (e) {
      console.error('Failed to send gift voucher email to recipient:', e);
    }
  }

  // Dispatch Confirmation Receipt to Buyer
  if (params.buyerEmail) {
    try {
      await sendGiftReceiptToBuyerEmail({
        buyerEmail: params.buyerEmail,
        buyerName: params.buyerName,
        code,
        targetTier: params.targetTier,
        durationMonths: params.durationMonths,
        recipientEmail: params.recipientEmail,
        paymentReference: params.paymentReference,
      });
    } catch (e) {
      console.error('Failed to send buyer gift receipt email:', e);
    }
  }

  // Audit Trail Log
  await adminClient.from('coupon_audit_logs').insert({
    actor_email: params.buyerEmail,
    action: 'CREATED',
    target_id: voucher.id,
    target_type: 'COUPON_CODE',
    metadata: { is_gift: true, recipient: params.recipientEmail, payment_ref: params.paymentReference },
  });

  return { success: true, voucher };
}

/**
 * Purchase Bulk Sponsorship Package (Org Manager)
 */
export async function purchaseOrgSponsorshipPackage(params: {
  orgId: string;
  title: string;
  planTier: string;
  totalSeats: number;
  unitPrice: number;
  currency: string;
  paymentReference: string;
}) {
  const adminClient = createAdminClient();

  // 1. Create Package Record
  const { data: pkg, error: pkgErr } = await adminClient
    .from('org_sponsorship_packages')
    .insert({
      org_id: params.orgId,
      title: params.title,
      plan_tier: params.planTier,
      total_seats: params.totalSeats,
      unit_price: params.unitPrice,
      currency: params.currency,
      status: 'ACTIVE',
      payment_reference: params.paymentReference,
    })
    .select()
    .single();

  if (pkgErr || !pkg) {
    console.error('Package purchase error:', pkgErr);
    return { success: false, error: 'PACKAGE_CREATION_FAILED' };
  }

  // 2. Generate Seat Codes
  const codesToInsert = [];
  for (let i = 0; i < params.totalSeats; i++) {
    codesToInsert.push({
      code: generateCouponCodePrefix('ORG'),
      title: `${params.title} - Seat ${i + 1}`,
      coupon_type: 'FULL_COVER' as const,
      discount_value: 100.00,
      duration_months: 12,
      target_tier: params.planTier,
      max_redemptions: 1,
      status: 'AVAILABLE' as const,
      package_id: pkg.id,
      buyer_id: params.orgId,
      is_gift: false,
    });
  }

  const { error: codeErr } = await adminClient.from('coupon_codes').insert(codesToInsert);

  if (codeErr) {
    console.error('Error generating seat codes:', codeErr);
    return { success: false, error: 'SEAT_CODES_GENERATION_FAILED' };
  }

  // Audit Log
  await adminClient.from('coupon_audit_logs').insert({
    actor_id: params.orgId,
    action: 'CREATED',
    target_id: pkg.id,
    target_type: 'PACKAGE',
    metadata: { seats: params.totalSeats, tier: params.planTier },
  });

  return { success: true, package: pkg };
}
