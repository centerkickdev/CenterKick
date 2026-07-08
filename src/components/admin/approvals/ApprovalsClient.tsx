'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, CheckCircle, Clock, AlertCircle, RefreshCcw, 
  Eye, X, Filter, Target, Footprints, UserCheck, 
  ChevronLeft, ChevronRight, ShieldAlert, ShieldCheck, 
  FileText, Users, User, ArrowRight, Ban, Check, Trash2, Shield,
  Activity, CreditCard, Phone, ExternalLink
} from 'lucide-react';
import { DateDisplay } from '@/components/common/DateDisplay';
import { FlagIcon } from '@/components/common/FlagIcon';
import { useToast } from '@/context/ToastContext';

// Import our updated server actions
import { 
  approvePaymentTransaction, 
  rejectPaymentTransaction, 
  approveProfileEdit, 
  rejectProfileEdit, 
  approveStaffVerification, 
  rejectStaffVerification 
} from '@/app/admin/approvals/actions';
import { resendInvitation } from '@/app/actions/auth';

interface Prospect {
  id: string;
  email: string | null;
  first_name: string;
  last_name: string;
  status: string;
  role: string;
  country: string;
  created_at: string;
  transactions?: { status: string }[];
}

interface Registration {
  id: string;
  user_id: string | null;
  email: string | null;
  first_name: string;
  last_name: string;
  role: string;
  country: string;
  created_at: string;
  status: string;
  phone_number?: string | null;
  date_of_birth?: string | null;
  position?: string | null;
  foot?: string | null;
  jersey_number?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  market_value?: number | null;
  formation?: string | null;
  license?: string | null;
  agency_name?: string | null;
  license_code?: string | null;
  id_proof_url?: string | null;
  license_proof_url?: string | null;
  contact_email?: string | null;
  gender?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

interface StaffRequest {
  id: string;
  email: string;
  role: string;
  is_verification_requested: boolean;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    country: string;
  } | null;
}

interface ProfileEdit {
  id: string;
  profile_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string;
  status: string;
  created_at: string;
  profiles: {
    user_id?: string | null;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    country: string;
  } | null;
}


