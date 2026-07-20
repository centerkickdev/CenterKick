'use client';

import { useState } from 'react';
import { User, MapPin, Phone, Mail, Globe, Search, Camera, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Save } from 'lucide-react';
import { updateMarketValue } from '@/app/admin/users/actions';
import { useToast } from '@/context/ToastContext';
import { FlagIcon } from '@/components/common/FlagIcon';

import { CoachCareerForm } from '@/app/(dashboard)/dashboard/profile/components/CoachCareerForm';
import { PlayerCareerForm } from '@/app/(dashboard)/dashboard/profile/components/PlayerCareerForm';
import { AgentPortfolioForm } from '@/app/(dashboard)/dashboard/profile/components/AgentPortfolioForm';
import { ScoutDiscoveriesForm } from '@/app/(dashboard)/dashboard/profile/components/ScoutDiscoveriesForm';
import { OrganizationDetailsForm } from '@/app/(dashboard)/dashboard/profile/components/OrganizationDetailsForm';

export default function AdminUserProfileClient({
  profile,
  role,
  initialClients = [],
  clubsList = [],
  leaguesList = [],
  seasonsList = [],
  countriesList = []
}: {
  profile: any;
  role: string;
  initialClients?: any[];
  clubsList?: any[];
  leaguesList?: any[];
  seasonsList?: any[];
  countriesList?: any[];
}) {
  const [marketValue, setMarketValue] = useState(profile.market_value || '');
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const handleSaveMarketValue = async () => {
    setIsSaving(true);
    const { error, success } = await updateMarketValue(profile.id, Number(marketValue));
    if (error) {
      showToast(`Error updating market value: ${error}`, 'error');
    } else if (success) {
      showToast('Market value updated successfully!', 'success');
    }
    setIsSaving(false);
  };

  const getSubStatus = () => {
    const status = profile.users?.subscriptions?.[0]?.status || '';
    return status.toUpperCase() || 'FREE';
  };

  const subStatus = getSubStatus();
  const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] animate-in fade-in duration-500 pb-20">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 sticky top-0 z-[100] shadow-sm mb-8">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="/admin/users"
              className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold text-sm tracking-wide"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back
            </Link>
            <div className="h-4 w-full max-w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white overflow-hidden shadow-lg relative">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt="Avatar" fill className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tighter leading-none flex items-center gap-3">
                  {profile.first_name} <span className="text-[#b50a0a]">{profile.last_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold tracking-wide ${
                    ['ACTIVE', 'TRIALING'].includes(subStatus) ? 'bg-emerald-100 text-emerald-600' : 
                    subStatus !== 'FREE' ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {subStatus}
                  </span>
                </h1>
                <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mt-1 flex items-center gap-2">
                  {profile.users?.email || profile.contact_email || 'NO EMAIL'} • {roleDisplay}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {profile.official_links && Object.entries(profile.official_links).map(([platform, url]: [string, any]) => {
                if (!url) return null;
                return (
                  <Link key={platform} href={url} target="_blank" className="text-slate-400 hover:text-slate-900 transition-colors">
                    <Globe className="w-4 h-4" />
                  </Link>
                );
             })}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-8 space-y-12">
        
        {/* Basic Info Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <User className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tighter">Basic Info</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Gender</p>
              <p className="text-sm font-semibold text-slate-900">{profile.gender || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Date of Birth</p>
              <p className="text-sm font-semibold text-slate-900">{profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not specified'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Country</p>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                {profile.country && <FlagIcon country={profile.country} className="w-4 h-3" />}
                {profile.country || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Contact Email</p>
              <p className="text-sm font-semibold text-slate-900">{profile.contact_email || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Phone Number</p>
              <p className="text-sm font-semibold text-slate-900">{profile.phone_number || 'Not specified'}</p>
            </div>

            {role === 'player' && (
              <>
                <div>
                  <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Position</p>
                  <p className="text-sm font-semibold text-slate-900">{profile.position || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Strong Foot</p>
                  <p className="text-sm font-semibold text-slate-900">{profile.foot || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Height / Weight</p>
                  <p className="text-sm font-semibold text-slate-900">{profile.height_cm ? `${profile.height_cm}cm` : '--'} / {profile.weight_kg ? `${profile.weight_kg}kg` : '--'}</p>
                </div>
              </>
            )}

            {/* Editable Market Value */}
            {role === 'player' && (
              <div className="lg:col-span-3 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Market Value (€)</p>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      value={marketValue} 
                      onChange={(e) => setMarketValue(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold w-48 focus:outline-none focus:ring-2 focus:ring-[#b50a0a]"
                      placeholder="e.g. 500000"
                    />
                    <button 
                      onClick={handleSaveMarketValue}
                      disabled={isSaving || Number(marketValue) === profile.market_value}
                      className="bg-[#b50a0a] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSaving ? 'Saving...' : <><Save className="w-3 h-3" /> Save</>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bio Section */}
        {profile.bio && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <Info className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tighter">Biography</h2>
            </div>
            <div className="prose prose-slate max-w-none text-sm" dangerouslySetInnerHTML={{ __html: profile.bio }} />
          </div>
        )}

        {/* Career Data Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 pointer-events-none opacity-90">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <Search className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tighter">Career Data</h2>
          </div>
          
          <div className="-mx-4">
            {role === 'player' && <PlayerCareerForm data={profile} onChange={() => {}} disabled={true} />}
            {role === 'coach' && <CoachCareerForm data={profile} onChange={() => {}} disabled={true} />}
            {role === 'agent' && <AgentPortfolioForm data={profile} onChange={() => {}} disabled={true} />}
            {role === 'scout' && <ScoutDiscoveriesForm data={profile} onChange={() => {}} disabled={true} />}
            {role === 'organization' && <OrganizationDetailsForm data={profile} onChange={() => {}} disabled={true} />}
          </div>
        </div>

        {/* Linked Accounts Section */}
        {['agent', 'scout', 'organization'].includes(role) && initialClients.length > 0 && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <User className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tighter">Linked Accounts</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {initialClients.map((client) => (
                <Link key={client.id} href={`/admin/users/${client.slug || client.id}`} className="group bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4 hover:border-slate-300 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white overflow-hidden relative shadow-sm">
                    {client.avatar_url ? (
                      <Image src={client.avatar_url} alt="" fill className="object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#b50a0a] transition-colors">{client.first_name} {client.last_name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{client.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Medias Section */}
        {((profile.video_links && profile.video_links.length > 0) || (profile.gallery_urls && profile.gallery_urls.length > 0)) && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <Camera className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tighter">Media</h2>
            </div>
            
            {profile.video_links && profile.video_links.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Videos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.video_links.map((url: string, i: number) => {
                    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
                    const ytId = ytMatch ? ytMatch[1] : null;
                    return (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-300 transition-all">
                        {ytId ? (
                          <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} alt="Video thumbnail" className="w-16 h-12 object-cover rounded shadow-sm" />
                        ) : (
                          <div className="w-16 h-12 bg-slate-200 rounded flex items-center justify-center"><Camera className="w-4 h-4 text-slate-400" /></div>
                        )}
                        <span className="text-xs font-bold text-slate-900 truncate">{url}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {profile.gallery_urls && profile.gallery_urls.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {profile.gallery_urls.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="aspect-square rounded-xl overflow-hidden relative block hover:opacity-80 transition-opacity bg-slate-100 border border-slate-200">
                      <Image src={url} alt="Gallery image" fill className="object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
