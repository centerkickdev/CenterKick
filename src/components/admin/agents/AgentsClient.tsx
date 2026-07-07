'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Shield, UserPlus, 
  MoreHorizontal, Edit, Trash2, ExternalLink, 
  ChevronLeft, ChevronRight, X, User, ChevronDown,
  Globe, Calendar, MapPin, Target, CheckCircle, Clock, CreditCard, Briefcase, Link2, Lock,
  Info, AlertCircle, Mail, RefreshCcw
} from 'lucide-react';
import { FlagIcon } from '@/components/common/FlagIcon';
import { RestrictedAccessInline, RestrictedAccess } from '@/components/admin/RestrictedAccess';
import { deleteAgent, updateAgent, addAgent, migrateAllAgentSlugs } from '@/app/admin/agents/actions';
import { checkAccountStatus, resendInvitation, AccountStatus } from '@/app/actions/auth';
import Link from 'next/link';
import Image from 'next/image';
import { COUNTRIES } from '@/lib/constants/countries';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

interface Agent {
  id: string;
  email: string;
  created_at: string;
  first_name: string;
  last_name: string;
  status: string;
  agency_name: string;
  country: string;
  age?: number;
  date_of_birth?: string;
  gender: string;
  is_subscribed: boolean;
  license_code?: string;
  clientCount?: number;
}

