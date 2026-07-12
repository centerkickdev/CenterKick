'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle, XCircle, UserX, ShieldCheck, RefreshCw,
  AlertTriangle, Shield, Trophy, UserCheck, Briefcase,
  Search, Users, ChevronDown
} from 'lucide-react';
import { activateUser, deactivateUser, changeUserRole, rejectUser } from '@/app/admin/users/actions';

interface UserDetailActionsProps {
  userId: string;
  currentRole: string;
  isActive: boolean;
  profileStatus: string | null | undefined;
}

const ALL_ROLES = [
  { value: 'player', label: 'Athlete / Player', icon: Trophy },
  { value: 'coach', label: 'Technical Coach', icon: UserCheck },
  { value: 'agent', label: 'Licensed Agent', icon: Briefcase },
  { value: 'scout', label: 'Professional Scout', icon: Search },
  { value: 'organization', label: 'Organization / Club', icon: Users },
  { value: 'admin', label: 'Admin (Staff)', icon: Shield },
  { value: 'operations', label: 'Operations (Staff)', icon: Shield },
  { value: 'finance', label: 'Finance (Staff)', icon: Shield },
  { value: 'blogger', label: 'Blogger (Staff)', icon: Shield },
];

const PARTICIPANT_ROLES = ['player', 'coach', 'agent', 'scout', 'organization'];

export function UserDetailActions({ userId, currentRole, isActive, profileStatus }: UserDetailActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const runAction = async (key: string, action: () => Promise<{ success?: boolean; error?: string }>) => {
    setActionLoading(key);
    setConfirmAction(null);
    try {
      const result = await action();
      if (result.error) {
        showToast('error', result.error);
      } else {
        showToast('success', 'Account updated successfully.');
        startTransition(() => router.refresh());
      }
    } catch {
      showToast('error', 'An unexpected error occurred.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async () => {
    if (selectedRole === currentRole) return;
    await runAction('role', () => changeUserRole(userId, selectedRole));
  };

  const isParticipant = PARTICIPANT_ROLES.includes(currentRole);
  const isPendingActivation = profileStatus === 'pending' && isActive;

  const BtnLoading = ({ id }: { id: string }) => actionLoading === id
    ? <RefreshCw className="w-4 h-4 animate-spin" />
    : null;

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${
 toast.type === 'success'
 ? 'bg-white border-green-100 text-green-700'
 : 'bg-white border-red-100 text-red-700'
 }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <p className="text-xs font-bold tracking-wide">{toast.message}</p>
        </div>
      )}

      {/* Account Status Actions */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-xs font-bold text-gray-900 tracking-wide flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#b50a0a]" /> Account Controls
        </h3>

        {/* Approve Pending — highest priority CTA */}
        {isPendingActivation && isParticipant && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-amber-700 tracking-wide leading-relaxed">
                Pending approval — review the profile and subscription before activating.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => runAction('approve', () => activateUser(userId))}
                disabled={!!actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white text-xs font-bold tracking-wide rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
              >
                <BtnLoading id="approve" />
                {actionLoading !== 'approve' && <CheckCircle className="w-3.5 h-3.5" />}
                Approve
              </button>
              <button
                onClick={() => setConfirmAction('reject')}
                disabled={!!actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 text-xs font-bold tracking-wide rounded-xl hover:bg-red-100 border border-red-100 transition-all disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </div>

            {/* Reject confirmation */}
            {confirmAction === 'reject' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-red-700 tracking-wide">Confirm rejection? This will deactivate the account.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => runAction('reject', () => rejectUser(userId))}
                    disabled={!!actionLoading}
                    className="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all"
                  >
                    {actionLoading === 'reject' ? <RefreshCw className="w-3 h-3 animate-spin mx-auto" /> : 'Yes, Reject'}
                  </button>
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="flex-1 py-2 bg-white text-gray-500 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activate / Deactivate toggle */}
        <div className="flex flex-col gap-2">
          {isActive ? (
            confirmAction === 'deactivate' ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-red-700 tracking-wide">Deactivate this account? They will lose platform access immediately.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => runAction('deactivate', () => deactivateUser(userId))}
                    disabled={!!actionLoading}
                    className="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all"
                  >
                    {actionLoading === 'deactivate' ? <RefreshCw className="w-3 h-3 animate-spin mx-auto" /> : 'Yes, Deactivate'}
                  </button>
                  <button onClick={() => setConfirmAction(null)} className="flex-1 py-2 bg-white text-gray-500 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-all">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmAction('deactivate')}
                disabled={!!actionLoading}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-100 text-red-600 text-xs font-bold tracking-wide rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
              >
                <UserX className="w-3.5 h-3.5" /> Deactivate Account
              </button>
            )
          ) : (
            <button
              onClick={() => runAction('activate', () => activateUser(userId))}
              disabled={!!actionLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white text-xs font-bold tracking-wide rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
            >
              <BtnLoading id="activate" />
              {actionLoading !== 'activate' && <CheckCircle className="w-3.5 h-3.5" />}
              Reactivate Account
            </button>
          )}
        </div>
      </div>

      {/* Role Management */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-xs font-bold text-gray-900 tracking-wide flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#b50a0a]" /> Role Management
        </h3>

        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold tracking-wide text-gray-900 hover:border-gray-300 transition-all"
          >
            <span>{ALL_ROLES.find(r => r.value === selectedRole)?.label || selectedRole}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showRoleDropdown && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 space-y-0.5">
                {ALL_ROLES.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => { setSelectedRole(role.value); setShowRoleDropdown(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wide rounded-xl transition-all text-left ${
 selectedRole === role.value
 ? 'bg-[#b50a0a] text-white'
 : 'text-gray-600 hover:bg-gray-50'
 }`}
                  >
                    <role.icon className="w-3.5 h-3.5 shrink-0" />
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleRoleChange}
          disabled={!!actionLoading || selectedRole === currentRole}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-xs font-bold tracking-wide rounded-xl hover:bg-[#b50a0a] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <BtnLoading id="role" />
          {actionLoading !== 'role' && <Shield className="w-3.5 h-3.5" />}
          {selectedRole === currentRole ? 'No Change' : `Assign ${selectedRole} Role`}
        </button>

        {selectedRole !== currentRole && (
          <p className="text-xs text-amber-600 font-bold tracking-wide flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Changing role will update platform access immediately.
          </p>
        )}
      </div>

      {/* Quick Info */}
      <div className="bg-gray-50 rounded-[2rem] border border-gray-100 p-6 space-y-3">
        <h3 className="text-xs font-bold text-gray-400 tracking-wide">Quick Reference</h3>
        <ul className="space-y-2 text-xs font-bold text-gray-500">
          <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" /><span><strong className="text-gray-900">Approve</strong> — sets profile to active, grants full platform access.</span></li>
          <li className="flex items-start gap-2"><XCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" /><span><strong className="text-gray-900">Reject</strong> — marks application rejected, deactivates account.</span></li>
          <li className="flex items-start gap-2"><UserX className="w-3 h-3 text-red-400 mt-0.5 shrink-0" /><span><strong className="text-gray-900">Deactivate</strong> — temporarily blocks access without deleting data.</span></li>
          <li className="flex items-start gap-2"><Shield className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" /><span><strong className="text-gray-900">Role Change</strong> — updates JWT metadata and platform routing immediately.</span></li>
        </ul>
      </div>
    </div>
  );
}

