'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Gift, Copy, Check, ExternalLink, Mail, RefreshCw } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface GiftVoucherRecord {
  id: string;
  code: string;
  title: string;
  target_tier: string;
  duration_months: number;
  status: 'AVAILABLE' | 'REDEEMED' | 'EXPIRED' | 'REVOKED';
  recipient_email?: string;
  gift_message?: string;
  created_at: string;
  redeemed_at?: string;
  redeemed_by_email?: string;
}

export default function MyGiftsList({ userEmail }: { userEmail: string }) {
  const [vouchers, setVouchers] = useState<GiftVoucherRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { showToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchVouchers();
  }, [userEmail]);

  const fetchVouchers = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .eq('buyer_email', userEmail)
        .eq('is_gift', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gifts:', error);
      } else {
        setVouchers(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Voucher code ${code} copied!`, 'success');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleCopyClaimLink = (code: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://centerkick.com';
    const claimUrl = `${origin}/register?code=${code}`;
    navigator.clipboard.writeText(claimUrl);
    showToast('1-Click Claim URL copied!', 'success');
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-bold text-gray-400 animate-pulse flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#a20000]" /> Loading purchased gifts...
      </div>
    );
  }

  if (vouchers.length === 0) {
    return (
      <div className="bg-white rounded-[30px] border border-gray-100 p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#a20000]/10 text-[#a20000] flex items-center justify-center mx-auto mb-4">
          <Gift className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-gray-900">No Gift Vouchers Purchased Yet</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed font-medium">
          You haven&apos;t sponsored any athlete or talent yet. Support talent by gifting an official CenterKick membership!
        </p>
        <a
          href="/gift"
          className="inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-full bg-[#a20000] hover:bg-black text-white font-bold text-xs tracking-wider transition-all shadow-md"
        >
          <Gift className="w-4 h-4" /> Gift a Membership Now
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold tracking-wide text-gray-900 flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#a20000]" /> Purchased Gift Vouchers & Sponsorships
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Track voucher claim statuses and copy 1-click invite links.</p>
        </div>
        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {vouchers.length} {vouchers.length === 1 ? 'Voucher' : 'Vouchers'}
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {vouchers.map((v) => (
          <div key={v.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/60 transition-all">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-black text-gray-900 tracking-wider bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                  {v.code}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    v.status === 'AVAILABLE'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : v.status === 'REDEEMED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {v.status === 'AVAILABLE' ? 'Unclaimed / Available' : v.status}
                </span>
              </div>

              <p className="text-xs font-bold text-gray-700">
                {v.title} ({v.duration_months} Months)
              </p>

              {v.recipient_email && (
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> Recipient: <span className="font-semibold text-gray-800">{v.recipient_email}</span>
                </p>
              )}

              {v.gift_message && (
                <p className="text-xs text-gray-500 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100 max-w-md">
                  &quot;{v.gift_message}&quot;
                </p>
              )}

              {v.redeemed_at && (
                <p className="text-xs text-emerald-600 font-bold">
                  ✓ Claimed on {new Date(v.redeemed_at).toLocaleDateString()} {v.redeemed_by_email ? `by ${v.redeemed_by_email}` : ''}
                </p>
              )}
            </div>

            {/* Voucher Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleCopyCode(v.code)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                {copiedCode === v.code ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedCode === v.code ? 'Copied!' : 'Copy Code'}
              </button>

              <button
                onClick={() => handleCopyClaimLink(v.code)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4 text-[#a20000]" /> 1-Click Link
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