export function AgentsClient({ 
  initialAgents,
  totalCount,
  currentPage,
  pageSize,
  role
}: { 
  initialAgents: Agent[],
  totalCount: number,
  currentPage: number,
  pageSize: number,
  role: string
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<AccountStatus>('NONE');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const { showToast } = useToast();

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setIsAddModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!email || !email.includes('@')) {
      setEmailStatus('NONE');
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingEmail(true);
      const res = await checkAccountStatus(email);
      setEmailStatus(res.status);
      setIsCheckingEmail(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  const handleResendInv = async (e: React.MouseEvent) => {
    e.preventDefault();
    const lastName = (document.querySelector('input[name="last_name"]') as HTMLInputElement)?.value || 'User';
    const res = await resendInvitation(email, 'agent', lastName);
    if (res.success) {
      showToast("Invitation email resent successfully.", "success");
    } else {
      const errorMsg = res.error || "Failed to resend invitation.";
      showToast(errorMsg, "error");
    }
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('add');
    router.replace(`/admin/agents?${params.toString()}`);
  };

  const navigateToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/agents?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set('page', '1');
    router.push(`/admin/agents?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('q', searchQuery);
  };

   const handleOpenProfile = (agent: Record<string, any>) => {
    router.push(`/admin/agents/${agent.slug}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      const res = await deleteAgent(id);
      if (res.success) {
        showToast("The agent profile has been successfully removed.", "success");
        window.location.reload();
      } else {
        showToast(res.error || "Failed to delete agent.", "error");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search & Filters */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
           <div className="relative flex-1 min-w-0 md:min-w-full max-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black" />
              <input 
                type="text" 
                placeholder="Search name, email or agency..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-[11px] font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all text-gray-900 placeholder:text-gray-900"
              />
           </div>
           <div className="flex flex-wrap gap-2">
              <select 
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                value={searchParams.get('gender') || ''}
                className="bg-gray-50 border-none rounded-lg text-[9px] font-black tracking-wide px-3 py-2 focus:ring-2 focus:ring-[#b50a0a] text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%20stroke%3D%22%23b50a0a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_0.5rem_center] bg-no-repeat pr-6"
              >
                 <option value="" className="text-gray-900">Gen</option>
                 <option value="Male" className="text-gray-900">Male</option>
                 <option value="Female" className="text-gray-900">Female</option>
              </select>
              <div className="relative">
                 <input 
                   list="countries-agents"
                   placeholder="Country"
                   onChange={(e) => handleFilterChange('country', e.target.value)}
                   value={searchParams.get('country') || ''}
                   className="w-32 bg-gray-50 border-none rounded-lg text-[9px] font-black tracking-wide pl-3 pr-8 py-2 focus:ring-2 focus:ring-[#b50a0a] text-gray-900 placeholder:text-gray-900"
                 />
                 <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#b50a0a]" />
              </div>
              <datalist id="countries-agents">
                 {COUNTRIES.map(country => (
                    <option key={country} value={country} />
                 ))}
              </datalist>
              <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg font-black text-[9px] tracking-wide hover:bg-[#b50a0a] transition-all">
                Search
              </button>
           </div>
        </form>

        {/* Agents Table */}
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left text-base text-gray-600 whitespace-nowrap">
            <thead className="bg-[#f8f9fa] border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[9px] font-black tracking-wide text-[#b50a0a]">Agent Details</th>
                <th className="px-6 py-4 text-[9px] font-black tracking-wide text-[#b50a0a]">Agency / Brand</th>
                <th className="px-6 py-4 text-[9px] font-black tracking-wide text-[#b50a0a]">Manageable Assets</th>
                <th className="px-6 py-4 text-[9px] font-black tracking-wide text-[#b50a0a] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialAgents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                     <Briefcase className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                     <p className="text-[10px] font-black tracking-wide text-gray-400">No agents matches your search criteria.</p>
                  </td>
                </tr>
              ) : (
                initialAgents.map((agent) => (
                  <tr 
                    key={agent.id} 
                    onClick={() => handleOpenProfile(agent)}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center font-black text-white text-sm shrink-0">
                             {agent.email?.[0]?.toUpperCase() || 'A'}
                          </div>
                          <div className="min-w-0">
                             <p className="font-black text-gray-900 leading-none truncate text-[11px] mb-1">{agent.first_name} {agent.last_name}</p>
                             <div className="flex items-center gap-1.5">
                                <span className="text-[8px] font-bold text-gray-400 tracking-wide flex items-center gap-1">
                                   <FlagIcon country={agent.country || ''} className="w-3 h-2" /> {agent.country || 'N/A'}
                                </span>
                                <span className="text-[8px] font-bold text-gray-400">•</span>
                                <span className="text-[8px] font-bold text-gray-400 tracking-wide">Licensed Agent</span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-900 tracking-tighter truncate max-w-full max-w-[150px]">{agent.agency_name || 'Independent'}</span>
                          <span className="text-[8px] font-bold text-gray-400 tracking-wide mt-0.5">Sports Management</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-gray-900 tracking-tighter">{agent.clientCount || 0} Clients Linked</span>
                             <div className="flex items-center gap-2 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                                <span className="text-[8px] font-black tracking-wide text-green-600">
                                   PRO
                                </span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-1.5 text-gray-300 hover:text-black transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Tools */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
           <p className="text-[10px] font-black text-gray-400 tracking-wide">
              Showing <span className="text-gray-900">{initialAgents.length}</span> of <span className="text-gray-900">{totalCount}</span> Agents
           </p>
           <div className="flex items-center gap-3">
              <button 
                 onClick={async () => {
                    if (confirm("Are you sure you want to migrate all agent slugs to the new CK format?")) {
                       const res = await migrateAllAgentSlugs();
                       if (res.success) showToast(`Successfully migrated ${res.count} slugs.`, 'success');
                       else showToast(res.error || "Migration failed", "error");
                    }
                 }}
                 className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-3 rounded-xl font-black text-[9px] tracking-wide transition-all flex items-center gap-2"
              >
                 <RefreshCcw className="w-3.5 h-3.5" /> Fix Slugs
              </button>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => navigateToPage(currentPage - 1)}
                className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:text-black hover:border-black transition-all disabled:opacity-30 disabled:hover:border-gray-100" 
                disabled={currentPage === 1}
              >
                 <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                 {Array.from({ length: totalPages }).map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => navigateToPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-[#b50a0a] text-white' : 'hover:bg-gray-50 text-gray-400'}`}
                    >
                       {i + 1}
                    </button>
                 ))}
              </div>
              <button 
                onClick={() => navigateToPage(currentPage + 1)}
                className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:text-black hover:border-black transition-all disabled:opacity-30" 
                disabled={currentPage === totalPages}
              >
                 <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>      {/* Profile Detail Modal */}

      {/* Add Agent Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
           <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-[1.5rem] shadow-2xl overflow-hidden relative flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                 <div>
                    <h3 className="text-xl font-black tracking-tighter">
                       <span className="text-gray-900">Enroll New</span> <span className="text-[#b50a0a]">Agent</span>
                    </h3>
                    <p className="text-[8px] font-bold text-gray-900 tracking-wide mt-1">Onboard agency partner & manage network</p>
                 </div>
                 <button onClick={closeAddModal} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-100">
                    <X className="w-4 h-4 text-gray-400" />
                 </button>
              </div>
               <form action={async (formData) => {
                  if (emailStatus === 'REGISTERED') {
                     showToast("This email is already registered. Please use a different email.", "error");
                     return;
                  }
                  const res = await addAgent(formData);
                  if (res.success) {
                     showToast("The agent has been successfully enrolled.", "success");
                     closeAddModal();
                  } else {
                     const errorMsg = (res as Record<string, any>).error || "Failed to enroll agent.";
                     showToast(errorMsg, "error");
                  }
               }} className="p-6 space-y-4 overflow-y-auto">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">First Name</label>
                       <input name="first_name" required type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-[11px] font-bold focus:ring-1 focus:ring-[#b50a0a] text-black" placeholder="Ex: Alex" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">Last Name</label>
                       <input name="last_name" required type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-[11px] font-bold focus:ring-1 focus:ring-[#b50a0a] text-black" placeholder="Ex: Mendes" />
                    </div>
                     <div className="md:col-span-2 space-y-1">
                        <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1 flex justify-between">
                           <span>Email Address</span>
                           {isCheckingEmail && <span className="text-[7px] text-[#b50a0a] animate-pulse">Checking status...</span>}
                        </label>
                        <input 
                          name="email" 
                          required 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full bg-gray-50 border-none rounded-xl p-3 text-[11px] font-bold focus:ring-1 focus:ring-[#b50a0a] text-black placeholder:text-gray-900 ${emailStatus === 'REGISTERED' ? 'ring-1 ring-red-500 bg-red-50/10' : ''}`} 
                          placeholder="agency@centerkick.com" 
                        />
                        {emailStatus === 'REGISTERED' && (
                          <div className="flex items-center gap-2 mt-1 px-2 py-1 bg-red-50 rounded-lg border border-red-100">
                             <AlertCircle className="w-3 h-3 text-red-500" />
                             <p className="text-[8px] font-black text-red-600 tracking-wide">Email already registered as a member.</p>
                          </div>
                        )}
                        {emailStatus === 'PROSPECT' && (
                          <div className="flex items-center justify-between mt-1 px-2 py-1 bg-blue-50 rounded-lg border border-blue-100">
                             <div className="flex items-center gap-2">
                                <Info className="w-3 h-3 text-blue-500" />
                                <p className="text-[8px] font-black text-blue-600 tracking-wide">Enrolled as prospect (Not yet joined).</p>
                             </div>
                             <button 
                                onClick={handleResendInv}
                                className="text-[8px] font-black underline text-[#b50a0a] hover:text-black tracking-wide"
                             >
                                Resend Invitation?
                             </button>
                          </div>
                        )}
                     </div>
                    <div className="p-4 bg-gray-50/50 rounded-2xl md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-100">
                        <div className="space-y-1 md:col-span-2">
                           <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">Agency Name</label>
                           <input name="agency_name" required type="text" className="w-full bg-white border border-gray-100 rounded-lg p-3 text-[10px] font-bold focus:ring-1 focus:ring-[#b50a0a] text-black" placeholder="Ex: Gestifute Sports" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">License Code</label>
                           <input name="license_code" type="text" className="w-full bg-white border border-gray-100 rounded-lg p-2 text-[10px] font-bold focus:ring-1 focus:ring-[#b50a0a] text-black" placeholder="Ex: FIFA-2024-XXXX" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">Country</label>
                           <div className="relative group">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <FlagIcon 
                                  country={selectedCountry} 
                                  className="w-4 h-2.5" 
                                />
                              </div>
                              <input 
                                name="country" 
                                list="countries-agent-modal" 
                                required 
                                type="text" 
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                className="w-full bg-white border border-gray-100 rounded-lg pl-9 pr-3 py-2 text-[10px] font-bold focus:ring-1 focus:ring-[#b50a0a] text-black placeholder:text-gray-900" 
                                placeholder="Ex: Portugal" 
                              />
                           </div>
                           <datalist id="countries-agent-modal">
                              {COUNTRIES.map(country => (
                                 <option key={country} value={country} className="text-black" />
                              ))}
                           </datalist>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">Date of Birth</label>
                           <input name="date_of_birth" required type="date" className="w-full bg-white border border-gray-100 rounded-lg p-2 text-[10px] font-bold focus:ring-1 focus:ring-[#b50a0a] text-black" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">Gender</label>
                           <select name="gender" className="w-full bg-white border border-gray-100 rounded-lg p-2 text-[10px] font-bold focus:ring-1 focus:ring-[#b50a0a] text-black">
                              <option value="Male" className="text-black">Male</option>
                              <option value="Female" className="text-black">Female</option>
                           </select>
                        </div>
                    </div>
                 </div>
                 <div className="pt-2">
                    <button type="submit" className="w-full bg-[#b50a0a] text-white py-3.5 rounded-xl font-black tracking-wide shadow-xl shadow-red-900/10 hover:bg-black transition-all text-[10px] active:scale-[0.98]">
                        Confirm Partner Enrollment
                    </button>
                    <p className="text-[7px] text-gray-900 text-center font-bold tracking-wide mt-2 opacity-60">Partner will receive access links instantly.</p>
                 </div>
               </form>
           </div>
        </div>
      )}

    </div>
  );
}