export function ApprovalsClient({
  pendingStaff,
  pendingEdits,
  activeTab = 'staff',
  currentUserRole = 'admin'
}: {
  pendingStaff: StaffRequest[];
  pendingEdits: ProfileEdit[];
  activeTab?: string;
  currentUserRole: string;
}) {
  const router = useRouter();

  const resolveDocUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://devunomieta-centerkick.supabase.co';
    return `${baseUrl}/storage/v1/object/public${url.startsWith('/') ? '' : '/'}${url}`;
  };
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState(activeTab);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Decision & Reason confirmation modal
  const [decisionAction, setDecisionAction] = useState<{
    id: string;
    type: 'approve_staff' | 'reject_staff' | 'approve_edit' | 'reject_edit' | 'approve_pay' | 'reject_pay';
    title: string;
    subtitle: string;
    targetName: string;
    targetEmail: string;
    staffRole?: string;
  } | null>(null);
  const [decisionReason, setDecisionReason] = useState('');

  // Inspect modals
  const [selectedStaff, setSelectedStaff] = useState<StaffRequest | null>(null);

  const [targetStaffRole, setTargetStaffRole] = useState('blogger');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Pagination states (per tab)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter lists based on search queries and active tab
  const getFilteredData = () => {
    const query = searchQuery.toLowerCase().trim();
    
    switch (tab) {
      case 'staff': {
        return pendingStaff.filter(s => 
          (`${s.profiles?.first_name} ${s.profiles?.last_name}`.toLowerCase().includes(query) || s.email?.toLowerCase().includes(query))
        );
      }
      case 'edits':
        return pendingEdits.filter(e => 
          (roleFilter === 'all' || e.profiles?.role === roleFilter) &&
          (`${e.profiles?.first_name} ${e.profiles?.last_name}`.toLowerCase().includes(query) || e.profiles?.email?.toLowerCase().includes(query) || e.field_name.toLowerCase().includes(query))
        );
      default:
        return [];
    }
  };

  const filtered = getFilteredData();
  
  // Total pending counts for badges
  const totalStaff = pendingStaff.length;
  const totalEdits = pendingEdits.length;

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    setCurrentPage(1);
    setSearchQuery('');
    setRoleFilter('all');
    router.push(`/admin/approvals?tab=${newTab}`);
  };

  const runApprovalAction = async (id: string, actionFn: () => Promise<{ success: boolean; error?: string }>) => {
    setActionLoadingId(id);
    try {
      const res = await actionFn();
      if (res.success) {
        showToast("Request processed successfully and user notified via email.", "success");
        startTransition(() => {
          router.refresh();
        });
      } else {
        showToast(res.error || "Failed to process request.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "An unexpected error occurred.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResendInv = async (email: string, lastName: string, role: string) => {
    setActionLoadingId(email);
    try {
      const res = await resendInvitation(email, lastName, role);
      if (res.success) {
        showToast("Onboarding invitation resent successfully.", "success");
      } else {
        showToast(res.error || "Failed to send invitation.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Invitation error.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper formatting field labels
  const formatFieldName = (field: string) => {
    return field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Role icon assignment
  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'player': return <Footprints className="w-3.5 h-3.5 text-[#b50a0a]" />;
      case 'coach': return <UserCheck className="w-3.5 h-3.5 text-blue-600" />;
      case 'agent': return <Target className="w-3.5 h-3.5 text-purple-600" />;
      default: return <User className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cards Stats System */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: 'staff', label: 'Staff Requests', count: totalStaff, color: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-100', icon: Shield },
          { id: 'edits', label: 'Profile Edits', count: totalEdits, color: 'text-orange-600', bg: 'bg-orange-50/50', border: 'border-orange-100', icon: FileText }
        ].map((c) => {
          const isActive = tab === c.id;
          return (
            <button
              key={c.id}
              onClick={() => handleTabChange(c.id)}
              className={`p-5 rounded-[1.8rem] border-2 text-left transition-all duration-300 relative overflow-hidden group active:scale-[0.98] ${
 isActive 
 ? 'border-[#b50a0a] bg-white shadow-xl shadow-red-900/5' 
 : 'border-gray-100 bg-white shadow-sm hover:border-gray-200 hover:shadow-md'
 }`}
            >
              <div className={`w-12 h-12 rounded-2xl ${c.bg} ${c.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <c.icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-gray-400 tracking-[0.2em]">{c.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className={`text-3xl font-bold tracking-tighter ${isActive ? 'text-[#b50a0a]' : 'text-gray-900'}`}>
                  {c.count}
                </p>
                {c.count > 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-red-50 text-[#b50a0a]' : 'bg-gray-100 text-gray-500'}`}>
                    Action Req.
                  </span>
                )}
              </div>
              {(isActive || c.count > 0) && (
                <div className="absolute top-6 right-6 w-2 h-2 bg-[#b50a0a] rounded-full animate-ping"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-sm overflow-hidden">
        
        {/* Header toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold tracking-wide text-gray-950 flex items-center gap-2">
              Pending Queue <span className="text-[#b50a0a] font-bold">({tab.toUpperCase()})</span>
            </h2>
            <p className="text-xs font-bold text-gray-400 tracking-wide mt-1">
              Select records to verify profile authenticity or settlement transfers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Filter */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name, email, or reference..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Role Filter Selector */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                className="pl-12 pr-8 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold tracking-wide focus:ring-2 focus:ring-[#b50a0a] transition-all text-gray-900 appearance-none cursor-pointer"
              >
                <option value="all">ALL ROLES</option>
                <option value="player">PLAYERS</option>
                <option value="coach">COACHES</option>
                <option value="agent">AGENTS</option>
                {tab === 'staff' && <option value="staff">STAFF REQUESTS</option>}
              </select>
            </div>
          </div>
        </div>

        {/* Tab content rendering */}
        <div className="overflow-x-auto w-full pb-4 custom-scrollbar">
          {tab === 'staff' && (
            <div className="divide-y divide-gray-50">
              {(filtered.length === 0) ? (
                <div className="px-6 py-20 text-center">
                  <ShieldCheck className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                  <p className="text-xs font-bold tracking-wide text-gray-400">No new staff requests waiting for approval.</p>
                </div>
              ) : (
                <>
                  {/* Staff accounts */}
                  {(filtered as StaffRequest[]).map((staff: StaffRequest) => (
                    <div key={staff.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-950 flex items-center justify-center font-bold text-white text-base shrink-0">
                          <Shield className="w-5 h-5 text-[#b50a0a]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/admin/users/${staff.id}`} 
                              className="font-bold text-gray-900 text-base hover:text-[#b50a0a] transition-colors flex items-center gap-1.5 group"
                            >
                              {staff.profiles?.first_name} {staff.profiles?.last_name}
                              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <FlagIcon country={staff.profiles?.country || ''} className="w-3.5 h-2" />
                          </div>
                          <p className="text-xs font-bold text-gray-400 tracking-wide mt-0.5">{staff.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-[#b50a0a] rounded text-xs font-bold tracking-wide border border-red-100">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Requested Admin Access
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedStaff(staff)}
                          className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-950 hover:bg-black text-white rounded-xl text-xs font-bold tracking-wide transition-all"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Assign Role & Approve
                        </button>
                        <button
                          disabled={actionLoadingId !== null}
                          onClick={() => setDecisionAction({
                            id: staff.id,
                            type: 'reject_staff',
                            title: 'Decline Staff Access',
                            subtitle: 'Decline dashboard privileges request',
                            targetName: `${staff.profiles?.first_name || 'Staff Member'} ${staff.profiles?.last_name || ''}`,
                            targetEmail: staff.email
                          })}
                          className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl text-xs font-bold tracking-wide transition-all disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {tab === 'edits' && (
            <div className="divide-y divide-gray-50">
              {(filtered as ProfileEdit[]).length === 0 ? (
                <div className="px-6 py-20 text-center">
                  <FileText className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                  <p className="text-xs font-bold tracking-wide text-gray-400">No profile edits currently requiring review.</p>
                </div>
              ) : (
                (filtered as ProfileEdit[]).map((edit: ProfileEdit) => (
                  <div key={edit.id} className="p-6 space-y-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm shrink-0 border border-gray-200">
                          {((edit.profiles?.first_name && edit.profiles.first_name[0]) || 'E').toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {edit.profiles?.user_id ? (
                              <Link 
                                href={`/admin/users/${edit.profiles.user_id}`} 
                                className="font-bold text-gray-900 text-base hover:text-[#b50a0a] transition-colors flex items-center gap-1.5 group"
                              >
                                {edit.profiles?.first_name} {edit.profiles?.last_name}
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            ) : (
                              <p className="font-bold text-gray-900 text-base">{edit.profiles?.first_name} {edit.profiles?.last_name}</p>
                            )}
                            <FlagIcon country={edit.profiles?.country || ''} className="w-3 h-2" />
                          </div>
                          <p className="text-xs font-bold text-[#b50a0a] tracking-wide mt-0.5">{edit.profiles?.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          disabled={actionLoadingId !== null}
                          onClick={() => setDecisionAction({
                            id: edit.id,
                            type: 'approve_edit',
                            title: 'Approve Profile Change',
                            subtitle: 'Commit changes and update directory information',
                            targetName: `${edit.profiles?.first_name} ${edit.profiles?.last_name}`,
                            targetEmail: edit.profiles?.email || 'N/A'
                          })}
                          className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold tracking-wide shadow-md transition-all disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          disabled={actionLoadingId !== null}
                          onClick={() => setDecisionAction({
                            id: edit.id,
                            type: 'reject_edit',
                            title: 'Reject Profile Change',
                            subtitle: 'Decline proposed details updates',
                            targetName: `${edit.profiles?.first_name} ${edit.profiles?.last_name}`,
                            targetEmail: edit.profiles?.email || 'N/A'
                          })}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-xs font-bold tracking-wide transition-all disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    {/* Side-by-Side Values Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 tracking-wide">Field Requested</p>
                        <p className="text-sm font-bold text-gray-800 tracking-wide">{formatFieldName(edit.field_name)}</p>
                      </div>
                      <div className="space-y-1 bg-red-50/50 border border-red-100/50 p-2.5 rounded-xl">
                        <p className="text-xs font-bold text-red-400 tracking-wide">Current Value</p>
                        <p className="text-sm font-bold text-red-700 line-through truncate">{edit.old_value || '-- empty --'}</p>
                      </div>
                      <div className="space-y-1 bg-green-50/50 border border-green-100/50 p-2.5 rounded-xl">
                        <p className="text-xs font-bold text-green-400 tracking-wide">Proposed Value</p>
                        <p className="text-sm font-bold text-green-700 truncate">{edit.new_value || '-- empty --'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}


        </div>

        {/* Footer info/alert */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-400 tracking-wide">
          <p>Verified Administrative Approvals Center</p>
          <p>&bull;</p>
          <p>Security Grade AAA Secure</p>
        </div>
      </div>

      {/* MODALS SECTION */}

      {/* 1. Decision Confirmation Modal (Reason input & email trigger) */}
      {decisionAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => { setDecisionAction(null); setDecisionReason(''); }}>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setDecisionAction(null); setDecisionReason(''); }} className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-all z-10">
              <X className="w-4 h-4 text-gray-400" />
            </button>
            <div className="p-4 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${decisionAction.type.startsWith('approve') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {decisionAction.type.startsWith('approve') ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-gray-900 leading-none">{decisionAction.title}</h3>
                  <p className="text-xs font-bold text-gray-400 tracking-wide mt-1.5">{decisionAction.subtitle}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400">Target User</span>
                  <span className="text-gray-900 font-bold">{decisionAction.targetName}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400">Email</span>
                  <span className="text-gray-900 font-bold">{decisionAction.targetEmail}</span>
                </div>
                {decisionAction.staffRole && (
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-400">Assigned Role</span>
                    <span className="text-[#b50a0a] font-bold">{decisionAction.staffRole}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold text-gray-950 tracking-wide block ml-1">
                  Reason / Email Note (Optional)
                </label>
                <textarea
                  rows={4}
                  placeholder={
                    decisionAction.type.startsWith('approve')
                      ? "Add welcoming remarks or verification details to include in the email notification..."
                      : "Provide a detailed reason for the rejection so the user knows what to correct..."
                  }
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all text-gray-900 placeholder:text-gray-400 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  disabled={actionLoadingId !== null}
                  onClick={async () => {
                    const actId = decisionAction.id;
                    const actType = decisionAction.type;
                    const r = decisionReason;
                    const staffR = decisionAction.staffRole;
                    
                    setDecisionAction(null);
                    setDecisionReason('');

                    await runApprovalAction(actId, () => {
                      switch (actType) {

                        case 'approve_staff': return approveStaffVerification(actId, staffR!, r);
                        case 'reject_staff': return rejectStaffVerification(actId, r);
                        case 'approve_edit': return approveProfileEdit(actId, r);
                        case 'reject_edit': return rejectProfileEdit(actId, r);
                        case 'approve_pay': return approvePaymentTransaction(actId, r);
                        case 'reject_pay': return rejectPaymentTransaction(actId, r);
                      }
                    });
                  }}
                  className={`flex-1 py-4 rounded-2xl text-xs font-bold tracking-[0.2em] text-white transition-all shadow-lg flex items-center justify-center gap-1.5 ${
 decisionAction.type.startsWith('approve')
 ? 'bg-green-600 hover:bg-green-700 shadow-green-900/10'
 : 'bg-red-600 hover:bg-red-700 shadow-red-900/10'
 }`}
                >
                  {actionLoadingId !== null ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirm & Notify
                </button>
                <button
                  onClick={() => { setDecisionAction(null); setDecisionReason(''); }}
                  className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-bold tracking-wide transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}





      {/* 5. Staff Access Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedStaff(null)}>
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedStaff(null)} className="absolute top-4 md:p-8 right-8 w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-all z-10">
              <X className="w-5 h-5 text-gray-400" />
            </button>
            <div className="p-10 pb-6">
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-[#b50a0a] mb-4 border border-red-100">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                  Assign Staff <span className="text-[#b50a0a]">Permission</span>
                </h3>
                <p className="text-xs font-bold text-gray-400 tracking-wide mt-1">
                  Assign an official administrative role to {selectedStaff.profiles?.first_name}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Assign Target Role</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'admin', label: 'Administrator', icon: ShieldCheck },
                    { id: 'blogger', label: 'Blogger / Editor', icon: FileText },
                    { id: 'operations', label: 'Operations Specialist', icon: Activity },
                    { id: 'finance', label: 'Finance Manager', icon: CreditCard }
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setTargetStaffRole(r.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
 targetStaffRole === r.id 
 ? 'bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-900/10' 
 : 'bg-white border-gray-100 hover:border-gray-200 text-gray-600'
 }`}
                    >
                      <div>
                        <r.icon className="w-4 h-4 text-[#b50a0a] mb-2" />
                        <span className="text-xs font-bold tracking-wide block">{r.label}</span>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full ${targetStaffRole === r.id ? 'bg-[#b50a0a]' : 'bg-gray-200'}`}></div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  const staff = selectedStaff;
                  setSelectedStaff(null);
                  setDecisionAction({
                    id: staff.id,
                    type: 'approve_staff',
                    title: 'Grant Staff Access',
                    subtitle: 'Confirms role assignment and sends access details via email',
                    targetName: `${staff.profiles?.first_name || 'Staff Member'} ${staff.profiles?.last_name || ''}`,
                    targetEmail: staff.email,
                    staffRole: targetStaffRole
                  });
                }}
                className="w-full bg-[#b50a0a] hover:bg-black text-white py-5 rounded-[2rem] font-bold tracking-[0.25em] text-xs transition-all shadow-xl shadow-red-900/10 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Grant Role & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
