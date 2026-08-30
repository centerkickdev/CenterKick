'use client';

import React, { useState } from 'react';
import { CouponCode, ValidationResult, ResolutionMode } from '@/types/coupons';
import { validateCouponCode, redeemCouponCode } from '@/lib/actions/coupons';
import { CheckCircle2, AlertCircle, RefreshCw, ArrowUpRight, Clock, X } from 'lucide-react';

interface CouponRedeemerProps {
  userId?: string;
  userEmail?: string;
  onSuccess?: (result: any) => void;
  className?: string;
}

export default function CouponRedeemer({ userId, userEmail, onSuccess, className = '' }: CouponRedeemerProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);

  // Debounced real-time validation preview (Checks code status without auto-submitting/redeeming)
  React.useEffect(() => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 5) {
      setValidation(null);
      setErrorMsg(null);
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
              `You currently have an active ${res.active_subscription.tier} subscription that expires on ${res.active_subscription.formatted_expiry || 'the end of your billing cycle'}. You can redeem or stack this coupon code once your current running subscription ends.`
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
  }, [code, userId]);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    if (validation?.valid && validation.requires_resolution) {
      setShowResolutionModal(true);
      return;
    }

    if (validation?.valid && !validation.requires_resolution && userId) {
      await handleRedeem('DEFAULT');
    }
  };

  const handleRedeem = async (mode: ResolutionMode = 'DEFAULT') => {
    if (!userId || !userEmail || !validation?.coupon) {
      setErrorMsg('User authentication required to redeem code.');
      return;
    }

    setIsRedeeming(true);
    try {
      const res = await redeemCouponCode(code, userId, userEmail, mode);
      if (res.success) {
        setShowResolutionModal(false);
        if (onSuccess) onSuccess(res);
      } else {
        setErrorMsg(getHumanReadableError(res.error));
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
      default:
        return 'Unable to process coupon code. Please try again.';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Coupon Input Form */}
      <form onSubmit={handleValidate} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              const sanitized = e.target.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
              setCode(sanitized);
            }}
            placeholder="Enter Promo or Gift Code (e.g. CK-GIFT-8812)"
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#a20000] font-mono uppercase tracking-wider text-sm"
            disabled={isRedeeming}
          />
          {isValidating && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <RefreshCw className="w-4 h-4 text-red-400 animate-spin" />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isValidating || isRedeeming || !validation?.valid}
          className="px-6 py-3 rounded-xl bg-[#a20000] hover:bg-black text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-md"
        >
          {isRedeeming ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm & Claim'}
        </button>
      </form>

      {/* Validation Success Badge */}
      {validation?.valid && !validation.requires_resolution && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">{validation.coupon?.title}</p>
              <p className="text-xs text-emerald-400/80">
                ✓ 100% Covered • Tier: <span className="font-mono">{validation.coupon?.target_tier}</span> ({validation.coupon?.duration_months} Months)
              </p>
            </div>
          </div>
          {userId && (
            <button
              onClick={() => handleRedeem('DEFAULT')}
              disabled={isRedeeming}
              className="px-4 py-2 rounded-lg bg-[#a20000] text-white text-xs font-bold hover:bg-black transition-all flex items-center gap-1 shrink-0"
            >
              {isRedeeming ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Confirm & Claim'}
            </button>
          )}
        </div>
      )}

      {/* Error Message Display */}
      {errorMsg && (
        <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
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
