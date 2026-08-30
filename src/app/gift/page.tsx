import React from 'react';
import PublicGiftPurchase from '@/components/coupons/PublicGiftPurchase';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getGlobalCMSData } from '@/app/admin/manage-ui/actions';
import { createClient } from '@/lib/supabase/server';
import { Gift, ShieldCheck, Zap } from 'lucide-react';

export const metadata = {
  title: 'Gift a Membership | CenterKick',
  description: 'Sponsor an athlete, coach, scout, or organization with an official CenterKick digital gift membership voucher.',
};

export default async function GiftPage() {
  const [globalCms, supabase] = await Promise.all([
    getGlobalCMSData(),
    createClient(),
  ]);

  // Fetch real payment and subscription registry plans from site_content
  const { data: paymentContent } = await supabase
    .from('site_content')
    .select('content')
    .eq('page', 'settings')
    .eq('section', 'payment')
    .single();

  const paymentSettings = paymentContent?.content || {};
  const systemPlans = paymentSettings.plans || {};

  const paystackEnv = paymentSettings.paystackEnv || 'live';
  const paystackPublicKey = paystackEnv === 'test'
    ? (paymentSettings.paystackTestPublicKey || paymentSettings.paystackPublicKey)
    : (paymentSettings.paystackPublicKey || paymentSettings.paystackLivePublicKey);

  const { navContent, footerContent, siteSettings } = globalCms;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Official CenterKick Navbar */}
      <Navbar content={navContent} settings={siteSettings} />

      {/* Main Content Hero */}
      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a20000]/10 text-[#a20000] border border-[#a20000]/20 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5" /> CenterKick Gifting Portal
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mt-4 tracking-tight">
            Sponsor Football Talent
          </h1>

          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Give the gift of visibility. Sponsor an athlete, coach, scout, or organization with a full CenterKick digital membership voucher.
          </p>

          {/* Key Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs font-bold text-gray-500">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#a20000]" /> Instant Email Delivery</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-[#a20000]" /> Zero Expiration Rush</span>
            <span className="flex items-center gap-1.5"><Gift className="w-4 h-4 text-[#a20000]" /> Official Membership Certificate</span>
          </div>
        </div>

        {/* Public Gift Purchase Form Component with system dynamic subscription plans & payment settings */}
        <PublicGiftPurchase systemPlans={systemPlans} paymentSettings={paymentSettings} />
      </main>

      {/* Official CenterKick Footer */}
      <Footer content={footerContent} settings={siteSettings} />
    </div>
  );
}
