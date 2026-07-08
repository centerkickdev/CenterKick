'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Users, Search, Filter, Shield, UserPlus, 
  MoreHorizontal, Edit, Trash2, ExternalLink, 
  ChevronLeft, ChevronRight, X, User, ChevronDown,
  Globe, Calendar, MapPin, Target, CheckCircle, Clock, CreditCard, Lock, Eye, Mail, Trophy, Activity, MessageSquare,
  Facebook, Instagram, Twitter, AlertCircle, Save, Undo, Plus,
  LayoutDashboard, UserCircle, Briefcase, FileText, Image as ImageIcon, Newspaper, ShoppingBag, DollarSign, Settings,
  Star, Award, Building2, CheckCircle2
} from 'lucide-react';
import Image from 'next/image';
import { RestrictedAccessInline, RestrictedAccess } from '@/components/admin/RestrictedAccess';
import { DateDisplay } from '@/components/common/DateDisplay';

const DEFAULT_MEDIA = { 
  highlight_video_url: '', 
  action_images: ['', '', '', '', ''], 
  external_gallery_url: '' 
};
import { 
  updateProfileTags,
  updateProfileAvatar,
  getPlayerNews,
  getPlayerTransactions, getPendingEdits, processProfileEdit, updatePlayer,
  getPlayerStats, addPlayerStat, updatePlayerStat, deletePlayerStat,
  getPlayerTransfers, addPlayerTransfer, updatePlayerTransfer, deletePlayerTransfer,
  getPlayerAchievements, addPlayerAchievement, updatePlayerAchievement, deletePlayerAchievement,
  uploadPlayerImage
} from '@/app/admin/players/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { FlagIcon } from '@/components/common/FlagIcon';

interface Player {
  id: string;
  user_id: string | null;
  email: string | null;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  country: string | null;
  date_of_birth: string;
  gender: string;
  position: string;
  foot: string;
  is_subscribed: boolean;
  avatar_url?: string;
  agent_id?: string;
  agent_status?: 'pending' | 'accepted' | 'rejected';
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
  media_gallery?: {
    highlight_video_url: string;
    action_images: string[];
    external_gallery_url: string;
  };
  tags?: string[];
  users: {
    email: string;
    role: string;
    subscriptions?: Array<{
      current_period_end: string;
      status: string;
    }>;
  } | null;
}

interface CareerStat {
  id: string;
  player_id: string;
  season: string;
  league_name: string | null;
  league_flag: string | null;
  club_name: string;
  club_flag: string | null;
  appearances: number;
  minutes_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  created_at?: string;
}

const getEmbedUrl = (url: string) => {
  if (!url) return '';
  // YouTube
  const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1].split('&')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  // Vimeo
  const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(.+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return url;
};

interface Achievement {
  id: string;
  player_id: string;
  title: string;
  year: string | null;
  organization: string | null;
  category: string;
  description: string | null;
  created_at?: string;
}

