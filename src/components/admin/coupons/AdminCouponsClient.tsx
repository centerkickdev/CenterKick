'use client';

import React, { useState } from 'react';
import { createAdminCoupon, toggleCouponStatus, updateAdminCoupon } from '@/app/admin/coupons/actions';
import {
  Ticket,
  Plus,
  ShieldAlert,
  History,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Users,
  Gift,
  Lock,
  Edit3,
  Eye,
  X
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Coupon {
  id: string;
  code: string;
  title: string;
  coupon_type: string;
  discount_value: number;
  duration_months: number;
  target_tier: string;
  max_redemptions: number;
  redemption_count: number;
  status: string;
  is_gift: boolean;
  buyer_email?: string;
  recipient_email?: string;
  created_at: string;
}

interface AuditLog {
  id: string;
  actor_email?: string;
  action: string;
  target_type: string;
  created_at: string;
  metadata?: any;
}

interface VelocityLog {
  id: string;
  ip_address: string;
  attempted_code: string;
  is_success: boolean;
  error_reason?: string;
  attempted_at: string;
}

export default function AdminCouponsClient({
  initialCoupons,
  auditLogs,
  velocityLogs,
  systemPlans = {},
}: {
  initialCoupons: Coupon[];
  auditLogs: AuditLog[];
  velocityLogs: VelocityLog[];
  systemPlans?: Record<string, any>;
}) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [activeTab, setActiveTab] = useState<'MANAGEMENT' | 'SECURITY_LOGS'>('MANAGEMENT');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Create Form State
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [couponType, setCouponType] = useState<'FULL_COVER' | 'PERCENTAGE' | 'FLAT'>('FULL_COVER');
  const [discountValue, setDiscountValue] = useState(100);
  const [durationMonths, setDurationMonths] = useState(12);
  const [targetTier, setTargetTier] = useState('ALL');
  const [maxRedemptions, setMaxRedemptions] = useState(100);
  const [expiryDate, setExpiryDate] = useState('');
  const [autoSwitchNotice, setAutoSwitchNotice] = useState<string | null>(null);

  // Audience Scope State (ANYONE vs SPECIFIC_USERS)
  const [audienceScope, setAudienceScope] = useState<'ANYONE' | 'SPECIFIC_USERS'>('ANYONE');
  const [targetEmails, setTargetEmails] = useState('');

  // Details & Revoke Confirm Modal State
  const [viewingCoupon, setViewingCoupon] = useState<Coupon | null>(null);
  const [confirmRevokeTarget, setConfirmRevokeTarget] = useState<Coupon | null>(null);

  // Edit / Extend Modal State
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMaxRedemptions, setEditMaxRedemptions] = useState(100);
  const [editDurationMonths, setEditDurationMonths] = useState(12);
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setEditTitle(coupon.title);
    setEditMaxRedemptions(coupon.max_redemptions);
    setEditDurationMonths(coupon.duration_months || 12);
    setEditExpiryDate(coupon.created_at ? new Date().toISOString().split('T')[0] : '');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    setIsEditing(true);
    try {
      const res = await updateAdminCoupon({
        couponId: editingCoupon.id,
        title: editTitle,
        maxRedemptions: editMaxRedemptions,
        durationMonths: editDurationMonths,
        expiryDate: editExpiryDate || undefined,
      });

      if (res.success && res.coupon) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === editingCoupon.id ? { ...c, ...res.coupon } : c))
        );
        setEditingCoupon(null);
        showToast(`Coupon ${editingCoupon.code} updated & extended successfully!`, 'success');
      } else {
        showToast(res.error || 'Failed to update coupon.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating coupon', 'error');
    } finally {
      setIsEditing(false);
    }
  };

  // Get current plan rate for target tier
  const activePlanConfig = targetTier !== 'ALL' ? systemPlans[targetTier.toLowerCase()] : null;
  const targetTierRate = activePlanConfig ? Number(activePlanConfig.amount || 0) : 0;
  const maxAllowedFlatDiscount = targetTierRate > 0 ? targetTierRate * 0.8 : 0;

  // Validation flag checking all fields are filled
  const isFormValid =
    title.trim() !== '' &&
    durationMonths > 0 &&
    maxRedemptions > 0 &&
    expiryDate !== '' &&
    (couponType === 'FULL_COVER' || discountValue > 0) &&
    (audienceScope === 'ANYONE' || targetEmails.trim() !== '');

  // Handle Discount Value change with 80% threshold guard
  const handleDiscountValueChange = (val: number) => {
    setAutoSwitchNotice(null);

    // Percentage > 80% or 100% auto-switch
    if (couponType === 'PERCENTAGE' && val >= 80) {
      setCouponType('FULL_COVER');
      setDiscountValue(100);
      setAutoSwitchNotice(
        `Percentage discount (${val}%) reached or exceeded 80% limit. Auto-switched to 100% Full Cover.`
      );
      showToast('Discount >= 80%. Auto-switched to 100% Full Cover.', 'info');
      return;
    }

    // Flat discount > 80% rate auto-switch
    if (couponType === 'FLAT' && targetTierRate > 0 && val > maxAllowedFlatDiscount) {
      setCouponType('FULL_COVER');
      setDiscountValue(100);
      setAutoSwitchNotice(
        `Flat discount (₦${val.toLocaleString()}) exceeded 80% of ${targetTier} subscription rate (₦${targetTierRate.toLocaleString()}). Auto-switched to 100% Full Cover.`
      );
      showToast('Exceeded 80% limit. Auto-switched to 100% Full Cover.', 'info');
      return;
    }

    setDiscountValue(val);
  };

  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === 'ALL') return matchesSearch;
    if (filterType === 'GIFTS') return matchesSearch && c.is_gift;
    if (filterType === 'PROMO') return matchesSearch && !c.is_gift;
    if (filterType === 'AVAILABLE') return matchesSearch && c.status === 'AVAILABLE';
    if (filterType === 'REVOKED') return matchesSearch && c.status === 'REVOKED';
    return matchesSearch;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showToast('Please enter a campaign title.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await createAdminCoupon({
        code: code || undefined,
        title,
        couponType,
        discountValue,
        durationMonths,
        targetTier,
        maxRedemptions: audienceScope === 'SPECIFIC_USERS' && targetEmails.includes(',')
          ? targetEmails.split(',').filter(Boolean).length
          : maxRedemptions,
        expiryDate: expiryDate || undefined,
        recipientEmail: audienceScope === 'SPECIFIC_USERS' ? targetEmails : undefined,
      });

      if (res.success && res.coupon) {
        setCoupons([res.coupon, ...coupons]);
        setShowCreateModal(false);
        showToast(`Coupon ${res.coupon.code} created successfully!`, 'success');
        // Reset form
        setCode('');
        setTitle('');
      } else {
        showToast(res.error || 'Failed to create coupon.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating coupon', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (couponId: string, currentStatus: string) => {
    try {
      const res = await toggleCouponStatus(couponId, currentStatus);
      if (res.success && res.newStatus) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === couponId ? { ...c, status: res.newStatus } : c))
        );
        showToast(`Coupon status updated to ${res.newStatus}`, 'success');
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Status update error', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-8 rounded-3xl text-white shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#a20000] text-white flex items-center justify-center shrink-0 shadow-lg">
            <Ticket className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Coupon & Sponsorship System</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Manage promotional codes, bulk seat packages, and anti-fraud velocity logs.</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-[#a20000] hover:bg-black text-white text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Promo Code
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Coupons</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{coupons.length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gift Vouchers</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{coupons.filter((c) => c.is_gift).length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active / Available</p>
          <p className="text-3xl font-black text-amber-600 mt-2">{coupons.filter((c) => c.status === 'AVAILABLE').length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Security Log Entries</p>
          <p className="text-3xl font-black text-rose-600 mt-2">{velocityLogs.length}</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('MANAGEMENT')}
          className={`px-6 py-4 font-bold text-xs tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'MANAGEMENT'
              ? 'border-[#a20000] text-[#a20000]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Ticket className="w-4 h-4" /> Coupon Management
        </button>

        <button
          onClick={() => setActiveTab('SECURITY_LOGS')}
          className={`px-6 py-4 font-bold text-xs tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'SECURITY_LOGS'
              ? 'border-[#a20000] text-[#a20000]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Security & Audit Logs ({velocityLogs.length})
        </button>
      </div>

      {/* Tab 1: Coupon Management */}
      {activeTab === 'MANAGEMENT' && (
        <div className="space-y-6">
          {/* Controls: Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search code or campaign title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a20000]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#a20000]"
              >
                <option value="ALL">All Types</option>
                <option value="GIFTS">Gift Vouchers Only</option>
                <option value="PROMO">Promotional Codes Only</option>
                <option value="AVAILABLE">Active / Available</option>
                <option value="REVOKED">Revoked / Disabled</option>
              </select>
            </div>
          </div>

          {/* Coupons Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="py-4 px-5">Code & Campaign</th>
                    <th className="py-4 px-5">Discount & Tier</th>
                    <th className="py-4 px-5 text-center">Redemptions</th>
                    <th className="py-4 px-5 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 font-semibold">
                        No coupons found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((c) => {
                      const recipientList = c.recipient_email
                        ? c.recipient_email.split(',').map((e) => e.trim()).filter(Boolean)
                        : [];

                      return (
                        <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-xs text-gray-900 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md shrink-0 select-all">
                                {c.code}
                              </span>
                              {c.is_gift && (
                                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/60 font-black text-[9px] uppercase tracking-wider shrink-0">
                                  GIFT
                                </span>
                              )}
                            </div>
                            {!c.title.toLowerCase().startsWith('gift voucher for') && (
                              <p className="text-gray-600 font-semibold mt-1 line-clamp-1">{c.title}</p>
                            )}
                          </td>

                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">
                                {c.coupon_type === 'FULL_COVER'
                                  ? '100% Cover'
                                  : c.coupon_type === 'PERCENTAGE'
                                  ? `${c.discount_value}% Off`
                                  : `₦${c.discount_value.toLocaleString()} Off`}
                              </span>
                              <span className="font-black uppercase tracking-wider text-gray-700 text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {c.target_tier}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium mt-0.5 block">
                              {c.duration_months} Months Access
                              {recipientList.length > 0 && (
                                <span className="text-emerald-700 font-bold ml-1.5">
                                  • {recipientList.length} Restricted {recipientList.length === 1 ? 'User' : 'Users'}
                                </span>
                              )}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-center font-bold text-gray-900">
                            <span className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg font-mono">
                              {c.redemption_count} / {c.max_redemptions}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-center">
                            <span
                              className={`px-3 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider inline-block ${
                                c.status === 'AVAILABLE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : c.status === 'REDEEMED'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5 shrink-0">
                              <button
                                onClick={() => setViewingCoupon(c)}
                                title="View Details & Restricted Recipients"
                                className="p-2 rounded-xl bg-gray-100 hover:bg-slate-900 text-gray-700 hover:text-white transition-all flex items-center justify-center shadow-sm"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(c)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-slate-900 text-gray-700 hover:text-white transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (c.status === 'AVAILABLE') {
                                    setConfirmRevokeTarget(c);
                                  } else {
                                    handleToggleStatus(c.id, c.status);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm ${
                                  c.status === 'AVAILABLE'
                                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/60'
                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200/60'
                                }`}
                              >
                                {c.status === 'AVAILABLE' ? 'Revoke' : 'Enable'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Security & Audit Logs */}
      {activeTab === 'SECURITY_LOGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Velocity Logs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" /> Redemption Attempt Velocity Logs
            </h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {velocityLogs.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No attempt logs recorded.</p>
              ) : (
                velocityLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-gray-900">{log.attempted_code}</span>
                      <span className="text-gray-400 ml-2">IP: {log.ip_address}</span>
                      {log.error_reason && <p className="text-rose-500 font-bold mt-0.5">{log.error_reason}</p>}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${log.is_success ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {log.is_success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-[#a20000]" /> System Audit Trail
            </h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No audit logs recorded.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-900 uppercase">{log.action}</span>
                      <span className="text-gray-500 ml-2">By: {log.actor_email || 'System'}</span>
                    </div>
                    <span className="text-gray-400 text-[11px] font-mono">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-6 sm:p-8 relative animate-in zoom-in duration-300">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-6 right-6 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-[#a20000]" /> Create Promotional Coupon
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-700 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Scouting Campaign"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a20000] text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Custom Code (Optional - Leave blank for auto-code)</label>
                <input
                  type="text"
                  placeholder="e.g. CK-SUMMER-2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a20000] font-mono text-gray-900 uppercase"
                />
              </div>

              {/* Audience Scope Selector */}
              <div>
                <label className="block text-gray-700 mb-1">Target Audience Scope</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAudienceScope('ANYONE')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      audienceScope === 'ANYONE'
                        ? 'bg-[#a20000] text-white border-[#a20000] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Anyone in Target Tier
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudienceScope('SPECIFIC_USERS')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      audienceScope === 'SPECIFIC_USERS'
                        ? 'bg-[#a20000] text-white border-[#a20000] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Specific Account Email(s)
                  </button>
                </div>
              </div>

              {/* Specific User Emails Input */}
              {audienceScope === 'SPECIFIC_USERS' && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-gray-700 mb-1">
                    Target User Email(s) <span className="text-gray-400 font-normal">(Separate multiple emails with commas)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. coach.smith@example.com, scout.david@gmail.com"
                    value={targetEmails}
                    onChange={(e) => setTargetEmails(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a20000] text-gray-900 font-medium"
                  />
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    ✓ Restricted: Only the specified account email address(es) can redeem this coupon.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={couponType}
                    onChange={(e) => {
                      const newType = e.target.value as any;
                      setCouponType(newType);
                      setAutoSwitchNotice(null);
                      if (newType === 'FULL_COVER') setDiscountValue(100);
                      else if (newType === 'PERCENTAGE') setDiscountValue(50);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a20000] text-gray-900"
                  >
                    <option value="FULL_COVER">100% Full Cover</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₦)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Target Account Tier</label>
                  <select
                    value={targetTier}
                    onChange={(e) => {
                      setTargetTier(e.target.value);
                      setAutoSwitchNotice(null);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a20000] text-gray-900"
                  >
                    <option value="ALL">All Tiers</option>
                    <option value="PLAYER">Player</option>
                    <option value="COACH">Coach</option>
                    <option value="AGENT">Agent</option>
                    <option value="SCOUT">Scout</option>
                    <option value="ORGANIZATION">Organization</option>
                  </select>
                </div>
              </div>

              {/* Target Tier Rate Badge */}
              {targetTier !== 'ALL' && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium">
                    <span className="font-bold text-gray-900">{targetTier}</span> Subscription Rate:
                  </span>
                  <span className="font-mono font-bold text-[#a20000]">
                    {targetTierRate > 0 ? `₦${targetTierRate.toLocaleString()}` : 'Free Tier'}
                  </span>
                </div>
              )}

              {/* Dynamic Discount Value Input */}
              {couponType !== 'FULL_COVER' && (
                <div>
                  <label className="block text-gray-700 mb-1">
                    {couponType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Flat Discount Amount (₦)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      max={couponType === 'PERCENTAGE' ? 100 : undefined}
                      value={discountValue}
                      onChange={(e) => handleDiscountValueChange(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a20000] text-gray-900 font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      {couponType === 'PERCENTAGE' ? '%' : '₦'}
                    </span>
                  </div>
                  {couponType === 'FLAT' && targetTierRate > 0 && (
                    <p className="text-[11px] text-gray-400 mt-1">
                      Max allowed flat discount (80% limit): <span className="font-bold text-gray-700">₦{maxAllowedFlatDiscount.toLocaleString()}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Auto Switch Notice Alert */}
              {autoSwitchNotice && (
                <div className="p-4 bg-amber-100 border border-amber-300 rounded-2xl text-amber-950 text-xs font-black flex items-start gap-3 shadow-sm">
                  <Lock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-amber-950">{autoSwitchNotice}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Access Duration (Months)</label>
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a20000] text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Max Redemptions Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={maxRedemptions}
                    onChange={(e) => setMaxRedemptions(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a20000] text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Expiration Date</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a20000] text-gray-900 font-medium"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="w-1/2 py-3.5 rounded-xl bg-[#a20000] hover:bg-black text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit & Extend Coupon Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-6 sm:p-8 relative animate-in zoom-in duration-300">
            <button
              onClick={() => setEditingCoupon(null)}
              className="absolute top-6 right-6 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-gray-900 mb-2 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#a20000]" /> Edit & Extend Code
            </h3>

            <div className="mb-6 p-3 rounded-xl bg-slate-100 border border-slate-200 flex justify-between items-center text-xs font-mono">
              <span className="font-black text-gray-900">{editingCoupon.code}</span>
              <span className="text-gray-500 font-bold uppercase">{editingCoupon.target_tier}</span>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-700 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a20000] text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Max Redemptions Limit</label>
                <input
                  type="number"
                  required
                  min={editingCoupon.redemption_count + 1}
                  value={editMaxRedemptions}
                  onChange={(e) => setEditMaxRedemptions(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a20000] text-gray-900 font-bold"
                />
                <p className="text-[11px] text-gray-400 font-normal mt-1">
                  Current claimed redemptions: <span className="font-bold text-gray-800">{editingCoupon.redemption_count}</span>
                </p>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Access Duration (Months)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={60}
                  value={editDurationMonths}
                  onChange={(e) => setEditDurationMonths(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a20000] text-gray-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Extend Expiration Date</label>
                <input
                  type="date"
                  required
                  value={editExpiryDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a20000] text-gray-900 font-medium"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="w-1/2 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="w-1/2 py-3 rounded-xl bg-[#a20000] hover:bg-black text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isEditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save & Extend'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Coupon Details Modal */}
      {viewingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-6 sm:p-8 relative animate-in zoom-in duration-300">
            <button
              onClick={() => setViewingCoupon(null)}
              className="absolute top-6 right-6 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#a20000]/10 text-[#a20000] flex items-center justify-center shrink-0">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{viewingCoupon.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono font-bold text-xs bg-slate-100 border border-slate-200 text-gray-900 px-2.5 py-0.5 rounded select-all">
                    {viewingCoupon.code}
                  </span>
                  {viewingCoupon.is_gift && (
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px]">
                      GIFT VOUCHER
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Discount Type</p>
                  <p className="font-extrabold text-gray-900 text-sm mt-0.5">
                    {viewingCoupon.coupon_type === 'FULL_COVER'
                      ? '100% Full Cover'
                      : viewingCoupon.coupon_type === 'PERCENTAGE'
                      ? `${viewingCoupon.discount_value}% Off`
                      : `₦${viewingCoupon.discount_value.toLocaleString()} Off`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Target Tier</p>
                  <p className="font-extrabold text-gray-900 text-sm mt-0.5 uppercase">{viewingCoupon.target_tier}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Access Duration</p>
                  <p className="font-bold text-gray-800 text-xs mt-0.5">{viewingCoupon.duration_months} Months</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Redemptions Used</p>
                  <p className="font-mono font-bold text-gray-900 text-xs mt-0.5">
                    {viewingCoupon.redemption_count} / {viewingCoupon.max_redemptions}
                  </p>
                </div>
              </div>

              {/* Recipient Email Restrictions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-700 font-bold flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#a20000]" /> Restricted Recipient Email(s)
                  </p>
                  {viewingCoupon.recipient_email && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-extrabold">
                      {viewingCoupon.recipient_email.split(',').filter(Boolean).length} Authorized {viewingCoupon.recipient_email.split(',').filter(Boolean).length === 1 ? 'Email' : 'Emails'}
                    </span>
                  )}
                </div>

                {viewingCoupon.recipient_email ? (
                  <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5 font-mono text-xs shadow-inner">
                    {viewingCoupon.recipient_email.split(',').map((email, idx) => {
                      const cleanEmail = email.trim();
                      if (!cleanEmail) return null;
                      return (
                        <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <span className="w-2 h-2 rounded-full bg-[#b50a0a] shrink-0" />
                            <span className="truncate text-gray-900 font-bold select-all text-xs">{cleanEmail}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-sans font-extrabold uppercase tracking-wider shrink-0 ml-2">
                            Recipient #{idx + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-500 font-medium">
                    Unrestricted — Code can be redeemed by any user under the target tier.
                  </div>
                )}
              </div>

              {/* Action Buttons in Details Modal */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const c = viewingCoupon;
                    setViewingCoupon(null);
                    openEditModal(c);
                  }}
                  className="w-1/2 py-3 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" /> Edit Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setViewingCoupon(null)}
                  className="w-1/2 py-3 rounded-xl bg-[#a20000] hover:bg-black text-white font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Revoke Action Modal */}
      {confirmRevokeTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-6 sm:p-8 relative animate-in zoom-in duration-300">
            <button
              onClick={() => setConfirmRevokeTarget(null)}
              className="absolute top-6 right-6 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Revoke Coupon Code?</h3>
                <p className="text-xs text-gray-500 font-medium">This will immediately block future redemptions.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 mb-6">
              <p className="text-xs text-rose-950 font-bold">
                Are you sure you want to revoke code <span className="font-mono bg-rose-200/60 px-1.5 py-0.5 rounded text-rose-900">{confirmRevokeTarget.code}</span>?
              </p>
              <p className="text-[11px] text-rose-800/80 mt-1 font-medium">
                Users will no longer be able to claim this promo code or gift voucher.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmRevokeTarget(null)}
                className="w-1/2 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = confirmRevokeTarget;
                  setConfirmRevokeTarget(null);
                  await handleToggleStatus(target.id, target.status);
                }}
                className="w-1/2 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all text-xs shadow-md"
              >
                Yes, Revoke Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
