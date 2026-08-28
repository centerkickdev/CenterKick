import React from 'react';
import PublicGiftPurchase from '@/components/coupons/PublicGiftPurchase';

export const metadata = {
  title: 'Gift a Subscription | CenterKick',
  description: 'Sponsor an athlete, coach, or scout with a CenterKick digital gift voucher.',
};

export default function GiftPage() {
  return (
    <main className="min-h-screen bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
          CenterKick Gifting Portal
        </span>
        <h1 className="text-4xl font-extrabold text-white mt-4 tracking-tight sm:text-5xl">
          Empower Football Talent
        </h1>
        <p className="mt-3 text-base text-slate-400 max-w-xl mx-auto">
          Purchase a digital membership voucher for an athlete, coach, or scout. Instantly delivered via email or printable voucher.
        </p>
      </div>

      <PublicGiftPurchase />
    </main>
  );
}
