'use client';

import React, { useState } from 'react';
import { purchaseOrgSponsorshipPackage } from '@/lib/actions/coupons';
import { sendOrgSponsorshipInviteEmail } from '@/lib/resend';
import { Users, CheckCircle, RefreshCw, Mail, Plus, Download, Shield, ArrowUpRight, UserCheck } from 'lucide-react';

interface OrgSponsorshipDashboardProps {
  orgId: string;
  orgName: string;
  existingPackages?: any[];
  existingCodes?: any[];
}

export default function OrgSponsorshipDashboard({
  orgId,
  orgName,
  existingPackages = [],
  existingCodes = [],
}: OrgSponsorshipDashboardProps) {
  const [seatCount, setSeatCount] = useState(25);
  const [planTier, setPlanTier] = useState('STANDARD_PLAYER');
  const [currency, setCurrency] = useState('EUR');
  const [purchasing, setPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState<'PACKAGES' | 'ROSTER'>('ROSTER');

  // Invitation Roster State
  const [inviteEmails, setInviteEmails] = useState('');
  const [sendingInvites, setSendingInvites] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const calculateTotalPrice = () => {
    const basePricePerSeat = planTier === 'STANDARD_PLAYER' ? 100 : 250;
    const grossTotal = basePricePerSeat * seatCount;
    // Volume Discount logic
    const discount = seatCount >= 50 ? 0.25 : seatCount >= 20 ? 0.15 : 0.05;
    return grossTotal * (1 - discount);
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setPurchasing(true);
    setStatusMessage(null);

    try {
      const mockPaymentRef = `PAY-ORG-${Date.now()}`;
      const res = await purchaseOrgSponsorshipPackage({
        orgId,
        title: `${orgName} ${seatCount}-Seat Sponsorship Package`,
        planTier,
        totalSeats: seatCount,
        unitPrice: calculateTotalPrice() / seatCount,
        currency,
        paymentReference: mockPaymentRef,
      });

      if (res.success) {
        setStatusMessage('✓ Sponsorship package activated! Seat codes generated successfully.');
        window.location.reload();
      } else {
        setStatusMessage('Error activating package.');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Purchase transaction failed.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleSendInvites = async (e: React.FormEvent) => {
    e.preventDefault();
    const emails = inviteEmails
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    if (emails.length === 0) return;

    setSendingInvites(true);
    setStatusMessage(null);

    try {
      // Find available unclaimed codes
      const availableCodes = existingCodes.filter((c) => c.status === 'AVAILABLE');
      if (emails.length > availableCodes.length) {
        setStatusMessage(`Error: You only have ${availableCodes.length} available unassigned seats.`);
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

      setStatusMessage(`✓ Dispatched ${sentCount} athlete sponsorship invitation emails!`);
      setInviteEmails('');
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to send invite emails.');
    } finally {
      setSendingInvites(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!existingCodes || existingCodes.length === 0) return;

    const headers = 'Code,Status,Tier,Recipient Email,Claimed Count\n';
    const rows = existingCodes
      .map((c) => `${c.code},${c.status},${c.target_tier},${c.recipient_email || 'Unassigned'},${c.redemption_count}`)
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sponsorship_roster_${orgName.toLowerCase().replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  const totalSeatsAll = existingPackages.reduce((acc, p) => acc + p.total_seats, 0);
  const claimedSeatsAll = existingPackages.reduce((acc, p) => acc + p.claimed_seats, 0);

  return (
    <div className="w-full space-y-8">
      {/* Header & Stats Bar */}
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
            Organization Sponsorship Manager
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{orgName} Roster Center</h1>
          <p className="text-xs text-slate-400 mt-1">Issue, assign, and manage sponsored membership seats for your athletes.</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0">
          <div className="text-right">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Seat Utilization</span>
            <p className="text-xl font-bold text-emerald-400">{claimedSeatsAll} / {totalSeatsAll} Claimed</p>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
          {statusMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('ROSTER')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'ROSTER'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Athlete Roster & Bulk Invites
        </button>
        <button
          onClick={() => setActiveTab('PACKAGES')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'PACKAGES'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Buy New Sponsorship Package
        </button>
      </div>

      {/* Tab 1: Athlete Roster & Invites */}
      {activeTab === 'ROSTER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roster Table */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> Active Roster Codes
              </h3>
              <span className="text-xs text-slate-400 font-mono">{existingCodes.length} Total Codes</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Tier</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Redeemer Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {existingCodes.length > 0 ? (
                    existingCodes.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-emerald-400">{c.code}</td>
                        <td className="p-3 font-semibold">{c.target_tier}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              c.status === 'AVAILABLE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{c.recipient_email || 'Unassigned'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500">
                        No sponsorship seat codes found. Purchase a package to generate codes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bulk Invite Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-400" /> Send Athlete Invites
            </h3>
            <p className="text-xs text-slate-400">
              Enter athlete email addresses (one per line or comma-separated) to dispatch 1-click claim URLs.
            </p>

            <form onSubmit={handleSendInvites} className="space-y-4">
              <textarea
                rows={5}
                required
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder="athlete1@academy.com&#10;athlete2@academy.com"
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="submit"
                disabled={sendingInvites || !inviteEmails.trim()}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendingInvites ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Dispatch Invitation Emails'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Buy Sponsorship Package */}
      {activeTab === 'PACKAGES' && (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <h3 className="text-xl font-bold text-white">Purchase Sponsorship Package</h3>

          <form onSubmit={handlePurchase} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Seat Count</label>
              <input
                type="number"
                min={1}
                max={500}
                value={seatCount}
                onChange={(e) => setSeatCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Athlete Tier</label>
              <select
                value={planTier}
                onChange={(e) => setPlanTier(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="STANDARD_PLAYER">Standard Player Seat (€100/yr base)</option>
                <option value="PREMIUM_COACH">Premium Coach Seat (€250/yr base)</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400">Total Calculated Price:</span>
                <p className="text-2xl font-bold text-emerald-400">€{calculateTotalPrice().toLocaleString()}.00</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                {seatCount >= 50 ? '25% Volume Discount Applied' : seatCount >= 20 ? '15% Volume Discount Applied' : '5% Discount'}
              </span>
            </div>

            <button
              type="submit"
              disabled={purchasing}
              className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {purchasing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm & Purchase Seats'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
