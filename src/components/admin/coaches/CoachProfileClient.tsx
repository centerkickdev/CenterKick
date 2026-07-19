'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Users, Search, Filter, Shield, UserPlus, 
  MoreHorizontal, Edit, Trash2, ExternalLink, 
  ChevronLeft, ChevronRight, X, User, ChevronDown,
  Globe, Calendar, MapPin, Target, CheckCircle, Clock, CreditCard, Lock, Eye, Mail, Trophy, Activity, MessageSquare,
  Facebook, Instagram, Twitter, AlertCircle, Save, Undo, Plus, Briefcase,
  LayoutDashboard, UserCircle, FileText, Image as ImageIcon, Newspaper, ShoppingBag, DollarSign, Settings,
  Star, Award, Building2, CheckCircle2, Quote
} from 'lucide-react';
import { RestrictedAccessInline, RestrictedAccess } from '@/components/admin/RestrictedAccess';
import { DateDisplay } from '@/components/common/DateDisplay';
import { getPendingEdits, processProfileEdit, getPlayerTransactions } from '@/app/admin/players/actions';
import { updateCoach, getCoachStats, addCoachStat, updateCoachStat, deleteCoachStat, getCoachAchievements, addCoachAchievement, updateCoachAchievement, deleteCoachAchievement, updateProfileTags, getCoachNews } from '@/app/admin/coaches/actions';
import Link from 'next/link';
import { RichTextEditor } from '@/components/cms/RichTextEditor';
import parse from 'html-react-parser';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { FlagIcon } from '@/components/common/FlagIcon';

