'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Users, Search, Filter, Shield, UserPlus, 
  MoreHorizontal, Edit, Trash2, ExternalLink, 
  ChevronLeft, ChevronRight, X, User, ChevronDown,
  Globe, Calendar, MapPin, Target, CheckCircle, Clock, CreditCard, UserCheck, Briefcase, Lock, Mail
} from 'lucide-react';
import { DirectoryTable } from '../shared/DirectoryTable';
import { RestrictedAccessInline, RestrictedAccess } from '@/components/admin/RestrictedAccess';
import { DateDisplay } from '@/components/common/DateDisplay';
import { deleteCoach, updateCoach, addCoach, migrateAllCoachSlugs } from '@/app/admin/coaches/actions';
import { checkAccountStatus, resendInvitation, AccountStatus } from '@/app/actions/auth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { Info, AlertCircle, ImageIcon, Eye, Activity, RefreshCcw } from 'lucide-react';
import { FlagIcon } from '@/components/common/FlagIcon';

interface Coach {
  id: string;
  email: string;
  created_at: string;
  first_name: string;
  last_name: string;
  status: string;
  position: string;
  country: string;
  age: number;
  gender: string;
  is_subscribed: boolean;
  league?: string;
  agent_id?: string;
  slug?: string;
}

export function CoachesClient({ 
  initialCoaches,
  agents,
  totalCount,
  currentPage,
  pageSize,
  role,
  leagues,
  clubs,
  countries
}: { 
  initialCoaches: Coach[],
  agents: any[],
  totalCount: number,
  currentPage: number,
  pageSize: number,
  role: string,
  leagues: any[],
  clubs: any[],
  countries: any[]
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<AccountStatus>('NONE');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('');
  const [dob, setDob] = useState({ day: '', month: '', year: '' });
  const [calculatedAge, setCalculatedAge] = useState<string | null>(null);
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

  useEffect(() => {
    if (dob.day && dob.month && dob.year) {
      const birthDate = new Date(`${dob.year}-${dob.month}-${dob.day}`);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setCalculatedAge(`${age} YRS OLD`);
    } else {
      setCalculatedAge(null);
    }
  }, [dob]);

  const handleResendInv = async (e: React.MouseEvent) => {
    e.preventDefault();
    const lastName = (document.querySelector('input[name="last_name"]') as HTMLInputElement)?.value || 'User';
    const res = await resendInvitation(email, 'coach', lastName);
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
    router.replace(`/admin/coaches?${params.toString()}`);
  };

  const navigateToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/coaches?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set('page', '1'); // Reset to page 1 on filter
    router.push(`/admin/coaches?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('q', searchQuery);
  };

  const handleOpenProfile = (coach: Coach) => {
    router.push(`/admin/coaches/${coach.slug}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this coach?')) {
      const res = await deleteCoach(id);
      if (res.success) {
        showToast("The coach profile has been successfully removed.", "success");
        window.location.reload();
      } else {
        showToast(res.error || "Failed to delete coach.", "error");
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
                placeholder="Search name, email or league..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-xs font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all text-gray-900 placeholder:text-gray-900"
              />
           </div>
           <div className="flex flex-wrap gap-2">
              <select 
                onChange={(e) => handleFilterChange('position', e.target.value)}
                value={searchParams.get('position') || ''}
                className="bg-gray-50 border-none rounded-lg text-xs font-bold tracking-wide px-3 py-2 focus:ring-2 focus:ring-[#b50a0a] text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%20stroke%3D%22%23b50a0a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_0.5rem_center] bg-no-repeat pr-6"
              >
                 <option value="" className="text-gray-900">Role</option>
                 <option value="Head Coach">Head Coach</option>
                 <option value="Assistant Coach">Assistant</option>
                 <option value="Goalkeeping Coach">Goalkeeper</option>
                 <option value="Fitness Coach">Fitness</option>
              </select>
              <select 
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                value={searchParams.get('gender') || ''}
                className="bg-gray-50 border-none rounded-lg text-xs font-bold tracking-wide px-3 py-2 focus:ring-2 focus:ring-[#b50a0a] text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%20stroke%3D%22%23b50a0a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_0.5rem_center] bg-no-repeat pr-6"
              >
                 <option value="" className="text-gray-900">Gen</option>
                 <option value="Male" className="text-gray-900">Male</option>
                 <option value="Female" className="text-gray-900">Female</option>
              </select>
              <input 
                type="number"
                placeholder="Age"
                onChange={(e) => handleFilterChange('age', e.target.value)}
                value={searchParams.get('age') || ''}
                className="w-16 bg-gray-50 border-none rounded-lg text-xs font-bold tracking-wide px-3 py-2 focus:ring-2 focus:ring-[#b50a0a] text-gray-900 placeholder:text-gray-300"
              />
              <div className="relative">
                 <input 
                   list="countries-coaches"
                   placeholder="Country"
                   onChange={(e) => handleFilterChange('country', e.target.value)}
                   value={searchParams.get('country') || ''}
                   className="w-32 bg-gray-50 border-none rounded-lg text-xs font-bold tracking-wide pl-3 pr-8 py-2 focus:ring-2 focus:ring-[#b50a0a] text-gray-900 placeholder:text-gray-900"
                 />
                 <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#b50a0a]" />
              </div>
              <datalist id="countries-coaches">
                 {countries.map((c: any) => (
                    <option key={c.id} value={c.name} />
                 ))}
              </datalist>
              <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg font-bold text-xs tracking-wide hover:bg-[#b50a0a] transition-all">
                Search
              </button>
           </div>
                       </form>

        {/* Coaches Table */}
        <DirectoryTable
          data={initialCoaches}
          columns={[
            { key: 'coach', label: 'Coach Information', width: 'w-[35%]' },
            { key: 'specialization', label: 'Specialization', width: 'w-[25%]' },
            { key: 'league', label: 'League / Credentials', width: 'w-[25%]' },
            { key: 'actions', label: 'Actions', width: 'w-[15%]', className: 'text-right whitespace-nowrap' }
          ]}
          isPending={false}
          emptyStateMessage="No coaches matches your search criteria."
          getItemId={(c) => c.id}
          renderRow={(coach) => (
            <tr 
              key={coach.id} 
              onClick={() => handleOpenProfile(coach)}
              className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
            >
              <td className="px-4 md:px-6 py-6 border-b border-gray-50">
                 <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center font-bold text-white text-sm shrink-0">
                       {coach.email?.[0]?.toUpperCase() || 'C'}
                    </div>
                    <div className="min-w-0 flex-1">
                       <p className="font-bold text-gray-900 leading-none truncate text-xs mb-1">{coach.first_name} {coach.last_name}</p>
                       <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-400 tracking-wide flex items-center gap-1">
                             <FlagIcon country={coach.country || ''} className="w-3 h-2" /> {coach.country || 'N/A'}
                          </span>
                          <span className="text-xs font-bold text-gray-400">•</span>
                          <span className="text-xs font-bold text-gray-400 tracking-wide">{coach.age || '--'} YRS</span>
                       </div>
                    </div>
                 </div>
              </td>
              <td className="px-4 md:px-6 py-6 border-b border-gray-50">
                 <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 tracking-tighter">{coach.position || 'Head Coach'}</span>
                    <span className="text-xs font-bold text-gray-400 tracking-wide mt-0.5">Expert Member</span>
                 </div>
              </td>
              <td className="px-4 md:px-6 py-6 border-b border-gray-50">
                 <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 tracking-tighter truncate max-w-full max-w-[150px]">{coach.league || 'Independent'}</span>
                    <div className="flex items-center gap-2 mt-1">
                       {role === 'operations' ? (
                         <RestrictedAccessInline />
                       ) : (
                         <>
                           <div className={`w-1.5 h-1.5 rounded-full ${coach.is_subscribed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-300'}`}></div>
                           <span className={`text-xs font-bold tracking-wide ${coach.is_subscribed ? 'text-green-600' : 'text-gray-400'}`}>
                              {coach.is_subscribed ? 'PRO' : 'Standard'}
                           </span>
                         </>
                       )}
                    </div>
                 </div>
              </td>
              <td className="px-4 md:px-6 py-6 border-b border-gray-50 text-right">
                 <button className="p-1.5 text-gray-300 hover:text-black transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                 </button>
              </td>
            </tr>
          )}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
           <p className="text-xs font-bold text-gray-400 tracking-wide">
              Showing <span className="text-gray-900">{initialCoaches.length}</span> of <span className="text-gray-900">{totalCount}</span> Coaches
           </p>
           <div className="flex items-center gap-3">
             <button 
                onClick={async () => {
                   if (confirm("Are you sure you want to migrate all coach profile slugs to the new CK format?")) {
                      const res = await migrateAllCoachSlugs();
                      if (res.success) showToast(`Successfully migrated ${res.count} coach slugs.`, 'success');
                      else showToast(res.error || "Migration failed", "error");
                   }
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-3 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center gap-2"
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
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-[#b50a0a] text-white' : 'hover:bg-gray-50 text-gray-400'}`}
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
      </div>

      {/* Add Coach Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
           <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-[1.5rem] shadow-2xl overflow-hidden relative flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                 <div>
                    <h3 className="text-xl font-bold tracking-tighter">
                       <span className="text-gray-900">Enroll New</span> <span className="text-[#b50a0a]">Coach</span>
                    </h3>
                    <p className="text-xs font-bold text-gray-900 tracking-wide mt-1">Direct enrollment & automated onboarding</p>
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
                  const res = await addCoach(formData);
                  if (res.success) {
                     showToast("The coach has been successfully enrolled.", "success");
                     closeAddModal();
                  } else {
                     const errorMsg = (res as any).error || "Failed to enroll coach.";
                     showToast(errorMsg, "error");
                  }
               }} className="p-6 space-y-4 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">First Name</label>
                        <input name="first_name" required type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-gray-900" placeholder="Ex: John" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Last Name</label>
                        <input name="last_name" required type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-gray-900" placeholder="Ex: Doe" />
                     </div>
                      <div className="md:col-span-2 space-y-1">
                         <label className="text-xs font-bold text-gray-900 tracking-wide ml-1 flex justify-between">
                            <span>Email Address</span>
                            {isCheckingEmail && <span className="text-[7px] text-[#b50a0a] animate-pulse">Checking status...</span>}
                         </label>
                         <input 
                           name="email" 
                           required 
                           type="email" 
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className={`w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-gray-900 placeholder:text-gray-900 ${emailStatus === 'REGISTERED' ? 'ring-1 ring-red-500 bg-red-50/10' : ''}`} 
                           placeholder="coach@centerkick.com" 
                         />
                         {emailStatus === 'REGISTERED' && (
                           <div className="flex items-center gap-2 mt-1 px-2 py-1 bg-red-50 rounded-lg border border-red-100">
                              <AlertCircle className="w-3 h-3 text-red-500" />
                              <p className="text-xs font-bold text-red-600 tracking-wide">Email already registered as a member.</p>
                           </div>
                         )}
                         {emailStatus === 'PROSPECT' && (
                           <div className="flex items-center justify-between mt-1 px-2 py-1 bg-blue-50 rounded-lg border border-blue-100">
                              <div className="flex items-center gap-2">
                                 <Info className="w-3 h-3 text-blue-500" />
                                 <p className="text-xs font-bold text-blue-600 tracking-wide">Enrolled as prospect (Not yet joined).</p>
                              </div>
                              <button 
                                 onClick={handleResendInv}
                                 className="text-xs font-bold underline text-[#b50a0a] hover:text-black tracking-wide"
                              >
                                 Resend Invitation?
                              </button>
                           </div>
                         )}
                      </div>
                     <div className="p-4 bg-gray-50/50 rounded-2xl md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-100">
                         <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Coaching Role</label>
                            <select name="position" className="w-full bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-gray-900">
                               <option value="Head Coach">Head Coach</option>
                               <option value="Assistant Coach">Assistant Coach</option>
                               <option value="Goalkeeping Coach">Goalkeeping Coach</option>
                               <option value="Fitness Coach">Fitness Coach</option>
                               <option value="Set Piece Coach">Set Piece Coach</option>
                               <option value="Medical Coach">Medical Coach</option>
                            </select>
                         </div>
                         <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">League</label>
                            <select 
                              name="league" 
                              className="w-full bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-gray-900"
                              onChange={(e) => setSelectedLeague(e.target.value)}
                              value={selectedLeague}
                            >
                               <option value="">No League</option>
                               {leagues.map((l: any) => (
                                 <option key={l.id} value={l.name}>{l.name}</option>
                               ))}
                            </select>
                         </div>
                         <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Current Club</label>
                            <select name="current_club" className="w-full bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-gray-900">
                               <option value="">Unattached</option>
                               {clubs.filter((c: any) => c.leagues?.name === selectedLeague).map((club: any) => (
                                 <option key={club.id} value={club.name}>{club.name}</option>
                               ))}
                            </select>
                         </div>
                         <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Country</label>
                            <div className="relative group">
                               <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                 <FlagIcon 
                                   country={selectedCountry} 
                                   className="w-4 h-2.5" 
                                 />
                               </div>
                               <input 
                                 name="country" 
                                 list="countries-coach-modal" 
                                 required 
                                 type="text" 
                                 value={selectedCountry}
                                 onChange={(e) => setSelectedCountry(e.target.value)}
                                 className="w-full bg-white border border-gray-100 rounded-lg pl-9 pr-3 py-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-gray-900 placeholder:text-gray-900" 
                                 placeholder="Ex: Nigeria" 
                               />
                            </div>
                            <datalist id="countries-coach-modal">
                               {countries.map((c: any) => (
                                  <option key={c.id} value={c.name} />
                               ))}
                            </datalist>
                         </div>

                         {/* Agent Selection */}
                         <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Assigned Agent</label>
                            <select name="agent_id" className="w-full bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-gray-900">
                               <option value="">Independent (No Agent)</option>
                               {agents.map((a: any) => (
                                 <option key={a.id} value={a.user_id}>{a.first_name} {a.last_name} {a.agency_name ? `(${a.agency_name})` : ''}</option>
                               ))}
                            </select>
                         </div>

                         <div className="space-y-1">
                            <div className="flex items-center justify-between ml-1">
                               <label className="text-xs font-bold text-red-500 tracking-wide">Birthdate</label>
                               {calculatedAge && (
                                  <span className="text-xs font-bold text-[#b50a0a] animate-in fade-in zoom-in duration-300">
                                     {calculatedAge}
                                  </span>
                               )}
                            </div>
                            <div className="flex gap-2">
                               <select 
                                 className="flex-1 bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-gray-900"
                                 onChange={(e) => setDob(prev => ({ ...prev, day: e.target.value }))}
                                 required
                               >
                                  <option value="">DD</option>
                                  {Array.from({ length: 31 }, (_, i) => (
                                     <option key={i+1} value={String(i+1).padStart(2, '0')}>{i+1}</option>
                                  ))}
                               </select>
                               <select 
                                 className="flex-1 bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-gray-900"
                                 onChange={(e) => setDob(prev => ({ ...prev, month: e.target.value }))}
                                 required
                               >
                                  <option value="">MM</option>
                                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                     <option key={m} value={String(i+1).padStart(2, '0')}>{m}</option>
                                  ))}
                               </select>
                               <select 
                                 className="flex-1 bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-gray-900"
                                 onChange={(e) => setDob(prev => ({ ...prev, year: e.target.value }))}
                                 required
                               >
                                  <option value="">YYYY</option>
                                  {Array.from({ length: 70 }, (_, i) => (
                                     <option key={i} value={String(new Date().getFullYear() - 15 - i)}>{new Date().getFullYear() - 15 - i}</option>
                                  ))}
                               </select>
                            </div>
                            <input type="hidden" name="date_of_birth" value={`${dob.year}-${dob.month}-${dob.day}`} />
                         </div>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                       <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Gender</label>
                       <div className="flex gap-2">
                          {['Male', 'Female'].map(g => (
                            <label key={g} className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent has-[:checked]:border-[#b50a0a] has-[:checked]:bg-red-50/30">
                               <input type="radio" name="gender" value={g} defaultChecked={g === 'Male'} className="w-3 translate-y-[1px] accent-[#b50a0a]" />
                               <span className="text-xs font-bold tracking-wide text-gray-900">{g}</span>
                            </label>
                          ))}
                       </div>
                    </div>
                 </div>
                 <div className="pt-2">
                    <button type="submit" className="w-full bg-[#b50a0a] text-white py-3.5 rounded-xl font-bold tracking-wide shadow-xl shadow-red-900/10 hover:bg-black transition-all text-xs active:scale-[0.98]">
                        Create Profile
                    </button>
                    <p className="text-[7px] text-gray-900 text-center font-bold tracking-wide mt-2 opacity-60">An automated enrollment email will be sent immediately.</p>
                 </div>
</form>
           </div>
        </div>
      )}
    </div>
  );
}
