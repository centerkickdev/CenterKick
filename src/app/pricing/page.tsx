import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getGlobalCMSData } from '@/lib/cms';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCachedData } from '@/lib/redis';
import { getLiveUsdNgnRate, convertNgnToUsd } from '@/lib/utils/currencyRate';
import {
  User,
  ShieldCheck,
  Zap,
  Gift,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Award,
  Briefcase,
  Sparkles
} from 'lucide-react';

export const revalidate = 300;

export const metadata = {
  title: 'Membership Pricing & Plans | CenterKick',
  description: 'Explore transparent membership pricing plans for players, coaches, scouts, agents, and organizations on CenterKick. Register your profile or gift a membership voucher today.',
};

export default async function PricingPage() {
  const adminSupabase = createAdminClient();

  const [globalCms, usdNgnRate, paymentSettings] = await Promise.all([
    getGlobalCMSData(),
    getLiveUsdNgnRate(),
    getCachedData('pricing_payment_settings', async () => {
      const { data: paymentContent } = await adminSupabase
        .from('site_content')
        .select('content')
        .eq('page', 'settings')
        .eq('section', 'payment')
        .single();
      return paymentContent?.content || {};
    }, 1800),
  ]);

  const systemPlans = paymentSettings.plans || {};

  const { navContent, footerContent, siteSettings } = globalCms;

  const rolesConfig = [
    {
      id: 'player',
      name: 'Player / Athlete',
      tagline: 'Showcase your talent to scouts & clubs worldwide',
      icon: User,
      badgeColor: 'bg-red-50 text-[#b50a0a] border-red-100',
      buttonBg: 'bg-[#b50a0a] hover:bg-red-800 text-white',
      defaultAmount: 50000,
      currency: 'NGN',
      duration: '6 Months',
      features: [
        'Verified Player Profile & Custom URL',
        'Video Highlights & Photo Gallery Showcase',
        'Physical & Technical Attributes Matrix',
        'Career Statistics & Match Logs',
        'Transfer History Tracking',
        'Direct Outreach & Scouting Visibility'
      ]
    },
    {
      id: 'coach',
      name: 'Coach',
      tagline: 'Build your managerial portfolio & tactical philosophy',
      icon: Award,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-100',
      buttonBg: 'bg-gray-900 hover:bg-black text-white',
      defaultAmount: 75000,
      currency: 'NGN',
      duration: '6 Months',
      features: [
        'Verified Coach Badge & Public Profile',
        'Managerial Record & Team Statistics',
        'Coaching Licenses & Accreditation Verification',
        'Tactical Formations & Coaching Specializations',
        'Career Achievements & Honors Listing',
        'Direct Networking with Clubs & Academies'
      ]
    },
    {
      id: 'scout',
      name: 'Scout',
      tagline: 'Discover emerging talent & manage scout reports',
      icon: ShieldCheck,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-100',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      defaultAmount: 100000,
      currency: 'NGN',
      duration: '6 Months',
      features: [
        'Verified Talent Scout Profile',
        'FA / Accreditation Badge Verification',
        'Past Discoveries Portfolio Showcase',
        'Advanced Search & Talent Filtering',
        'Scouting Methodologies & Regions',
        'Direct Athlete & Agency Contact'
      ]
    },
    {
      id: 'agent',
      name: 'Agent',
      tagline: 'Represent athletes & showcase your client roster',
      icon: Briefcase,
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-100',
      buttonBg: 'bg-gray-900 hover:bg-black text-white',
      defaultAmount: 120000,
      currency: 'NGN',
      duration: '6 Months',
      features: [
        'Verified Licensed Agent Badge',
        'Client Roster & Portfolio Showcase',
        'FIFA / FA License Registration Check',
        'Notable Transfer Transactions Record',
        'Regions of Operation Listing',
        'Direct Communication with Clubs & Scouts'
      ]
    },
    {
      id: 'organization',
      name: 'Club & Academy',
      tagline: 'Manage team roster, personnel & infrastructure',
      icon: Building2,
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-100',
      buttonBg: 'bg-[#b50a0a] hover:bg-red-800 text-white',
      defaultAmount: 150000,
      currency: 'NGN',
      duration: '6 Months',
      features: [
        'Official Club / Academy Profile Listing',
        'Key Personnel & Technical Staff Management',
        'Facilities & Infrastructure Showcase',
        'Trophies & Organization Honors',
        'Official Links & Social Channels',
        'Direct Recruitment & Scouting Exposure'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      tagline: 'A CV-style profile for any sports industry role',
      icon: Zap,
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-100',
      buttonBg: 'bg-gray-900 hover:bg-black text-white',
      defaultAmount: 75000,
      currency: 'NGN',
      duration: '6 Months',
      features: [
        'Verified Professional Profile & Custom URL',
        'Professional Experience, Qualifications & Achievements',
        'Downloadable ATS-Formatted CV with QR Code',
        'Media Center for Photos & Highlight Videos',
        'Open Profession Field for Any Sports Industry Role',
        'Direct Networking with Clubs, Academies & Agencies'
      ]
    }
  ];

  const getPlanPrices = (roleId: string, defaultConfig: any) => {
    const cmsPlan = systemPlans[roleId];
    let nairaAmount = defaultConfig.defaultAmount || 50000;

    if (cmsPlan && cmsPlan.amount !== undefined && cmsPlan.amount !== null) {
      nairaAmount = Number(cmsPlan.amount);
    }

    if (nairaAmount === 0) {
      return { usdText: 'Free', nairaText: 'Free' };
    }

    const usdText = convertNgnToUsd(nairaAmount, usdNgnRate);
    const nairaText = `₦${nairaAmount.toLocaleString('en-US')}`;

    return { usdText, nairaText };
  };

  const formatPlanDuration = (roleId: string, defaultConfig: any) => {
    const cmsPlan = systemPlans[roleId];
    if (cmsPlan) {
      if (cmsPlan.durationMonths) {
        return `${cmsPlan.durationMonths} ${Number(cmsPlan.durationMonths) === 1 ? 'Month' : 'Months'}`;
      }
      if (cmsPlan.billingPeriod) {
        return cmsPlan.billingPeriod;
      }
    }
    return defaultConfig.duration;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Official CenterKick Navbar */}
      <Navbar content={navContent} settings={siteSettings} />

      <main className="flex-1 pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Header Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#b50a0a] text-xs font-bold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" /> CenterKick Membership Plans
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
            Transparent Pricing for Every Football Role
          </h1>

          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Choose your membership plan to unlock full platform features, build your verified profile, or gift a membership voucher to an athlete or club.
          </p>

          {/* Top CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              id="cta-top-register"
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#b50a0a] hover:bg-red-800 text-white text-sm font-bold rounded-2xl transition-all shadow-md hover:shadow-lg"
            >
              Register Account <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              id="cta-top-gift"
              href="/gift"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-2xl transition-all shadow-md hover:shadow-lg"
            >
              <Gift className="w-4 h-4 text-amber-400" /> Gift a Membership
            </Link>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rolesConfig.map((role) => {
            const { usdText, nairaText } = getPlanPrices(role.id, role);
            const durationText = formatPlanDuration(role.id, role);
            const Icon = role.icon;

            return (
              <div
                key={role.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group p-6 sm:p-8"
              >
                <div>
                  {/* Top Header & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-900 group-hover:bg-[#b50a0a] group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${role.badgeColor}`}>
                      {role.name}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-1">{role.name}</h3>
                  <p className="text-xs font-medium text-gray-500 mb-6 leading-normal min-h-[36px]">{role.tagline}</p>

                  {/* Price Display */}
                  <div className="mb-6 p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-gray-900 tracking-tight">{usdText}</span>
                      <span className="text-xs font-bold text-gray-500">/ {durationText}</span>
                    </div>
                    {nairaText !== 'Free' && (
                      <p className="text-xs font-bold text-[#b50a0a] mt-1.5">
                        ~ {nairaText} <span className="text-[11px] font-normal text-gray-400">NGN</span>
                      </p>
                    )}
                    <p className="text-[11px] font-medium text-gray-400 mt-1">Full platform access during validity period</p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <p className="text-xs font-bold text-gray-900 tracking-wider uppercase">Included Features:</p>
                    <ul className="space-y-2.5">
                      {role.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs font-medium text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA Actions */}
                <div className="space-y-2.5 pt-4 border-t border-gray-50">
                  <Link
                    id={`cta-register-${role.id}`}
                    href={`/register?role=${role.id}`}
                    className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-sm ${role.buttonBg}`}
                  >
                    Register as {role.name.split('/')[0].trim()} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    id={`cta-gift-${role.id}`}
                    href={`/gift?role=${role.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-xl text-xs font-bold transition-colors border border-gray-200"
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-500" /> Gift {role.name.split('/')[0].trim()} Voucher
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Section */}
        <div className="max-w-5xl mx-auto mt-20 bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold tracking-wide uppercase mb-3">
              <Gift className="w-3.5 h-3.5" /> Sponsor an Athlete or Team
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
              Looking to Gift a CenterKick Membership?
            </h2>
            <p className="text-sm font-normal text-gray-300 leading-relaxed">
              Purchase digital gift vouchers for players, coaches, scouts, or clubs. Instant code delivery with easy 1-click redemption.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              id="cta-bottom-gift"
              href="/gift"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-gray-950 text-xs font-bold rounded-xl transition-all shadow-lg"
            >
              <Gift className="w-4 h-4" /> Gift a Voucher
            </Link>
            <Link
              id="cta-bottom-register"
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>

      {/* Official CenterKick Footer */}
      <Footer content={footerContent} settings={siteSettings} />
    </div>
  );
}
