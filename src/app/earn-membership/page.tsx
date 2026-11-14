import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getGlobalCMSData } from '@/lib/cms';
import { getEarnMembershipPageData } from './actions';
import EarnMembershipClient from '@/components/earn/EarnMembershipClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Earn Free Membership | CenterKick Task Rewards & Sponsorship',
  description: 'Complete promotional tasks, share CenterKick with your network, and earn 100% free subscription activation codes.',
};

export default async function EarnMembershipPage() {
  const [globalCms, earnData] = await Promise.all([
    getGlobalCMSData(),
    getEarnMembershipPageData(),
  ]);

  const { navContent, footerContent, siteSettings } = globalCms;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Official CenterKick Navbar */}
      <Navbar content={navContent} settings={siteSettings} />

      <main className="flex-1 pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8">
        <EarnMembershipClient
          tasks={earnData.tasks}
          userProfile={earnData.userProfile}
          userSubmissions={earnData.userSubmissions}
          isLoggedIn={earnData.isLoggedIn}
        />
      </main>

      {/* Official CenterKick Footer */}
      <Footer content={footerContent} settings={siteSettings} />
    </div>
  );
}
