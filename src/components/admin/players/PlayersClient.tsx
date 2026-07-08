'use client';

import { useState, useRef } from 'react';
import { 
  Users, Search, Filter, Shield, UserPlus, 
  MoreHorizontal, Edit, Trash2, ExternalLink, 
  ChevronLeft, ChevronRight, X, User, ChevronDown,
  Globe, Calendar, MapPin, Target, CheckCircle, Clock, CreditCard, Lock, Eye, Mail, Trophy, Activity, MessageSquare,
  Facebook, Instagram, Twitter, RefreshCcw
} from 'lucide-react';
import { RestrictedAccessInline, RestrictedAccess } from '@/components/admin/RestrictedAccess';
import { DateDisplay } from '@/components/common/DateDisplay';
import { deletePlayer, updatePlayer, addPlayer, getPlayerTransactions, getPendingEdits, processProfileEdit, updateProfileAvatar, uploadPlayerImage, migrateAllProfileSlugs } from '@/app/admin/players/actions';
import { checkAccountStatus, resendInvitation, type AccountStatus } from '@/app/actions/auth';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { Info, AlertCircle } from 'lucide-react';
import { FlagIcon } from '@/components/common/FlagIcon';

interface Player {
  id: string;
  slug?: string | null;
  user_id: string | null;
  email: string | null;
  first_name: string;
  last_name: string;
  status: string;
  position: string;
  country: string;
  age?: number;
  date_of_birth: string | null;
  gender: string;
  foot?: string;
  is_subscribed: boolean;
  agent_id?: string;
  agent_status?: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  place_of_birth?: string;
  current_club?: string;
  joined_date?: string;
  contract_expiry?: string;
  current_salary?: string;
  bio?: string;
  phone_number?: string;
  jersey_number?: number;
  height_cm?: number;
  weight_kg?: number;
  market_value?: string;
  formation?: string;
  league?: string;
  social_links?: Record<string, any>;
  achievements?: any[];
  avatar_url?: string;
  users: {
    email: string;
    role: string;
    subscriptions?: Array<{
      current_period_end: string;
      status: string;
    }>;
  } | null;
}

