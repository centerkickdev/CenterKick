'use client';

import { useState, useTransition, useRef, useEffect, useMemo } from 'react';
import { 
  Search, User, Shield, CheckCircle, Clock, XCircle,
  MoreVertical, Calendar, UserCheck, Briefcase, 
  Trophy, Eye, Users, ChevronRight, AlertTriangle,
  UserX, RefreshCw, ShieldCheck, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { activateUser, deactivateUser, changeUserRole, rejectUser, deleteUsers } from '@/app/admin/users/actions';
import { DirectoryTable } from '@/components/admin/shared/DirectoryTable';

interface UsersClientProps {
  initialUsers: any[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

const PARTICIPANT_ROLES = ['player', 'coach', 'agent', 'scout', 'organization'];

export function UsersClient({ initialUsers, totalCount, currentPage, pageSize }: UsersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentRole = searchParams.get('role') || 'all';
  const currentSearch = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  
  const filteredUsers = useMemo(() => initialUsers, [initialUsers]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  };

  const handleRoleFilter = (role: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (role === 'all') params.delete('role');
    else params.set('role', role);
    params.set('page', '1');
    startTransition(() => router.push(`/admin/users?${params.toString()}`, { scroll: false }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) params.set('q', searchTerm);
    else params.delete('q');
    params.set('page', '1');
    startTransition(() => router.push(`/admin/users?${params.toString()}`, { scroll: false }));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(filteredUsers.map(u => u.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBatchDelete = async (ids: string[]) => {
    setIsDeleting(true);
    setToast(null);
    try {
      const res = await deleteUsers(ids);
      if (res.error) {
        setToast({ type: 'error', message: res.error });
      } else {
        setToast({ type: 'success', message: `Successfully deleted ${ids.length} account(s).` });
        setSelectedIds([]);
        setOpenDropdown(null);
        startTransition(() => router.refresh());
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'An error occurred' });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const runAction = async (userId: string, action: () => Promise<{ success?: boolean; error?: string }>) => {
    setActionLoading(userId);
    setOpenDropdown(null);
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
      setTimeout(() => setToast(null), 5000);
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'player': return <Trophy className="w-3.5 h-3.5" />;
      case 'coach': return <UserCheck className="w-3.5 h-3.5" />;
      case 'agent': return <Briefcase className="w-3.5 h-3.5" />;
      case 'scout': return <Search className="w-3.5 h-3.5" />;
      case 'organization': return <Users className="w-3.5 h-3.5" />;
      case 'superadmin': case 'admin': return <ShieldCheck className="w-3.5 h-3.5" />;
      default: return <Shield className="w-3.5 h-3.5" />;
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) return (
      <span className="w-fit px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-1 whitespace-nowrap">
        <XCircle className="w-2.5 h-2.5" /> Deactivated
      </span>
    );
    switch (status?.toLowerCase()) {
      case 'active':
        return <span className="w-fit px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100 flex items-center gap-1 whitespace-nowrap"><CheckCircle className="w-2.5 h-2.5" /> Active</span>;
      case 'pending':
        return <span className="w-fit px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100 flex items-center gap-1 whitespace-nowrap"><Clock className="w-2.5 h-2.5" /> Pending</span>;
      case 'rejected':
        return <span className="w-fit px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-1 whitespace-nowrap"><XCircle className="w-2.5 h-2.5" /> Rejected</span>;
      default:
        return <span className="w-fit px-2 py-1 bg-gray-50 text-gray-400 text-xs font-bold rounded-lg border border-gray-100 flex items-center gap-1 whitespace-nowrap"><Clock className="w-2.5 h-2.5" /> Incomplete</span>;
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">

      {/* Toast Notification */}
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

      {/* Controls */}
      <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search accounts by email or name..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#b50a0a]/10 focus:border-[#b50a0a] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 border border-gray-200 rounded-xl">
            {['all', 'player', 'coach', 'agent', 'scout', 'organization'].map((r) => (
              <button
                key={r}
                onClick={() => handleRoleFilter(r)}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
 currentRole === r ? 'bg-[#b50a0a] text-white shadow-lg' : 'text-gray-400 hover:text-[#b50a0a]'
 }`}
              >
                {r === 'all' ? 'All Roles' : r === 'organization' ? 'Orgs' : r + 's'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table via DirectoryTable */}
      <div ref={dropdownRef}>
        <DirectoryTable
        data={filteredUsers}
        columns={[
          { key: 'account', label: 'Account User', width: 'w-[35%]' },
          { key: 'identity', label: 'Identity / Role', width: 'w-[20%]', className: 'whitespace-nowrap' },
          { key: 'status', label: 'Status', width: 'w-[15%]', className: 'whitespace-nowrap' },
          { key: 'registered', label: 'Registered On', width: 'w-[15%]', className: 'whitespace-nowrap' },
          { key: 'actions', label: 'Actions', width: 'w-[15%]', className: 'text-right whitespace-nowrap' }
        ]}
        isPending={isPending}
        isDeleting={isDeleting}
        onBatchDelete={handleBatchDelete}
        emptyStateMessage="No users found."
        renderRow={(user, isSelected, toggleSelect, triggerDelete) => {
          const isLoading = actionLoading === user.id;
          const profileStatus = user.profile?.status;
          const isActive = user.is_active !== false;
          const isPendingActivation = profileStatus === 'pending' && isActive;
          const isParticipant = PARTICIPANT_ROLES.includes(user.role);

          return (
            <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors group ${isSelected ? 'bg-red-50/30' : ''}`}>
              <td className="px-4 md:px-6 py-6 border-b border-gray-50">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-[#b50a0a] focus:ring-[#b50a0a]"
                  checked={isSelected}
                  onChange={toggleSelect}
                />
              </td>
              <td className="px-2 md:px-4 py-6 border-b border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center font-bold text-white text-sm border-2 border-white shadow-md shrink-0">
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.email}</p>
                    <p className="text-xs font-bold text-gray-400 tracking-wide truncate">
                      {user.profile?.first_name
                        ? `${user.profile.first_name} ${user.profile.last_name || ''}`.trim()
                        : `UID: ${user.id.substring(0, 8)}`}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 md:px-8 py-6 border-b border-gray-50 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${user.role ? 'bg-red-50 text-[#b50a0a]' : 'bg-gray-100 text-gray-400'}`}>
                        {getRoleIcon(user.role)}
                      </div>
                      <span className={`text-xs font-bold tracking-wide ${user.role ? 'text-gray-900' : 'text-gray-300'}`}>
                        {user.role || 'Unassigned'}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 md:px-8 py-6 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(profileStatus, isActive)}
                      {/* Inline Approve button for pending accounts */}
                      {isPendingActivation && isParticipant && (
                        <button
                          onClick={() => runAction(user.id, () => activateUser(user.id))}
                          disabled={isLoading}
                          className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all flex items-center gap-1 w-fit disabled:opacity-50"
                        >
                          {isLoading ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <CheckCircle className="w-2.5 h-2.5" />}
                          Approve
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-4 md:px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{format(new Date(user.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </td>

                  <td className="px-4 md:px-8 py-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-sm"
                        title="View full profile"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                          disabled={isLoading}
                          className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
                          title="More actions"
                        >
                          {isLoading 
                            ? <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                            : <MoreVertical className="w-4 h-4 text-gray-400" />}
                        </button>

                        {openDropdown === user.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2">
                              {isActive ? (
                                <button
                                  onClick={() => runAction(user.id, () => deactivateUser(user.id))}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wide text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <UserX className="w-3.5 h-3.5" /> Deactivate Account
                                </button>
                              ) : (
                                <button
                                  onClick={() => runAction(user.id, () => activateUser(user.id))}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wide text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Activate Account
                                </button>
                              )}

                              {isPendingActivation && isParticipant && (
                                <button
                                  onClick={() => runAction(user.id, () => activateUser(user.id))}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wide text-green-700 hover:bg-green-50 rounded-xl transition-all"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" /> Approve & Activate
                                </button>
                              )}

                              {profileStatus === 'pending' && isParticipant && (
                                <button
                                  onClick={() => runAction(user.id, () => rejectUser(user.id))}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wide text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject Application
                                </button>
                              )}

                              <div className="h-px bg-gray-100 my-1"></div>

                              <Link
                                href={`/admin/users/${user.id}`}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wide text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Full Profile
                                <ChevronRight className="w-3 h-3 ml-auto" />
                              </Link>
                              
                              <div className="h-px bg-gray-100 my-1"></div>

                              <button
                                onClick={triggerDelete}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-wide text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Account
                              </button>
                            </div>
                          </div>
                        </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            }}
          />
      </div>
      {/* Empty State */}
      {initialUsers.length === 0 && (
        <div className="p-24 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tighter">No Accounts Found</h3>
          <p className="text-gray-400 text-sm font-bold max-w-xs mt-2">Try adjusting your filters or search terms to find the user.</p>
        </div>
      )}

      {/* Pagination */}
      <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
        <p className="text-xs font-bold text-gray-400 tracking-wide">
          Showing {initialUsers.length} of {totalCount} Records
        </p>
        <div className="flex gap-2">
          {currentPage > 1 && (
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', String(currentPage - 1));
                startTransition(() => router.push(`/admin/users?${params.toString()}`, { scroll: false }));
              }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold tracking-wide text-gray-900 hover:bg-gray-900 hover:text-white transition-all"
            >
              Previous
            </button>
          )}
          {initialUsers.length === pageSize && (
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', String(currentPage + 1));
                startTransition(() => router.push(`/admin/users?${params.toString()}`, { scroll: false }));
              }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold tracking-wide text-gray-900 hover:bg-gray-900 hover:text-white transition-all"
            >
              Next Page
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
