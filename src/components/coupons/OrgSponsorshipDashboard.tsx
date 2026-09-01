'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { purchaseOrgSponsorshipPackage } from '@/lib/actions/coupons';
import { sendOrgSponsorshipInviteEmail } from '@/lib/resend';
import { Users, RefreshCw, Mail, Download, Search, ChevronLeft, ChevronRight, Award, Plus, CreditCard, History } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface OrgSponsorshipDashboardProps {
  orgId: string;
  orgName: string;
  userEmail?: string;
  existingPackages?: any[];
  existingCodes?: any[];
  systemPlans?: Record<string, any>;
  paymentSettings?: any;
}

export default function OrgSponsorshipDashboard({
  orgId,
  orgName,
  userEmail = '',
  existingPackages = [],
  existingCodes = [],
  systemPlans = {},
  paymentSettings = {},
}: OrgSponsorshipDashboardProps) {
  const { showToast } = useToast();

  // All candidate roles in CenterKick
  const allRoleOptions = [
    { key: 'player', defaultName: 'Player Account' },
    { key: 'coach', defaultName: 'Coach Account' },
    { key: 'agent', defaultName: 'Agent Account' },
    { key: 'scout', defaultName: 'Scout Account' },
    { key: 'organization', defaultName: 'Organization Account' },
  ];

  // Filter out any account tiers configured as Free
  const paidRoleOptions = allRoleOptions.filter((r) => {
    const planConfig = systemPlans[r.key];
    if (!planConfig) return false;
    const amountNum = Number(planConfig.amount || 0);
    return amountNum > 0;
  });

  const activeRoleOptions = paidRoleOptions.length > 0 ? paidRoleOptions : allRoleOptions;

  const [codeCount, setCodeCount] = useState(10);
  const [selectedRole, setSelectedRole] = useState(activeRoleOptions[0]?.key || 'player');
  const [purchasing, setPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'PACKAGES' | 'HISTORY'>('ROSTER');

  // Search & Pagination State for Codes Table
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Invite Form State
  const [inviteEmails, setInviteEmails] = useState('');
  const [sendingInvites, setSendingInvites] = useState(false);

  // Gateway Keys
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

  const [selectedGateway, setSelectedGateway] = useState<'PAYSTACK' | 'STRIPE'>(() => {
    if (isPaystackActive) return 'PAYSTACK';
    if (isStripeActive) return 'STRIPE';
    return 'PAYSTACK';
  });

  // Load Paystack Inline script dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Real unit price from systemPlans
  const currentPlan = systemPlans[selectedRole] || { amount: '0' };
  const unitPrice = Number(currentPlan.amount || 0);

  const calculateTotalPrice = () => {
    return unitPrice * codeCount;
  };

  const executePackageActivation = async (paymentRef: string) => {
    setPurchasing(true);
    showToast('Activating sponsorship codes...', 'info');

    try {
      const res = await purchaseOrgSponsorshipPackage({
        orgId,
        userEmail,
        title: `${orgName} ${codeCount}-Code Sponsorship Package`,
        planTier: selectedRole.toUpperCase(),
        totalSeats: codeCount,
        unitPrice,
        currency: 'NGN',
        paymentReference: paymentRef,
      });

      if (res.success) {
        showToast('Sponsorship codes generated and activated successfully!', 'success');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        showToast(`Could not activate sponsorship codes: ${res.error || 'Contact support.'}`, 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Error: ${err.message || 'Package activation failed.'}`, 'error');
    } finally {
      setPurchasing(false);
    }
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (codeCount < 1) {
      showToast('Please enter at least 1 code to purchase.', 'error');
      return;
    }

    const totalAmount = calculateTotalPrice();

    if (totalAmount === 0) {
      await executePackageActivation(`FREE-ORG-${Date.now()}`);
      return;
    }

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

      setPurchasing(true);
      const ref = 'ck_org_' + Math.floor(Math.random() * 1000000000 + 1);

      const handler = paystack.setup({
        key: paystackPublicKey,
        email: userEmail || 'org@centerkick.com',
        amount: Math.round(totalAmount * 100),
        currency: 'NGN',
        ref,
        metadata: {
          custom_fields: [
            { display_name: 'Organization Name', variable_name: 'org_name', value: orgName },
            { display_name: 'Target Tier', variable_name: 'target_tier', value: selectedRole.toUpperCase() },
            { display_name: 'Code Quantity', variable_name: 'code_quantity', value: codeCount },
          ]
        },
        callback: function (response: any) {
          executePackageActivation(response.reference || ref);
        },
        onClose: function () {
          setPurchasing(false);
          showToast('Payment cancelled. Sponsorship codes were not generated.', 'error');
        }
      });
      handler.openIframe();
      return;
    }

    if (selectedGateway === 'STRIPE') {
      if (paymentSettings.paymentLink) {
        window.location.href = paymentSettings.paymentLink;
      } else {
        showToast('Stripe checkout link unavailable.', 'error');
      }
      return;
    }
  };

  const handleSendInvites = async (e: React.FormEvent) => {
    e.preventDefault();
    const emails = inviteEmails
      .split(/[\n,]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (emails.length === 0) {
      showToast('Please enter at least one valid email address.', 'error');
      return;
    }

    setSendingInvites(true);

    try {
      const availableCodes = existingCodes.filter((c) => c.status === 'AVAILABLE');
      if (emails.length > availableCodes.length) {
        showToast(`You only have ${availableCodes.length} unclaimed code(s) available. Please buy more codes or reduce the email list.`, 'error');
        setSendingInvites(false);
        return;
      }

      let sentCount = 0;
      for (let i = 0; i < emails.length; i++) {
        const codeRec = availableCodes[i];
        await sendOrgSponsorshipInviteEmail({
          athleteEmail: emails[i],
          orgName,
          code: codeRec.code,
          planTier: codeRec.target_tier,
        });
        sentCount++;
      }

      showToast(`Sent ${sentCount} invitation email(s) successfully!`, 'success');
      setInviteEmails('');
    } catch (err) {
      console.error(err);
      showToast('Failed to send invitation emails. Please try again.', 'error');
    } finally {
      setSendingInvites(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!existingCodes || existingCodes.length === 0) return;

    const exportDate = new Date().toISOString().split('T')[0];
    let csvContent = `CenterKick Membership Sponsorship Export\n`;
    csvContent += `Sponsor Organization: "${orgName}"\n`;
    csvContent += `Export Date: ${exportDate}\n`;
    csvContent += `Total Sponsored Codes: ${existingCodes.length}\n\n`;
    csvContent += `Voucher Code,Status,Account Tier,Assigned Recipient Email,Redemptions\n`;

    existingCodes.forEach((c) => {
      csvContent += `"${c.code}","${c.status}","${c.target_tier}","${c.recipient_email || 'Unassigned'}","${c.redemption_count}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CenterKick_Sponsorship_Codes_${orgName.toLowerCase().replace(/\s+/g, '_')}_${exportDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalCodesAll = useMemo(() => {
    const pkgTotal = existingPackages.reduce((acc, p) => acc + (p.total_seats || p.total_codes || 0), 0);
    return pkgTotal > 0 ? pkgTotal : existingCodes.length;
  }, [existingPackages, existingCodes]);

  const claimedCodesAll = useMemo(() => {
    const pkgClaimed = existingPackages.reduce((acc, p) => acc + (p.claimed_seats || p.claimed_codes || 0), 0);
    const codeClaimed = existingCodes.filter((c) => c.status === 'REDEEMED' || c.redemption_count > 0).length;
    return pkgClaimed > 0 ? pkgClaimed : codeClaimed;
  }, [existingPackages, existingCodes]);

  // Filtered & Paginated Codes
  const filteredCodes = useMemo(() => {
    if (!searchQuery.trim()) return existingCodes;
    const query = searchQuery.toLowerCase().trim();
    return existingCodes.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.target_tier.toLowerCase().includes(query) ||
        c.status.toLowerCase().includes(query) ||
        (c.recipient_email && c.recipient_email.toLowerCase().includes(query))
    );
  }, [existingCodes, searchQuery]);

  const totalPages = Math.ceil(filteredCodes.length / pageSize) || 1;
  const paginatedCodes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCodes.slice(start, start + pageSize);
  }, [filteredCodes, currentPage]);

  return (
    <div className="w-full space-y-6 text-gray-900">
      {/* Top Banner Header */} 
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 tracking-tight flex items-center gap-3">
            <Award className="w-7 h-7 text-[#b50a0a]" />
            Buy Codes
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage and assign sponsored membership codes for your members.</p>
        </div>

        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Codes Used</span>
            <p className="text-lg font-black text-gray-900 mt-0.5">
              <span className="text-[#b50a0a]">{claimedCodesAll}</span> of {totalCodesAll} Claimed
            </p>
          </div>
          <button
            onClick={handleDownloadCSV}
            disabled={existingCodes.length === 0}
            className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-40"
          >
            <Download className="w-4 h-4" /> Download Codes (.CSV)
          </button>
        </div>
      </div>

      {/* Clean Tab Selector Bar */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex gap-2">
        <button
          onClick={() => setActiveTab('ROSTER')}
          className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ROSTER'
              ? 'bg-gray-900 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Sponsorship Codes
        </button>
        <button
          onClick={() => setActiveTab('PACKAGES')}
          className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'PACKAGES'
              ? 'bg-gray-900 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Plus className="w-4 h-4 text-[#b50a0a]" />
          Buy Codes
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'HISTORY'
              ? 'bg-gray-900 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <History className="w-4 h-4 text-emerald-500" />
          Purchase History ({existingPackages.length})
        </button>
      </div>

      {/* Tab 1: Codes & Invites */}
      {activeTab === 'ROSTER' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  Active Membership Codes
                </h3>
                <p className="text-xs font-medium text-gray-500 mt-0.5">{filteredCodes.length} code(s) available</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search code or email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b50a0a] transition-all"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="p-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Voucher Code</th>
                    <th className="p-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Tier</th>
                    <th className="p-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="p-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedCodes.length > 0 ? (
                    paginatedCodes.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[#b50a0a] text-xs">{c.code}</td>
                        <td className="p-3.5 text-xs font-bold text-gray-900">{c.target_tier}</td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              c.status === 'AVAILABLE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {c.status === 'AVAILABLE' ? 'Unclaimed' : 'Claimed'}
                          </span>
                        </td>
                        <td className="p-3.5 text-xs font-medium text-gray-500">{c.recipient_email || 'Unassigned'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-xs font-bold text-gray-400">
                        {searchQuery ? 'No codes match your search query.' : 'No sponsorship codes found. Click "Buy Extra Sponsorship Codes" to generate codes.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
              <span>Page {currentPage} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Buy Sponsorship Codes */}
      {activeTab === 'PACKAGES' && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-black text-gray-900">Buy Extra Sponsorship Codes</h3>
            <p className="text-xs font-medium text-gray-500 mt-1">Choose code quantity and membership tier to generate new codes.</p>
          </div>

          <form onSubmit={handlePurchaseSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Number of Codes</label>
              <input
                type="number"
                min={1}
                max={500}
                value={codeCount}
                onChange={(e) => setCodeCount(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-black text-lg focus:outline-none focus:ring-2 focus:ring-[#b50a0a]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Membership Tier</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#b50a0a]"
              >
                {activeRoleOptions.map((r) => {
                  const planConfig = systemPlans[r.key];
                  const labelName = planConfig?.name || r.defaultName;
                  const priceLabel = planConfig?.amount ? ` (₦${Number(planConfig.amount).toLocaleString()}/code)` : '';
                  return (
                    <option key={r.key} value={r.key}>
                      {labelName}{priceLabel}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Payment Method Selector */}
            {(isPaystackActive || isStripeActive) && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Channel</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {isPaystackActive && (
                    <button
                      type="button"
                      onClick={() => setSelectedGateway('PAYSTACK')}
                      className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition-all ${
                        selectedGateway === 'PAYSTACK'
                          ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <p className="font-black text-xs">Paystack</p>
                      <p className="text-[10px] font-normal text-gray-500 mt-0.5">Card, USSD & Bank Transfer</p>
                    </button>
                  )}

                  {isStripeActive && (
                    <button
                      type="button"
                      onClick={() => setSelectedGateway('STRIPE')}
                      className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition-all ${
                        selectedGateway === 'STRIPE'
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <p className="font-black text-xs">Stripe</p>
                      <p className="text-[10px] font-normal text-gray-500 mt-0.5">Credit / Debit Cards & Apple Pay</p>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex justify-between items-center">
              <div>
                <span className="text-[11px] font-bold text-gray-400 block">Total Price ({codeCount} code{codeCount > 1 ? 's' : ''}):</span>
                <p className="text-xl font-black text-gray-900">
                  {unitPrice === 0 ? 'Free' : `₦${calculateTotalPrice().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={purchasing}
              className="w-full py-4 rounded-xl bg-[#b50a0a] hover:bg-black text-white font-bold text-xs tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {purchasing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Pay & Activate Codes'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Purchase History */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" /> Sponsorship Purchase History
              </h3>
              <p className="text-xs font-medium text-gray-500 mt-1">Audit log of all bulk membership voucher packages purchased by your account.</p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              {existingPackages.length} Package{existingPackages.length !== 1 ? 's' : ''} Purchased
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Package Title</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tier</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Seats</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ref / Date</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {existingPackages.length > 0 ? (
                  existingPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900 text-xs sm:text-sm">{pkg.title}</td>
                      <td className="p-4 text-xs font-extrabold text-[#b50a0a]">{pkg.plan_tier}</td>
                      <td className="p-4 text-xs font-bold text-gray-800">{pkg.total_seats || pkg.total_codes} Seats</td>
                      <td className="p-4 text-xs font-bold text-gray-900">
                        ₦{Number(pkg.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-xs">
                        <p className="font-mono font-bold text-gray-700">{pkg.payment_reference || 'N/A'}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                          {pkg.created_at ? new Date(pkg.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently'}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {pkg.status || 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs font-bold text-gray-400">
                      No sponsorship package purchase history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
