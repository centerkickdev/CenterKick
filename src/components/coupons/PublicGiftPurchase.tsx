'use client';

import React, { useState } from 'react';
import { purchaseGiftVoucher } from '@/lib/actions/coupons';
import { Gift, CheckCircle, RefreshCw, Mail, Copy, Check } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface RolePlan {
  name: string;
  amount: string;
  frequency: string;
}

interface PublicGiftPurchaseProps {
  systemPlans: Record<string, RolePlan>;
  paymentSettings: any;
}

export default function PublicGiftPurchase({ systemPlans, paymentSettings = {} }: PublicGiftPurchaseProps) {
  const { showToast } = useToast();

  const paystackEnv = paymentSettings.paystackEnv || 'live';
  const paystackPublicKey = paystackEnv === 'test'
    ? (paymentSettings.paystackTestPublicKey || paymentSettings.paystackPublicKey)
    : (paymentSettings.paystackPublicKey || paymentSettings.paystackLivePublicKey);

  const stripeEnv = paymentSettings.stripeEnv || 'live';
  const stripePublicKey = stripeEnv === 'test'
    ? (paymentSettings.stripeTestPublicKey || paymentSettings.stripeKey)
    : (paymentSettings.stripeKey || paymentSettings.stripeLivePublicKey);

  const isPaystackActive = Boolean(paymentSettings.paystackActive && paystackPublicKey);
  const isStripeActive = Boolean(paymentSettings.stripeActive && stripePublicKey);
  const isLegacyLinkActive = Boolean(paymentSettings.legacyLinkActive && paymentSettings.paymentLink);

  // Default active route selection (Automated gateways only for Instant Voucher issuance)
  const [selectedGateway, setSelectedGateway] = useState<'PAYSTACK' | 'STRIPE' | 'LEGACY_LINK'>(() => {
    if (isPaystackActive) return 'PAYSTACK';
    if (isStripeActive) return 'STRIPE';
    if (isLegacyLinkActive) return 'LEGACY_LINK';
    return 'PAYSTACK';
  });

  const [copiedCode, setCopiedCode] = useState(false);

  // Load Paystack Inline script dynamically
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // All candidate roles in CenterKick
  const allRoleOptions = [
    { key: 'player', defaultName: 'Player Account' },
    { key: 'coach', defaultName: 'Coach Account' },
    { key: 'agent', defaultName: 'Agent Account' },
    { key: 'scout', defaultName: 'Scout Account' },
    { key: 'organization', defaultName: 'Organization Account' },
  ];

  // Filter out any account tiers configured as Free (amount === 0)
  const paidRoleOptions = allRoleOptions.filter((r) => {
    const planConfig = systemPlans[r.key];
    if (!planConfig) return false;
    const amountNum = Number(planConfig.amount || 0);
    return amountNum > 0;
  });

  // If no paid plans are configured (e.g. initial dev setup), fall back to showing all roles to prevent empty dropdown
  const activeRoleOptions = paidRoleOptions.length > 0 ? paidRoleOptions : allRoleOptions;

  // System Subscription Durations
  const durationOptions = [
    { value: 1, label: '1 Month' },
    { value: 3, label: '3 Months (Quarterly)' },
    { value: 6, label: '6 Months (Biannual)' },
    { value: 12, label: '12 Months (Yearly / Annual)' },
  ];

  const [selectedRole, setSelectedRole] = useState(activeRoleOptions[0]?.key || 'player');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'EMAIL' | 'MANUAL'>('EMAIL');
  const [loading, setLoading] = useState(false);
  const [completedVoucher, setCompletedVoucher] = useState<any>(null);

  // Dynamic Price & Duration Calculation based on real site_content payment settings
  const currentPlan = systemPlans[selectedRole] || { amount: '0', frequency: 'Yearly' };
  const baseRate = Number(currentPlan.amount || 0);

  // Determine system duration months for the plan
  let durationMonths = 12;
  const freq = currentPlan.frequency;
  if (freq === 'Monthly') durationMonths = 1;
  else if (freq === 'Quarterly') durationMonths = 3;
  else if (freq === 'Biannually' || freq === 'Biannual' || freq === 'Half-Year' || freq === 'Half-Yearly') durationMonths = 6;
  else if (freq === 'Yearly' || freq === 'Annually' || freq === 'Annual') durationMonths = 12;

  const calculateTotalPrice = () => {
    return baseRate;
  };

  const executeVoucherCreation = async (paymentRef: string) => {
    setLoading(true);
    showToast('Generating voucher code...', 'info');

    try {
      const res = await purchaseGiftVoucher({
        buyerName,
        buyerEmail,
        recipientEmail: deliveryMode === 'EMAIL' ? recipientEmail : undefined,
        giftMessage,
        targetTier: selectedRole.toUpperCase(),
        durationMonths,
        paymentReference: paymentRef,
      });

      if (res.success) {
        setCompletedVoucher(res.voucher);
        showToast('Gift voucher purchased and dispatched successfully!', 'success');
      } else {
        showToast('Failed to issue gift voucher after payment. Please contact support.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Error: ${err.message || 'An unexpected error occurred'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBuyerName = buyerName.trim();
    const cleanBuyerEmail = buyerEmail.trim().toLowerCase();
    const cleanRecipientEmail = recipientEmail.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanBuyerName || !cleanBuyerEmail) {
      showToast('Please enter your full name and a valid email address.', 'error');
      return;
    }

    if (!emailRegex.test(cleanBuyerEmail)) {
      showToast('Please enter a valid email address for yourself.', 'error');
      return;
    }

    if (deliveryMode === 'EMAIL') {
      if (!cleanRecipientEmail) {
        showToast("Please enter the recipient's email address.", 'error');
        return;
      }
      if (!emailRegex.test(cleanRecipientEmail)) {
        showToast("Please enter a valid recipient email address.", 'error');
        return;
      }
    }

    const totalAmount = calculateTotalPrice();

    // If total charge is zero (Free tier), issue voucher directly without payment
    if (totalAmount === 0) {
      await executeVoucherCreation(`FREE-GIFT-${Date.now()}`);
      return;
    }

    // 1. Paystack Checkout Route
    if (selectedGateway === 'PAYSTACK') {
      if (!paystackPublicKey) {
        showToast('Paystack gateway is not configured.', 'error');
        return;
      }
      const paystack = (window as any).PaystackPop;
      if (!paystack) {
        showToast('Paystack SDK loading. Please try again in a moment.', 'error');
        return;
      }

      setLoading(true);
      const ref = 'ck_gift_' + Math.floor(Math.random() * 1000000000 + 1);

      const handler = paystack.setup({
        key: paystackPublicKey,
        email: buyerEmail,
        amount: Math.round(totalAmount * 100), // Paystack expects kobo
        currency: 'NGN',
        ref,
        metadata: {
          custom_fields: [
            { display_name: 'Buyer Name', variable_name: 'buyer_name', value: buyerName },
            { display_name: 'Gift Tier', variable_name: 'gift_tier', value: selectedRole.toUpperCase() },
            { display_name: 'Duration Months', variable_name: 'duration_months', value: durationMonths },
          ]
        },
        callback: function (response: any) {
          executeVoucherCreation(response.reference || ref);
        },
        onClose: function () {
          setLoading(false);
          showToast('Payment cancelled. Gift voucher was not created.', 'error');
        }
      });
      handler.openIframe();
      return;
    }

    // 2. Stripe Checkout Route
    if (selectedGateway === 'STRIPE') {
      showToast('Redirecting to Stripe checkout...', 'info');
      // For Stripe, we can redirect or trigger checkout; if redirect link present:
      if (paymentSettings.paymentLink) {
        window.location.href = paymentSettings.paymentLink;
      } else {
        showToast('Stripe gateway session initialization unavailable.', 'error');
      }
      return;
    }

    // 3. External Legacy Link Route
    if (selectedGateway === 'LEGACY_LINK') {
      if (!paymentSettings.paymentLink) {
        showToast('External payment link not configured.', 'error');
        return;
      }
      window.open(paymentSettings.paymentLink, '_blank');
      showToast('Opened payment portal in new tab.', 'info');
      return;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white border border-gray-100 rounded-3xl shadow-2xl p-6 sm:p-10">

      {!completedVoucher ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Plan Selection */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">1. Choose Membership Plan</label>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Account Type</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#a20000] transition-all"
              >
                {activeRoleOptions.map((r) => {
                  const planConfig = systemPlans[r.key];
                  const labelName = planConfig?.name || r.defaultName;
                  const priceLabel = planConfig?.amount ? ` (₦${Number(planConfig.amount).toLocaleString()} - ${planConfig.frequency || 'Yearly'})` : '';
                  return (
                    <option key={r.key} value={r.key}>
                      {labelName}{priceLabel}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">2. Your Details</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Your Full Name"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#a20000] placeholder-gray-400"
              />
              <input
                type="email"
                required
                placeholder="Your Email Address"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#a20000] placeholder-gray-400"
              />
            </div>
          </div>

          {/* Delivery Mode Toggle */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">3. Delivery Method & Message</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMode('EMAIL')}
                className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all flex items-center gap-3 ${
                  deliveryMode === 'EMAIL'
                    ? 'bg-[#a20000]/5 border-[#a20000] text-[#a20000]'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Mail className="w-5 h-5 shrink-0" />
                <span>Email to Recipient Directly</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMode('MANUAL')}
                className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all flex items-center gap-3 ${
                  deliveryMode === 'MANUAL'
                    ? 'bg-[#a20000]/5 border-[#a20000] text-[#a20000]'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Gift className="w-5 h-5 shrink-0" />
                <span>Get Code to Share Myself</span>
              </button>
            </div>

            {deliveryMode === 'EMAIL' && (
              <input
                type="email"
                required
                placeholder="Recipient's Email Address"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#a20000] placeholder-gray-400 mt-3"
              />
            )}

            <textarea
              rows={3}
              placeholder="Add a personal gift note (optional)..."
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#a20000] placeholder-gray-400"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">4. Payment Option</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {isPaystackActive && (
                <button
                  type="button"
                  onClick={() => setSelectedGateway('PAYSTACK')}
                  className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all ${
                    selectedGateway === 'PAYSTACK'
                      ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-extrabold text-sm">Paystack</p>
                  <p className="text-[11px] font-normal text-gray-500 mt-0.5">Debit Card, Bank Transfer & USSD</p>
                </button>
              )}

              {isStripeActive && (
                <button
                  type="button"
                  onClick={() => setSelectedGateway('STRIPE')}
                  className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all ${
                    selectedGateway === 'STRIPE'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-extrabold text-sm">Stripe</p>
                  <p className="text-[11px] font-normal text-gray-500 mt-0.5">Credit / Debit Cards, Apple Pay & Google Pay</p>
                </button>
              )}

              {isLegacyLinkActive && (
                <button
                  type="button"
                  onClick={() => setSelectedGateway('LEGACY_LINK')}
                  className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all ${
                    selectedGateway === 'LEGACY_LINK'
                      ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-extrabold text-sm">Custom Payment Link</p>
                  <p className="text-[11px] font-normal text-gray-500 mt-0.5">Admin Payment Page</p>
                </button>
              )}
            </div>
          </div>

          {/* Checkout Total & Submit */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Amount</span>
              <p className="text-3xl font-black text-gray-900 mt-0.5">
                {baseRate === 0 ? 'Free' : `₦${calculateTotalPrice().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#a20000] hover:bg-black text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Pay Now'}
            </button>
          </div>
        </form>
      ) : (
        /* Voucher Success Confirmation Card */
        <div className="text-center py-8 space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-gray-900">Voucher Created!</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
              We sent a receipt to <span className="font-semibold text-gray-800">{buyerEmail}</span>.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200 inline-block text-center my-2 shadow-inner relative group">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Voucher Code</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-3xl font-black text-[#a20000] tracking-widest">
                {completedVoucher.code}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(completedVoucher.code);
                  setCopiedCode(true);
                  showToast('Voucher code copied to clipboard!', 'success');
                  setTimeout(() => setCopiedCode(false), 3000);
                }}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-[#a20000] hover:text-[#a20000] transition-all shadow-sm flex items-center gap-1 text-xs font-bold"
                title="Copy Voucher Code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            The recipient can enter this code at sign-up or on their account page to activate their membership.
          </p>

          <button
            onClick={() => setCompletedVoucher(null)}
            className="px-8 py-3 rounded-full border border-gray-300 text-gray-700 font-bold text-xs hover:border-[#a20000] hover:text-[#a20000] transition-all"
          >
            Buy Another Gift Voucher
          </button>
        </div>
      )}
    </div>
  );
}
