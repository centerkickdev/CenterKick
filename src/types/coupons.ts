export type CouponType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL_MONTHS' | 'FULL_COVER';
export type CouponStatus = 'DRAFT' | 'AVAILABLE' | 'REDEEMED' | 'REVOKED' | 'EXPIRED';
export type PackageStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'EXPIRED' | 'ORG_INACTIVE' | 'CANCELLED';
export type SubscriptionStatusType = 'ACTIVE' | 'SPONSORED' | 'GIFT_COVERED' | 'TRIALING' | 'EXPIRED' | 'CANCELLED';
export type ResolutionMode = 'DEFAULT' | 'UPGRADE' | 'STACK';

export interface OrgSponsorshipPackage {
  id: string;
  org_id: string;
  title: string;
  plan_tier: string;
  total_seats: number;
  claimed_seats: number;
  unit_price: number;
  currency: string;
  status: PackageStatus;
  payment_reference?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export interface CouponCode {
  id: string;
  code: string;
  title: string;
  coupon_type: CouponType;
  discount_value: number;
  currency: string;
  duration_months: number;
  target_tier: string;
  target_role?: string;
  max_redemptions: number;
  redemption_count: number;
  status: CouponStatus;
  package_id?: string;
  buyer_id?: string;
  buyer_email?: string;
  buyer_name?: string;
  recipient_email?: string;
  gift_message?: string;
  is_gift: boolean;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CouponRedemption {
  id: string;
  coupon_code_id: string;
  redeemer_id: string;
  redeemer_email: string;
  resolution_mode: ResolutionMode;
  previous_tier?: string;
  new_tier?: string;
  redeemed_at: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  coupon?: CouponCode;
  requires_resolution?: boolean;
  active_subscription?: {
    tier: string;
    valid_until?: string;
  };
}

/**
 * Generate a high-entropy, human-friendly coupon code string
 * Example: CK-ORG-9X2M-K84P or CK-GIFT-77A2-99BL
 */
export function generateCouponCodePrefix(prefix: 'ORG' | 'GIFT' | 'PROMO' = 'PROMO'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excludes 0, O, 1, I to prevent confusion
  const generateSegment = (length: number) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  return `CK-${prefix}-${generateSegment(4)}-${generateSegment(4)}`;
}