interface ProfileEdit {
  id: string;
  profile_id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const calculateDetailedAgeString = (day: string, month: string, year: string) => {
  if (!day || !month || !year || day === 'DD' || month === 'MM' || year === 'YYYY') return null;
  const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  // Convert total days for the "Days" part to be cumulative for the current year
  const startOfCurrentYearAge = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (today < startOfCurrentYearAge) {
    startOfCurrentYearAge.setFullYear(today.getFullYear() - 1);
  }
  const diffTime = Math.abs(today.getTime() - startOfCurrentYearAge.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return `${years}Y, ${totalDays}D`;
};

const calculateSimpleAge = (dobString: string | null) => {
  if (!dobString) return '--';
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return '--';
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    years--;
  }
  return years;
};

export function PlayersClient({ 
  initialPlayers,
  agents,
  totalCount,
  currentPage,
  pageSize,
  role,
  leagues,
  clubs,
  countries
}: { 
  initialPlayers: Player[],
  agents: Record<string, any>[],
  totalCount: number,
  currentPage: number,
  pageSize: number,
  role: string,
  leagues: Record<string, any>[],
  clubs: Record<string, any>[],
  countries: Record<string, any>[]
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<AccountStatus>('NONE');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [dob, setDob] = useState({ day: '', month: '', year: '' });
  const [selectedLeague, setSelectedLeague] = useState('');
  const [calculatedAge, setCalculatedAge] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [targetAvatarId, setTargetAvatarId] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const agentSearchRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setIsEnrollModalOpen(true);
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
    const res = await resendInvitation(email, 'player', lastName);
    if (res.success) {
      showToast("Invitation email resent successfully.", "success");
    } else {
      const errorMsg = res.error || "Failed to resend invitation.";
      showToast(errorMsg, "error");
    }
  };

  const closeAddModal = () => {
    setIsEnrollModalOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('add');
    router.replace(`/admin/players?${params.toString()}`);
  };

  const navigateToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/players?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set('page', '1'); // Reset to page 1 on filter
    router.push(`/admin/players?${params.toString()}`);
  };
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Form click outside logic...
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('q', searchQuery);
  };

  const handleOpenProfile = (player: Player) => {
    router.push(`/admin/players/${player.slug}`);
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetAvatarId) return;
    
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadPlayerImage(formData);
      if (res.url) {
        const updateRes = await updateProfileAvatar(targetAvatarId, res.url);
        if (updateRes.success) {
          showToast('Profile picture updated successfully', 'success');
          router.refresh();
        } else {
          showToast(updateRes.error || 'Failed to update avatar', 'error');
        }
      } else {
        showToast(res.error || 'Upload failed', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setAvatarUploading(false);
      setTargetAvatarId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      const res = await deletePlayer(id);
      if (res.success) {
        showToast('Player deleted successfully', 'success');
        router.refresh();
      } else {
        showToast(res.error || 'Failed to delete player', 'error');
      }
    }
  };

  useEffect(() => {
    if (dob.day && dob.month && dob.year) {
      const birthDate = new Date(`${dob.year}-${dob.month}-${dob.day}`);
      const today = new Date();
      
      if (isNaN(birthDate.getTime())) {
        setCalculatedAge(null);
        return;
      }

      let years = today.getFullYear() - birthDate.getFullYear();
      let lastBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      if (today < lastBirthday) {
        years--;
        lastBirthday = new Date(today.getFullYear() - 1, birthDate.getMonth(), birthDate.getDate());
      }
      
      const diffTime = today.getTime() - lastBirthday.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      setCalculatedAge(`${years}Y, ${diffDays}D`);
    } else {
      setCalculatedAge(null);
    }
  }, [dob]);


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search & Filters */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
           <div className="relative flex-1 min-w-0 md:min-w-full max-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black" />
              <input 
                type="text" 
                placeholder="Search name or email..." 
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
                 <option value="" className="text-gray-900">Pos</option>
                 <option value="Forward" className="text-gray-900">Forward</option>
                 <option value="Midfielder" className="text-gray-900">Midfielder</option>
                 <option value="Defender" className="text-gray-900">Defender</option>
                 <option value="Goalkeeper" className="text-gray-900">Goalkeeper</option>
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
              <select 
                onChange={(e) => handleFilterChange('foot', e.target.value)}
                value={searchParams.get('foot') || ''}
                className="bg-gray-50 border-none rounded-lg text-xs font-bold tracking-wide px-3 py-2 focus:ring-2 focus:ring-[#b50a0a] text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%20stroke%3D%22%23b50a0a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_0.5rem_center] bg-no-repeat pr-6"
              >
                 <option value="" className="text-gray-900">Foot</option>
                 <option value="Left" className="text-gray-900">Left</option>
                 <option value="Right" className="text-gray-900">Right</option>
                 <option value="Both" className="text-gray-900">Both</option>
              </select>
              <div className="relative">
                 <input 
                   list="countries-players"
                   placeholder="Country"
                   onChange={(e) => handleFilterChange('country', e.target.value)}
                   value={searchParams.get('country') || ''}
                   className="w-32 bg-gray-50 border-none rounded-lg text-xs font-bold tracking-wide pl-3 pr-8 py-2 focus:ring-2 focus:ring-[#b50a0a] text-gray-900 placeholder:text-gray-300"
                 />
                 <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#b50a0a]" />
              </div>
              <datalist id="countries-players">
                 {countries.map((c: Record<string, any>) => (
                    <option key={c.id} value={c.name} />
                 ))}
              </datalist>
              <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg font-bold text-xs tracking-wide hover:bg-[#b50a0a] transition-all">
                Search
              </button>
           </div>
        </form>

        {/* Players Table */}
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left text-base text-gray-600 whitespace-nowrap">
            <thead className="bg-[#f8f9fa] border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold tracking-wide text-[#b50a0a]">Athlete Information</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wide text-[#b50a0a]">Gender</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wide text-[#b50a0a]">Country</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wide text-[#b50a0a]">Role / Position</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wide text-[#b50a0a]">Subscription</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wide text-[#b50a0a] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialPlayers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                     <Users className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                     <p className="text-xs font-bold tracking-wide text-gray-400">No players matches your search criteria.</p>
                  </td>
                </tr>
              ) : (
                initialPlayers.map((player) => (
                  <tr 
                    key={player.id} 
                    onClick={() => handleOpenProfile(player)}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                           <div className="relative group/avatar">
                             <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-white text-sm shrink-0 overflow-hidden shadow-sm relative">
                               {player.avatar_url ? (
                                 <Image 
                                   src={player.avatar_url} 
                                   className="w-full h-full object-cover" 
                                   alt={`${player.first_name} ${player.last_name}`}
                                   fill
                                 />
                               ) : (
                                 (player.users?.email || player.email || 'P')[0].toUpperCase()
                               )}
                               
                               {avatarUploading && targetAvatarId === player.id && (
                                 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                   <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                 </div>
                               )}
                             </div>
                             
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setTargetAvatarId(player.id);
                                 avatarInputRef.current?.click();
                               }}
                               className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-xl shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#b50a0a] transition-all opacity-0 group-hover/avatar:opacity-100 z-10"
                             >
                               <Edit className="w-3 h-3" />
                             </button>
                           </div>

                          <div className="min-w-0">
                             <p className="font-bold text-gray-900 leading-none truncate text-xs mb-1.5 flex items-center gap-2">
                               {player.first_name} {player.last_name} 
                               <span className="text-xs font-bold text-gray-400">â€¢</span>
                               <span className="text-xs font-bold text-gray-400 tracking-wide">{calculateSimpleAge(player.date_of_birth)} YRS</span>
                             </p>
                             <p className="text-xs font-bold text-gray-400 tracking-wide truncate">{player.users?.email || player.email || 'No email'}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-xs font-bold text-gray-900 tracking-wide">{player.gender || 'Unset'}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5">
                          <FlagIcon country={player.country} className="w-5 h-3.5" />
                          <span className="text-xs font-bold text-gray-900 tracking-wide">{player.country || 'N/A'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900 tracking-tighter">{player.position || 'Unset'}</span>
                          <span className="text-xs font-bold text-gray-400 tracking-wide mt-0.5">{player.foot || 'N/A'} Foot</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       {role === 'operations' ? (
                         <RestrictedAccessInline />
                       ) : (
                         <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                               <div className={`w-1.5 h-1.5 rounded-full ${player.is_subscribed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-300'}`}></div>
                               <span className={`text-xs font-bold tracking-wide ${player.is_subscribed ? 'text-green-600' : 'text-gray-400'}`}>
                                  {player.is_subscribed ? 'Pro' : 'Free'}
                               </span>
                            </div>
                            {player.is_subscribed && player.users?.subscriptions?.[0]?.current_period_end && (() => {
                               const expiryDate = new Date(player.users.subscriptions[0].current_period_end);
                               const diffTime = expiryDate.getTime() - new Date().getTime();
                               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                               const isExpiringSoon = diffDays <= 7;
                               return (
                                 <span className={`text-xs font-bold tracking-wide ${isExpiringSoon ? 'text-red-600' : 'text-gray-400'}`}>
                                     Expires: <DateDisplay date={expiryDate} />
                                 </span>
                               );
                            })()}
                         </div>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProfile(player);
                         }}
                         className="p-1.5 text-gray-300 hover:text-[#b50a0a] transition-colors bg-gray-50 rounded-lg"
                       >
                          <Eye className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
           <p className="text-xs font-bold text-gray-400 tracking-wide">
              Showing <span className="text-gray-900">{initialPlayers.length}</span> of <span className="text-gray-900">{totalCount}</span> Players
           </p>
           <div className="flex items-center gap-3">
             <button 
                onClick={async () => {
                   if (confirm("Are you sure you want to migrate all profile slugs to the new CK format?")) {
                      const res = await migrateAllProfileSlugs();
                      if (res.success) showToast(`Successfully migrated ${res.count} slugs.`, 'success');
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

      {isEnrollModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
           <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-[1.5rem] shadow-2xl overflow-hidden relative flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                 <div>
                    <h3 className="text-xl font-bold tracking-tighter">
                       <span className="text-gray-900">Enroll New</span> <span className="text-[#b50a0a]">Athlete</span>
                    </h3>
                    <p className="text-xs font-bold text-gray-900 tracking-wide mt-1">Direct enrollment & automated onboarding</p>
                 </div>
                 <button onClick={closeAddModal} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-100">
                    <X className="w-4 h-4 text-gray-400" />
                 </button>
              </div>
              <form action={async (formData) => {
                 // Real-time validation for Birthdate
                 if (!dob.day || !dob.month || !dob.year || dob.day === 'DD' || dob.month === 'MM' || dob.year === 'YYYY') {
                    showToast('Please select a complete birthdate (DD/MM/YYYY)', 'error');
                    return;
                 }

                  if (emailStatus === 'REGISTERED') {
                     showToast("This email is already registered. Please use a different email.", "error");
                     return;
                  }

                 const res = await addPlayer(formData);
                 if (res.success) {
                    showToast('Player enrolled successfully', 'success');
                    closeAddModal();
                    router.refresh();
                 } else {
                    showToast(res.error || 'Failed to enroll player', 'error');
                 }
              }} className="p-6 space-y-4 overflow-y-auto">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">First Name</label>
                       <input name="first_name" required type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-black placeholder:text-gray-900" placeholder="Ex: John" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Last Name</label>
                       <input name="last_name" required type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-black placeholder:text-gray-900" placeholder="Ex: Doe" />
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
                         className={`w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-black placeholder:text-gray-900 ${emailStatus === 'REGISTERED' ? 'ring-1 ring-red-500 bg-red-50/10' : ''}`} 
                         placeholder="athlete@centerkick.com" 
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
                    </div>                     <div className="p-4 bg-gray-50/50 rounded-2xl md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-100">
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Primary Role</label>
                           <select name="position" className="w-full bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-black">
                              <option value="Forward" className="text-black">Forward</option>
                              <option value="Midfielder" className="text-black">Midfielder</option>
                              <option value="Defender" className="text-black">Defender</option>
                              <option value="Goalkeeper" className="text-black">Goalkeeper</option>
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Main Foot</label>
                           <select name="foot" className="w-full bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-black">
                              <option value="Right" className="text-black">Right</option>
                              <option value="Left" className="text-black">Left</option>
                              <option value="Both" className="text-black">Both</option>
                           </select>
                        </div>
                        
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">League</label>
                           <select 
                             name="league" 
                             className="w-full bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-black"
                             onChange={(e) => setSelectedLeague(e.target.value)}
                             value={selectedLeague}
                           >
                              <option value="">No League</option>
                              {leagues.map((l: Record<string, any>) => (
                                <option key={l.id} value={l.name}>{l.name}</option>
                              ))}
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Current Club</label>
                           <select name="current_club" className="w-full bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-black">
                              <option value="">Unattached</option>
                              {clubs.filter((c: Record<string, any>) => c.leagues?.name === selectedLeague).map((club: Record<string, any>) => (
                                <option key={club.id} value={club.name}>{club.name}</option>
                              ))}
                           </select>
                        </div>

                        <div className="space-y-1">
                           <div className="flex items-center justify-between ml-1">
                              <label className="text-xs font-bold text-gray-900 tracking-wide">Country</label>
                           </div>
                           <div className="relative group">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <FlagIcon 
                                  country={selectedCountry} 
                                  className="w-4 h-2.5" 
                                />
                              </div>
                              <input 
                                name="country" 
                                list="countries-modal-players" 
                                required 
                                type="text" 
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                className="w-full bg-white border border-gray-100 rounded-lg pl-9 pr-3 py-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-black placeholder:text-gray-900" 
                                placeholder="Ex: Nigeria" 
                              />
                           </div>
                           <datalist id="countries-modal-players">
                              {countries.map((c: Record<string, any>) => (
                                 <option key={c.id} value={c.name} className="text-black" />
                              ))}
                           </datalist>
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
                                  className="flex-1 bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-black"
                                  onChange={(e) => setDob(prev => ({ ...prev, day: e.target.value }))}
                                  required
                                >
                                   <option value="" className="text-black">DD</option>
                                   {Array.from({ length: 31 }, (_, i) => (
                                      <option key={i+1} value={String(i+1).padStart(2, '0')} className="text-black">{i+1}</option>
                                   ))}
                                </select>
                                <select 
                                  className="flex-1 bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-black"
                                  onChange={(e) => setDob(prev => ({ ...prev, month: e.target.value }))}
                                  required
                                >
                                   <option value="" className="text-black">MM</option>
                                   {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                      <option key={m} value={String(i+1).padStart(2, '0')} className="text-black">{m}</option>
                                   ))}
                                </select>
                                <select 
                                  className="flex-1 bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold focus:ring-1 focus:ring-[#b50a0a] text-black"
                                  onChange={(e) => setDob(prev => ({ ...prev, year: e.target.value }))}
                                  required
                                >
                                   <option value="" className="text-black">YYYY</option>
                                   {Array.from({ length: 50 }, (_, i) => (
                                      <option key={i} value={String(new Date().getFullYear() - i)} className="text-black">{new Date().getFullYear() - i}</option>
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