interface PlayerTransfer {
  id: string;
  player_id: string;
  season: string;
  transfer_date: string | null;
  from_club_name: string;
  from_club_flag: string | null;
  to_club_name: string;
  to_club_flag: string | null;
  league_name: string | null;
  league_flag: string | null;
  transfer_fee: string | null;
  created_at?: string;
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

interface PlayerProfileClientProps {
  player: Player;
  agents: Record<string, any>[];
  leagues: Record<string, any>[];
  clubs: Record<string, any>[];
  seasons: Record<string, any>[];
  countries: Record<string, any>[];
}

// SEASONS constant removed. Seasons are now provided via props.

function StatFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  defaultSeason,
  leagues,
  clubs: allClubs,
  seasons: allSeasons
}: { 
  isOpen: boolean; onClose: () => void; onSave: (data: Partial<CareerStat>) => void; initialData?: CareerStat | null; defaultSeason?: string | null;
  leagues: Record<string, any>[]; clubs: Record<string, any>[]; seasons: Record<string, any>[];
}) {
  const seasonsList = allSeasons.map(s => s.name);
  const [formData, setFormData] = useState<Partial<CareerStat>>(initialData || {
    season: defaultSeason || seasonsList[0] || '2023/24',
    appearances: 0,
    goals: 0,
    assists: 0,
    minutes_played: 0,
    yellow_cards: 0,
    red_cards: 0,
    league_name: '',
    club_name: ''
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else if (defaultSeason) setFormData(prev => ({ ...prev, season: defaultSeason }));
    else setFormData(prev => ({ ...prev, season: seasonsList[0] || '2023/24' }));
  }, [initialData, defaultSeason, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {initialData ? 'Edit Career Record' : 'Add Career Record'}
            </h3>
            <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">Detailed Performance Entry</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Season & League */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Football Season</label>
              <select 
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
              >
                {seasonsList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">League / Tournament</label>
              <div className="relative group/select">
                <input 
                  type="text"
                  list="league-list"
                  placeholder="e.g. Premier League"
                  value={formData.league_name || ''}
                  onChange={(e) => setFormData({ ...formData, league_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
                />
                <datalist id="league-list">
                  {leagues.map((l: any) => <option key={l.id} value={l.name} />)}
                </datalist>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {formData.league_flag && (
                    <Image 
                      src={`https://flagcdn.com/w20/${formData.league_flag.toLowerCase()}.png`} 
                      alt="" 
                      className="w-4 h-3 object-cover rounded-sm"
                      width={20}
                      height={15}
                      unoptimized
                    />
                  )}
                  <Search className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Club / Team Name</label>
            <div className="relative">
              <input 
                type="text"
                list="club-list"
                placeholder="Search or enter club name..."
                value={formData.club_name || ''}
                onChange={(e) => setFormData({ ...formData, club_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
              />
               <datalist id="club-list">
                {allClubs
                  .filter((c: Record<string, any>) => c.leagues?.name === formData.league_name)
                  .map((c: Record<string, any>) => <option key={c.id} value={c.name} />)}
                {!formData.league_name && allClubs.map((c: Record<string, any>) => <option key={c.id} value={c.name} />)}
              </datalist>
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Search className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 tracking-wide ml-1 flex items-center gap-2">
                <Activity className="w-3 h-3 text-slate-400" /> Appearances
              </label>
              <input 
                type="number"
                min="0"
                value={formData.appearances || 0}
                onChange={(e) => setFormData({ ...formData, appearances: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 tracking-wide ml-1 flex items-center gap-2">
                <Clock className="w-3 h-3 text-slate-400" /> Minutes Played
              </label>
              <input 
                type="number"
                min="0"
                value={formData.minutes_played || 0}
                onChange={(e) => setFormData({ ...formData, minutes_played: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 tracking-wide ml-1 flex items-center gap-2">
                <Target className="w-3 h-3 text-slate-400" /> Goals
              </label>
              <input 
                type="number"
                min="0"
                value={formData.goals || 0}
                onChange={(e) => setFormData({ ...formData, goals: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 tracking-wide ml-1 flex items-center gap-2">
                <Award className="w-3 h-3 text-slate-400" /> Assists
              </label>
              <input 
                type="number"
                min="0"
                value={formData.assists || 0}
                onChange={(e) => setFormData({ ...formData, assists: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 tracking-wide ml-1 flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-yellow-500" /> Yellow Cards
              </label>
              <input 
                type="number"
                min="0"
                value={formData.yellow_cards || 0}
                onChange={(e) => setFormData({ ...formData, yellow_cards: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 tracking-wide ml-1 flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-red-500" /> Red Cards
              </label>
              <input 
                type="number"
                min="0"
                value={formData.red_cards || 0}
                onChange={(e) => setFormData({ ...formData, red_cards: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button 
            onClick={() => onSave(formData)}
            className="flex-1 bg-slate-900 text-white rounded-2xl py-4 text-xs font-bold tracking-[0.2em] hover:bg-[#b50a0a] transition-all shadow-xl shadow-slate-200"
          >
            {initialData ? 'Save Changes' : 'Add Record'}
          </button>
          <button 
            onClick={onClose}
            className="px-10 bg-white text-slate-400 border border-slate-200 rounded-2xl py-4 text-xs font-bold tracking-wide hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function TransferFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  leagues,
  clubs: allClubs,
  seasons: allSeasons
}: { 
  isOpen: boolean; onClose: () => void; onSave: (data: Partial<PlayerTransfer>) => void; initialData?: PlayerTransfer | null;
  leagues: Record<string, any>[]; clubs: Record<string, any>[]; seasons: Record<string, any>[];
}) {
  const seasonsList = allSeasons.map(s => s.name);
  const [formData, setFormData] = useState<Partial<PlayerTransfer>>(initialData || {
    season: seasonsList[0] || '2023/24',
    transfer_date: new Date().toISOString().split('T')[0],
    from_club_name: '',
    to_club_name: '',
    league_name: '',
    transfer_fee: ''
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({
        season: seasonsList[0] || '2023/24',
        transfer_date: new Date().toISOString().split('T')[0],
        from_club_name: '',
        to_club_name: '',
        league_name: '',
        transfer_fee: ''
    });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {initialData ? 'Edit Transfer Record' : 'Add Transfer Record'}
            </h3>
            <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">Movement & Contract Details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Season</label>
              <select 
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
              >
                {seasonsList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Transfer Date</label>
              <input 
                type="date"
                value={formData.transfer_date || ''}
                onChange={(e) => setFormData({ ...formData, transfer_date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">League</label>
            <div className="relative group/select">
                <input 
                  type="text"
                  list="transfer-league-list"
                  placeholder="Select League"
                  value={formData.league_name || ''}
                  onChange={(e) => {
                      const league = leagues.find((l: Record<string, any>) => l.name === e.target.value);
                      setFormData({ 
                        ...formData, 
                        league_name: e.target.value,
                        league_flag: league ? league.countries?.code : formData.league_flag
                      });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
                />
                <datalist id="transfer-league-list">
                  {leagues.map((l: Record<string, any>) => <option key={l.id} value={l.name} />)}
                </datalist>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {formData.league_flag && (
                  <Image 
                    src={`https://flagcdn.com/w20/${formData.league_flag.toLowerCase()}.png`} 
                    alt="" 
                    className="w-4 h-3 object-cover rounded-sm"
                    width={20}
                    height={15}
                    unoptimized
                  />
                )}
                <Search className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">New Club (Joined)</label>
                <div className="relative">
                  <input 
                    type="text"
                    list="to-club-list"
                    placeholder="Joined..."
                    value={formData.to_club_name || ''}
                    onChange={(e) => setFormData({ ...formData, to_club_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
                  />
                  <datalist id="to-club-list">
                    {allClubs
                      .filter((c: Record<string, any>) => c.leagues?.name === formData.league_name)
                      .map((c: Record<string, any>) => <option key={c.id} value={c.name} />)}
                    {!formData.league_name && allClubs.map((c: Record<string, any>) => <option key={c.id} value={c.name} />)}
                  </datalist>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Search className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Old Club (Left)</label>
                <div className="relative">
                  <input 
                    type="text"
                    list="from-club-list"
                    placeholder="Left..."
                    value={formData.from_club_name || ''}
                    onChange={(e) => setFormData({ ...formData, from_club_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
                  />
                  <datalist id="from-club-list">
                    {allClubs
                      .map((c: Record<string, any>) => <option key={c.id} value={c.name} />)}
                  </datalist>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Search className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Transfer Fee / Status</label>
            <div className="flex gap-4">
              {['Free', 'Loan', 'Transferred'].map((type) => (
                <label key={type} className="flex-1 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="feeType" 
                    className="hidden" 
                    checked={(type === 'Transferred' && !['Free', 'Loan'].includes(formData.transfer_fee || '')) || formData.transfer_fee === type}
                    onChange={() => {
                      if (type === 'Transferred') {
                        setFormData({ ...formData, transfer_fee: '' });
                      } else {
                        setFormData({ ...formData, transfer_fee: type });
                      }
                    }}
                  />
                  <div className={`py-4 rounded-2xl border-2 text-center transition-all
 ${(type === 'Transferred' && !['Free', 'Loan'].includes(formData.transfer_fee || '')) || formData.transfer_fee === type
 ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
 : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                    <span className="text-xs font-bold tracking-wide">{type}</span>
                  </div>
                </label>
              ))}
            </div>

            {(!['Free', 'Loan'].includes(formData.transfer_fee || '')) && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <input 
                  type="text"
                  placeholder="Enter Transfer Amount (e.g. $10,000,000)"
                  value={formData.transfer_fee || ''}
                  onChange={(e) => setFormData({ ...formData, transfer_fee: e.target.value })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button 
            onClick={() => onSave(formData)}
            className="flex-1 bg-slate-900 text-white rounded-2xl py-4 text-xs font-bold tracking-[0.2em] hover:bg-[#b50a0a] transition-all shadow-xl shadow-slate-200"
          >
            {initialData ? 'Save Changes' : 'Add Record'}
          </button>
          <button 
            onClick={onClose}
            className="px-10 bg-white text-slate-400 border border-slate-200 rounded-2xl py-4 text-xs font-bold tracking-wide hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function AchievementFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  seasons: allSeasons
}: { 
  isOpen: boolean; onClose: () => void; onSave: (data: Partial<Achievement>) => void; initialData?: Achievement | null;
  seasons: Record<string, any>[];
}) {
  const seasonsList = allSeasons.map(s => s.name);
  const [formData, setFormData] = useState<Partial<Achievement>>(initialData || {
    title: '',
    year: seasonsList[0] || '2023/24',
    organization: '',
    category: 'Club',
    description: ''
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({
        title: '',
        year: seasonsList[0] || '2023/24',
        organization: '',
        category: 'Club',
        description: ''
    });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {initialData ? 'Edit Career Honour' : 'Add Career Honour'}
            </h3>
            <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">Official Recognition & Awards</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Award / Trophy Title</label>
            <input 
              type="text"
              placeholder="e.g. Premier League Winner, Golden Boot"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Year / Season</label>
              <select 
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
              >
                {seasonsList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
              >
                <option value="Club">Club Honour</option>
                <option value="Individual">Individual Award</option>
                <option value="International">International</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Organization / Competition</label>
            <input 
              type="text"
              placeholder="e.g. Manchester City, Premier League, FIFA"
              value={formData.organization || ''}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Short Description (Optional)</label>
            <textarea 
              placeholder="Brief details about the achievement..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all h-24"
            />
          </div>
        </div>

        <div className="p-4 md:p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button 
            onClick={() => onSave(formData)}
            className="flex-1 bg-slate-900 text-white rounded-2xl py-4 text-xs font-bold tracking-[0.2em] hover:bg-[#b50a0a] transition-all shadow-xl shadow-slate-200"
          >
            {initialData ? 'Save Changes' : 'Add Award'}
          </button>
          <button 
            onClick={onClose}
            className="px-10 bg-white text-slate-400 border border-slate-200 rounded-2xl py-4 text-xs font-bold tracking-wide hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function MediaGalleryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: { 
  isOpen: boolean; onClose: () => void; onSave: (data: Record<string, any>) => void; initialData: { highlight_video_url: string; action_images: string[]; external_gallery_url: string }
}) {
  const [formData, setFormData] = useState(initialData);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isInitialized = useRef(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && !isInitialized.current && initialData) {
      // Ensure we have a stable array of 5 slots
      const baseImages = initialData.action_images || [];
      const paddedImages = [0, 1, 2, 3, 4].map(i => baseImages[i] || '');
      setFormData({
        ...initialData,
        action_images: paddedImages
      });
      isInitialized.current = true;
    }
    
    if (!isOpen) {
      isInitialized.current = false;
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleFileChange = async (index: number, file: File | undefined) => {
    if (!file) return;
    
    setUploadingIndex(index);
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    const res = await uploadPlayerImage(uploadData);
    if (res.url) {
      const newImages = [...formData.action_images];
      newImages[index] = res.url;
      setFormData({ ...formData, action_images: newImages });
      toast.showToast(`Image ${index + 1} uploaded`, 'success');
    } else {
      toast.showToast(res.error || 'Upload failed', 'error');
    }
    setUploadingIndex(null);
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.action_images];
    newImages[index] = '';
    setFormData({ ...formData, action_images: newImages });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Manage Media Gallery</h3>
            <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">Video, Photos & External Portfolios</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Video Highlight */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-red-600" />
              <label className="text-xs font-bold text-slate-400 tracking-wide">Featured Video URL (YouTube/Vimeo)</label>
            </div>
            <input 
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.highlight_video_url}
              onChange={(e) => setFormData({ ...formData, highlight_video_url: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <label className="text-xs font-bold text-slate-400 tracking-wide">Action Images (Upload up to 5)</label>
            </div>
            <div className="grid gap-4">
              {[0, 1, 2, 3, 4].map((idx) => (
                <div key={idx} className="group relative bg-slate-50 border border-slate-200 rounded-3xl p-4 flex items-center gap-4 transition-all hover:bg-white hover:shadow-md">
                   <div 
                      className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm cursor-zoom-in hover:ring-2 hover:ring-indigo-500 transition-all"
                      onClick={() => formData.action_images[idx] && setPreviewUrl(formData.action_images[idx])}
                   >
                      {formData.action_images[idx] ? (
                         <div className="relative w-full h-full">
                            <Image 
                               src={formData.action_images[idx]} 
                               className="w-full h-full object-cover" 
                               alt={`Action ${idx + 1}`}
                               fill
                            />
                         </div>
                      ) : (
                         <span className="text-sm font-bold text-slate-300">#{idx + 1}</span>
                      )}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      {formData.action_images[idx] ? (
                         <div className="flex flex-col gap-1">
                            <p className="text-xs font-bold text-green-600 tracking-wide flex items-center gap-1.5">
                               <CheckCircle className="w-3 h-3" /> Image Ready
                            </p>
                            <p className="text-xs text-slate-400 truncate max-w-full font-medium">
                               /{formData.action_images[idx].split('/avatars/')[1] || formData.action_images[idx]}
                            </p>
                         </div>
                      ) : (
                         <div className="flex flex-col gap-1">
                            <p className="text-xs font-bold text-slate-400 tracking-wide">No Image selected</p>
                            <p className="text-xs text-slate-300 font-medium">Click button to upload action shot</p>
                         </div>
                      )}
                   </div>

                   <div className="flex items-center gap-3">
                      {formData.action_images[idx] && (
                         <button 
                            onClick={() => removeImage(idx)}
                            className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all shadow-sm"
                            title="Remove Image"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                      )}
                      
                      <div className="relative">
                         <input 
                            type="file"
                            id={`upload-${idx}`}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/*"
                            onChange={(e) => handleFileChange(idx, e.target.files?.[0])}
                            disabled={uploadingIndex === idx}
                         />
                         <button className={`px-6 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 shadow-sm ${uploadingIndex === idx ? 'bg-slate-200 text-slate-400 animate-pulse' : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'}`}>
                            {uploadingIndex === idx ? 'Uploading...' : formData.action_images[idx] ? 'Replace' : 'Upload'}
                         </button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* External Gallery */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <label className="text-xs font-bold text-slate-400 tracking-wide">External Portfolio / Channel Link</label>
            </div>
            <input 
              type="text"
              placeholder="e.g. https://shutterstock.com/athlete-portfolio"
              value={formData.external_gallery_url}
              onChange={(e) => setFormData({ ...formData, external_gallery_url: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="p-4 md:p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button 
            onClick={() => onSave(formData)}
            className="flex-1 bg-slate-900 text-white rounded-2xl py-4 text-xs font-bold tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
          >
            Save Media Gallery
          </button>
          <button 
            onClick={onClose}
            className="px-10 bg-white text-slate-400 border border-slate-200 rounded-2xl py-4 text-xs font-bold tracking-wide hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Large Preview Overlay */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
          onClick={() => setPreviewUrl(null)}
        >
          <button 
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 md:p-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all transition-transform hover:scale-110"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500 relative aspect-video">
            <Image 
               src={previewUrl} 
               className="object-contain" 
               alt="Preview"
               fill
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayerProfileClient({ player, agents, leagues, clubs, seasons, countries }: PlayerProfileClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'bio' | 'gallery' | 'news' | 'shop' | 'billing'>('profile');
  const [playerTransactions, setPlayerTransactions] = useState<Record<string, any>[]>([]);
  const [pendingEdits, setPendingEdits] = useState<ProfileEdit[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingEdits, setIsLoadingEdits] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedFields, setEditedFields] = useState<Partial<Player>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [playerStats, setPlayerStats] = useState<CareerStat[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [showStatModal, setShowStatModal] = useState(false);
  const [editingStat, setEditingStat] = useState<CareerStat | null>(null);
  const [selectedSeasonForAdd, setSelectedSeasonForAdd] = useState<string | null>(null);
  const [playerTransfers, setPlayerTransfers] = useState<PlayerTransfer[]>([]);
  const [isLoadingTransfers, setIsLoadingTransfers] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<PlayerTransfer | null>(null);

  const [playerAchievements, setPlayerAchievements] = useState<Achievement[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [playerNews, setPlayerNews] = useState<Record<string, any>[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Tag Management
  const [profileTags, setProfileTags] = useState<string[]>(player.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [isUpdatingTags, setIsUpdatingTags] = useState(false);

  // Advanced Billing State
  const [txSearch, setTxSearch] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState('all');
  const [txPage, setTxPage] = useState(1);
  const txPerPage = 20;

  // Avatar State
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Achievement Search, Filter, Pagination
  const [achievementSearch, setAchievementSearch] = useState('');
  const [achievementCategoryFilter, setAchievementCategoryFilter] = useState('All');
  const [achievementPage, setAchievementPage] = useState(1);
  const achievementsPerPage = 5;

  useEffect(() => {
    // Fetch transactions when on billing tab
    if (activeTab === 'billing') {
      const fetchTransactions = async () => {
        setIsLoadingTransactions(true);
        const res = await getPlayerTransactions(player.id);
        if (res.success) setPlayerTransactions(res.data || []);
        setIsLoadingTransactions(false);
      };
      fetchTransactions();
    }
  }, [player.id, activeTab]);

  useEffect(() => {
    // Fetch pending edits on load
    const fetchEdits = async () => {
      setIsLoadingEdits(true);
      const res = await getPendingEdits(player.id);
      if (res.success) setPendingEdits(res.data || []);
      setIsLoadingEdits(false);
    };
    fetchEdits();
  }, [player.id]);

  useEffect(() => {
    // Fetch stats and transfers when on stats tab
    if (activeTab === 'stats') {
      const fetchData = async () => {
        setIsLoadingStats(true);
        setIsLoadingTransfers(true);
        const [statsRes, transfersRes] = await Promise.all([
          getPlayerStats(player.id),
          getPlayerTransfers(player.id)
        ]);
        if (statsRes.success) setPlayerStats(statsRes.data || []);
        if (transfersRes.success) setPlayerTransfers(transfersRes.data || []);
        setIsLoadingStats(false);
        setIsLoadingTransfers(false);
      };
      fetchData();
    }
    
    if (activeTab === 'bio') {
      const fetchAchievements = async () => {
        setIsLoadingAchievements(true);
        const res = await getPlayerAchievements(player.id);
        if (res.success) setPlayerAchievements(res.data || []);
        setIsLoadingAchievements(false);
      };
      fetchAchievements();
    }
    
    if (activeTab === 'news') {
      const fetchNews = async () => {
        setIsLoadingNews(true);
        // Fetch news based on all profile tags
        const newsTags = profileTags.length > 0 ? profileTags : [`${player.first_name} ${player.last_name}`];
        const res = await getPlayerNews(newsTags);
        if (res.success) setPlayerNews(res.data || []);
        setIsLoadingNews(false);
      };
      fetchNews();
    }
  }, [player.id, activeTab, player.first_name, player.last_name, profileTags]);

  const handleUpdateTags = async (newTags: string[]) => {
    setIsUpdatingTags(true);
    try {
      const res = await updateProfileTags(player.id, newTags);
      if (res.success) {
        setProfileTags(newTags);
        toast.showToast('Profile tags updated and synced to CMS', 'success');
      } else {
        toast.showToast(res.error || 'Failed to update tags', 'error');
      }
    } finally {
      setIsUpdatingTags(false);
    }
  };

  const groupedStats = playerStats.reduce((acc: { [key: string]: CareerStat[] }, stat) => {
    if (!acc[stat.season]) acc[stat.season] = [];
    acc[stat.season].push(stat);
    return acc;
  }, {});

  const shortenLeagueName = (name: string | null) => {
    if (!name) return 'N/A';
    const common: { [key: string]: string } = {
      'Premier League': 'PL',
      'Nigeria Premier Football League': 'NPFL',
      'Champions League': 'UCL',
      'Europa League': 'UEL',
      'Ligue 1': 'L1',
      'Serie A': 'SA',
      'La Liga': 'LL',
      'Bundesliga': 'BL',
    };
    if (common[name]) return common[name];
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
  };

  const sortedSeasons = Object.keys(groupedStats).sort((a, b) => b.localeCompare(a));

  const handleSyncTag = async () => {
    const tagName = `${player.first_name} ${player.last_name}`;
    if (!profileTags.includes(tagName)) {
      await handleUpdateTags([...profileTags, tagName]);
    } else {
      toast.showToast('Standard tag already exists', 'info');
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadPlayerImage(formData);
      if (res.url) {
        const updateRes = await updateProfileAvatar(player.id, res.url);
        if (updateRes.success) {
          toast.showToast('Profile picture updated successfully', 'success');
          router.refresh();
        } else {
          toast.showToast(updateRes.error || 'Failed to update avatar record', 'error');
        }
      } else {
        toast.showToast(res.error || 'Upload failed', 'error');
      }
    } catch (err) {
      toast.showToast('An unexpected error occurred', 'error');
    } finally {
      setAvatarUploading(false);
    }
  };

  // Filtered/Paginated Transactions
  const filteredTransactions = playerTransactions.filter(tx => {
    const matchesSearch = tx.reference?.toLowerCase().includes(txSearch.toLowerCase());
    const matchesStatus = txStatusFilter === 'all' || tx.status === txStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedTransactions = filteredTransactions.slice(
    (txPage - 1) * txPerPage,
    txPage * txPerPage
  );

  useEffect(() => {
    setTxPage(1);
  }, [txSearch, txStatusFilter]);

  const handleSaveStat = async (data: Partial<CareerStat>) => {
    setIsSaving(true);
    const res = editingStat 
      ? await updatePlayerStat(editingStat.id, data)
      : await addPlayerStat(player.id, data);

    if (res.success) {
      toast.showToast(editingStat ? 'Stat updated' : 'Stat added', 'success');
      setShowStatModal(false);
      setEditingStat(null);
      setSelectedSeasonForAdd(null);
      // Re-fetch stats
      const updated = await getPlayerStats(player.id);
      if (updated.success) setPlayerStats(updated.data || []);
    } else {
      toast.showToast(res.error || 'Operation failed', 'error');
    }
    setIsSaving(false);
  };

  const handleDeleteStat = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    const res = await deletePlayerStat(id);
    if (res.success) {
      toast.showToast('Stat deleted', 'success');
      setPlayerStats(prev => prev.filter(s => s.id !== id));
    } else {
      toast.showToast(res.error || 'Failed to delete', 'error');
    }
  };

  const handleSaveTransfer = async (data: Partial<PlayerTransfer>) => {
    setIsSaving(true);
    const res = editingTransfer 
      ? await updatePlayerTransfer(editingTransfer.id, data)
      : await addPlayerTransfer(player.id, data);

    if (res.success) {
      toast.showToast(editingTransfer ? 'Transfer updated' : 'Transfer added', 'success');
      setShowTransferModal(false);
      setEditingTransfer(null);
      // Re-fetch transfers
      const updated = await getPlayerTransfers(player.id);
      if (updated.success) setPlayerTransfers(updated.data || []);
    } else {
      toast.showToast(res.error || 'Operation failed', 'error');
    }
    setIsSaving(false);
  };

  const handleDeleteTransfer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transfer?')) return;
    const res = await deletePlayerTransfer(id);
    if (res.success) {
      toast.showToast('Transfer record deleted', 'success');
      setPlayerTransfers(playerTransfers.filter(t => t.id !== id));
    } else {
      toast.showToast(res.error || 'Failed to delete', 'error');
    }
  };

  const handleSaveAchievement = async (data: Partial<Achievement>) => {
    setIsSaving(true);
    const res = editingAchievement 
      ? await updatePlayerAchievement(editingAchievement.id, data)
      : await addPlayerAchievement(player.id, data);

    if (res.success) {
      toast.showToast(editingAchievement ? 'Achievement updated' : 'Achievement added', 'success');
      setShowAchievementModal(false);
      setEditingAchievement(null);
      // Refresh achievements
      const refreshRes = await getPlayerAchievements(player.id);
      if (refreshRes.success) setPlayerAchievements(refreshRes.data || []);
    } else {
      toast.showToast(res.error || 'Failed to save achievement', 'error');
    }
    setIsSaving(false);
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    const res = await deletePlayerAchievement(id);
    if (res.success) {
      toast.showToast('Achievement deleted', 'success');
      setPlayerAchievements(playerAchievements.filter(a => a.id !== id));
    } else {
      toast.showToast(res.error || 'Failed to delete', 'error');
    }
  };

  // Achievement Filtered Results
  const filteredAchievements = playerAchievements.filter(a => {
    const matchesSearch = achievementSearch === '' || 
      a.title.toLowerCase().includes(achievementSearch.toLowerCase()) ||
      (a.organization?.toLowerCase().includes(achievementSearch.toLowerCase())) ||
      (a.year?.toLowerCase().includes(achievementSearch.toLowerCase()));
    
    const matchesCategory = achievementCategoryFilter === 'All' || a.category === achievementCategoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const totalAchievementPages = Math.ceil(filteredAchievements.length / achievementsPerPage);
  const paginatedAchievements = filteredAchievements.slice(
    (achievementPage - 1) * achievementsPerPage,
    achievementPage * achievementsPerPage
  );

  const handlePlayerUpdate = async (data: Partial<Player>) => {
    setIsSaving(true);
    const res = await updatePlayer(player.id, data);
    if (res.success) {
      toast.showToast('Profile updated', 'success');
      setShowMediaModal(false);
      router.refresh();
    } else {
      toast.showToast(res.error || 'Update failed', 'error');
    }
    setIsSaving(false);
  };

  const handleEditAction = async (editId: string, action: 'approve' | 'reject') => {
    const res = await processProfileEdit(editId, action);
    if (res.success) {
      toast.showToast(`Change ${action}d successfully`, 'success');
      const updatedEdits = await getPendingEdits(player.id);
      if (updatedEdits.success) setPendingEdits(updatedEdits.data || []);
      router.refresh();
    } else {
      toast.showToast(res.error || 'Failed to process edit', 'error');
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const res = await updatePlayer(player.id, editedFields);
    if (res.success) {
      toast.showToast('Profile updated successfully', 'success');
      setEditingSection(null);
      setEditedFields({});
      router.refresh();
    } else {
      toast.showToast(res.error || 'Failed to update profile', 'error');
    }
    setIsSaving(false);
  };

  const updateField = (field: keyof Player, value: unknown) => {
    setEditedFields(prev => ({ ...prev, [field]: value }));
  };

  const displayValue = (field: keyof Player, defaultValue: unknown): string | number | readonly string[] | undefined => {
    const val = editedFields.hasOwnProperty(field) ? editedFields[field] : defaultValue;
    return val as string | number | readonly string[] | undefined;
  };

  const PendingEditBadge = ({ field }: { field: string }) => {
    const edit = pendingEdits.find(e => e.field_name === field);
    if (!edit) return null;

    return (
      <div className="flex items-center gap-2 mt-1 animate-in fade-in slide-in-from-left-2 duration-300">
        <div className="bg-yellow-50 border border-yellow-100 px-2 py-0.5 rounded text-xs font-bold text-yellow-700 flex items-center gap-1.5 shadow-sm">
          <span className="opacity-50">PROPOSED:</span> {edit.new_value}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleEditAction(edit.id, 'approve')}
            className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-sm"
          >
            <CheckCircle className="w-3 h-3" />
          </button>
          <button 
            onClick={() => handleEditAction(edit.id, 'reject')}
            className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] animate-in fade-in duration-500">
      <input 
        type="file" 
        ref={avatarInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
      />
      {/* Dashboard Top Bar - Sticky below Admin Nav */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 sticky top-[-32px] z-[100] shadow-sm mx-[-32px] mt-[-32px] mb-8">
        <div className="max-w-full max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="/admin/players"
              className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold text-sm tracking-wide"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Players
            </Link>
            <div className="h-4 w-full max-w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <div 
                className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white overflow-hidden shadow-lg cursor-pointer group/avatar relative ${avatarUploading ? 'animate-pulse' : ''}`}
                onClick={() => !avatarUploading && avatarInputRef.current?.click()}
              >
                {player.avatar_url ? (
                  <Image 
                    src={player.avatar_url} 
                    className="w-full h-full object-cover group-hover/avatar:opacity-50 transition-all" 
                    alt="Avatar"
                    fill
                  />
                ) : (
                  <User className="w-5 h-5 group-hover/avatar:opacity-50 transition-all" />
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all">
                  <Edit className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tighter leading-none flex items-center gap-3">
                  {player.first_name} <span className="text-[#b50a0a]">{player.last_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold tracking-wide ${
 player.is_subscribed ? 'bg-emerald-100 text-emerald-600' : 
 player.users?.subscriptions?.[0]?.status === 'expired' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
 }`}>
                    {player.is_subscribed ? 'PRO' : 
                     player.users?.subscriptions?.[0]?.status === 'expired' ? 'EXPIRED' : 'NEW'}
                  </span>
                </h1>
                <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mt-1 flex items-center gap-2">
                  <FlagIcon country={player.country || ''} className="w-3.5 h-2.5" />
                  {player.email || 'NO EMAIL'} â€¢ {player.position}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href={`/players/${player.id}`} 
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold tracking-wide hover:bg-slate-100 transition-all border border-slate-100"
            >
              View Public <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-full max-w-[1400px] mx-auto w-full flex gap-4 md:p-8 px-4 md:px-8 pb-12 flex-1 items-start">
        {/* Left Sidebar - Profile Summary - Sticky */}
        <div className="w-72 bg-white border border-slate-100 p-6 rounded-[2.5rem] flex flex-col gap-4 md:p-8 sticky top-[72px] shadow-sm shadow-slate-200/50">
          <div 
            className={`relative group cursor-pointer overflow-hidden rounded-[2rem] ${avatarUploading ? 'animate-pulse opacity-50' : ''}`}
            onClick={() => !avatarUploading && avatarInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 transform scale-90 group-hover:scale-100 transition-all">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            {player.avatar_url ? (
              <Image 
                src={player.avatar_url} 
                alt="" 
                className="w-full aspect-square object-cover border-2 border-slate-50 shadow-inner transition-transform duration-700 group-hover:scale-110" 
                fill
              />
            ) : (
              <div className="w-full aspect-square bg-slate-100 flex items-center justify-center text-slate-300 text-4xl font-bold">
                {player.first_name[0]}{player.last_name[0]}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {[
              { id: 'profile', label: 'Overview & Details', icon: LayoutDashboard },
              { id: 'stats', label: 'Career & Stats', icon: Activity },
              { id: 'bio', label: 'Biography & Awards', icon: FileText },
              { id: 'gallery', label: 'Media Gallery', icon: ImageIcon },
              { id: 'news', label: 'Latest News', icon: Newspaper },
              { id: 'billing', label: 'Billing & History', icon: DollarSign },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as 'profile' | 'stats' | 'bio' | 'gallery' | 'news' | 'shop' | 'billing'); setEditingSection(null); }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold tracking-wide transition-all group ${
 activeTab === tab.id 
 ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 translate-x-1' 
 : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
 }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-300 group-hover:text-slate-900'} transition-colors`} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-50">
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-400 tracking-wide mb-1">Assigned Agent</p>
              {player.agent_id ? (
                <Link href={`/admin/agents/${player.agent_id}`} className="text-xs font-bold text-slate-900 hover:text-[#b50a0a] transition-colors">
                  {agents.find(a => a.user_id === player.agent_id)?.first_name ? `${agents.find(a => a.user_id === player.agent_id)?.first_name} ${agents.find(a => a.user_id === player.agent_id)?.last_name}` : 'Linked Agent'}
                </Link>
              ) : (
                <p className="text-xs font-bold text-slate-400">Independent</p>
              )}
            </div>
          </div>
        </div>
        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
              <div className="grid grid-cols-1 gap-4 md:p-8">
                {/* Identity Card */}
                <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-0 transition-all group-hover:bg-slate-100"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                          <UserCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">Identity Details</h3>
                      </div>
                      <button 
                        onClick={() => setEditingSection(editingSection === 'identity' ? null : 'identity')}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {[
                        { label: 'First Name', value: player.first_name, field: 'first_name', type: 'text' },
                        { label: 'Last Name', value: player.last_name, field: 'last_name', type: 'text' },
                        { label: 'Email Address', value: player.email || 'N/A', field: 'email', type: 'text' },
                        { label: 'Date Of Birth', value: player.date_of_birth, field: 'date_of_birth', type: 'date' },
                        { label: 'Place Of Birth', value: player.place_of_birth || 'N/A', field: 'place_of_birth', type: 'text' },
                        { label: 'Preferred Foot', value: player.foot || 'Right', field: 'foot', type: 'select', options: ['Right', 'Left', 'Both'] },
                        { label: 'Citizenship', value: player.country, field: 'country', type: 'select', options: countries.map(c => c.name) },
                        { label: 'Gender', value: player.gender, field: 'gender', type: 'select', options: ['Male', 'Female', 'Other'] },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-400 tracking-wide">{item.label}</span>
                          {editingSection === 'identity' ? (
                            item.type === 'select' ? (
                              <select 
                                value={displayValue(item.field as any, item.value)}
                                onChange={(e) => updateField(item.field as any, e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#b50a0a]"
                              >
                                {(item.options || []).map((opt: unknown) => (
                                  <option key={opt as string} value={opt as string}>{opt as string}</option>
                                ))}
                              </select>
                            ) : (
                              <input 
                                type={item.type}
                                value={displayValue(item.field as any, item.value || '')}
                                onChange={(e) => updateField(item.field as any, e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#b50a0a]"
                              />
                            )
                          ) : (
                            <div className="text-[13px] font-bold text-slate-800">
                              {item.field === 'date_of_birth' ? <DateDisplay date={item.value as string} /> : item.value}
                            </div>
                          )}
                          <PendingEditBadge field={item.field} />
                        </div>
                      ))}
                    </div>

                    {editingSection === 'identity' && (
                      <div className="mt-8 flex gap-3 animate-in fade-in slide-in-from-top-2">
                        <button onClick={handleSaveChanges} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold tracking-wide hover:bg-[#b50a0a] transition-all">Save Changes</button>
                        <button onClick={() => { setEditingSection(null); setEditedFields({}); }} className="px-6 py-2 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold tracking-wide hover:bg-slate-200 transition-all">Cancel</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Details Card */}
                <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-0 transition-all group-hover:bg-slate-100"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">Pro Career</h3>
                      </div>
                      <button 
                         onClick={() => setEditingSection(editingSection === 'pro' ? null : 'pro')}
                         className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {(() => {
                        const currentLeague = displayValue('league' as keyof Player, player.league);
                        const availableClubs = clubs.filter((c: Record<string, any>) => c.leagues?.name === currentLeague).map((c: Record<string, any>) => c.name);
                        
                        return [
                          { label: 'League', value: player.league || 'Not Set', field: 'league', type: 'select', options: ['None', ...leagues.map(l => l.name)] },
                          { label: 'Current Club', value: player.current_club || 'Unattached', field: 'current_club', type: availableClubs.length > 0 ? 'select' : 'text', options: availableClubs },
                          { label: 'Primary Role', value: player.position, field: 'position', type: 'select', options: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'] },
                          { label: 'Market Value', value: player.market_value || 'N/A', field: 'market_value', type: 'text' },
                          { label: 'Contract Expiry', value: player.contract_expiry, field: 'contract_expiry', type: 'date' },
                        ];
                      })().map((item, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-400 tracking-wide">{item.label}</span>
                          {editingSection === 'pro' ? (
                            item.type === 'select' ? (
                              <select 
                                value={displayValue(item.field as any, item.value)}
                                onChange={(e) => {
                                  updateField(item.field as keyof Player, e.target.value);
                                  // If league changes, reset current_club
                                  if (item.field === 'league') {
                                    updateField('current_club', '');
                                  }
                                }}
                                className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#b50a0a]"
                              >
                                {item.field === 'current_club' && <option value="">Select Club</option>}
                                {(item.options || []).map((opt: unknown) => (
                                  <option key={opt as string} value={opt as string}>{opt as string}</option>
                                ))}
                              </select>
                            ) : (
                              <input 
                                type={item.type}
                                value={displayValue(item.field as any, item.value || '')}
                                onChange={(e) => updateField(item.field as any, e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#b50a0a]"
                              />
                            )
                          ) : (
                            <div className="text-[13px] font-bold text-slate-800">
                              {item.field === 'contract_expiry' ? (item.value ? <DateDisplay date={item.value as string} /> : 'N/A') : item.value}
                            </div>
                          )}
                          <PendingEditBadge field={item.field} />
                        </div>
                      ))}
                    </div>

                    {editingSection === 'pro' && (
                      <div className="mt-8 flex gap-3 animate-in fade-in slide-in-from-top-2">
                        <button onClick={handleSaveChanges} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold tracking-wide hover:bg-[#b50a0a] transition-all">Save Changes</button>
                        <button onClick={() => { setEditingSection(null); setEditedFields({}); }} className="px-6 py-2 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold tracking-wide hover:bg-slate-200 transition-all">Cancel</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Agent Card */}
                <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                          <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">Agent Relationship</h3>
                      </div>
                      <button 
                         onClick={() => setEditingSection(editingSection === 'agent' ? null : 'agent')}
                         className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl font-bold text-slate-300">
                          {agents.find(a => a.user_id === player.agent_id)?.first_name?.[0] || '?'}
                       </div>
                       <div className="flex-1">
                          {editingSection === 'agent' ? (
                            <select 
                              value={displayValue('agent_id', player.agent_id || '')}
                              onChange={(e) => updateField('agent_id', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#b50a0a]"
                            >
                               <option value="">Independent</option>
                               {agents.map(a => (
                                  <option key={a.id} value={a.user_id}>{a.first_name} {a.last_name}</option>
                               ))}
                            </select>
                          ) : (
                            <>
                              <h4 className="text-base font-bold text-slate-900 tracking-tight">
                                {agents.find(a => a.user_id === player.agent_id)?.first_name ? `${agents.find(a => a.user_id === player.agent_id)?.first_name} ${agents.find(a => a.user_id === player.agent_id)?.last_name}` : 'Independent'}
                              </h4>
                              <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">Status: {player.agent_status || 'N/A'}</p>
                            </>
                          )}
                       </div>
                    </div>

                    {editingSection === 'agent' && (
                      <div className="mt-8 flex gap-3 animate-in fade-in slide-in-from-top-2">
                        <button onClick={handleSaveChanges} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold tracking-wide hover:bg-[#b50a0a] transition-all">Save Changes</button>
                        <button onClick={() => { setEditingSection(null); setEditedFields({}); }} className="px-6 py-2 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold tracking-wide hover:bg-slate-200 transition-all">Cancel</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Management Card */}
                <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-0 transition-all group-hover:bg-slate-100"></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Lock className="w-5 h-5 text-[#b50a0a]" /> Password Management
                      </h3>
                      <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                         <p className="text-xs font-bold text-slate-400 tracking-wide leading-none">
                            {player.email ? 'Account Active' : 'No Account'}
                         </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <p className="text-xs font-bold text-slate-400 tracking-wide mb-1.5">Registered Email</p>
                          <p className="text-base font-bold text-slate-900 flex items-center gap-2">
                             {player.email || 'No email linked'}
                             {player.user_id && <ExternalLink className="w-3.5 h-3.5 text-[#b50a0a]" />}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-md">
                            Administrators cannot view or change passwords directly. 
                            Use the buttons below to trigger an automated secure process via email.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 justify-center">
                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold tracking-wide hover:bg-[#b50a0a] transition-all shadow-lg shadow-slate-200">
                          Send Password Reset Link
                        </button>
                        {!player.is_subscribed && (
                          <button className="w-full py-4 bg-slate-50 text-slate-500 border border-slate-100 rounded-2xl text-xs font-bold tracking-wide hover:bg-slate-100 transition-all">
                            Resend Account Invitation
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Stats */}
          {activeTab === 'stats' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12 pb-20">
              {sortedSeasons.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-20 border border-slate-100 shadow-sm text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <Activity className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">No Career Data Yet</h3>
                  <p className="text-base font-bold text-slate-400 mt-2 max-w-sm mx-auto">Start building this player&apos;s professional history by adding their first season data.</p>
                  <button 
                    onClick={() => { setEditingStat(null); setSelectedSeasonForAdd(null); setShowStatModal(true); }}
                    className="mt-8 px-4 md:px-8 py-4 bg-[#b50a0a] text-white rounded-2xl text-xs font-bold tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-red-900/20"
                  >
                    + Create First Record
                  </button>
                </div>
              ) : (
                sortedSeasons.map((season) => (
                  <section key={season} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm overflow-hidden group/season">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm tracking-tighter">
                          {season}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">Season Overview</h3>
                      </div>
                      <button 
                         onClick={() => { setSelectedSeasonForAdd(season); setEditingStat(null); setShowStatModal(true); }}
                         className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-[#b50a0a] hover:text-white transition-all shadow-sm"
                      >
                         <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-4 py-4 text-xs font-bold tracking-wide text-slate-400">Club / Team</th>
                            <th className="px-4 py-4 text-xs font-bold tracking-wide text-slate-400 text-center">League</th>
                            <th className="px-4 py-4 text-xs font-bold tracking-wide text-slate-400 text-center">Apps</th>
                            <th className="px-4 py-4 text-xs font-bold tracking-wide text-slate-400 text-center">Mins</th>
                            <th className="px-4 py-4 text-xs font-bold tracking-wide text-slate-400 text-center">Goals</th>
                            <th className="px-4 py-4 text-xs font-bold tracking-wide text-slate-400 text-center">Ast</th>
                            <th className="px-4 py-4 text-xs font-bold tracking-wide text-slate-400 text-center">Cards</th>
                            <th className="px-4 py-4 text-xs font-bold tracking-wide text-slate-400 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-100">
                          {groupedStats[season].map((stat) => (
                            <tr key={stat.id} className="hover:bg-slate-50/50 transition-colors group/row">
                              <td className="px-4 py-4 align-middle">
                                <div className="flex items-center gap-2">
                                  {stat.club_flag ? (
                                    <div className="relative w-6 h-6 rounded-md overflow-hidden bg-white p-1 shadow-sm">
                                      <Image 
                                        src={stat.club_flag} 
                                        alt="" 
                                        className="object-contain" 
                                        fill
                                        unoptimized
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center text-xs text-slate-400 font-bold">{stat.club_name[0]}</div>
                                  )}
                                  <span className="font-bold text-slate-900 text-xs whitespace-nowrap">{toTitleCase(stat.club_name)}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center align-middle">
                                <div className="flex items-center justify-center gap-2">
                                  {stat.league_flag && (
                                    <Image 
                                      src={`https://flagcdn.com/w20/${stat.league_flag.toLowerCase()}.png`} 
                                      alt="" 
                                      className="w-3.5 h-2.5 object-cover rounded-[1px] opacity-70"
                                      width={14}
                                      height={10}
                                      unoptimized
                                    />
                                  )}
                                  <span 
                                    title={stat.league_name || undefined}
                                    className="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-bold tracking-tight text-slate-500 cursor-help"
                                  >
                                    {shortenLeagueName(stat.league_name)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center align-middle font-bold text-slate-700">{stat.appearances}</td>
                              <td className="px-4 py-4 text-center align-middle text-slate-400 font-bold">{stat.minutes_played}'</td>
                              <td className="px-4 py-4 text-center align-middle text-[#ef4444] font-bold">{stat.goals.toString().padStart(2, '0')}</td>
                              <td className="px-4 py-4 text-center align-middle font-bold text-slate-700">{stat.assists.toString().padStart(2, '0')}</td>
                              <td className="px-4 py-4 text-center align-middle">
                                <div className="flex items-center justify-center gap-1.5">
                                  <div className="flex items-center gap-1 bg-yellow-400/10 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-600">
                                    <div className="w-1.5 h-2 bg-yellow-400 rounded-[1px]"></div>
                                    {stat.yellow_cards}
                                  </div>
                                  <div className="flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded text-xs font-bold text-red-600">
                                    <div className="w-1.5 h-2 bg-red-500 rounded-[1px]"></div>
                                    {stat.red_cards}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right align-middle">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                  <button onClick={() => { setEditingStat(stat); setShowStatModal(true); }} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteStat(stat.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ))
              )}

              {/* Transfer History Section */}
              <section className="bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#b50a0a]/10 rounded-full blur-[120px] -mr-20 -mt-20"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">Transfer & Movement Logs</h3>
                      <p className="text-xs font-bold text-slate-500 tracking-wide mt-0.5">Verified Career Transitions</p>
                    </div>
                    <button 
                      onClick={() => { setEditingTransfer(null); setShowTransferModal(true); }}
                      className="w-10 h-10 bg-white/5 border border-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/10 transition-all backdrop-blur-md"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {playerTransfers.length === 0 ? (
                    <div className="py-16 text-center bg-white/5 rounded-[1.5rem] border border-white/5 backdrop-blur-sm">
                      <p className="text-slate-500 text-sm font-bold tracking-wide">Awaiting movement records...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-[1.5rem] border border-white/5 bg-white/5 backdrop-blur-md">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-4 py-4 text-xs font-bold tracking-wide text-slate-500">Season / Date</th>
                            <th className="px-4 py-4 text-xs font-bold tracking-wide text-slate-500">From Club</th>
                            <th className="px-4 py-4 text-xs font-bold tracking-wide text-slate-500">To Club</th>
                            <th className="px-4 py-4 text-xs font-bold tracking-wide text-slate-500">League</th>
                            <th className="px-4 py-4 text-xs font-bold tracking-wide text-slate-500 text-center">Fee</th>
                            <th className="px-4 py-4 text-xs font-bold tracking-wide text-slate-500 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-bold text-slate-300 divide-y divide-white/5">
                          {playerTransfers.map((transfer) => (
                            <tr key={transfer.id} className="hover:bg-white/5 transition-colors group/row border-b border-white/5 last:border-0 font-medium">
                              <td className="px-4 py-5 align-middle">
                                <div className="text-white font-bold tracking-tighter text-xs">{transfer.season}</div>
                                <div className="text-xs text-slate-500 font-bold mt-0.5">{transfer.transfer_date ? <DateDisplay date={transfer.transfer_date} /> : 'N/A'}</div>
                              </td>
                              <td className="px-4 py-5 align-middle text-slate-400 font-bold tracking-tight text-xs">{toTitleCase(transfer.from_club_name)}</td>
                              <td className="px-4 py-5 align-middle">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                  <span className="text-white font-bold tracking-tight text-xs">{toTitleCase(transfer.to_club_name)}</span>
                                </div>
                              </td>
                              <td className="px-4 py-5 align-middle">
                                <div className="flex items-center gap-2">
                                  {transfer.league_flag && (
                                    <Image 
                                      src={`https://flagcdn.com/w20/${transfer.league_flag.toLowerCase()}.png`} 
                                      alt="" 
                                      className="w-3.5 h-2.5 object-cover rounded-[1px] opacity-80"
                                      width={14}
                                      height={10}
                                      unoptimized
                                    />
                                  )}
                                  <span 
                                    title={transfer.league_name || undefined}
                                    className="px-2 py-0.5 bg-white/10 rounded-full text-xs font-bold text-slate-300 cursor-help"
                                  >
                                    {shortenLeagueName(transfer.league_name)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-5 text-center align-middle">
                                <span className="text-[#ef4444] font-bold tracking-wide text-xs">{transfer.transfer_fee || 'FREE'}</span>
                              </td>
                              <td className="px-4 py-5 text-right align-middle">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                  <button onClick={() => { setEditingTransfer(transfer); setShowTransferModal(true); }} className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteTransfer(transfer.id)} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-white/10 rounded-lg transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>

              {/* Stat Form Modal Rendering */}
              <StatFormModal 
                isOpen={showStatModal} 
                onClose={() => { setShowStatModal(false); setEditingStat(null); setSelectedSeasonForAdd(null); }}
                onSave={handleSaveStat}
                initialData={editingStat}
                defaultSeason={selectedSeasonForAdd}
                leagues={leagues}
                clubs={clubs}
                seasons={seasons}
              />

              {/* Transfer Form Modal Rendering */}
              <TransferFormModal 
                isOpen={showTransferModal} 
                onClose={() => { setShowTransferModal(false); setEditingTransfer(null); }}
                onSave={handleSaveTransfer}
                initialData={editingTransfer}
                leagues={leagues}
                clubs={clubs}
                seasons={seasons}
              />
            </div>
          )}

          {/* Tab 3: Bio & Honours */}
          {activeTab === 'bio' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 max-w-5xl mx-auto">
              {/* Biography Section - Full Width */}
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-indigo-50/50"></div>
                
                <div className="flex items-center justify-between mb-6 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-wide">Athlete Biography</h3>
                      <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mt-1">Professional Background & Story</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingSection(editingSection === 'bio' ? null : 'bio')}
                    className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                
                {editingSection === 'bio' ? (
                  <div className="space-y-6 relative">
                    <textarea 
                      rows={2}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-4 md:p-8 text-[13px] font-medium text-slate-600 leading-relaxed shadow-inner focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all resize-none overflow-hidden"
                      value={displayValue('bio', player.bio || '') as string}
                      onChange={(e) => updateField('bio', e.target.value)}
                      placeholder="Share the professional journey, key milestones, and personal story of this athlete..."
                    />
                    <div className="flex gap-4">
                      <button onClick={handleSaveChanges} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">Save Biography</button>
                      <button onClick={() => { setEditingSection(null); setEditedFields({}); }} className="px-10 py-4 bg-white text-slate-400 border border-slate-200 rounded-2xl text-xs font-bold tracking-wide hover:bg-slate-50 transition-all">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="p-4 md:p-8 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 relative group/bio shadow-inner">
                      <div className="text-[13px] font-medium text-slate-600 leading-[1.8] whitespace-pre-wrap">
                        {player.bio || "No professional biography has been provided for this athlete yet. Use the edit button to share their professional journey and achievements."}
                      </div>
                      <div className="absolute -left-2 top-10 w-1 h-32 bg-indigo-500/20 rounded-full opacity-0 group-hover/bio:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                )}
                <PendingEditBadge field="bio" />
              </div>

              {/* Honours & Awards - Full Width */}
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-slate-50 rounded-tl-full -mr-16 -mb-16 transition-all group-hover:bg-yellow-50/30"></div>
                
                <div className="flex items-center justify-between mb-6 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600 shadow-sm border border-yellow-100/50">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-wide">Career Honours</h3>
                      <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mt-1">Medals, Trophies & Individual Awards</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setEditingAchievement(null); setShowAchievementModal(true); }}
                    className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-yellow-600 transition-all shadow-md shadow-slate-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6 relative">
                   <div className="flex-1 relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-yellow-600 transition-colors" />
                      <input 
                         type="text"
                         placeholder="Search trophies, years, organizations..."
                         value={achievementSearch}
                         onChange={(e) => { setAchievementSearch(e.target.value); setAchievementPage(1); }}
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/50 outline-none transition-all shadow-inner"
                      />
                   </div>
                   <div className="w-full md:w-44 relative">
                      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <select 
                         value={achievementCategoryFilter}
                         onChange={(e) => { setAchievementCategoryFilter(e.target.value); setAchievementPage(1); }}
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/50 outline-none transition-all appearance-none cursor-pointer"
                      >
                         <option value="All">All Categories</option>
                         <option value="Club">Club Honours</option>
                         <option value="Individual">Individual Awards</option>
                         <option value="International">International</option>
                         <option value="Other">Other</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                         <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                   </div>
                </div>

                <div className="relative">
                  {isLoadingAchievements ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                      <div className="w-10 h-10 border-4 border-slate-100 border-t-yellow-500 rounded-full animate-spin"></div>
                      <p className="text-xs font-bold text-slate-400 tracking-wide">Loading Honours...</p>
                    </div>
                  ) : filteredAchievements.length > 0 ? (
                    <>
                      <div className="space-y-4">
                        {paginatedAchievements.map((h) => (
                          <div key={h.id} className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 group/item transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-full bg-yellow-500 transform translate-x-full group-hover/item:translate-x-0 transition-transform duration-300"></div>
                            
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center transition-all shadow-sm group-hover/item:scale-110 group-hover/item:bg-yellow-50 border border-slate-100 group-hover/item:border-yellow-100">
                               <Trophy className="w-7 h-7 text-yellow-600" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-3 mb-1.5">
                                  <span className="px-2 py-0.5 bg-white border border-slate-100 rounded-md text-[7px] font-bold text-slate-400 tracking-wide shadow-sm">{h.category}</span>
                                  {h.year && (
                                     <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-md text-xs font-bold tracking-wide border border-yellow-100/50">
                                        <Calendar className="w-2.5 h-2.5" />
                                        {h.year}
                                     </div>
                                  )}
                               </div>
                               <h4 className="text-[13px] font-bold text-slate-900 tracking-tight mb-0.5">{h.title}</h4>
                               {h.organization && (
                                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                     <Building2 className="w-3 h-3" />
                                     {h.organization}
                                  </div>
                               )}
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <button 
                                onClick={() => { setEditingAchievement(h); setShowAchievementModal(true); }}
                                className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm border border-slate-100 transition-all hover:scale-105 active:scale-95"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteAchievement(h.id)}
                                className="p-2.5 bg-white text-slate-400 hover:text-red-600 rounded-xl shadow-sm border border-slate-100 transition-all hover:scale-105 active:scale-95"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Achievement Pagination */}
                      {totalAchievementPages > 1 && (
                        <div className="flex items-center justify-between mt-10 pt-10 border-t border-slate-100">
                          <p className="text-xs font-bold text-slate-400 tracking-wide">
                            Showing {Math.min(filteredAchievements.length, achievementsPerPage)} of {filteredAchievements.length} Results
                          </p>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setAchievementPage(p => Math.max(1, p - 1))}
                              disabled={achievementPage === 1}
                              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-slate-200 bg-slate-50">
                              <span className="text-xs font-bold text-slate-900">{achievementPage}</span>
                              <span className="text-xs font-bold text-slate-300">/</span>
                              <span className="text-xs font-bold text-slate-400">{totalAchievementPages}</span>
                            </div>
                            <button 
                              onClick={() => setAchievementPage(p => Math.min(totalAchievementPages, p + 1))}
                              disabled={achievementPage === totalAchievementPages}
                              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="min-h-[300px] flex flex-col items-center justify-center p-12 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                        <Trophy className="w-10 h-10 text-slate-100" />
                      </div>
                      <h4 className="text-base font-bold text-slate-400 tracking-wide">No achievements yet</h4>
                      <p className="text-xs text-slate-400 mt-2 max-w-full max-w-[240px] text-center">Start adding official trophies, medals, and awards to showcase this player&apos;s success.</p>
                      <button 
                        onClick={() => { setEditingAchievement(null); setShowAchievementModal(true); }}
                        className="mt-8 px-4 md:px-8 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-xs font-bold tracking-wide hover:bg-slate-50 transition-all shadow-sm"
                      >
                        + Add First Achievement
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Rendering */}
              <AchievementFormModal 
                isOpen={showAchievementModal}
                onClose={() => { setShowAchievementModal(false); setEditingAchievement(null); }}
                onSave={handleSaveAchievement}
                initialData={editingAchievement}
                seasons={seasons}
              />
            </div>
          )}

          {/* Tab 4: Gallery */}
          {activeTab === 'gallery' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-4 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 shadow-sm border border-slate-100">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Athlete Media</h3>
                    <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">Video Highlights & Action Shots</p>
                  </div>
                </div>
                
                {player.media_gallery?.external_gallery_url && (
                  <a 
                    href={player.media_gallery.external_gallery_url.startsWith('http') ? player.media_gallery.external_gallery_url : `https://${player.media_gallery.external_gallery_url}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 md:px-8 py-4 bg-slate-50 text-slate-900 rounded-2xl text-xs font-bold tracking-wide hover:bg-slate-100 transition-all flex items-center gap-3 border border-slate-200"
                  >
                    Visit Global Portfolio <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Video Highlight - Primary focus */}
              <div className="bg-white rounded-[2.5rem] p-4 md:p-8 border border-slate-100 shadow-sm overflow-hidden group">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                       <Activity className="w-4 h-4" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 tracking-wide">Featured Highlight Vid</h4>
                 </div>
                 
                 <div className="aspect-video rounded-[2rem] overflow-hidden bg-slate-900 border border-slate-100 shadow-2xl relative group/video">
                    {player.media_gallery?.highlight_video_url ? (
                       <iframe 
                          src={getEmbedUrl(player.media_gallery.highlight_video_url)}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                       ></iframe>
                    ) : (
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-4">
                          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                             <Activity className="w-10 h-10" />
                          </div>
                          <p className="text-sm font-bold tracking-wide">No highlight video added</p>
                       </div>
                    )}
                 </div>
              </div>

              {/* Action Grid & External Link */}
              {/* Action Grid */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between px-2">
                    <h4 className="text-xs font-bold text-slate-400 tracking-[0.2em]">Latest Action Images</h4>
                    <span className="text-xs font-bold text-slate-400">Total: {player.media_gallery?.action_images?.filter(img => img && img.trim() !== '').length || 0}</span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-cols-5 gap-4">
                    {(player.media_gallery?.action_images && player.media_gallery.action_images.filter(img => img && img.trim() !== '').length > 0) ? (
                       player.media_gallery.action_images.filter(img => img && img.trim() !== '').map((img, i) => (
                          <div key={i} className="group relative aspect-square rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer">
                             <Image 
                               src={img} 
                               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                               alt="Gallery image"
                               fill
                             />
                             <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye className="w-6 h-6 text-white" />
                             </div>
                          </div>
                       ))
                    ) : (
                       [1,2,3,4,5].map((idx) => (
                          <div key={idx} className="aspect-square rounded-3xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
                             <ImageIcon className="w-6 h-6 text-slate-200" />
                          </div>
                       ))
                    )}
                 </div>

                 {/* Manage Gallery Button at the bottom */}
                 <div className="flex justify-center pt-10 pb-4">
                    <button 
                       onClick={() => setShowMediaModal(true)}
                       className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-bold tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center gap-3 shadow-xl hover:shadow-indigo-500/20 active:scale-95"
                    >
                       <Edit className="w-4 h-4" /> Manage Media Gallery
                    </button>
                 </div>
              </div>

              <MediaGalleryModal 
                 isOpen={showMediaModal}
                 onClose={() => setShowMediaModal(false)}
                 onSave={(media) => handlePlayerUpdate({ media_gallery: media as { highlight_video_url: string; action_images: string[]; external_gallery_url: string } })}
                 initialData={player.media_gallery || DEFAULT_MEDIA}
              />
            </div>
          )}

          {/* Tab 5: News */}
          {activeTab === 'news' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
              <div className="bg-white rounded-[2.5rem] p-4 md:p-8 border border-slate-100 shadow-sm mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900">
                      <Newspaper className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">Press Tags</h3>
                      <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">Manage tags to connect news stories</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="text"
                        placeholder="Add new tag (e.g. Victor Osimhen)"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newTagInput.trim()) {
                            if (!profileTags.includes(newTagInput.trim())) {
                              handleUpdateTags([...profileTags, newTagInput.trim()]);
                            }
                            setNewTagInput('');
                          }
                        }}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a]/20 transition-all shadow-inner"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (newTagInput.trim()) {
                          if (!profileTags.includes(newTagInput.trim())) {
                            handleUpdateTags([...profileTags, newTagInput.trim()]);
                          }
                          setNewTagInput('');
                        }
                      }}
                      disabled={isUpdatingTags || !newTagInput.trim()}
                      className="bg-[#b50a0a] hover:bg-black text-white px-4 md:px-8 rounded-2xl font-bold text-xs tracking-wide transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {isUpdatingTags ? 'Syncing...' : 'Add Tag'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {profileTags.length > 0 ? (
                      profileTags.map((tag, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl group hover:border-[#b50a0a]/30 transition-all">
                          <span className="text-xs font-bold text-slate-700 tracking-wide">{tag}</span>
                          <button 
                            onClick={() => handleUpdateTags(profileTags.filter(t => t !== tag))}
                            className="text-slate-300 hover:text-[#b50a0a] transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs font-bold text-slate-300 tracking-wide py-2">No tags assigned yet</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <hr className="flex-1 border-slate-100" />
                <span className="text-xs font-bold text-slate-300 tracking-[0.2em]">Latest Feed</span>
                <hr className="flex-1 border-slate-100" />
              </div>
              <div className="grid grid-cols-1 gap-6">
                {isLoadingNews ? (
                  <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs font-bold text-slate-400 tracking-wide">Searching tagged stories...</p>
                  </div>
                ) : playerNews.length > 0 ? (
                  playerNews.map((news) => (
                    <div key={news.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col md:flex-row h-48 hover:border-[#b50a0a]/30 transition-all group">
                      <div className="md:w-64 relative overflow-hidden bg-slate-100">
                        <Image 
                          src={news.cover_image_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800'} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" 
                          alt={news.title}
                          fill
                        />
                      </div>
                      <div className="flex-1 p-4 md:p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#b50a0a] tracking-wide">{news.category?.name || 'Story'}</span>
                            {news.is_pinned && <Star className="w-3 h-3 text-orange-400 fill-orange-400" />}
                          </div>
                          <h4 className="text-base font-bold leading-tight text-slate-900 line-clamp-2">{news.title}</h4>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                             <Calendar className="w-3 h-3 text-slate-300" />
                             <DateDisplay date={news.published_at} className="text-xs font-bold text-slate-400" />
                          </div>
                          <Link 
                            href={`/news/${news.slug}`}
                            target="_blank"
                            className="text-xs font-bold tracking-wide flex items-center gap-2 text-slate-400 hover:text-[#b50a0a] transition-all"
                          >
                            View Post <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                    <p className="text-xs font-bold text-slate-400 tracking-wide">No stories tagged for this athlete yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Billing */}
          {activeTab === 'billing' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
              <div className="space-y-8">
                {/* Subscription Card - Full Width */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#b50a0a]/10 rounded-full blur-[100px] group-hover:bg-[#b50a0a]/20 transition-all duration-1000"></div>
                  <div className="relative z-10 flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-[#b50a0a]" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold tracking-[0.3em] text-slate-400">Subscription Status</h3>
                        <p className="text-base font-bold text-white mt-0.5 tracking-tight">{player.is_subscribed ? 'Active Pro Member' : 'Free Prospect Plan'}</p>
                      </div>
                    </div>
                    <span className={`${player.is_subscribed ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'} px-6 py-2 rounded-xl text-xs font-bold tracking-[0.2em] shadow-2xl shadow-black/20`}>
                      {player.is_subscribed ? 'PRO' : 'FREE'}
                    </span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-bold text-slate-500 tracking-wide mb-1.5 px-1">Cycle End Date</p>
                    <p className="text-3xl font-bold tracking-tighter">
                      {player.users?.subscriptions?.[0]?.current_period_end ? (
                        <DateDisplay date={player.users.subscriptions[0].current_period_end} />
                      ) : 'NOT CONFIGURED'}
                    </p>
                  </div>
                </div>

                {/* Ledger Card - Full Width */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-10 border-b border-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[#b50a0a]" />
                      </div>
                      Ledger
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <div className="relative group/search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-hover/search:text-[#b50a0a] transition-colors" />
                        <input 
                          type="text"
                          placeholder="Search reference..."
                          value={txSearch}
                          onChange={(e) => setTxSearch(e.target.value)}
                          className="bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl pl-11 pr-5 py-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a]/10 w-48 transition-all"
                        />
                      </div>
                      <div className="relative">
                        <select 
                          value={txStatusFilter}
                          onChange={(e) => setTxStatusFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl pl-5 pr-10 py-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a]/10 transition-all appearance-none cursor-pointer"
                        >
                          <option value="all">All Status</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="success">Success</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {isLoadingTransactions ? (
                      <div className="py-20 text-center">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-[#b50a0a] rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-xs font-bold text-slate-400 tracking-wide">Accessing records...</p>
                      </div>
                    ) : filteredTransactions.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 gap-3">
                          {paginatedTransactions.map((tx, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-50 hover:border-[#b50a0a]/10 hover:bg-white transition-all group">
                              <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold shadow-sm ${
 tx.status === 'confirmed' || tx.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
 }`}>
                                  {tx.currency === 'USD' ? '$' : tx.currency === 'NGN' ? 'â‚¦' : tx.currency}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900 leading-none mb-1.5 tracking-tight">
                                    {tx.reference?.split('_')[0] || 'Member Base Payment'}
                                    <span className="ml-2 text-xs font-bold text-slate-300 normal-case tracking-normal">ref: {tx.reference}</span>
                                  </p>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3 h-3 text-slate-300" />
                                      <DateDisplay date={tx.created_at} className="text-xs font-bold text-slate-400 tracking-wide" />
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                    <p className="text-xs font-bold text-slate-400 tracking-wide">{tx.currency} GATEWAY</p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-slate-900 tracking-tighter">
                                  {tx.currency === 'USD' ? '$' : tx.currency === 'NGN' ? 'â‚¦' : ''}{(tx.amount / 100).toLocaleString()}
                                </p>
                                <span className={`text-xs font-bold tracking-[0.2em] px-2.5 py-1 rounded-lg ${
 tx.status === 'confirmed' || tx.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
 }`}>{tx.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination Footer */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8 pt-8 border-t border-slate-50">
                          <p className="text-xs font-bold text-slate-400 tracking-wide">
                            Showing <span className="text-slate-900">{Math.min(filteredTransactions.length, (txPage - 1) * txPerPage + 1)}</span> to <span className="text-slate-900">{Math.min(filteredTransactions.length, txPage * txPerPage)}</span> of <span className="text-slate-900">{filteredTransactions.length}</span> transactions
                          </p>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setTxPage(p => Math.max(1, p - 1))}
                              disabled={txPage === 1}
                              className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="bg-slate-50 px-4 py-2.5 rounded-xl">
                              <span className="text-xs font-bold text-slate-900">{txPage}</span>
                            </div>
                            <button 
                              onClick={() => setTxPage(p => p + 1)}
                              disabled={txPage * txPerPage >= filteredTransactions.length}
                              className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="py-24 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                        <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-xs font-bold text-slate-400 tracking-wide">No activity matches your filters</p>
                        <button onClick={() => { setTxSearch(''); setTxStatusFilter('all'); }} className="mt-4 text-xs font-bold text-[#b50a0a] tracking-wide hover:underline">Clear all filters</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
