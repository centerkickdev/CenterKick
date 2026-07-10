'use client';

import { useState } from 'react';
import { 
  Search, Filter, Mail, Calendar, CheckCircle, Clock, 
  MoreVertical, UserPlus, Globe, Shield, MapPin, 
  ExternalLink, Building2, UserCheck, Trophy, Users, User, Search as SearchIcon
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { DirectoryTable } from '../shared/DirectoryTable';

interface RoleDirectoryClientProps {
  initialData: any[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  roleLabel: string;
  roleSlug: string;
  iconName: string;
}

export function RoleDirectoryClient({ 
  initialData, 
  totalCount, 
  currentPage, 
  pageSize, 
  roleLabel, 
  roleSlug,
  iconName
}: RoleDirectoryClientProps) {
  const IconComponent = () => {
    switch(iconName) {
      case 'Trophy': return <Trophy className="w-3 h-3 text-white" />;
      case 'Users': return <Users className="w-3 h-3 text-white" />;
      case 'User': return <User className="w-3 h-3 text-white" />;
      case 'Search': return <SearchIcon className="w-3 h-3 text-white" />;
      default: return <User className="w-3 h-3 text-white" />;
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-100 flex items-center gap-1.5 w-fit"><CheckCircle className="w-3 h-3" /> Verified</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-100 flex items-center gap-1.5 w-fit"><Clock className="w-3 h-3" /> Pending</span>;
      default:
        return <span className="px-3 py-1 bg-gray-50 text-gray-400 text-xs font-bold rounded-xl border border-gray-100 flex items-center gap-1.5 w-fit"><Clock className="w-3 h-3" /> Unverified</span>;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search & Filters */}
      <div className="p-4 md:p-8 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gray-50/30">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${roleLabel.toLowerCase()}s by name, email or location...`}
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#b50a0a]/5 focus:border-[#b50a0a] transition-all placeholder:text-gray-400 tracking-wide"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1.5 border border-gray-200 rounded-2xl shadow-inner">
            {['all', 'active', 'pending'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-[0.2em] transition-all ${
 statusFilter === s ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'text-gray-400 hover:text-gray-900'
 }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
          
          <button className="p-4 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
             <Filter className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto w-full pb-4 custom-scrollbar">
        <DirectoryTable
          data={initialData}
          columns={[
            { key: 'profile', label: 'Profile / Identity', width: 'w-[30%]' },
            { key: 'location', label: 'Location / Agency', width: 'w-[25%]' },
            { key: 'status', label: 'Status', width: 'w-[15%]' },
            { key: 'joined', label: 'Join Date', width: 'w-[15%]' },
            { key: 'actions', label: 'Actions', width: 'w-[15%]', className: 'text-right whitespace-nowrap' }
          ]}
          isPending={false}
          emptyStateMessage={`No ${roleLabel.toLowerCase()}s found.`}
          getItemId={(item) => item.id}
          renderRow={(item) => (
            <tr key={item.id} className="hover:bg-gray-50/50 transition-all group">
              <td className="px-4 md:px-10 py-7 border-b border-gray-50">
                <div className="flex items-center gap-5">
                  <div className="relative group/avatar">
                     <div className="w-14 h-14 rounded-2xl bg-gray-900 border-2 border-white shadow-xl flex items-center justify-center font-bold text-white text-lg overflow-hidden transition-transform group-hover/avatar:scale-105">
                        {item.avatar_url ? (
                           <img src={item.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                           item.first_name?.[0]?.toUpperCase() || item.email?.[0]?.toUpperCase()
                        )}
                     </div>
                     <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#b50a0a] rounded-lg border-2 border-white flex items-center justify-center shadow-lg">
                        <IconComponent />
                     </div>
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900 tracking-tight leading-none">
                       {item.first_name} {item.last_name}
                    </p>
                    <p className="text-xs font-bold text-gray-400 mt-1.5 flex items-center gap-1.5 tracking-wide">
                       <Mail className="w-3 h-3" /> {item.email || item.users?.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 md:px-10 py-7 border-b border-gray-50">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-gray-900">
                    <MapPin className="w-3.5 h-3.5 text-[#b50a0a]" />
                    <span className="text-xs font-bold tracking-tight">{item.country || item.nationality || 'Unspecified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold tracking-wide">{item.current_club || item.agency_name || 'Independent'}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 md:px-10 py-7 border-b border-gray-50">
                 {getStatusBadge(item.status)}
              </td>
              <td className="px-4 md:px-10 py-7 border-b border-gray-50">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
                </div>
              </td>
              <td className="px-4 md:px-10 py-7 border-b border-gray-50 text-right">
                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link 
                    href={`/admin/${roleSlug}/${item.id}`}
                    className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-sm hover:shadow-lg active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>

      {/* Pagination & Summary */}
      <div className="p-4 md:p-8 border-t border-gray-50 flex items-center justify-between bg-gray-50/20">
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 bg-[#b50a0a] rounded-full animate-pulse"></div>
           <p className="text-xs font-bold text-gray-500 tracking-wide">
             Record Count: <span className="text-gray-900">{initialData.length}</span> / {totalCount} Entities
           </p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold tracking-wide text-gray-400 cursor-not-allowed transition-all">Previous</button>
          <button className="px-6 py-3 bg-gray-900 text-white border border-gray-900 rounded-xl text-xs font-bold tracking-wide hover:bg-[#b50a0a] hover:border-[#b50a0a] transition-all shadow-lg shadow-gray-900/10 active:scale-95">Next Segment</button>
        </div>
      </div>
    </div>
  );
}
