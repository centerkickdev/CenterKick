'use client';

import { useState } from 'react';
import { User, MapPin, Phone, Mail, Globe, Search, Camera, Info, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
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
  subStatus,
  initialClients = [],
  clubsList = [],
  leaguesList = [],
  seasonsList = [],
  countriesList = []
}: {
  profile: any;
  role: string;
  subStatus: string;
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

  const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] animate-in fade-in duration-500 pb-28 sm:pb-20 pt-4 sm:pt-8 space-y-6 sm:space-y-8">
      {/* Top Bar Card */}
      <div className="w-full px-3 sm:px-6 md:px-8 xl:px-12">
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4 sm:gap-6">
          {/* Top Row: Back Link */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <Link 
              href="/admin/users"
              className="group inline-flex items-center gap-1.5 text-slate-500 hover:text-[#b50a0a] transition-all font-bold text-xs sm:text-sm tracking-wide shrink-0"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Accounts</span>
            </Link>
          </div>

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 sm:gap-6">
            {/* Profile Avatar & Name */}
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white overflow-hidden shadow-sm border border-slate-100 relative shrink-0">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt="Avatar" fill className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug truncate">
                  {profile.first_name} <span className="text-[#b50a0a]">{profile.last_name}</span>
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 truncate" title={profile.users?.email || profile.contact_email}>
                  {profile.users?.email || profile.contact_email || 'No email provided'}
                </p>
              </div>
            </div>

            {/* Role & Status & Socials */}
            <div className="flex items-center gap-4 sm:gap-8 flex-wrap pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100">
              <div className="flex flex-col min-w-max">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Role</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 capitalize">{roleDisplay}</span>
              </div>

              <div className="h-6 w-px bg-slate-200"></div>

              <div className="flex flex-col min-w-max">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</span>
                <span className={`text-[10px] uppercase px-2.5 py-1 rounded-full font-bold tracking-widest inline-flex w-fit ${
                  subStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                  subStatus === 'PENDING APPROVAL' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                  subStatus === 'EXPIRED' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-500 border border-slate-200'
                }`}>
                  {subStatus}
                </span>
              </div>

              {profile.official_links && Object.values(profile.official_links).some(Boolean) && (
                <>
                  <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                  <div className="flex items-center gap-2">
                    {Object.entries(profile.official_links).map(([platform, url]: [string, any]) => {
                      if (!url) return null;
                      let Icon = Globe;
                      if (platform === 'instagram') Icon = Instagram;
                      else if (platform === 'facebook') Icon = Facebook;
                      else if (platform === 'twitter') Icon = Twitter;
                      else if (platform === 'linkedin') Icon = Linkedin;

                      return (
                        <Link key={platform} href={url} target="_blank" className="text-slate-400 hover:text-[#b50a0a] transition-colors p-2 bg-slate-50 rounded-full hover:bg-red-50">
                          <Icon className="w-4 h-4" />
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 xl:px-12 space-y-8">
        
        {/* Basic Info Section */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <User className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tighter">Basic Info</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-8 gap-x-6">
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
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Contact Email</p>
              <p className="text-sm font-semibold text-slate-900 truncate" title={profile.contact_email || 'Not specified'}>
                {profile.contact_email || 'Not specified'}
              </p>
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
            <div className="prose prose-slate max-w-none text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: profile.bio }} />
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
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
