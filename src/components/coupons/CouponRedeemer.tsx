'use client';

import React, { useState } from 'react';
import { CouponCode, ValidationResult, ResolutionMode } from '@/types/coupons';
import { validateCouponCode, redeemCouponCode } from '@/lib/actions/coupons';
import { CheckCircle2, AlertCircle, RefreshCw, ArrowUpRight, Clock, X } from 'lucide-react';

interface CouponRedeemerProps {
  userId?: string;
  userEmail?: string;
  isSubscribed?: boolean;
  subscriptionTier?: string;
  onSuccess?: (result: any) => void;
  onApplyPartialDiscount?: (coupon: CouponCode) => void;
  className?: string;
}

export default function CouponRedeemer({ userId, userEmail, isSubscribed, subscriptionTier, onSuccess, onApplyPartialDiscount, className = '' }: CouponRedeemerProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);

  // Initial check on mount: If user already has an active subscription, display proactive warning
  React.useEffect(() => {
    if (isSubscribed) {
      setErrorMsg(`Your account currently has an active ${subscriptionTier || 'professional'} subscription. Active subscribers cannot redeem voucher codes.`);
    }
  }, [isSubscribed, subscriptionTier]);

  // Debounced real-time validation preview (Checks code status without auto-submitting/redeeming)
  React.useEffect(() => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 5) {
      setValidation(null);
      if (!isSubscribed) setErrorMsg(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsValidating(true);
      setErrorMsg(null);
      try {
        const res = await validateCouponCode(cleanCode, userId);
        if (!res.valid) {
          setValidation(null);
          if (res.error === 'ACTIVE_SUBSCRIPTION_BLOCKED' && res.active_subscription) {
            setErrorMsg(
              `You currently have an active ${res.active_subscription.tier} subscription${res.active_subscription.formatted_expiry ? ` that expires on ${res.active_subscription.formatted_expiry}` : ''}. Active subscribers cannot redeem voucher codes.`
            );
          } else {
            setErrorMsg(getHumanReadableError(res.error));
          }
        } else {
          setValidation(res);
          setErrorMsg(null);
        }
      } catch (err) {
        setErrorMsg('Validation preview failed.');
      } finally {
        setIsValidating(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [code, userId, isSubscribed]);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubscribed) {
      setErrorMsg(`Your account currently has an active subscription and cannot redeem voucher codes.`);
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setIsValidating(true);
    setErrorMsg(null);
    try {
      const res = await validateCouponCode(cleanCode, userId);
      if (!res.valid) {
        setValidation(null);
        if (res.error === 'ACTIVE_SUBSCRIPTION_BLOCKED' && res.active_subscription) {
          setErrorMsg(
            `You currently have an active ${res.active_subscription.tier} subscription${res.active_subscription.formatted_expiry ? ` that expires on ${res.active_subscription.formatted_expiry}` : ''}. Active subscribers cannot redeem voucher codes.`
          );
        } else {
          setErrorMsg(getHumanReadableError(res.error));
        }
        setIsValidating(false);
        return;
      }
      
      setValidation(res);

      if (res.coupon) {
        const isPartial = res.coupon.coupon_type === 'PERCENTAGE' || res.coupon.coupon_type === 'FIXED_AMOUNT';
        if (isPartial && onApplyPartialDiscount) {
          onApplyPartialDiscount(res.coupon);
          return;
        }

        if (res.requires_resolution) {
          setShowResolutionModal(true);
          return;
        }

        if (userId) {
          await handleRedeem('DEFAULT', res.coupon.code);
        }
      }
    } catch (err) {
      setErrorMsg('Validation preview failed.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRedeem = async (mode: ResolutionMode = 'DEFAULT', overrideCode?: string) => {
    const codeToRedeem = overrideCode || code;
    if (!userId || !userEmail) {
      setErrorMsg('User authentication required to redeem code.');
      return;
    }

    setIsRedeeming(true);
    try {
      const res = await redeemCouponCode(codeToRedeem, userId, userEmail, mode);
      if (res.success) {
        setShowResolutionModal(false);
        if (onSuccess) onSuccess(res);
      } else {
        setErrorMsg(res.error ? (getHumanReadableError(res.error) !== 'Unable to process coupon code. Please try again.' ? getHumanReadableError(res.error) : res.error) : 'Unable to process coupon code. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Redemption error occurred.');
    } finally {
      setIsRedeeming(false);
    }
  };

  const getHumanReadableError = (errKey?: string) => {
    switch (errKey) {
      case 'INVALID_CODE':
        return 'Invalid coupon or voucher code. Please check and try again.';
      case 'CODE_UNAVAILABLE':
      case 'CODE_REDEEMED':
        return 'This coupon code has already been redeemed or is no longer available.';
      case 'CODE_EXPIRED':
        return 'This coupon code has expired.';
      case 'MAX_REDEMPTIONS_REACHED':
        return 'This code has reached its maximum redemption limit.';
      case 'CODE_REVOKED':
        return 'This coupon has been revoked.';
      case 'RESTRICTED_RECIPIENT_ONLY':
        return 'This voucher code is restricted exclusively to a specific account email.';
      case 'FREE_TIER_NO_REDEEM':
        return 'Your account tier cannot redeem coupon codes.';
      case 'ALREADY_REDEEMED_BY_USER':
        return 'Your account has already redeemed this specific coupon code.';
      case 'ACTIVE_SUBSCRIPTION_BLOCKED':
        return 'Your account currently has an active subscription and cannot redeem voucher codes at this time.';
      default:
        return 'Unable to process coupon code. Please try again.';
    }
  };

  const isClaimDisabled = Boolean(
    isSubscribed ||
    isValidating ||
    isRedeeming ||
    !code.trim() ||
    Boolean(errorMsg) ||
    (code.trim().length >= 5 && validation && !validation.valid)
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Coupon Input Form */}
      <form onSubmit={handleValidate} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
              setCode(sanitized);
            }}
            placeholder="Enter Promo or Gift Code (e.g. CK-GIFT-8812)"
            className="w-full px-5 py-3.5 rounded-2xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#b50a0a] font-mono uppercase tracking-wider text-sm shadow-inner transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isRedeeming || Boolean(isSubscribed)}
          />
          {isValidating && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs font-semibold text-gray-400">
              <RefreshCw className="w-4 h-4 text-[#b50a0a] animate-spin" />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isClaimDisabled}
          className="px-8 py-3.5 rounded-2xl bg-[#b50a0a] hover:bg-black text-white font-bold tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:bg-gray-800 disabled:text-gray-500 flex items-center justify-center gap-2 text-xs uppercase shadow-lg hover:-translate-y-0.5 shrink-0"
        >
          {isRedeeming ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : validation?.coupon?.coupon_type === 'PERCENTAGE' || validation?.coupon?.coupon_type === 'FIXED_AMOUNT' ? (
            'Apply & Checkout'
          ) : (
            'Claim'
          )}
        </button>
      </form>

      {/* Validation Success Badge - CenterKick Palette */}
      {validation?.valid && !validation.requires_resolution && (
        <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#b50a0a]/15 text-[#b50a0a] flex items-center justify-center shrink-0 border border-[#b50a0a]/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white tracking-tight">{validation.coupon?.title}</p>
                <span className="px-2.5 py-0.5 rounded-full bg-[#b50a0a]/20 text-red-400 text-[10px] font-extrabold uppercase tracking-wider border border-[#b50a0a]/30">Valid Voucher</span>
              </div>
              <p className="text-xs text-gray-300 font-medium mt-1">
                ✓ {validation.coupon?.coupon_type === 'PERCENTAGE'
                  ? `${validation.coupon.discount_value}% Off`
                  : validation.coupon?.coupon_type === 'FIXED_AMOUNT'
                  ? `₦${validation.coupon.discount_value?.toLocaleString()} Off`
                  : '100% Covered'} • Tier: <span className="font-bold text-white">{validation.coupon?.target_tier}</span> ({validation.coupon?.duration_months} Months Membership)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {errorMsg && (
        <div className="mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-900 font-bold shadow-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 text-[#b50a0a] shrink-0" />
          <span className="leading-snug">{errorMsg}</span>
        </div>
      )}

      {/* Interactive Resolution Modal [USER D] */}
      {showResolutionModal && validation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowResolutionModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Active Subscription Detected</h3>
                <p className="text-xs text-slate-400">
                  You already have an active plan ({validation.active_subscription?.tier}).
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-6">
              How would you like to apply your new code (<span className="font-mono text-emerald-400 font-semibold">{validation.coupon?.code}</span>)?
            </p>

            <div className="space-y-3">
              {/* Option 1: Upgrade Tier */}
              <button
                onClick={() => handleRedeem('UPGRADE')}
                disabled={isRedeeming}
                className="w-full p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white group-hover:text-emerald-400">
                    <ArrowUpRight className="w-4 h-4" />
                    Option 1: Upgrade Tier Immediately
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {validation.coupon?.target_tier}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Switch your account tier to {validation.coupon?.target_tier} starting today.
                </p>
              </button>

              {/* Option 2: Time Stacking */}
              <button
                onClick={() => handleRedeem('STACK')}
                disabled={isRedeeming}
                className="w-full p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white group-hover:text-emerald-400">
                    <Clock className="w-4 h-4" />
                    Option 2: Extend Subscription Duration (Stack Time)
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    +{validation.coupon?.duration_months} Months
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Keep your plan and extend your expiration date seamlessly.
                </p>
              </button>

              {/* Option 3: Keep Unclaimed */}
              <button
                onClick={() => setShowResolutionModal(false)}
                className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold text-center transition-all border border-slate-800"
              >
                Decline & Keep Code Unclaimed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
