"use client";

import { useState } from 'react';
import { 
  ShieldCheck, UserPlus, Search, Activity, 
  Trash2, Mail, Clock, Shield, CheckCircle, Loader2, X,
  ShieldAlert, Eye, Power, ChevronRight, MapPin, Calendar as CalendarIcon,
  FileText, CreditCard, Users, UserCheck, RefreshCw
} from 'lucide-react';
import { DateDisplay } from '@/components/common/DateDisplay';
import { useRouter } from 'next/navigation';
import { updateUserRole, toggleUserStatus, resendInvitation, revokeInvitation, deleteUser } from '@/app/admin/roles/actions';
import { useToast } from '@/context/ToastContext';

export function RolesClient({ 
  adminUsers, 
  verificationQueue,
  invitations,
  currentUserId,
  currentUserRole 
}: { 
  adminUsers: Record<string, any>[], 
  verificationQueue: Record<string, any>[],
  invitations: Record<string, any>[],
  currentUserId: string,
  currentUserRole: string
}) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Record<string, any> | null>(null);
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('blogger');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { showToast } = useToast();

  const isSuper = currentUserRole === 'superadmin';

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    // Secure Email Regex Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      showToast('Please enter a valid, properly formatted email address', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to send invitation', 'error');
        throw new Error(data.error || 'Failed to send invitation');
      }

      setIsInviteModalOpen(false);
      setEmail('');
      setRole('blogger');
      showToast('Invitation sent successfully', 'success');
      router.refresh();
    } catch (err: unknown) {
      // Error already handled
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setLoading(true);
    const result = await updateUserRole(userId, newRole);
    setLoading(false);
    if (result.success) {
      showToast(`User role updated to ${newRole.toUpperCase()}`, 'success');
      setIsPreviewModalOpen(false);
      setSelectedUser(null);
      router.refresh();
    } else {
      showToast(result.error || 'Failed to update role', 'error');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setLoading(true);
    const result = await toggleUserStatus(userId, !currentStatus);
    setLoading(false);
    if (result.success) {
      showToast(`User account ${currentStatus ? 'deactivated' : 'activated'} successfully`, 'success');
      router.refresh();
    } else {
      showToast(result.error || 'Failed to update user status', 'error');
    }
  };

  const handleResendInvite = async (invitationId: string) => {
    setLoading(true);
    const result = await resendInvitation(invitationId);
    setLoading(false);
    if (result.success) {
      showToast('Invitation resent successfully with a new token.', 'success');
      router.refresh();
    } else {
      showToast(result.error || 'Failed to resend invitation', 'error');
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (confirm('Are you sure you want to revoke this invitation? The signup link will be permanently deactivated.')) {
      setLoading(true);
      const result = await revokeInvitation(inviteId);
      setLoading(false);
      if (result.success) {
        showToast('Invitation revoked successfully', 'success');
        router.refresh();
      } else {
        showToast(result.error || 'Failed to revoke invitation', 'error');
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user account? This action cannot be undone.')) {
      setLoading(true);
      const result = await deleteUser(userId);
      setLoading(false);
      if (result.success) {
        showToast('User account deleted successfully', 'success');
        router.refresh();
      } else {
        showToast(result.error || 'Failed to delete user account', 'error');
      }
    }
  };

  const filteredAdmins = adminUsers.filter((admin: Record<string, any>) => 
    admin.email?.toLowerCase().includes(search.toLowerCase()) ||
    `${admin.profiles?.first_name} ${admin.profiles?.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const canManage = (targetRole: string, targetId: string) => {
    if (targetRole === 'superadmin') return false;
    if (targetId === currentUserId) return false;
    if (isSuper) return true;
    if (currentUserRole === 'admin' && ['blogger', 'operations', 'finance', 'unassigned'].includes(targetRole)) return true;
    return false;
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tighter">Manage <span className="text-[#b50a0a]">Roles & Access</span></h1>
          <p className="text-gray-900 text-xs font-bold tracking-[0.2em] mt-1">Configure administrative accounts, manage permissions, and audit system activities.</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-[#b50a0a] hover:bg-black text-white px-4 md:px-8 py-4 rounded-2xl font-bold text-xs tracking-wide transition-all flex items-center gap-3 shadow-xl shadow-red-900/20 active:scale-95 group"
        >
          <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Invite Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           
           {/* Verification Queue */}
           {verificationQueue.length > 0 && (
             <div className="bg-red-50/30 rounded-[2.5rem] border border-red-100/50 p-4 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#b50a0a] flex items-center justify-center text-white shadow-lg">
                         <ShieldAlert className="w-4 h-4" />
                      </div>
                      <h2 className="text-xs font-bold text-gray-900 tracking-wide">Verification Queue</h2>
                   </div>
                   <span className="px-3 py-1 bg-[#b50a0a] text-white text-xs font-bold rounded-lg tracking-wide">
                      {verificationQueue.length} Pending
                   </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {verificationQueue.map((user: Record<string, any>) => (
                      <div key={user.id} className="bg-white p-6 rounded-3xl shadow-sm border border-red-100/50 flex items-center justify-between group hover:shadow-md transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-bold text-gray-400 text-base border border-gray-100">
                               {user.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                               <p className="font-bold text-gray-900 text-sm">{user.profiles?.first_name} {user.profiles?.last_name}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${user.is_verification_requested ? 'bg-[#b50a0a] animate-pulse' : 'bg-gray-300'}`}></div>
                                  <p className="text-xs text-gray-500 font-bold tracking-wide">
                                     {user.is_verification_requested ? 'Requested Verification' : 'Newly Registered'}
                                  </p>
                               </div>
                            </div>
                         </div>
                         <button 
                           onClick={() => {
                             setSelectedUser(user);
                             setIsPreviewModalOpen(true);
                           }}
                           className="p-3 bg-gray-50 text-gray-400 hover:bg-[#b50a0a] hover:text-white rounded-xl transition-all shadow-sm"
                         >
                            <ChevronRight className="w-4 h-4" />
                         </button>
                      </div>
                   ))}
                </div>
             </div>
           )}

           {/* Admin List */}
           <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
             <div className="p-4 md:p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <h2 className="text-xs font-bold text-gray-900 tracking-wide leading-none">Administrative Staff</h2>
                   <p className="text-xs font-bold text-gray-400 tracking-wide mt-2">Full list of active and inactive administrators.</p>
                </div>
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                   <input 
                      type="text" 
                      placeholder="Search teammates..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-12 pr-6 py-3 bg-gray-50 border border-transparent focus:border-gray-100 focus:bg-white rounded-2xl text-sm font-bold outline-none transition-all w-full md:w-80 text-gray-900"
                   />
                </div>
             </div>
             <div className="overflow-x-auto w-full pb-4 custom-scrollbar">
               <table className="w-full text-left text-base whitespace-nowrap">
                 <tbody className="divide-y divide-gray-50">
                   {filteredAdmins.map((admin: Record<string, any>) => (
                     <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                       <td className="px-4 py-4">
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-xl transition-transform group-hover:scale-105 ${admin.is_active ? 'bg-gray-900' : 'bg-gray-300'}`}>
                                {admin.email?.[0]?.toUpperCase() || 'A'}
                             </div>
                             <div>
                                <p className={`font-bold text-base tracking-tight ${admin.is_active ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                                   {admin.profiles?.first_name} {admin.profiles?.last_name}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 font-bold tracking-[0.2em]">{admin.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                             <span className={`w-fit px-3 py-1 rounded-lg text-xs font-bold tracking-wide flex items-center gap-1.5 ${
 admin.role === 'superadmin' ? 'bg-red-50 text-[#b50a0a]' : 'bg-gray-100 text-gray-600'
 }`}>
                               {admin.role === 'superadmin' && <Shield className="w-3 h-3" />}
                               {admin.role}
                             </span>
                             <div className="flex items-center gap-1.5 ml-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${admin.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-xs font-bold text-gray-400 tracking-wide">{admin.is_active ? 'Active' : 'Deactivated'}</span>
                             </div>
                          </div>
                       </td>
                       <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             {canManage(admin.role, admin.id) && (
                               <>
                                 <button 
                                   onClick={() => {
                                     setSelectedUser(admin);
                                     setIsPreviewModalOpen(true);
                                   }}
                                   className="p-3 text-gray-300 hover:text-black hover:bg-white rounded-xl transition-all shadow-sm"
                                   title="Edit Role"
                                 >
                                    <ShieldCheck className="w-4 h-4" />
                                 </button>
                                 <button 
                                   onClick={() => handleToggleStatus(admin.id, admin.is_active)}
                                   className={`p-3 rounded-xl transition-all shadow-sm ${
 admin.is_active 
 ? 'text-gray-300 hover:text-red-600 hover:bg-red-50' 
 : 'text-green-600 bg-green-50 hover:bg-green-100'
 }`}
                                   title={admin.is_active ? "Deactivate Account" : "Activate Account"}
                                 >
                                    <Power className="w-4 h-4" />
                                 </button>
                                 <button
                                   onClick={() => handleDeleteUser(admin.id)}
                                   className="p-3 rounded-xl transition-all shadow-sm text-gray-300 hover:text-[#b50a0a] hover:bg-red-50"
                                   title="Delete Account"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                               </>
                             )}
                          </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>

           {/* Pending Invitations */}
           {invitations.length > 0 && (
             <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
               <div className="p-4 md:p-8 border-b border-gray-50">
                  <h2 className="text-xs font-bold text-gray-900 tracking-wide">Pending Access Tokens</h2>
                  <p className="text-xs font-bold text-gray-400 tracking-wide mt-2">Invitations sent that are yet to be claimed.</p>
               </div>
               <div className="overflow-x-auto w-full pb-4 custom-scrollbar">
                 <table className="w-full text-left text-base text-gray-600 whitespace-nowrap">
                   <tbody className="divide-y divide-gray-50">
                     {invitations.map((invite: Record<string, any>) => (
                       <tr key={invite.id} className="hover:bg-gray-50/50 transition-colors">
                         <td className="px-4 py-4">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
                                  <Mail className="w-5 h-5" />
                               </div>
                               <div>
                                  <p className="font-bold text-gray-900 text-base tracking-tight">{invite.email}</p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <Clock className="w-3 h-3 text-gray-300" />
                                    <p className="text-xs text-gray-400 font-bold tracking-wide">Expires <DateDisplay date={invite.expires_at} /></p>
                                  </div>
                               </div>
                            </div>
                         </td>
                         <td className="px-4 py-4">
                            <span className="px-3 py-1 rounded-lg bg-gray-50 text-gray-400 text-xs font-bold tracking-wide border border-gray-100">
                               {invite.role}
                            </span>
                         </td>
                         <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-4">
                               <button 
                                 onClick={() => handleResendInvite(invite.id)}
                                 disabled={loading}
                                 className="text-xs font-bold tracking-wide text-[#b50a0a] hover:bg-red-50 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                               >
                                  {loading ? 'Resending...' : 'Resend Invite'}
                               </button>
                                <button 
                                  onClick={() => handleRevokeInvite(invite.id)}
                                  disabled={loading}
                                  className="text-xs font-bold tracking-wide text-gray-400 hover:text-black transition-all disabled:opacity-50"
                                >
                                  Revoke
                                </button>
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
           )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
           <div className="bg-gray-900 p-10 rounded-[3rem] shadow-2xl shadow-gray-900/40 relative overflow-hidden group">
              <ShieldCheck className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 group-hover:rotate-12 transition-transform duration-700" />
              <h2 className="text-xs font-bold text-[#b50a0a] tracking-[0.3em] mb-6">Governance Logic</h2>
              <div className="space-y-3 relative z-10 text-xs font-extrabold text-gray-400 tracking-[0.15em]">
                 {[
                   { role: 'Superadmin', desc: 'Full system control. Permission root.' },
                   { role: 'Admin', desc: 'Full access. Cannot manage other Admins.' },
                   { role: 'Blogger', desc: 'CMS & Personal Profile only.' },
                   { role: 'Operations', desc: 'Directory management. No financials.' },
                   { role: 'Finance', desc: 'Financial oversight. No profile editing.' },
                   { role: 'Unassigned', desc: 'Basic dashboard. Pending verification.' }
                 ].map((inf, i) => (
                   <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-colors">
                      <p className={`${inf.role === 'Superadmin' ? 'text-[#b50a0a]' : 'text-white'} mb-1`}>{inf.role}</p>
                      <p className="text-xs font-bold tracking-wide normal-case text-gray-400">{inf.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md">
           <div className="absolute inset-0 bg-black/40" onClick={() => setIsInviteModalOpen(false)}></div>
           <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 animate-in zoom-in slide-in-from-bottom-8 duration-500 ease-out border border-white/20">
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="absolute top-4 md:p-8 right-8 p-3 text-gray-300 hover:text-black hover:bg-gray-50 rounded-2xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-10 text-center">
                 <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <UserPlus className="w-8 h-8 text-[#b50a0a]" />
                 </div>
                 <h3 className="text-3xl font-bold text-gray-900 tracking-tighter">Invite <span className="text-[#b50a0a]">Administrator</span></h3>
                 <p className="text-xs font-bold text-gray-400 tracking-[0.3em] mt-2">Send an encrypted invitation link via email.</p>
              </div>

              <form onSubmit={handleInvite} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Recipient Email</label>
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teammate@centerkick.com"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-[#b50a0a] focus:ring-4 focus:ring-red-900/5 outline-none transition-all font-bold text-base text-black"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Pre-assign Target Role</label>
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-[#b50a0a] outline-none transition-all font-bold text-base appearance-none text-black cursor-pointer"
                    >
                       {isSuper && <option value="admin">Administrator</option>}
                       <option value="blogger">Blogger / CMS Editor</option>
                       <option value="operations">Operations Specialist</option>
                       <option value="finance">Finance Manager</option>
                       <option value="unassigned">Unassigned (Dashboard Only)</option>
                    </select>
                 </div>


                 <button 
                   disabled={loading}
                   className="w-full py-5 bg-[#b50a0a] hover:bg-black text-white rounded-[1.5rem] font-bold text-sm tracking-[0.3em] transition-all shadow-xl shadow-red-900/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                 >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    Issue Invitation
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Preview & Role Assignment Modal */}
      {(isPreviewModalOpen && selectedUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md">
           <div className="absolute inset-0 bg-black/40" onClick={() => {
              setIsPreviewModalOpen(false);
              setSelectedUser(null);
           }}></div>
           <div className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl p-10 animate-in zoom-in slide-in-from-bottom-8 duration-500 ease-out border border-white/20">
              <button 
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  setSelectedUser(null);
                }}
                className="absolute top-4 md:p-8 right-8 p-3 text-gray-300 hover:text-black hover:bg-gray-50 rounded-2xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center mb-10">
                 <div className="w-24 h-24 rounded-[2rem] bg-gray-900 flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-2xl tracking-tighter">
                    {selectedUser.email?.[0]?.toUpperCase() || 'U'}
                 </div>
                 <h3 className="text-3xl font-bold text-gray-900 tracking-tighter">
                    {selectedUser.profiles?.first_name} <span className="text-[#b50a0a]">{selectedUser.profiles?.last_name}</span>
                 </h3>
                 <p className="text-xs font-bold text-gray-400 tracking-[0.3em] mt-2">{selectedUser.email}</p>
                 {selectedUser.is_verification_requested && (
                    <div className="mt-4 px-4 py-1.5 bg-red-50 text-[#b50a0a] rounded-full text-xs font-bold tracking-wide border border-red-100 flex items-center gap-2 animate-pulse">
                       <ShieldAlert className="w-3.5 h-3.5" /> Pending Verification Request
                    </div>
                 )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8 mb-10">
                 <div className="space-y-1">
                    <p className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-wide">
                       <MapPin className="w-3 h-3 text-[#b50a0a]" /> Location
                    </p>
                    <p className="text-sm font-bold text-gray-900">{selectedUser.profiles?.location || 'Not provided'}</p>
                 </div>
                 <div className="space-y-1 text-right">
                    <p className="flex items-center justify-end gap-2 text-xs font-bold text-gray-400 tracking-wide">
                       <CalendarIcon className="w-3 h-3 text-[#b50a0a]" /> Date of Birth
                    </p>
                    <p className="text-sm font-bold text-gray-900">{selectedUser.profiles?.date_of_birth || 'Not provided'}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-xs font-bold text-gray-900 tracking-wide ml-2">Assign Role & Approve Access</label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      ...(isSuper ? [{id: 'admin', label: 'Administrator', icon: ShieldCheck}] : []),
                      {id: 'blogger', label: 'Blogger', icon: FileText},
                      {id: 'operations', label: 'Operations', icon: Activity},
                      {id: 'finance', label: 'Finance', icon: CreditCard},
                      {id: 'unassigned', label: 'Revoke to Unassigned', icon: Clock}
                    ].map((r) => (
                      <button
                        key={r.id}
                        disabled={loading}
                        onClick={() => handleUpdateRole(selectedUser.id, r.id)}
                        className={`flex items-center justify-between p-4 rounded-3xl border-2 transition-all group ${
 selectedUser.role === r.id 
 ? 'bg-gray-900 border-gray-900 text-white' 
 : 'bg-white border-gray-100 hover:border-[#b50a0a]'
 }`}
                      >
                         <div className="flex items-center gap-3">
                            <r.icon className={`w-4 h-4 ${selectedUser.role === r.id ? 'text-[#b50a0a]' : 'text-gray-400 group-hover:text-[#b50a0a] transition-colors'}`} />
                            <span className="text-xs font-bold tracking-wide">{r.label}</span>
                         </div>
                         <div className={`w-1.5 h-1.5 rounded-full ${selectedUser.role === r.id ? 'bg-[#b50a0a]' : 'bg-transparent'}`}></div>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-50 flex justify-between items-center text-xs font-bold text-gray-400 tracking-wide">
                 <p>User Identity Verified &bull; Security Grade A</p>
                 <button 
                   onClick={() => handleToggleStatus(selectedUser.id, selectedUser.is_active)}
                   className="text-[#b50a0a] hover:underline"
                 >
                   {selectedUser.is_active ? 'Suspend Account' : 'Restore Account'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
