'use client';

import React, { useState } from 'react';
import { purchaseGiftVoucher } from '@/lib/actions/coupons';
import { Gift, CheckCircle, RefreshCw, Mail, User, ShieldCheck } from 'lucide-react';

export default function PublicGiftPurchase() {
  const [tier, setTier] = useState('STANDARD_PLAYER');
  const [duration, setDuration] = useState(12);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'EMAIL' | 'MANUAL'>('EMAIL');
  const [loading, setLoading] = useState(false);
  const [completedVoucher, setCompletedVoucher] = useState<any>(null);

  const calculatePrice = () => {
    const base = tier === 'STANDARD_PLAYER' ? 10 : 25;
    return base * duration;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail) return;

    setLoading(true);
    try {
      // Mock payment ref - in production, integrates with Stripe / Paystack checkout
      const mockPaymentRef = `PAY-GIFT-${Date.now()}`;
      const res = await purchaseGiftVoucher({
        buyerName,
        buyerEmail,
        recipientEmail: deliveryMode === 'EMAIL' ? recipientEmail : undefined,
        giftMessage,
        targetTier: tier,
        durationMonths: duration,
        paymentReference: mockPaymentRef,
      });

      if (res.success) {
        setCompletedVoucher(res.voucher);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Gift className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Gift CenterKick Subscription</h2>
          <p className="text-xs text-slate-400">Sponsor an athlete, coach, or scout with a digital gift voucher.</p>
        </div>
      </div>

      {!completedVoucher ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tier & Duration Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="STANDARD_PLAYER">Standard Player</option>
                <option value="PREMIUM_COACH">Premium Coach</option>
                <option value="ELITE_SCOUT">Elite Scout</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value={3}>3 Months Access</option>
                <option value={6}>6 Months Access</option>
                <option value={12}>12 Months (1 Year) Access</option>
              </select>
            </div>
          </div>

          {/* Buyer Information [USER B] */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" /> Buyer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Your Full Name"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-emerald-500 placeholder-slate-600"
              />
              <input
                type="email"
                required
                placeholder="Your Email Address"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-emerald-500 placeholder-slate-600"
              />
            </div>
          </div>

          {/* Delivery Mode Toggle */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" /> Voucher Delivery Option
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMode('EMAIL')}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                  deliveryMode === 'EMAIL'
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Send Direct Email to Recipient
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode('MANUAL')}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                  deliveryMode === 'MANUAL'
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                I will deliver code manually
              </button>
            </div>

            {deliveryMode === 'EMAIL' && (
              <input
                type="email"
                required
                placeholder="Recipient Email Address"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-emerald-500 placeholder-slate-600 mt-2"
              />
            )}

            <textarea
              rows={2}
              placeholder="Custom Gift Note (optional)"
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-emerald-500 placeholder-slate-600"
            />
          </div>

          {/* Checkout Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Total Price:</span>
              <p className="text-2xl font-bold text-emerald-400">€{calculatePrice()}.00</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Complete Gift Checkout'}
            </button>
          </div>
        </form>
      ) : (
        /* Voucher Success View */
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Gift Voucher Created Successfully!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            A confirmation receipt has been sent to <span className="text-slate-200">{buyerEmail}</span>.
          </p>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 inline-block font-mono text-xl text-emerald-400 font-bold tracking-widest my-4">
            {completedVoucher.code}
          </div>

          <p className="text-xs text-slate-500">
            Recipient can redeem this code directly at registration or in account settings.
          </p>
        </div>
      )}
    </div>
  );
}