interface Coach {
  id: string;
  user_id: string | null;
  email: string | null;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  country: string | null;
  date_of_birth?: string;
  age?: number;
  gender: string;
  position: string;
  avatar_url?: string | null;
  is_subscribed?: boolean;
  agent_id?: string | null;
  league?: string | null;
  current_club?: string | null;
  bio?: string | null;
  media_gallery?: {
    highlight_video_url: string;
    action_images: string[];
    external_gallery_url: string;
  };
  tactics?: {
    attacking_approach: string;
    defense_style: string;
    preferred_formation: string;
    tactical_philosophy: string;
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

interface ProfileEdit {
  id: string;
  profile_id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface CoachStat {
  id: string;
  coach_id: string;
  type: 'club' | 'national';
  role: string;
  season: string;
  league_name: string | null;
  club_name: string | null;
  country: string | null;
  games_managed: number;
  wins: number;
  losses: number;
  draws: number;
  cups_won: number;
  leagues_won: number;
  yellow_cards: number;
  red_cards: number;
  // Role-specific metrics
  goals_scored: number;
  goals_conceded: number;
  clean_sheets: number;
  save_percentage: number;
  penalties_saved: number;
  set_piece_goals_scored: number;
  set_piece_goals_conceded: number;
  player_availability_pct: number;
  average_recovery_days: number;
  player_fitness_pct: number;
  injury_count: number;
  achievements?: Array<{
    type: 'league' | 'cup';
    name: string;
  }>;
  created_at?: string;
}

interface CoachAchievement {
  id: string;
  coach_id: string;
  title: string;
  year: string;
  organization: string;
  description: string;
  category: string;
  created_at?: string;
}

import { uploadPlayerImage } from '@/app/admin/players/actions';

interface CoachProfileClientProps {
  coach: Coach;
  agents: Record<string, any>[];
  leagues: Record<string, any>[];
  clubs: Record<string, any>[];
  seasons: Record<string, any>[];
  countries: Record<string, any>[];
}

export default function CoachProfileClient({ 
  coach, agents, leagues, clubs, seasons, countries 
}: CoachProfileClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'bio' | 'statistics' | 'awards' | 'gallery' | 'news' | 'billing'>('profile');
  const [coachStats, setCoachStats] = useState<CoachStat[]>([]);
  const [coachAchievements, setCoachAchievements] = useState<CoachAchievement[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<CoachStat | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<CoachAchievement | null>(null);
  const [playerTransactions, setPlayerTransactions] = useState<Record<string, any>[]>([]);
  const [pendingEdits, setPendingEdits] = useState<ProfileEdit[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingEdits, setIsLoadingEdits] = useState(false);
  const [editingSection, setEditingSection] = useState<'identity' | 'pro' | 'bio' | null>(null);
  const [editedFields, setEditedFields] = useState<Partial<Coach>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isTacticsMediaModalOpen, setIsTacticsMediaModalOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // News & Tagging State
  const [profileTags, setProfileTags] = useState<string[]>(coach.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [isUpdatingTags, setIsUpdatingTags] = useState(false);
  const [coachNews, setCoachNews] = useState<Record<string, any>[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  useEffect(() => {
    if (activeTab === 'billing') {
      const fetchTransactions = async () => {
        setIsLoadingTransactions(true);
        const res = await getPlayerTransactions(coach.id);
        if (res.success) setPlayerTransactions(res.data || []);
        setIsLoadingTransactions(false);
      };
      fetchTransactions();
    }
  }, [coach.id, activeTab]);

  useEffect(() => {
    const fetchEdits = async () => {
      setIsLoadingEdits(true);
      const res = await getPendingEdits(coach.id);
      if (res.success) setPendingEdits(res.data || []);
      setIsLoadingEdits(false);
    };
    fetchEdits();
  }, [coach.id]);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      const res = await getCoachStats(coach.id);
      if (res.success) setCoachStats(res.data || []);
      setIsLoadingStats(false);
    };

    const fetchAchievements = async () => {
      setIsLoadingAchievements(true);
      const res = await getCoachAchievements(coach.id);
      if (res.success) setCoachAchievements(res.data || []);
      setIsLoadingAchievements(false);
    };

    fetchStats();
    fetchAchievements();
  }, [coach.id]);

  useEffect(() => {
    if (activeTab === 'news') {
      const fetchNews = async () => {
        setIsLoadingNews(true);
        const res = await getCoachNews(profileTags.length > 0 ? profileTags : [`${coach.first_name} ${coach.last_name}`]);
        if (res.success) setCoachNews(res.data || []);
        setIsLoadingNews(false);
      };
      fetchNews();
    }
  }, [coach.id, activeTab, coach.first_name, coach.last_name, profileTags]);

  const handleEditAction = async (editId: string, action: 'approve' | 'reject') => {
    const res = await processProfileEdit(editId, action);
    if (res.success) {
      toast.showToast(`Change ${action}d successfully`, 'success');
      const updatedEdits = await getPendingEdits(coach.id);
      if (updatedEdits.success) setPendingEdits(updatedEdits.data || []);
      router.refresh();
    } else {
      toast.showToast(res.error || 'Failed to process edit', 'error');
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const res = await updateCoach(coach.id, editedFields);
    if (res.success) {
      toast.showToast('Coach profile updated successfully', 'success');
      setEditingSection(null);
      setEditedFields({});
      router.refresh();
    } else {
      toast.showToast(res.error || 'Failed to update coach profile', 'error');
    }
    setIsSaving(false);
  };

   const handleUpdateTags = async (newTags: string[]) => {
    setIsUpdatingTags(true);
    try {
      const res = await updateProfileTags(coach.id, newTags);
      if (res.success) {
        setProfileTags(newTags);
        toast.showToast('Profile tags updated and synced', 'success');
      } else {
        toast.showToast(res.error || 'Failed to update tags', 'error');
      }
    } finally {
      setIsUpdatingTags(false);
    }
  };

   const updateField = (field: keyof Coach, value: unknown) => {
    setEditedFields(prev => ({ ...prev, [field]: value }));
  };

   const displayValue = (field: keyof Coach, defaultValue: unknown) => {
    return editedFields.hasOwnProperty(field) ? editedFields[field] : defaultValue;
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadPlayerImage(formData);
      if (res.url) {
        const updateRes = await updateCoach(coach.id, { avatar_url: res.url });
        if (updateRes.success) {
          toast.showToast('Profile picture updated', 'success');
          router.refresh();
        } else {
          toast.showToast(updateRes.error || 'Database update failed', 'error');
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

   const handleSaveStat = async (formData: Partial<CoachStat>) => {
    setIsSaving(true);
    let res;
    if (editingStat) {
      res = await updateCoachStat(editingStat.id, coach.id, formData);
    } else {
      res = await addCoachStat({ ...formData, coach_id: coach.id });
    }

    if (res.success) {
      toast.showToast(`Statistic ${editingStat ? 'updated' : 'added'} successfully`, 'success');
      setIsStatModalOpen(false);
      setEditingStat(null);
      const updated = await getCoachStats(coach.id);
      if (updated.success) setCoachStats(updated.data || []);
      router.refresh();
    } else {
      toast.showToast(res.error || 'Failed to save statistic', 'error');
    }
    setIsSaving(false);
  };

  const handleDeleteStat = async (id: string) => {
    if (!confirm('Are you sure you want to delete this statistic?')) return;
    const res = await deleteCoachStat(id, coach.id);
    if (res.success) {
      toast.showToast('Statistic deleted successfully', 'success');
      const updated = await getCoachStats(coach.id);
      if (updated.success) setCoachStats(updated.data || []);
      router.refresh();
    } else {
      toast.showToast(res.error || 'Failed to delete statistic', 'error');
    }
  };

   const handleSaveAchievement = async (formData: Partial<CoachAchievement>) => {
    setIsSaving(true);
    let res;
    if (editingAchievement) {
      res = await updateCoachAchievement(editingAchievement.id, coach.id, formData);
    } else {
      res = await addCoachAchievement({ ...formData, coach_id: coach.id });
    }

    if (res.success) {
      toast.showToast(`Award ${editingAchievement ? 'updated' : 'added'} successfully`, 'success');
      setIsAchievementModalOpen(false);
      setEditingAchievement(null);
      const updated = await getCoachAchievements(coach.id);
      if (updated.success) setCoachAchievements(updated.data || []);
      router.refresh();
    } else {
      toast.showToast(res.error || 'Failed to save award', 'error');
    }
    setIsSaving(false);
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this award?')) return;
    const res = await deleteCoachAchievement(id, coach.id);
    if (res.success) {
      toast.showToast('Award deleted successfully', 'success');
      const updated = await getCoachAchievements(coach.id);
      if (updated.success) setCoachAchievements(updated.data || []);
      router.refresh();
    } else {
      toast.showToast(res.error || 'Failed to delete award', 'error');
    }
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

  const sortedSeasons = []; // Coaches don't have seasons yet, but we'll keep the structure for future parity
  const groupedStats = {};

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] animate-in fade-in duration-500">
      <input 
        type="file" 
        ref={avatarInputRef}
        className="hidden" 
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
      />
      
      {/* Dashboard Top Bar - Sticky */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 sticky top-[-32px] z-[100] shadow-sm mx-[-32px] mt-[-32px] mb-8">
        <div className="max-w-full max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="/admin/coaches"
              className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold text-sm tracking-wide"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Coaches
            </Link>
            <div className="h-4 w-full max-w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <div 
                className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white overflow-hidden shadow-lg cursor-pointer group/avatar relative ${avatarUploading ? 'animate-pulse' : ''}`}
                onClick={() => !avatarUploading && avatarInputRef.current?.click()}
              >
                {coach.avatar_url ? (
                  <Image 
                    src={coach.avatar_url} 
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
                  {coach.first_name} <span className="text-[#b50a0a]">{coach.last_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold tracking-wide ${
 coach.is_subscribed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
 }`}>
                    {coach.is_subscribed ? 'PRO' : 'NEW'}
                  </span>
                </h1>
                <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mt-1 flex items-center gap-2">
                  <FlagIcon country={coach.country || ''} className="w-3.5 h-2.5" />
                  {coach.email || 'NO EMAIL'} • {coach.position}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href={`/coaches/${coach.id}`} 
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
            {coach.avatar_url ? (
              <Image 
                src={coach.avatar_url} 
                alt="" 
                className="w-full aspect-square object-cover border-2 border-slate-50 shadow-inner transition-transform duration-700 group-hover:scale-110" 
                fill
              />
            ) : (
              <div className="w-full aspect-square bg-slate-100 flex items-center justify-center text-slate-300 text-4xl font-bold">
                {coach.first_name[0]}{coach.last_name[0]}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {[
              { id: 'profile', label: 'Overview & Details', icon: LayoutDashboard },
              { id: 'bio', label: 'Coaching Bio', icon: FileText },
              { id: 'statistics', label: 'Performance Stats', icon: Activity },
              { id: 'awards', label: 'Awards & Honours', icon: Award },
              { id: 'gallery', label: 'Tactics & Media', icon: ImageIcon },
              { id: 'news', label: 'Latest Mentions', icon: Newspaper },
              { id: 'billing', label: 'Billing & History', icon: DollarSign },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as 'profile' | 'bio' | 'statistics' | 'awards' | 'gallery' | 'news' | 'billing'); setEditingSection(null); }}
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
              {coach.agent_id ? (
                <Link href={`/admin/agents/${coach.agent_id}`} className="text-xs font-bold text-slate-900 hover:text-[#b50a0a] transition-colors">
                  {agents.find((a: Record<string, any>) => a.user_id === coach.agent_id)?.first_name ? `${agents.find((a: Record<string, any>) => a.user_id === coach.agent_id)?.first_name} ${agents.find((a: Record<string, any>) => a.user_id === coach.agent_id)?.last_name}` : 'Linked Agent'}
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
                        { label: 'First Name', value: coach.first_name, field: 'first_name', type: 'text' },
                        { label: 'Last Name', value: coach.last_name, field: 'last_name', type: 'text' },
                        { label: 'Email Address', value: coach.email || 'N/A', field: 'email', type: 'text' },
                        { label: 'Date Of Birth', value: coach.date_of_birth, field: 'date_of_birth', type: 'date' },
                        { label: 'Citizenship', value: coach.country, field: 'country', type: 'select', options: countries.map(c => c.name) },
                        { label: 'Gender', value: coach.gender, field: 'gender', type: 'select', options: ['Male', 'Female', 'Other'] },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-400 tracking-wide">{item.label}</span>
                          {editingSection === 'identity' ? (
                            item.type === 'select' ? (
                              <select 
                                value={displayValue(item.field as keyof Coach, item.value || '') as string}
                                onChange={(e) => updateField(item.field as keyof Coach, e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#b50a0a]"
                              >
                                {(item.options || []).map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input 
                                type={item.type}
                                value={displayValue(item.field as keyof Coach, item.value || '') as string}
                                onChange={(e) => updateField(item.field as keyof Coach, e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#b50a0a]"
                              />
                            )
                          ) : (
                            <div className="text-sm font-bold text-slate-800">
                              {item.field === 'date_of_birth' ? (item.value ? <DateDisplay date={item.value as string} /> : 'N/A') : item.value}
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
                        const currentLeague = displayValue('league' as keyof Coach, coach.league);
                        const availableClubs = clubs.filter((c: Record<string, any>) => c.leagues?.name === currentLeague).map((c: Record<string, any>) => c.name);
                        
                        return [
                          { label: 'Primary Role', value: coach.position, field: 'position', type: 'select', options: ['Head Coach', 'Assistant Coach', 'Goalkeeping Coach', 'Fitness Coach', 'Set Piece Coach', 'Medical Coach'] },
                          { label: 'League', value: coach.league || 'Not Set', field: 'league', type: 'select', options: ['None', ...leagues.map(l => l.name)] },
                          { label: 'Current Club', value: coach.current_club || 'Unattached', field: 'current_club', type: availableClubs.length > 0 ? 'select' : 'text', options: availableClubs },
                          { label: 'Managing Agent', value: coach.agent_id, field: 'agent_id', type: 'select', options: agents.map(a => ({ id: a.user_id, name: `${a.first_name} ${a.last_name}` })) },
                        ];
                      })().map((item, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-400 tracking-wide">{item.label}</span>
                          {editingSection === 'pro' ? (
                            item.type === 'select' ? (
                              <select 
                                value={displayValue(item.field as keyof Coach, item.value || '') as string}
                                onChange={(e) => {
                                  updateField(item.field as keyof Coach, e.target.value);
                                  if (item.field === 'league') updateField('current_club' as keyof Coach, '');
                                }}
                                className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#b50a0a]"
                              >
                                {item.field === 'current_club' && <option value="">Select Club</option>}
                                {item.field === 'agent_id' && <option value="">Independent</option>}
                                {(item.options || []).map((opt: unknown) => (
                                  <option key={typeof opt === 'string' ? opt : (opt as Record<string, any>).id} value={typeof opt === 'string' ? opt : (opt as Record<string, any>).id}>
                                    {typeof opt === 'string' ? opt : (opt as Record<string, any>).name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input 
                                type={item.type}
                                value={displayValue(item.field as keyof Coach, item.value || '') as string}
                                onChange={(e) => updateField(item.field as keyof Coach, e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#b50a0a]"
                              />
                            )
                          ) : (
                            <div className="text-sm font-bold text-slate-800">
                              {item.field === 'agent_id' 
                                ? (agents.find((a: Record<string, any>) => a.id === item.value)?.first_name 
                                   ? `${agents.find((a: Record<string, any>) => a.id === item.value)?.first_name} ${agents.find((a: Record<string, any>) => a.id === item.value)?.last_name}` 
                                   : 'Independent')
                                : item.value}
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
              </div>
            </div>
          )}

          {activeTab === 'bio' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-indigo-50/50"></div>
                
                <div className="flex items-center justify-between mb-6 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-wide">Coaching Biography</h3>
                      <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mt-1">Experience & Philosophy</p>
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
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4">
                      <RichTextEditor
                        content={displayValue('bio', coach.bio || '') as string}
                        onChange={(val) => updateField('bio', val)}
                      />
                    </div>
                    <div className="flex justify-end gap-4">
                      <button onClick={handleSaveChanges} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold tracking-[0.2em] hover:bg-[#b50a0a] transition-all shadow-lg shadow-slate-200">Save Biography</button>
                      <button onClick={() => { setEditingSection(null); setEditedFields({}); }} className="px-10 py-4 bg-white text-slate-400 border border-slate-200 rounded-2xl text-xs font-bold tracking-wide hover:bg-slate-50 transition-all">Cancel</button>
                    </div>
                  </div>
                ) : (                  
                  <div>
                    <div className="p-4 md:p-8 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 relative group/bio shadow-inner">
                      <div className="text-sm text-slate-600 leading-relaxed font-medium prose prose-sm max-w-none prose-a:text-indigo-600 hover:prose-a:text-indigo-800">
                        {coach.bio ? parse(coach.bio) : "No professional biography has been provided yet."}
                      </div>
                      <div className="absolute -left-2 top-10 w-1 h-32 bg-[#b50a0a]/20 rounded-full opacity-0 group-hover/bio:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Performance Statistics</h3>
                  <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">Detailed coaching record and tactical analytics</p>
                </div>
                <button 
                  onClick={() => { setEditingStat(null); setIsStatModalOpen(true); }}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold tracking-wide hover:bg-[#b50a0a] transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
                >
                  <Plus className="w-4 h-4" /> Add Statistic
                </button>
              </div>

              {/* Statistics Tables */}
              {['club', 'national'].map((type) => {
                const filteredStats = coachStats.filter(s => s.type === type);
                if (filteredStats.length === 0) return null;

                return (
                  <div key={type} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-4 md:px-8 py-4 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="text-xs font-bold tracking-[0.2em] text-slate-400 flex items-center gap-2">
                         <Activity className="w-3.5 h-3.5" /> {type === 'club' ? 'Club Management' : 'International Management'}
                      </h4>
                    </div>
                    <div className="overflow-x-auto w-full pb-4 custom-scrollbar">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-slate-50">
                            <th className="px-4 md:px-8 py-4 text-xs font-bold text-slate-400 tracking-wide">Season</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wide">{type === 'club' ? 'Club / League' : 'Nation'}</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wide text-center">G</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wide text-center">W</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wide text-center">D</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wide text-center">L</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wide text-center text-emerald-600">Wins %</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#b50a0a] tracking-wide text-center">Specialized</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 tracking-wide text-center">Trophies</th>
                            <th className="px-4 md:px-8 py-4 text-xs font-bold text-slate-400 tracking-wide text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStats.map((stat) => (
                            <tr key={stat.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                              <td className="px-4 md:px-8 py-5 text-xs font-bold text-slate-900 tracking-tighter">{stat.season}</td>
                              <td className="px-6 py-5">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-900 tracking-tight">
                                    {type === 'club' ? stat.club_name : stat.country}
                                  </span>
                                  {type === 'club' && <span className="text-xs font-bold text-slate-400 tracking-wide">{stat.league_name}</span>}
                                  <span className="text-xs font-medium text-[#b50a0a] tracking-wide mt-0.5">{stat.role}</span>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-sm font-bold text-slate-900 text-center">{stat.games_managed}</td>
                              <td className="px-6 py-5 text-sm font-bold text-slate-900 text-center">{stat.wins}</td>
                              <td className="px-6 py-5 text-sm font-bold text-slate-900 text-center">{stat.draws}</td>
                              <td className="px-6 py-5 text-sm font-bold text-slate-900 text-center">{stat.losses}</td>
                              <td className="px-6 py-5 text-center">
                                <span className="text-sm font-bold text-emerald-600 tracking-tighter">
                                  {stat.games_managed > 0 ? Math.round((stat.wins / stat.games_managed) * 100) : 0}%
                                </span>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  {stat.role === 'Goalkeeping Coach' && (
                                    <span className="text-xs font-bold text-slate-700 tracking-tight">
                                      {stat.clean_sheets} CS • {stat.save_percentage}%
                                    </span>
                                  )}
                                  {stat.role === 'Fitness Coach' && (
                                    <span className="text-xs font-bold text-slate-700 tracking-tight">
                                      {stat.player_fitness_pct}% Fit • {stat.injury_count} Inj
                                    </span>
                                  )}
                                  {stat.role === 'Set Piece Coach' && (
                                    <span className="text-xs font-bold text-slate-700 tracking-tight">
                                      +{stat.set_piece_goals_scored}/-{stat.set_piece_goals_conceded} SPG
                                    </span>
                                  )}
                                  {stat.role === 'Medical Coach' && (
                                    <span className="text-xs font-bold text-slate-700 tracking-tight">
                                      {stat.player_availability_pct}% Avail • {stat.average_recovery_days}d
                                    </span>
                                  )}
                                  {(stat.role === 'Primary Coach' || stat.role === 'Assistant Coach') && (
                                    <span className="text-xs font-bold text-slate-700 tracking-tight">
                                      {stat.goals_scored}:{stat.goals_conceded} GD
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {(stat.achievements || []).length > 0 ? (
                                      (stat.achievements || []).map((achievement: Record<string, any>, i: number) => (
                                        <div key={i} className="group/trophy relative">
                                          <Trophy className={`w-3.5 h-3.5 ${achievement.type === 'league' ? 'text-amber-500' : 'text-amber-400'} fill-current`} />
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover/trophy:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10">
                                            <p className="font-bold tracking-wide leading-none">{achievement.name}</p>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <>
                                        {[...Array(stat.leagues_won + stat.cups_won)].map((_, i) => (
                                          <Trophy key={i} className={`w-3.5 h-3.5 ${i < stat.leagues_won ? 'text-amber-500' : 'text-amber-400'} fill-current`} />
                                        ))}
                                        {stat.leagues_won + stat.cups_won === 0 && <span className="text-slate-300 text-xs">—</span>}
                                      </>
                                    )}
                                  </div>
                                  {(stat.achievements || []).length > 0 && (
                                    <div className="flex flex-col gap-0.5">
                                      {(stat.achievements || []).slice(0, 2).map((a: Record<string, any>, i: number) => (
                                        <span key={i} className={`text-xs font-bold tracking-tight leading-tight ${a.type === 'league' ? 'text-amber-600' : 'text-slate-400'}`}>
                                          {a.name}
                                        </span>
                                      ))}
                                      {(stat.achievements || []).length > 2 && (
                                        <span className="text-[7px] font-bold text-slate-300 tracking-wide">
                                          +{(stat.achievements || []).length - 2} More
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 md:px-8 py-5 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => { setEditingStat(stat); setIsStatModalOpen(true); }}
                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteStat(stat.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              {coachStats.length === 0 && (
                <div className="bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mx-auto mb-6">
                    <Activity className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 tracking-wide mb-2">No Performance Records</h4>
                  <p className="text-xs text-slate-400 font-medium max-w-full max-w-[280px] mx-auto leading-relaxed">Start adding coaching statistics to build a comprehensive professional history.</p>
                  <button 
                    onClick={() => { setEditingStat(null); setIsStatModalOpen(true); }}
                    className="mt-8 px-4 md:px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold tracking-wide hover:bg-[#b50a0a] transition-all shadow-lg shadow-slate-200"
                  >
                    Create First Stat
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'awards' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Awards & Honours</h3>
                  <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">Professional recognition and historical milestones</p>
                </div>
                <button 
                  onClick={() => { setEditingAchievement(null); setIsAchievementModalOpen(true); }}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold tracking-wide hover:bg-[#b50a0a] transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
                >
                  <Plus className="w-4 h-4" /> Add Award
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-3 gap-6">
                {coachAchievements.map((award) => (
                  <div key={award.id} className="bg-white border border-slate-100 p-4 md:p-8 rounded-[2.5rem] shadow-sm relative group hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-bl-[2.5rem] -mr-0 -mt-0 -z-0 transition-all group-hover:bg-amber-100/50"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform shadow-sm border border-amber-100/50">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 mb-6">
                        <p className="text-xs font-bold text-[#b50a0a] tracking-[0.2em]">{award.category}</p>
                        <h4 className="text-lg font-bold tracking-tight text-slate-900 leading-none group-hover:text-[#b50a0a] transition-colors">{award.title}</h4>
                        <p className="text-xs font-bold text-slate-400 tracking-wide">{award.organization} • {award.year}</p>
                      </div>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">
                        {award.description}
                      </p>
                      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingAchievement(award); setIsAchievementModalOpen(true); }}
                          className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAchievement(award.id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {coachAchievements.length === 0 && (
                <div className="bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mx-auto mb-6">
                    <Award className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 tracking-wide mb-2">No Awards Recorded</h4>
                  <p className="text-xs text-slate-400 font-medium max-w-full max-w-[280px] mx-auto leading-relaxed">Showcase coach's professional achievements and historical honours.</p>
                  <button 
                    onClick={() => { setEditingAchievement(null); setIsAchievementModalOpen(true); }}
                    className="mt-8 px-4 md:px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold tracking-wide hover:bg-[#b50a0a] transition-all shadow-lg shadow-slate-200"
                  >
                    Add Award
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
               <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Tactics & Media</h3>
                    <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">Review coaching assets and tactical systems</p>
                  </div>
                  <button 
                    onClick={() => setIsTacticsMediaModalOpen(true)}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold tracking-wide hover:bg-[#b50a0a] transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
                  >
                     <ImageIcon className="w-4 h-4" /> Manage Tactics & Media
                  </button>
               </div>

               {/* Tactical Profile Card */}
               <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-bl-[6rem] -z-0 transition-all group-hover:bg-slate-100/80"></div>
                  <div className="p-10 relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                          <Target className="w-7 h-7" />
                       </div>
                       <div>
                          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Tactical System</h3>
                          <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mt-0.5">Core Methodology & Logic</p>
                       </div>
                    </div>

                    <div className="space-y-4 mb-10">
                       {[
                          { label: 'Attacking Approach', value: coach.tactics?.attacking_approach, icon: Target, color: 'text-orange-600' },
                          { label: 'Defensive Style', value: coach.tactics?.defense_style, icon: Shield, color: 'text-blue-600' },
                          { label: 'Primary Formation', value: coach.tactics?.preferred_formation, icon: LayoutDashboard, color: 'text-emerald-600' },
                       ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-white hover:shadow-md transition-all group/item">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 text-slate-400 group-hover/item:text-slate-900 transition-colors">
                                   <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                                <div>
                                   <p className="text-xs font-bold text-slate-400 tracking-wide">{item.label}</p>
                                   <p className="text-sm font-bold text-slate-900 tracking-tight mt-0.5">{item.value || 'Not Defined'}</p>
                                </div>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity border border-slate-100 shadow-sm">
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                             </div>
                          </div>
                       ))}
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group/philosophy hover:shadow-xl hover:translate-y-[-2px] transition-all">
                       <div className="absolute top-0 left-0 w-2 h-full bg-[#b50a0a]/10 group-hover/philosophy:bg-[#b50a0a] transition-all"></div>
                       <div className="relative z-10 pl-4">
                          <div className="flex items-center gap-3 mb-6">
                             <Quote className="w-10 h-10 text-[#b50a0a] opacity-20 group-hover/philosophy:opacity-40 transition-opacity" />
                             <h4 className="text-xs font-bold tracking-[0.3em] text-slate-400">Tactical Philosophy</h4>
                          </div>
                          <div className="min-h-[80px] flex items-center">
                             <p className="text-xl md:text-2xl font-bold text-slate-900 leading-tight tracking-tighter">
                                {coach.tactics?.tactical_philosophy ? (
                                   `"${coach.tactics.tactical_philosophy}"`
                                ) : "Fundamental vision has not been defined for this professional profile."}
                             </p>
                          </div>
                          <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-white">
                                   {coach.first_name[0]}{coach.last_name[0]}
                                </div>
                                <span className="text-xs font-bold text-slate-400 tracking-wide">{coach.first_name} {coach.last_name}</span>
                             </div>
                             <Target className="w-5 h-5 text-slate-100" />
                          </div>
                       </div>
                    </div>
                  </div>
               </div>

               {/* Media Library Section */}
               <div className="space-y-6">
                  <div className="flex items-center gap-2 px-2">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <h4 className="text-xs font-bold tracking-[0.2em] text-slate-400">Multimedia Gallery</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {/* Highlight Video (First Slot if exists) */}
                    {coach.media_gallery?.highlight_video_url && (
                      <div className="aspect-square bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm group cursor-pointer relative border border-slate-800">
                        <div className="absolute inset-0 bg-[#b50a0a]/20 group-hover:bg-[#b50a0a]/40 transition-all flex items-center justify-center">
                          <ExternalLink className="w-8 h-8 text-white animate-pulse" />
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md rounded-xl p-2 text-center text-xs font-bold text-white tracking-wide border border-white/10">
                          Highlight Reel
                        </div>
                      </div>
                    )}
                    
                    {/* Action Images */}
                    {(coach.media_gallery?.action_images || []).filter(url => url).map((url, i) => (
                      <div key={i} className="aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm group cursor-pointer hover:border-[#b50a0a] transition-all relative">
                          <Image 
                             src={url} 
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                             alt={`Gallery ${i + 1}`}
                             fill
                           />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                      </div>
                    ))}

                    {/* Placeholder if empty */}
                    {(!(coach.media_gallery?.action_images || []).some(url => url) && !coach.media_gallery?.highlight_video_url) && (
                      <div className="col-span-full aspect-[4/1] bg-white border border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-slate-200 mb-2" />
                        <p className="text-xs font-bold text-slate-400 tracking-wide">No Media Uploaded</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}

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
                        placeholder="Add new tag (e.g. Manchester United)"
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
                ) : coachNews.length > 0 ? (
                  coachNews.map((news: Record<string, any>) => (
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
                    <p className="text-xs font-bold text-slate-400 tracking-wide">No stories tagged for this coach yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
               {/* Subscription Hero */}
               <div className="bg-slate-900 rounded-[3rem] p-16 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#b50a0a]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-12">
                       <h3 className="text-xs font-bold tracking-[0.3em] text-slate-500">Subscription Hub</h3>
                       <span className={`${coach.is_subscribed ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-700'} px-4 md:px-8 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all`}>
                          {coach.is_subscribed ? 'Coach Premium' : 'Standard Access'}
                       </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div>
                          <p className="text-xs font-bold text-slate-500 tracking-wide mb-3">Expiration Date</p>
                          <p className="text-4xl font-bold tracking-tighter">
                             {coach.users?.subscriptions?.[0]?.current_period_end ? (
                                <DateDisplay date={coach.users.subscriptions[0].current_period_end} />
                             ) : 'UNSET'}
                          </p>
                       </div>
                       <div className="flex flex-col justify-end items-end">
                          <p className="text-xs font-bold text-slate-500 tracking-wide mb-3">Service Level</p>
                          <p className="text-xl font-bold tracking-tighter text-right">
                             {coach.is_subscribed ? 'Active Professional' : 'Restricted Access'}
                          </p>
                       </div>
                    </div>
                  </div>
               </div>

               {/* Transaction Ledger */}
               <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Financial Ledger</h3>
                        <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">Direct payment records and history</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {isLoadingTransactions ? (
                      <div className="py-20 text-center">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-[#b50a0a] rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-xs font-bold text-slate-400 tracking-wide">Accessing records...</p>
                      </div>
                    ) : playerTransactions.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {playerTransactions.map((tx: Record<string, any>, i: number) => (
                          <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-50 hover:border-[#b50a0a]/10 hover:bg-white transition-all group">
                            <div className="flex items-center gap-6">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold shadow-sm ${
 tx.status === 'confirmed' || tx.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
 }`}>
                                {tx.currency === 'USD' ? '$' : tx.currency === 'NGN' ? '₦' : tx.currency}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900 leading-none mb-1.5 tracking-tight">
                                  {tx.reference?.split('_')[0] || 'Member Base Payment'}
                                  <span className="ml-2 text-xs font-bold text-slate-300 transform tracking-wide opacity-50">REF: {tx.reference}</span>
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
                                {tx.currency === 'USD' ? '$' : tx.currency === 'NGN' ? '₦' : ''}{(tx.amount / 100).toLocaleString()}
                              </p>
                              <span className={`text-xs font-bold tracking-[0.2em] px-2.5 py-1 rounded-lg ${
 tx.status === 'confirmed' || tx.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
 }`}>{tx.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                        <CreditCard className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                        <p className="text-xs font-bold text-slate-400 tracking-wide">No transactions recorded yet</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      <StatModal 
        isOpen={isStatModalOpen} 
        onClose={() => setIsStatModalOpen(false)} 
        onSave={handleSaveStat}
        editingStat={editingStat}
        isSaving={isSaving}
        leagues={leagues}
        clubs={clubs}
        seasons={seasons}
        countries={countries}
      />

      <AchievementModal 
        isOpen={isAchievementModalOpen} 
        onClose={() => setIsAchievementModalOpen(false)} 
        onSave={handleSaveAchievement}
        editingAchievement={editingAchievement}
        isSaving={isSaving}
      />

      <TacticsMediaModal 
        isOpen={isTacticsMediaModalOpen}
        onClose={() => setIsTacticsMediaModalOpen(false)}
        onSave={async (data: Record<string, any>) => {
          setIsSaving(true);
          const res = await updateCoach(coach.id, {
            media_gallery: data.media_gallery,
            tactics: data.tactics
          });
          if (res.success) {
            toast.showToast('Tactics & Media updated successfully', 'success');
            setIsTacticsMediaModalOpen(false);
            router.refresh();
          } else {
            toast.showToast(res.error || 'Update failed', 'error');
          }
          setIsSaving(false);
        }}
        initialData={{
          media_gallery: coach.media_gallery || { highlight_video_url: '', action_images: ['', '', '', '', ''], external_gallery_url: '' },
          tactics: coach.tactics || { attacking_approach: '', defense_style: '', preferred_formation: '', tactical_philosophy: '' }
        }}
      />
    </div>
  );
}

// Modals
function StatModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingStat,
  isSaving,
  leagues,
  clubs: allClubs,
  seasons: allSeasons,
  countries
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: any) => void; 
  editingStat: CoachStat | null;
  isSaving: boolean;
  leagues: Record<string, any>[];
  clubs: Record<string, any>[];
  seasons: Record<string, any>[];
  countries: Record<string, any>[];
}) {
  const [formData, setFormData] = useState<Partial<CoachStat>>({
    type: 'club',
    role: 'Primary Coach',
    season: '2023/24',
    games_managed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    cups_won: 0,
    leagues_won: 0,
    yellow_cards: 0,
    red_cards: 0,
    goals_scored: 0,
    goals_conceded: 0,
    clean_sheets: 0,
    save_percentage: 0,
    penalties_saved: 0,
    set_piece_goals_scored: 0,
    set_piece_goals_conceded: 0,
    player_availability_pct: 0,
    average_recovery_days: 0,
    player_fitness_pct: 0,
    injury_count: 0,
    achievements: []
  });

  // Seasons from props
  const seasonsList = allSeasons.map(s => s.name);

  useEffect(() => {
    if (editingStat) setFormData(editingStat);
    else setFormData({
      type: 'club',
      role: 'Primary Coach',
      season: seasonsList[0] || '2023/24',
      games_managed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      cups_won: 0,
      leagues_won: 0,
      yellow_cards: 0,
      red_cards: 0,
      goals_scored: 0,
      goals_conceded: 0,
      clean_sheets: 0,
      save_percentage: 0,
      penalties_saved: 0,
      set_piece_goals_scored: 0,
      set_piece_goals_conceded: 0,
      player_availability_pct: 0,
      average_recovery_days: 0,
      player_fitness_pct: 0,
      injury_count: 0,
      achievements: []
    });
  }, [editingStat, isOpen]);

  if (!isOpen) return null;

  const clubs = allClubs.filter((c: Record<string, any>) => c.leagues?.name === formData.league_name);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl shadow-slate-900/20 animate-in slide-in-from-bottom-8 duration-500">
        <div className="bg-slate-900 p-4 md:p-8 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight">{editingStat ? 'Edit Statistic' : 'Add Coaching Stat'}</h3>
            <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">Record role-specific performance metrics</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X className="w-5 h-5" /></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 md:p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Team Type</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="club">Club Management</option>
                <option value="national">National Team</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Coaching Role</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Primary Coach">Primary Coach</option>
                <option value="Assistant Coach">Assistant Coach</option>
                <option value="Goalkeeping Coach">Goalkeeping Coach</option>
                <option value="Fitness Coach">Fitness Coach</option>
                <option value="Set Piece Coach">Set Piece Coach</option>
                <option value="Medical Coach">Medical Coach</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Season</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              >
                {seasonsList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {formData.type === 'club' ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">League</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
                    value={formData.league_name || ''}
                    onChange={(e) => setFormData({ ...formData, league_name: e.target.value, club_name: '' })}
                  >
                    <option value="">Select League</option>
                    {leagues.map((l: Record<string, any>) => <option key={l.id} value={l.name}>{l.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Club</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
                    value={formData.club_name || ''}
                    disabled={!formData.league_name}
                    onChange={(e) => setFormData({ ...formData, club_name: e.target.value })}
                  >
                    <option value="">Select Club</option>
                    {clubs.map((c: Record<string, any>) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Nation</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                >
                  <option value="">Select Nation</option>
                  {countries.map((c: Record<string, any>) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* General Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Games</label>
              <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.games_managed || 0} onChange={(e) => setFormData({ ...formData, games_managed: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Wins</label>
              <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.wins || 0} onChange={(e) => setFormData({ ...formData, wins: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Draws</label>
              <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.draws || 0} onChange={(e) => setFormData({ ...formData, draws: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Losses</label>
              <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.losses || 0} onChange={(e) => setFormData({ ...formData, losses: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Leagues Won</label>
              <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.leagues_won || 0} onChange={(e) => setFormData({ ...formData, leagues_won: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Cups Won</label>
              <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.cups_won || 0} onChange={(e) => setFormData({ ...formData, cups_won: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Yellow Cards</label>
              <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.yellow_cards || 0} onChange={(e) => setFormData({ ...formData, yellow_cards: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Red Cards</label>
              <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.red_cards || 0} onChange={(e) => setFormData({ ...formData, red_cards: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          {(formData.leagues_won || 0) + (formData.cups_won || 0) > 0 && (
            <div className="pt-8 border-t border-slate-100 space-y-6 animate-in slide-in-from-top-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold tracking-[0.2em] text-amber-600 flex items-center gap-2">
                  <Trophy className="w-3 h-3" /> Trophy Details Breakdown
                </h4>
                <p className="text-xs font-bold text-slate-400 tracking-wide">Link trophies to specific registry nodes</p>
              </div>

              <div className="space-y-4">
                {[...Array((formData.leagues_won || 0) + (formData.cups_won || 0))].map((_, i) => {
                  const isLeague = i < (formData.leagues_won || 0);
                  const achievement = (formData.achievements || [])[i] || { 
                    type: isLeague ? 'league' : 'cup', 
                    name: ''
                  };

                  const updateAchievement = (updates: Partial<Record<string, any>>) => {
                    const newAchievements = [...(formData.achievements || [])];
                    newAchievements[i] = { ...achievement, ...updates };
                    setFormData({ ...formData, achievements: newAchievements });
                  };

                  return (
                    <div key={i} className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 space-y-4 group/item hover:border-amber-200 transition-all">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold tracking-wide ${isLeague ? 'text-amber-600' : 'text-slate-400'}`}>
                          # {i + 1} • {isLeague ? 'League Title' : 'Cup Title'}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold tracking-[0.2em] text-slate-400 ml-1">Achievement Name</label>
                        <input 
                          type="text"
                          placeholder={isLeague ? "e.g. Premier League" : "e.g. FA Cup"}
                          className="w-full bg-white border-none rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"
                          value={achievement.name}
                          onChange={(e) => updateAchievement({ name: e.target.value })}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Role-Specific Metrics */}
          <div className="pt-8 border-t border-slate-100">
             <h4 className="text-xs font-bold tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <Target className="w-3 h-3" /> {formData.role} Specialized Metrics
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(formData.role === 'Primary Coach' || formData.role === 'Assistant Coach') && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wide text-slate-400">Goals Scored</label>
                      <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.goals_scored || 0} onChange={(e) => setFormData({ ...formData, goals_scored: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wide text-slate-400">Goals Conceded</label>
                      <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.goals_conceded || 0} onChange={(e) => setFormData({ ...formData, goals_conceded: parseInt(e.target.value) || 0 })} />
                    </div>
                  </>
                )}

                {formData.role === 'Goalkeeping Coach' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wide text-slate-400">Clean Sheets</label>
                      <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.clean_sheets || 0} onChange={(e) => setFormData({ ...formData, clean_sheets: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wide text-slate-400">Save %</label>
                      <input type="number" step="0.1" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.save_percentage || 0} onChange={(e) => setFormData({ ...formData, save_percentage: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wide text-slate-400">Penalties Saved</label>
                      <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.penalties_saved || 0} onChange={(e) => setFormData({ ...formData, penalties_saved: parseInt(e.target.value) || 0 })} />
                    </div>
                  </>
                )}

                {formData.role === 'Fitness Coach' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wide text-slate-400">Player Fitness %</label>
                      <input type="number" step="0.1" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.player_fitness_pct || 0} onChange={(e) => setFormData({ ...formData, player_fitness_pct: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wide text-slate-400">Injury Count</label>
                      <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.injury_count || 0} onChange={(e) => setFormData({ ...formData, injury_count: parseInt(e.target.value) || 0 })} />
                    </div>
                  </>
                )}

                {formData.role === 'Set Piece Coach' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wide text-slate-400">SP Goals For</label>
                      <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.set_piece_goals_scored || 0} onChange={(e) => setFormData({ ...formData, set_piece_goals_scored: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wide text-slate-400">SP Goals Against</label>
                      <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.set_piece_goals_conceded || 0} onChange={(e) => setFormData({ ...formData, set_piece_goals_conceded: parseInt(e.target.value) || 0 })} />
                    </div>
                  </>
                )}

                {formData.role === 'Medical Coach' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wide text-slate-400">Availability %</label>
                      <input type="number" step="0.1" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.player_availability_pct || 0} onChange={(e) => setFormData({ ...formData, player_availability_pct: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wide text-slate-400">Avg Recovery (Days)</label>
                      <input type="number" step="0.1" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.average_recovery_days || 0} onChange={(e) => setFormData({ ...formData, average_recovery_days: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wide text-slate-400">Injury Count</label>
                      <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all" value={formData.injury_count || 0} onChange={(e) => setFormData({ ...formData, injury_count: parseInt(e.target.value) || 0 })} />
                    </div>
                  </>
                )}
             </div>
          </div>

          <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="px-4 md:px-8 py-4 text-xs font-bold tracking-wide text-slate-400 hover:text-slate-900 transition-all">Cancel</button>
            <button 
              type="submit" disabled={isSaving}
              className="px-10 py-4 bg-slate-900 text-white rounded-[2rem] text-xs font-bold tracking-wide hover:bg-[#b50a0a] transition-all shadow-xl shadow-slate-200 flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingStat ? 'Update Record' : 'Save Statistic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AchievementModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingAchievement,
  isSaving 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: any) => void; 
  editingAchievement: CoachAchievement | null;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<Partial<CoachAchievement>>({
    title: '',
    year: new Date().getFullYear().toString(),
    organization: '',
    description: '',
    category: 'Individual'
  });

  useEffect(() => {
    if (editingAchievement) setFormData(editingAchievement);
    else setFormData({
      title: '',
      year: new Date().getFullYear().toString(),
      organization: '',
      description: '',
      category: 'Individual'
    });
  }, [editingAchievement, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl shadow-slate-900/20 animate-in slide-in-from-bottom-8 duration-500">
        <div className="bg-slate-900 p-4 md:p-8 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight">{editingAchievement ? 'Edit Award' : 'Add New Award'}</h3>
            <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">Honours, trophies and professional recognition</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X className="w-5 h-5" /></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Achievement Title</label>
              <input 
                type="text" required placeholder="e.g. Coach of the Year"
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Year</label>
              <input 
                type="text" required placeholder="2023"
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Category</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Individual">Individual Award</option>
                <option value="Team">Team Honour</option>
                <option value="International">International</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Organization / League</label>
              <input 
                type="text" placeholder="e.g. Premier League"
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all"
                value={formData.organization || ''}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold tracking-wide text-slate-400 ml-1">Description (Optional)</label>
              <textarea 
                rows={3}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] transition-all resize-none"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="px-4 md:px-8 py-4 text-xs font-bold tracking-wide text-slate-400 hover:text-slate-900 transition-all">Cancel</button>
            <button 
              type="submit" disabled={isSaving}
              className="px-10 py-4 bg-slate-900 text-white rounded-[2rem] text-xs font-bold tracking-wide hover:bg-[#b50a0a] transition-all shadow-xl shadow-slate-200 flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingAchievement ? 'Update Award' : 'Save Award'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TacticsMediaModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: { 
  isOpen: boolean; onClose: () => void; onSave: (data: Record<string, any>) => void; 
  initialData: { 
    media_gallery: { highlight_video_url: string; action_images: string[]; external_gallery_url: string };
    tactics: { attacking_approach: string; defense_style: string; preferred_formation: string; tactical_philosophy: string };
  }
}) {
  const [formData, setFormData] = useState(initialData);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const isInitialized = useRef(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && !isInitialized.current && initialData) {
      const baseImages = initialData.media_gallery?.action_images || [];
      const paddedImages = [0, 1, 2, 3, 4].map(i => baseImages[i] || '');
      setFormData({
        ...initialData,
        media_gallery: {
          ...initialData.media_gallery,
          action_images: paddedImages
        }
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
      const newImages = [...formData.media_gallery.action_images];
      newImages[index] = res.url;
      setFormData({ 
        ...formData, 
        media_gallery: { ...formData.media_gallery, action_images: newImages } 
      });
      toast.showToast(`Image ${index + 1} uploaded`, 'success');
    } else {
      toast.showToast(res.error || 'Upload failed', 'error');
    }
    setUploadingIndex(null);
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.media_gallery.action_images];
    newImages[index] = '';
    setFormData({ 
      ...formData, 
      media_gallery: { ...formData.media_gallery, action_images: newImages } 
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white rounded-[3rem] w-full max-w-3xl my-8 overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Tactics & Media Manager</h3>
            <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">Videos, Photos & Technical Systems</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <div className="p-10 space-y-12 overflow-y-auto flex-1 custom-scrollbar">
          {/* Section 1: Tactical Systems */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold tracking-[0.2em] text-slate-900">Functional Tactical Controls</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Attacking Approach</label>
                <select 
                  value={formData.tactics.attacking_approach}
                  onChange={(e) => setFormData({ ...formData, tactics: { ...formData.tactics, attacking_approach: e.target.value } })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                >
                  <option value="">Select Approach</option>
                  <option value="Possession-based">Possession-based</option>
                  <option value="Counter-attack">Counter-attack</option>
                  <option value="High-press">High-press</option>
                  <option value="Direct Football">Direct Football</option>
                  <option value="Gegenpressing">Gegenpressing</option>
                  <option value="Tiki-Taka">Tiki-Taka</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Defensive Style</label>
                <select 
                  value={formData.tactics.defense_style}
                  onChange={(e) => setFormData({ ...formData, tactics: { ...formData.tactics, defense_style: e.target.value } })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                >
                  <option value="">Select Style</option>
                  <option value="Zonal Marking">Zonal Marking</option>
                  <option value="Man-to-Man">Man-to-Man</option>
                  <option value="Low Block">Low Block</option>
                  <option value="High Line">High Line</option>
                  <option value="Buscaglia Block">Buscaglia Block</option>
                  <option value="Parking the Bus">Parking the Bus</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Preferred Formation</label>
                <select 
                  value={formData.tactics.preferred_formation}
                  onChange={(e) => setFormData({ ...formData, tactics: { ...formData.tactics, preferred_formation: e.target.value } })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                >
                  <option value="">Select Formation</option>
                  <option value="4-3-3">4-3-3</option>
                  <option value="4-4-2">4-4-2</option>
                  <option value="4-2-3-1">4-2-3-1</option>
                  <option value="3-5-2">3-5-2</option>
                  <option value="3-4-3">3-4-3</option>
                  <option value="5-3-2">5-3-2</option>
                  <option value="4-1-4-1">4-1-4-1</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Tactical Philosophy / Vision</label>
              <textarea 
                rows={6}
                value={formData.tactics.tactical_philosophy}
                onChange={(e) => setFormData({ ...formData, tactics: { ...formData.tactics, tactical_philosophy: e.target.value } })}
                placeholder="Describe your fundamental beliefs about how football should be played at the highest level..."
                className="w-full bg-slate-50 border-none rounded-[2.5rem] px-10 py-8 text-sm font-medium text-slate-600 leading-relaxed shadow-inner focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>
          </div>

          <div className="h-[1px] bg-slate-100"></div>

          {/* Section 2: Multimedia Gallery */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold tracking-[0.2em] text-slate-900">Multimedia Library</h4>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Featured Highlight Video (YouTube/Vimeo)</label>
              <input 
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.media_gallery.highlight_video_url}
                onChange={(e) => setFormData({ ...formData, media_gallery: { ...formData.media_gallery, highlight_video_url: e.target.value } })}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 tracking-wide ml-1">Action & Tactical Images (Max 5)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {formData.media_gallery.action_images.map((url, i) => (
                  <div key={i} className="relative aspect-square">
                    <div className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden group hover:border-indigo-400 transition-all">
                      {url ? (
                        <>
                          <div className="relative w-full h-full">
                            <Image 
                              src={url} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                              alt={`Action ${i + 1}`}
                              fill
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button 
                              onClick={() => removeImage(i)}
                              className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-[#b50a0a] transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                          {uploadingIndex === i ? (
                            <Clock className="w-6 h-6 text-indigo-400 animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-6 h-6 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                              <span className="text-[7px] font-bold text-slate-300 mt-2">Slot {i + 1}</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileChange(i, e.target.files?.[0])}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button 
            onClick={() => onSave(formData)}
            className="flex-1 bg-slate-900 text-white rounded-[2rem] py-5 text-xs font-bold tracking-[0.2em] hover:bg-[#b50a0a] transition-all shadow-xl shadow-slate-200"
          >
            Save All Changes
          </button>
          <button 
            onClick={onClose}
            className="px-12 bg-white text-slate-400 border border-slate-200 rounded-[2rem] py-5 text-xs font-bold tracking-wide hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

