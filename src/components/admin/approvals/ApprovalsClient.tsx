'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Mail, User, Globe, Calendar, MapPin, 
  CheckCircle, Clock, AlertCircle, RefreshCcw, 
  Eye, X, Filter, Target, Footprints, UserCheck, 
  ChevronLeft, ChevronRight, ShieldAlert, ShieldCheck, 
  FileText, CreditCard, Users, ArrowRight, Ban, Check, Trash2, Shield,
  Activity, DollarSign, Phone, ExternalLink
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
  approveNewRegistration, 
  rejectNewRegistration, 
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

interface PaymentTransaction {
  id: string;
  user_id?: string | null;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  } | null;
}

export function ApprovalsClient({
  pendingRegistrations,
  pendingStaff,
  pendingEdits,
  prospects,
  pendingPayments,
  activeTab = 'registrations',
  currentUserRole = 'admin'
}: {
  pendingRegistrations: Registration[];
  pendingStaff: StaffRequest[];
  pendingEdits: ProfileEdit[];
  prospects: Prospect[];
  pendingPayments: PaymentTransaction[];
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
    type: 'approve_reg' | 'reject_reg' | 'approve_staff' | 'reject_staff' | 'approve_edit' | 'reject_edit' | 'approve_pay' | 'reject_pay';
    title: string;
    subtitle: string;
    targetName: string;
    targetEmail: string;
    staffRole?: string;
  } | null>(null);
  const [decisionReason, setDecisionReason] = useState('');

  // Inspect modals
  const [inspectRegistration, setInspectRegistration] = useState<Registration | null>(null);
  const [inspectPayment, setInspectPayment] = useState<PaymentTransaction | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
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
      case 'registrations': {
        const filteredSports = pendingRegistrations.filter(r => 
          (roleFilter === 'all' || r.role === roleFilter) &&
          (`${r.first_name} ${r.last_name}`.toLowerCase().includes(query) || r.email?.toLowerCase().includes(query))
        );
        const filteredStaff = pendingStaff.filter(s => 
          (roleFilter === 'all' || roleFilter === 'staff') &&
          (`${s.profiles?.first_name} ${s.profiles?.last_name}`.toLowerCase().includes(query) || s.email?.toLowerCase().includes(query))
        );
        return { sports: filteredSports, staff: filteredStaff };
      }
      case 'edits':
        return pendingEdits.filter(e => 
          (roleFilter === 'all' || e.profiles?.role === roleFilter) &&
          (`${e.profiles?.first_name} ${e.profiles?.last_name}`.toLowerCase().includes(query) || e.profiles?.email?.toLowerCase().includes(query) || e.field_name.toLowerCase().includes(query))
        );
      case 'prospects':
        return prospects.filter(p => 
          (roleFilter === 'all' || p.role === roleFilter) &&
          (`${p.first_name} ${p.last_name}`.toLowerCase().includes(query) || p.email?.toLowerCase().includes(query))
        );
      case 'payments':
        return pendingPayments.filter(p => 
          (roleFilter === 'all' || p.profiles?.role === roleFilter) &&
          (`${p.profiles?.first_name} ${p.profiles?.last_name}`.toLowerCase().includes(query) || p.profiles?.email?.toLowerCase().includes(query) || p.reference.toLowerCase().includes(query))
        );
      default:
        return [];
    }
  };

  const filtered = getFilteredData();
  
  // Total pending counts for badges
  const totalRegistrations = pendingRegistrations.length + pendingStaff.length;
  const totalEdits = pendingEdits.length;
  const totalProspects = prospects.length;
  const totalPayments = pendingPayments.length;

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
      
      {/* 4 Cards Stats System */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'registrations', label: 'Registrations', count: totalRegistrations, color: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-100', icon: UserCheck },
          { id: 'edits', label: 'Profile Edits', count: totalEdits, color: 'text-orange-600', bg: 'bg-orange-50/50', border: 'border-orange-100', icon: FileText },
          { id: 'prospects', label: 'Prospects & Invites', count: totalProspects, color: 'text-purple-600', bg: 'bg-purple-50/50', border: 'border-purple-100', icon: Mail },
          { id: 'payments', label: 'Bank Transfers', count: totalPayments, color: 'text-green-600', bg: 'bg-green-50/50', border: 'border-green-100', icon: CreditCard }
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
              <p className="text-[9px] font-black text-gray-400 tracking-[0.2em]">{c.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className={`text-3xl font-black tracking-tighter ${isActive ? 'text-[#b50a0a]' : 'text-gray-900'}`}>
                  {c.count}
                </p>
                {c.count > 0 && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-red-50 text-[#b50a0a]' : 'bg-gray-100 text-gray-500'}`}>
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
            <h2 className="text-base font-black tracking-wide text-gray-950 flex items-center gap-2">
              Pending Queue <span className="text-[#b50a0a] font-black">({tab.toUpperCase()})</span>
            </h2>
            <p className="text-[9px] font-black text-gray-400 tracking-wide mt-1">
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
                className="pl-12 pr-8 py-3 bg-gray-50 border-none rounded-2xl text-sm font-black tracking-wide focus:ring-2 focus:ring-[#b50a0a] transition-all text-gray-900 appearance-none cursor-pointer"
              >
                <option value="all">ALL ROLES</option>
                <option value="player">PLAYERS</option>
                <option value="coach">COACHES</option>
                <option value="agent">AGENTS</option>
                {tab === 'registrations' && <option value="staff">STAFF REQUESTS</option>}
              </select>
            </div>
          </div>
        </div>

        {/* Tab content rendering */}
        <div className="overflow-x-auto w-full pb-4 custom-scrollbar">
          {tab === 'registrations' && (
            <div className="divide-y divide-gray-50">
              {((filtered as any).sports.length === 0 && (filtered as any).staff.length === 0) ? (
                <div className="px-6 py-20 text-center">
                  <ShieldCheck className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                  <p className="text-[10px] font-black tracking-wide text-gray-400">No new registration requests waiting for approval.</p>
                </div>
              ) : (
                <>
                  {/* Sports accounts */}
                  {(filtered as any).sports.map((reg: Registration) => (
                    <div key={reg.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center font-black text-white text-base shrink-0">
                          {((reg.first_name && reg.first_name[0]) || 'R').toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {reg.user_id ? (
                              <Link 
                                href={`/admin/users/${reg.user_id}`} 
                                className="font-black text-gray-900 text-base hover:text-[#b50a0a] transition-colors flex items-center gap-1.5 group"
                              >
                                {reg.first_name} {reg.last_name}
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            ) : (
                              <p className="font-black text-gray-900 text-base">{reg.first_name} {reg.last_name}</p>
                            )}
                            <FlagIcon country={reg.country} className="w-3.5 h-2" />
                          </div>
                          <p className="text-[9px] font-bold text-gray-400 tracking-wide mt-0.5">{reg.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded text-[8px] font-black tracking-wide text-gray-700 border border-gray-200/50">
                              {getRoleIcon(reg.role)}
                              {reg.role}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 rounded text-[8px] font-black tracking-wide border border-amber-100">
                              Awaiting Verification
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setInspectRegistration(reg)}
                          className="p-2.5 text-gray-400 hover:text-black transition-colors rounded-xl hover:bg-gray-100 border border-transparent"
                          title="Inspect Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          disabled={actionLoadingId !== null}
                          onClick={() => setDecisionAction({
                            id: reg.id,
                            type: 'approve_reg',
                            title: 'Approve Registration',
                            subtitle: 'Confirm verification and unlock sports member account',
                            targetName: `${reg.first_name} ${reg.last_name}`,
                            targetEmail: reg.email || 'N/A'
                          })}
                          className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[9px] font-black tracking-wide shadow-lg shadow-green-900/10 transition-all disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve Profile
                        </button>
                        <button
                          disabled={actionLoadingId !== null}
                          onClick={() => setDecisionAction({
                            id: reg.id,
                            type: 'reject_reg',
                            title: 'Decline Registration',
                            subtitle: 'Reject registration verification request',
                            targetName: `${reg.first_name} ${reg.last_name}`,
                            targetEmail: reg.email || 'N/A'
                          })}
                          className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl text-[9px] font-black tracking-wide transition-all disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Staff accounts */}
                  {(filtered as any).staff.map((staff: StaffRequest) => (
                    <div key={staff.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-950 flex items-center justify-center font-black text-white text-base shrink-0">
                          <Shield className="w-5 h-5 text-[#b50a0a]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/admin/users/${staff.id}`} 
                              className="font-black text-gray-900 text-base hover:text-[#b50a0a] transition-colors flex items-center gap-1.5 group"
                            >
                              {staff.profiles?.first_name} {staff.profiles?.last_name}
                              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <FlagIcon country={staff.profiles?.country || ''} className="w-3.5 h-2" />
                          </div>
                          <p className="text-[9px] font-bold text-gray-400 tracking-wide mt-0.5">{staff.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-[#b50a0a] rounded text-[8px] font-black tracking-wide border border-red-100">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Requested Admin Access
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedStaff(staff)}
                          className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-950 hover:bg-black text-white rounded-xl text-[9px] font-black tracking-wide transition-all"
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
                          className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl text-[9px] font-black tracking-wide transition-all disabled:opacity-50"
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
                  <p className="text-[10px] font-black tracking-wide text-gray-400">No profile edits currently requiring review.</p>
                </div>
              ) : (
                (filtered as ProfileEdit[]).map((edit: ProfileEdit) => (
                  <div key={edit.id} className="p-6 space-y-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-600 text-sm shrink-0 border border-gray-200">
                          {((edit.profiles?.first_name && edit.profiles.first_name[0]) || 'E').toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {edit.profiles?.user_id ? (
                              <Link 
                                href={`/admin/users/${edit.profiles.user_id}`} 
                                className="font-black text-gray-900 text-base hover:text-[#b50a0a] transition-colors flex items-center gap-1.5 group"
                              >
                                {edit.profiles?.first_name} {edit.profiles?.last_name}
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            ) : (
                              <p className="font-black text-gray-900 text-base">{edit.profiles?.first_name} {edit.profiles?.last_name}</p>
                            )}
                            <FlagIcon country={edit.profiles?.country || ''} className="w-3 h-2" />
                          </div>
                          <p className="text-[8px] font-black text-[#b50a0a] tracking-wide mt-0.5">{edit.profiles?.role}</p>
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
                          className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[8px] font-black tracking-wide shadow-md transition-all disabled:opacity-50"
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
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-[8px] font-black tracking-wide transition-all disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    {/* Side-by-Side Values Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-gray-400 tracking-wide">Field Requested</p>
                        <p className="text-sm font-black text-gray-800 tracking-wide">{formatFieldName(edit.field_name)}</p>
                      </div>
                      <div className="space-y-1 bg-red-50/50 border border-red-100/50 p-2.5 rounded-xl">
                        <p className="text-[8px] font-black text-red-400 tracking-wide">Current Value</p>
                        <p className="text-sm font-bold text-red-700 line-through truncate">{edit.old_value || '-- empty --'}</p>
                      </div>
                      <div className="space-y-1 bg-green-50/50 border border-green-100/50 p-2.5 rounded-xl">
                        <p className="text-[8px] font-black text-green-400 tracking-wide">Proposed Value</p>
                        <p className="text-sm font-black text-green-700 truncate">{edit.new_value || '-- empty --'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'prospects' && (
            <table className="w-full text-left text-base text-gray-600 whitespace-nowrap">
              <thead className="bg-[#f8f9fa] border-b border-gray-100">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-black tracking-wide text-[#b50a0a]">Prospect Identity</th>
                  <th className="px-6 py-5 text-[10px] font-black tracking-wide text-[#b50a0a]">Role Type</th>
                  <th className="px-6 py-5 text-[10px] font-black tracking-wide text-[#b50a0a]">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black tracking-wide text-[#b50a0a] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(filtered as Prospect[]).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <Mail className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                      <p className="text-[10px] font-black tracking-wide text-gray-400">No prospects matching your filters.</p>
                    </td>
                  </tr>
                ) : (
                  (filtered as Prospect[]).map((prospect) => (
                    <tr key={prospect.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center font-black text-white text-base shrink-0 shadow-lg shadow-gray-200/50">
                            {((prospect.first_name && prospect.first_name[0]) || 'U').toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-black text-gray-900 leading-none truncate max-w-full max-w-[150px]">{prospect.first_name} {prospect.last_name}</p>
                              <FlagIcon country={prospect.country} className="w-3 h-2" />
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 tracking-wide truncate max-w-full max-w-[200px]">{prospect.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-[8px] font-black tracking-wide text-gray-950 border border-gray-200/50">
                          {getRoleIcon(prospect.role)}
                          {prospect.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${prospect.status === 'new' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                            <span className={`text-[8px] font-black tracking-wide ${prospect.status === 'new' ? 'text-blue-600' : 'text-orange-600'}`}>
                              {prospect.status === 'new' ? 'NEW / PENDING PAY' : 'EXPIRED / RENEW'}
                            </span>
                          </div>
                          <span className="text-[8px] font-bold text-gray-400 tracking-wide">
                            Since <DateDisplay date={prospect.created_at} />
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedProspect(prospect)}
                            className="p-2 text-gray-300 hover:text-black transition-colors rounded-xl hover:bg-white border border-transparent hover:border-gray-100"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            disabled={actionLoadingId === prospect.email}
                            onClick={() => handleResendInv(prospect.email!, prospect.last_name, prospect.role)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[9px] font-black tracking-wide text-gray-900 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
                          >
                            {actionLoadingId === prospect.email ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                            {prospect.status === 'expired' ? 'Send Reminder' : 'Resend Invitation'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {tab === 'payments' && (
            <div className="divide-y divide-gray-50">
              {(filtered as PaymentTransaction[]).length === 0 ? (
                <div className="px-6 py-20 text-center">
                  <CreditCard className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                  <p className="text-[10px] font-black tracking-wide text-gray-400">No manual bank transfer payments currently awaiting verification.</p>
                </div>
              ) : (
                (filtered as PaymentTransaction[]).map((pay: PaymentTransaction) => (
                  <div key={pay.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center font-black text-base shrink-0 border border-green-100">
                        <DollarSign className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          {pay.user_id ? (
                            <Link 
                              href={`/admin/users/${pay.user_id}`} 
                              className="font-black text-gray-900 text-base hover:text-[#b50a0a] transition-colors flex items-center gap-1.5 group"
                            >
                              {pay.profiles?.first_name} {pay.profiles?.last_name}
                              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          ) : (
                            <p className="font-black text-gray-900 text-base">{pay.profiles?.first_name} {pay.profiles?.last_name}</p>
                          )}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-[7px] font-black text-gray-600">
                            {pay.profiles?.role}
                          </span>
                        </div>
                        <p className="text-[8px] font-black text-[#b50a0a] tracking-wide mt-1">REF: {pay.reference}</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-base font-black text-gray-900">${pay.amount.toLocaleString()} {pay.currency}</span>
                          <span className="text-[8px] font-bold text-gray-400">Awaiting Settlement Confirmation</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setInspectPayment(pay)}
                        className="p-2.5 text-gray-400 hover:text-black transition-colors rounded-xl hover:bg-gray-100 border border-transparent"
                        title="Inspect Bank Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        disabled={actionLoadingId !== null}
                        onClick={() => setDecisionAction({
                          id: pay.id,
                          type: 'approve_pay',
                          title: 'Approve Payment',
                          subtitle: 'Confirm manual bank transfer and activate subscription privileges',
                          targetName: `${pay.profiles?.first_name} ${pay.profiles?.last_name}`,
                          targetEmail: pay.profiles?.email || 'N/A'
                        })}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[9px] font-black tracking-wide shadow-lg shadow-green-900/10 transition-all disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve Payment
                      </button>
                      <button
                        disabled={actionLoadingId !== null}
                        onClick={() => setDecisionAction({
                          id: pay.id,
                          type: 'reject_pay',
                          title: 'Reject Payment',
                          subtitle: 'Decline payment receipt and mark subscription transfer as failed',
                          targetName: `${pay.profiles?.first_name} ${pay.profiles?.last_name}`,
                          targetEmail: pay.profiles?.email || 'N/A'
                        })}
                        className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl text-[9px] font-black tracking-wide transition-all disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer info/alert */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[9px] font-black text-gray-400 tracking-wide">
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
                  <h3 className="text-lg font-black tracking-tight text-gray-900 leading-none">{decisionAction.title}</h3>
                  <p className="text-[9px] font-black text-gray-400 tracking-wide mt-1.5">{decisionAction.subtitle}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-gray-400">Target User</span>
                  <span className="text-gray-900 font-black">{decisionAction.targetName}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-gray-400">Email</span>
                  <span className="text-gray-900 font-black">{decisionAction.targetEmail}</span>
                </div>
                {decisionAction.staffRole && (
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-gray-400">Assigned Role</span>
                    <span className="text-[#b50a0a] font-black">{decisionAction.staffRole}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-[10px] font-black text-gray-950 tracking-wide block ml-1">
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
                        case 'approve_reg': return approveNewRegistration(actId, r);
                        case 'reject_reg': return rejectNewRegistration(actId, r);
                        case 'approve_staff': return approveStaffVerification(actId, staffR!, r);
                        case 'reject_staff': return rejectStaffVerification(actId, r);
                        case 'approve_edit': return approveProfileEdit(actId, r);
                        case 'reject_edit': return rejectProfileEdit(actId, r);
                        case 'approve_pay': return approvePaymentTransaction(actId, r);
                        case 'reject_pay': return rejectPaymentTransaction(actId, r);
                      }
                    });
                  }}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] text-white transition-all shadow-lg flex items-center justify-center gap-1.5 ${
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
                  className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-[10px] font-black tracking-wide transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Registration Details Inspector Modal */}
      {inspectRegistration && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setInspectRegistration(null)}>
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setInspectRegistration(null)} className="absolute top-4 md:p-8 right-8 w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-all z-[200]">
              <X className="w-5 h-5 text-gray-400" />
            </button>
            <div className="p-10 pb-6">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 rounded-3xl bg-gray-950 flex items-center justify-center font-black text-white text-2xl shadow-xl overflow-hidden shrink-0">
                  {inspectRegistration.avatar_url ? (
                    <img src={inspectRegistration.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    ((inspectRegistration.first_name && inspectRegistration.first_name[0]) || 'R').toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tighter leading-none mb-2">{inspectRegistration.first_name} {inspectRegistration.last_name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded text-[8px] font-black tracking-wide text-gray-700 border border-gray-200/50">
                      {getRoleIcon(inspectRegistration.role)}
                      {inspectRegistration.role}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 rounded text-[8px] font-black tracking-wide border border-amber-100">
                      Awaiting Approval
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 mb-10 border-b border-gray-100 pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[8px] font-black text-gray-400 tracking-wide"><Mail className="w-3.5 h-3.5" /> Email Address</div>
                  <p className="text-sm font-black text-gray-900 truncate pr-4">{inspectRegistration.email || 'No email'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[8px] font-black text-gray-400 tracking-wide"><Globe className="w-3.5 h-3.5" /> Origin / Country</div>
                  <p className="text-sm font-black text-gray-900 flex items-center gap-2 tracking-wide">
                    <FlagIcon country={inspectRegistration.country} className="w-4 h-2.5" /> {inspectRegistration.country || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[8px] font-black text-gray-400 tracking-wide"><Phone className="w-3.5 h-3.5" /> Phone Number</div>
                  <p className="text-sm font-black text-gray-900">{inspectRegistration.phone_number || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[8px] font-black text-gray-400 tracking-wide"><Calendar className="w-3.5 h-3.5" /> Date of Birth</div>
                  <p className="text-sm font-black text-gray-900">
                    {inspectRegistration.date_of_birth ? (
                      new Date(inspectRegistration.date_of_birth).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    ) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Bio block inside modal */}
              {inspectRegistration.bio && (
                <div className="mb-10 space-y-2 border-b border-gray-100 pb-6">
                  <span className="text-[8px] font-black text-gray-400 tracking-wide block">Professional Biography</span>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed">"{inspectRegistration.bio}"</p>
                </div>
              )}

              {/* Category-Specific Specifications inside Modal */}
              {(inspectRegistration.role === 'player' || inspectRegistration.role === 'coach' || inspectRegistration.role === 'agent' || inspectRegistration.role === 'scout' || inspectRegistration.role === 'organization') && (
                <div className="mb-10 space-y-4 border-b border-gray-100 pb-6">
                  <h4 className="text-[9px] font-black text-gray-955 tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#b50a0a]" />
                    Professional Specifications ({inspectRegistration.role})
                  </h4>
                  
                  {inspectRegistration.role === 'player' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl">
                        <span className="text-[7px] font-black text-gray-400 block tracking-wide">Position</span>
                        <span className="text-sm font-black text-gray-900">{inspectRegistration.position || 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl">
                        <span className="text-[7px] font-black text-gray-400 block tracking-wide">Dominant Foot</span>
                        <span className="text-sm font-black text-gray-900 capitalize">{inspectRegistration.foot || 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl">
                        <span className="text-[7px] font-black text-gray-400 block tracking-wide">Jersey Num</span>
                        <span className="text-sm font-black text-gray-900">{inspectRegistration.jersey_number ? `#${inspectRegistration.jersey_number}` : 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl">
                        <span className="text-[7px] font-black text-gray-400 block tracking-wide">Height (cm)</span>
                        <span className="text-sm font-black text-gray-900">{inspectRegistration.height_cm ? `${inspectRegistration.height_cm} cm` : 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl">
                        <span className="text-[7px] font-black text-gray-400 block tracking-wide">Weight (kg)</span>
                        <span className="text-sm font-black text-gray-900">{inspectRegistration.weight_kg ? `${inspectRegistration.weight_kg} kg` : 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl">
                        <span className="text-[7px] font-black text-gray-400 block tracking-wide">Market Value</span>
                        <span className="text-sm font-black text-gray-900">{inspectRegistration.market_value ? `$${Number(inspectRegistration.market_value).toLocaleString()}` : 'N/A'}</span>
                      </div>
                    </div>
                  )}

                  {inspectRegistration.role === 'coach' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl">
                        <span className="text-[7px] font-black text-gray-400 block tracking-wide">Preferred Formation</span>
                        <span className="text-sm font-black text-gray-900">{inspectRegistration.formation || 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl">
                        <span className="text-[7px] font-black text-gray-400 block tracking-wide">Coaching License</span>
                        <span className="text-sm font-black text-gray-900">{inspectRegistration.license || 'N/A'}</span>
                      </div>
                    </div>
                  )}

                  {(inspectRegistration.role === 'agent' || inspectRegistration.role === 'scout' || inspectRegistration.role === 'organization') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl">
                        <span className="text-[7px] font-black text-gray-400 block tracking-wide">Agency / Club Name</span>
                        <span className="text-sm font-black text-gray-900">{inspectRegistration.agency_name || 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl">
                        <span className="text-[7px] font-black text-gray-400 block tracking-wide">License Code</span>
                        <span className="text-sm font-black text-gray-900">{inspectRegistration.license_code || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Document Proofs inside Modal */}
              {(inspectRegistration.id_proof_url || inspectRegistration.license_proof_url) && (
                <div className="mb-10 space-y-4 border-b border-gray-100 pb-6">
                  <h4 className="text-[9px] font-black text-gray-955 tracking-wide flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#b50a0a]" />
                    Uploaded Document Proofs
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inspectRegistration.id_proof_url && (
                      <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-2xl flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <span className="text-[7px] font-black text-gray-400 block tracking-wide">Passport / ID</span>
                          <span className="text-[9px] font-black text-green-700 tracking-wide bg-green-50 px-2 py-0.5 rounded mt-1 inline-block border border-green-100/50">Uploaded</span>
                        </div>
                        <a 
                          href={resolveDocUrl(inspectRegistration.id_proof_url)}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-black hover:text-white rounded-xl text-[8px] font-black tracking-wide transition-all shrink-0 flex items-center gap-1 shadow-sm"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {inspectRegistration.license_proof_url && (
                      <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-2xl flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <span className="text-[7px] font-black text-gray-400 block tracking-wide">Credentials License</span>
                          <span className="text-[9px] font-black text-green-700 tracking-wide bg-green-50 px-2 py-0.5 rounded mt-1 inline-block border border-green-100/50">Uploaded</span>
                        </div>
                        <a 
                          href={resolveDocUrl(inspectRegistration.license_proof_url)}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-black hover:text-white rounded-xl text-[8px] font-black tracking-wide transition-all shrink-0 flex items-center gap-1 shadow-sm"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-6 mb-10 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-gray-900 tracking-wide">Verify Profile Integrity</p>
                  <p className="text-gray-400 text-[10px] leading-relaxed mt-1">Cross-examine loaded category stats and verified identity documents.</p>
                </div>
                {inspectRegistration.user_id && (
                  <Link
                    href={`/admin/users/${inspectRegistration.user_id}`}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-100 text-gray-900 rounded-xl text-[9px] font-black tracking-wide hover:bg-black hover:text-white transition-all shadow-sm shrink-0"
                  >
                    View Full Profile
                  </Link>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setInspectRegistration(null);
                    setDecisionAction({
                      id: inspectRegistration.id,
                      type: 'approve_reg',
                      title: 'Approve Registration',
                      subtitle: 'Verify and unlock sports member account',
                      targetName: `${inspectRegistration.first_name} ${inspectRegistration.last_name}`,
                      targetEmail: inspectRegistration.email || 'N/A'
                    });
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-5 rounded-[2rem] font-black tracking-[0.2em] text-[11px] transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-green-900/10"
                >
                  <CheckCircle className="w-4 h-4" /> Approve Account
                </button>
                <button 
                  onClick={() => {
                    setInspectRegistration(null);
                    setDecisionAction({
                      id: inspectRegistration.id,
                      type: 'reject_reg',
                      title: 'Decline Registration',
                      subtitle: 'Decline registration verification request',
                      targetName: `${inspectRegistration.first_name} ${inspectRegistration.last_name}`,
                      targetEmail: inspectRegistration.email || 'N/A'
                    });
                  }}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 py-5 rounded-[2rem] font-black tracking-[0.2em] text-[11px] transition-all text-center flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Decline Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Payment Details Inspector Modal */}
      {inspectPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setInspectPayment(null)}>
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setInspectPayment(null)} className="absolute top-4 md:p-8 right-8 w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-all z-10">
              <X className="w-5 h-5 text-gray-400" />
            </button>
            <div className="p-10 pb-6">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100 font-black text-2xl shrink-0">
                  $
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tighter leading-none mb-2">Direct Bank Settlement</h2>
                  <p className="text-[10px] font-black text-[#b50a0a] tracking-[0.2em]">Transaction Ref: {inspectPayment.reference}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 mb-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 tracking-wide"><User className="w-3.5 h-3.5" /> Payer Name</div>
                  <p className="text-[14px] font-black text-gray-900 truncate pr-4">
                    {inspectPayment.profiles?.first_name} {inspectPayment.profiles?.last_name}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 tracking-wide"><Mail className="w-3.5 h-3.5" /> Email Address</div>
                  <p className="text-[14px] font-black text-gray-900 truncate pr-4">{inspectPayment.profiles?.email || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 tracking-wide"><CreditCard className="w-3.5 h-3.5" /> Subscription Amount</div>
                  <p className="text-[14px] font-black text-green-600 font-black">${inspectPayment.amount.toLocaleString()} {inspectPayment.currency}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 tracking-wide"><Calendar className="w-3.5 h-3.5" /> Transfer Initiated</div>
                  <p className="text-[14px] font-black text-gray-900"><DateDisplay date={inspectPayment.created_at} /></p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-[2.5rem] p-6 mb-10 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-gray-900 tracking-wide">Verify Settlement Funds</p>
                  <p className="text-gray-400 text-[10px] leading-relaxed mt-1">Please confirm that funds matching reference <strong>{inspectPayment.reference}</strong> are fully cleared in the corporate bank account.</p>
                </div>
                {inspectPayment.user_id && (
                  <Link
                    href={`/admin/users/${inspectPayment.user_id}`}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-100 text-gray-900 rounded-xl text-[9px] font-black tracking-wide hover:bg-black hover:text-white transition-all shadow-sm shrink-0"
                  >
                    View Full Profile
                  </Link>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setInspectPayment(null);
                    setDecisionAction({
                      id: inspectPayment.id,
                      type: 'approve_pay',
                      title: 'Approve Payment',
                      subtitle: 'Confirm bank settlement receipt & activate subscription',
                      targetName: `${inspectPayment.profiles?.first_name} ${inspectPayment.profiles?.last_name}`,
                      targetEmail: inspectPayment.profiles?.email || 'N/A'
                    });
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-5 rounded-[2rem] font-black tracking-[0.2em] text-[11px] transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-green-900/10"
                >
                  <CheckCircle className="w-4 h-4" /> Confirm & Activate
                </button>
                <button 
                  onClick={() => {
                    setInspectPayment(null);
                    setDecisionAction({
                      id: inspectPayment.id,
                      type: 'reject_pay',
                      title: 'Reject Payment',
                      subtitle: 'Decline transfer proof & mark transaction as failed',
                      targetName: `${inspectPayment.profiles?.first_name} ${inspectPayment.profiles?.last_name}`,
                      targetEmail: inspectPayment.profiles?.email || 'N/A'
                    });
                  }}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 py-5 rounded-[2rem] font-black tracking-[0.2em] text-[11px] transition-all text-center flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Reject Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Prospect Details Modal */}
      {selectedProspect && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedProspect(null)}>
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedProspect(null)} className="absolute top-4 md:p-8 right-8 w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-all z-10">
              <X className="w-5 h-5 text-gray-400" />
            </button>
            <div className="p-10 pb-6">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 rounded-3xl bg-[#0f172a] flex items-center justify-center font-black text-white text-2xl shadow-xl">
                  {((selectedProspect.first_name && selectedProspect.first_name[0]) || 'P').toUpperCase()}
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tighter leading-none mb-2">{selectedProspect.first_name} {selectedProspect.last_name}</h2>
                  <p className="text-[10px] font-black text-[#b50a0a] tracking-[0.2em]">{selectedProspect.role} Prospect</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 mb-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 tracking-wide"><Mail className="w-3.5 h-3.5" /> Email Address</div>
                  <p className="text-[14px] font-black text-gray-900 truncate pr-4">{selectedProspect.email || 'No email'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 tracking-wide"><Globe className="w-3.5 h-3.5" /> Location</div>
                  <p className="text-[14px] font-black text-gray-900 flex items-center gap-2 tracking-wide">
                    <FlagIcon country={selectedProspect.country} className="w-4 h-2.5" /> {selectedProspect.country || 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 tracking-wide"><Calendar className="w-3.5 h-3.5" /> Enrolled On</div>
                  <p className="text-[14px] font-black text-gray-900"><DateDisplay date={selectedProspect.created_at} /></p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 tracking-wide"><Clock className="w-3.5 h-3.5" /> Status</div>
                  <p className="text-[14px] font-black text-gray-900">{selectedProspect.status === 'new' ? 'New invite' : 'Expired subscription'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-[2.5rem] p-6 mb-10 border border-gray-100">
                <p className="text-[9px] font-black text-gray-900 tracking-wide">Onboarding Status</p>
                <p className="text-gray-400 text-[11px] leading-relaxed mt-4">
                  This sports directory profile was created by an administrator. You can invite the participant to renew or claim their profile by clicking the button below.
                </p>
              </div>

              <button 
                onClick={() => {
                  handleResendInv(selectedProspect.email!, selectedProspect.last_name, selectedProspect.role);
                  setSelectedProspect(null);
                }}
                className="w-full bg-black hover:bg-[#b50a0a] text-white py-5 rounded-[2rem] font-black tracking-[0.25em] text-[11px] transition-all shadow-md"
              >
                {selectedProspect.status === 'expired' ? 'Send Renewal Link' : 'Send Invitation Link'}
              </button>
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
                <h3 className="text-2xl font-black tracking-tight text-gray-900">
                  Assign Staff <span className="text-[#b50a0a]">Permission</span>
                </h3>
                <p className="text-[9px] font-black text-gray-400 tracking-wide mt-1">
                  Assign an official administrative role to {selectedStaff.profiles?.first_name}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Assign Target Role</label>
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
                        <span className="text-[9px] font-black tracking-wide block">{r.label}</span>
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
                className="w-full bg-[#b50a0a] hover:bg-black text-white py-5 rounded-[2rem] font-black tracking-[0.25em] text-[11px] transition-all shadow-xl shadow-red-900/10 flex items-center justify-center gap-2"
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
