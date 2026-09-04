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

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mt-4 tracking-tight">
            Gift a Membership
          </h1>

          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Sponsor an athlete, coach, scout, or organization with a full CenterKick digital membership voucher.
          </p>

        </div>

        {/* Public Gift Purchase Form Component with system dynamic subscription plans & payment settings */}
        <PublicGiftPurchase systemPlans={systemPlans} paymentSettings={paymentSettings} />
      </main>

      {/* Official CenterKick Footer */}
      <Footer content={footerContent} settings={siteSettings} />
    </div>
  );
}
