'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Users, Search, Filter, Shield, UserPlus, 
  MoreHorizontal, Edit, Trash2, ExternalLink, 
  ChevronLeft, ChevronRight, X, User, ChevronDown,
  Globe, Calendar, MapPin, Target, CheckCircle, Clock, CreditCard, Lock, Eye, Mail, Trophy, Activity, MessageSquare,
  Facebook, Instagram, Twitter, AlertCircle, Save, Undo, Plus, Briefcase, Link2, LayoutDashboard, UserCircle, FileText, Image as ImageIcon, Newspaper, DollarSign, Settings, RefreshCcw
} from 'lucide-react';
import { RestrictedAccessInline, RestrictedAccess } from '@/components/admin/RestrictedAccess';
import { DateDisplay } from '@/components/common/DateDisplay';
import { getPendingEdits, processProfileEdit, getPlayerTransactions, uploadPlayerImage } from '@/app/admin/players/actions';
import { updateAgent, getAvailableTalent, linkTalentToAgent, unlinkTalentFromAgent } from '@/app/admin/agents/actions';
import Link from 'next/link';
import Image from 'next/image';
import { COUNTRIES } from '@/lib/constants/countries';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { FlagIcon } from '@/components/common/FlagIcon';

interface Agent {
  id: string;
  user_id: string | null;
  email: string | null;
  first_name: string;
  last_name: string;
  slug?: string;
  role: string;
  status: string;
  country: string | null;
  age?: number;
  date_of_birth?: string | null;
  gender: string;
  agency_name: string;
  license_code?: string;
  is_subscribed: boolean;
  avatar_url?: string;
  bio?: string;
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

interface ClientProfile {
  id: string;
  slug?: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar_url?: string;
  country?: string;
  status: string;
  agent_id?: string;
  agent_status?: string;
}

interface AgentProfileClientProps {
  agent: Agent;
  initialClients: ClientProfile[];
}

export default function AgentProfileClient({ agent, initialClients }: AgentProfileClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'bio' | 'clients' | 'billing'>('profile');
  const [playerTransactions, setPlayerTransactions] = useState<Record<string, any>[]>([]);
  const [pendingEdits, setPendingEdits] = useState<ProfileEdit[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingEdits, setIsLoadingEdits] = useState(false);
  const [editingSection, setEditingSection] = useState<'identity' | 'agency' | 'bio' | null>(null);
  const [editedFields, setEditedFields] = useState<Partial<Agent>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [clients, setClients] = useState<ClientProfile[]>(initialClients);
  const [isAddTalentModalOpen, setIsAddTalentModalOpen] = useState(false);
  const [availableTalent, setAvailableTalent] = useState<ClientProfile[]>([]);
  const [isSearchingTalent, setIsSearchingTalent] = useState(false);
  const [talentSearchQuery, setTalentSearchQuery] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'billing') {
      const fetchTransactions = async () => {
        setIsLoadingTransactions(true);
        const res = await getPlayerTransactions(agent.id);
        if (res.success) setPlayerTransactions(res.data || []);
        setIsLoadingTransactions(false);
      };
      fetchTransactions();
    }
  }, [agent.id, activeTab]);

  useEffect(() => {
    const fetchEdits = async () => {
      setIsLoadingEdits(true);
      const res = await getPendingEdits(agent.id);
      if (res.success) setPendingEdits(res.data || []);
      setIsLoadingEdits(false);
    };
    fetchEdits();
  }, [agent.id]);

  const handleEditAction = async (editId: string, action: 'approve' | 'reject') => {
    const res = await processProfileEdit(editId, action);
    if (res.success) {
      toast.showToast(`Change ${action}d successfully`, 'success');
      const updatedEdits = await getPendingEdits(agent.id);
      if (updatedEdits.success) setPendingEdits(updatedEdits.data || []);
      router.refresh();
    } else {
      toast.showToast(res.error || 'Failed to process edit', 'error');
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const res = await updateAgent(agent.id, editedFields);
    if (res.success) {
      toast.showToast('Agent profile updated successfully', 'success');
      setEditingSection(null);
      setEditedFields({});
      router.refresh();
    } else {
      toast.showToast(res.error || 'Failed to update agent profile', 'error');
    }
    setIsSaving(false);
  };

   const updateField = (field: keyof Agent, value: unknown) => {
    setEditedFields((prev: Partial<Agent>) => ({ ...prev, [field]: value }));
  };

   const displayValue = (field: keyof Agent, defaultValue: unknown) => {
    return editedFields.hasOwnProperty(field) ? (editedFields as Record<string, any>)[field] : defaultValue;
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadPlayerImage(formData);
      if (res.url) {
        const updateRes = await updateAgent(agent.id, { avatar_url: res.url });
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

  const handleTalentSearch = async (q: string) => {
    setTalentSearchQuery(q);
    if (!q || q.length < 2) {
      setAvailableTalent([]);
      return;
    }
    setIsSearchingTalent(true);
    const res = await getAvailableTalent(q);
    if (res.success) setAvailableTalent(res.data || []);
    setIsSearchingTalent(false);
  };

  const handleLinkTalent = async (profileId: string) => {
    const res = await linkTalentToAgent(agent.user_id!, profileId);
    if (res.success) {
      toast.showToast('Talent linked successfully', 'success');
      // Refresh clients list
      router.refresh();
      setIsAddTalentModalOpen(false);
      setTalentSearchQuery('');
      setAvailableTalent([]);
    } else {
      toast.showToast(res.error || 'Failed to link talent', 'error');
    }
  };

  const handleUnlinkTalent = async (profileId: string) => {
    if (!confirm('Are you sure you want to remove this athlete from your roster?')) return;
    const res = await unlinkTalentFromAgent(profileId);
    if (res.success) {
      toast.showToast('Talent unlinked successfully', 'success');
      router.refresh();
    } else {
      toast.showToast(res.error || 'Failed to unlink talent', 'error');
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

  return (
    <>
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
              href="/admin/agents"
              className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold text-sm tracking-wide"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Agents
            </Link>
            <div className="h-4 w-full max-w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <div 
                className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white overflow-hidden shadow-lg cursor-pointer group/avatar relative ${avatarUploading ? 'animate-pulse' : ''}`}
                onClick={() => !avatarUploading && avatarInputRef.current?.click()}
              >
                {agent.avatar_url ? (
                  <Image 
                    src={agent.avatar_url} 
                    alt={`${agent.first_name} ${agent.last_name}`} 
                    fill 
                    className="w-full h-full object-cover group-hover/avatar:opacity-50 transition-all" 
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
                  {agent.first_name} <span className="text-[#b50a0a]">{agent.last_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold tracking-wide ${
 agent.is_subscribed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
 }`}>
                    {agent.is_subscribed ? 'PRO' : 'NEW'}
                  </span>
                </h1>
                <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mt-1 flex items-center gap-2">
                  <FlagIcon country={agent.country || ''} className="w-3.5 h-2.5" />
                  {agent.email || 'NO EMAIL'} â€¢ {agent.agency_name}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href={`/agents/${agent.slug}`} 
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
            {agent.avatar_url ? (
              <Image src={agent.avatar_url} alt={`${agent.first_name} ${agent.last_name}`} fill className="w-full aspect-square object-cover border-2 border-slate-50 shadow-inner transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <div className="w-full aspect-square bg-slate-100 flex items-center justify-center text-slate-300 text-4xl font-bold">
                {agent.first_name[0]}{agent.last_name[0]}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {[
              { id: 'profile', label: 'Agency Identity', icon: LayoutDashboard },
              { id: 'bio', label: 'Company Profile', icon: FileText },
              { id: 'clients', label: 'Talent Roster', icon: Users },
              { id: 'billing', label: 'Billing & Subs', icon: DollarSign },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setEditingSection(null); }}
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
              <p className="text-xs font-bold text-slate-400 tracking-wide mb-1">Managed Profiles</p>
              <div className="flex items-center gap-2">
                 <Users className="w-4 h-4 text-slate-900" />
                 <p className="text-xl font-bold tracking-tighter text-slate-900">{clients.length} Profile{clients.length !== 1 ? 's' : ''}</p>
              </div>
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
                        { label: 'First Name', value: agent.first_name, field: 'first_name', type: 'text' },
                        { label: 'Last Name', value: agent.last_name, field: 'last_name', type: 'text' },
                        { label: 'Email Address', value: agent.email || 'N/A', field: 'email', type: 'text' },
                        { label: 'Citizenship', value: agent.country, field: 'country', type: 'select', options: COUNTRIES },
                        { label: 'Birthdate', value: agent.date_of_birth || 'N/A', field: 'date_of_birth', type: 'date' },
                        { label: 'Gender', value: agent.gender, field: 'gender', type: 'select', options: ['Male', 'Female', 'Other'] },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-400 tracking-wide">{item.label}</span>
                          {editingSection === 'identity' ? (
                            item.type === 'select' ? (
                              <select 
                                value={displayValue(item.field as any, item.value || '') as string}
                                onChange={(e) => updateField(item.field as any, e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#b50a0a]"
                              >
                                {(item.options || []).map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input 
                                type={item.type}
                                value={displayValue(item.field as any, item.value || '') as string}
                                onChange={(e) => updateField(item.field as any, e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#b50a0a]"
                              />
                            )
                          ) : (
                            <div className="text-[13px] font-bold text-slate-800">
                              {item.field === 'date_of_birth' ? (item.value ? <DateDisplay date={item.value as string} /> : 'N/A') : item.value || 'N/A'}
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

                {/* Agency Details Card */}
                <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-0 transition-all group-hover:bg-slate-100"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">Agency Operations</h3>
                      </div>
                      <button 
                         onClick={() => setEditingSection(editingSection === 'agency' ? null : 'agency')}
                         className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {[
                        { label: 'Agency Name', value: agent.agency_name, field: 'agency_name', type: 'text' },
                        { label: 'License Code', value: agent.license_code || 'UNLICENSED', field: 'license_code', type: 'text' },
                        { label: 'Status', value: agent.status, field: 'status', type: 'select', options: ['active', 'pending', 'suspended'] },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-400 tracking-wide">{item.label}</span>
                          {editingSection === 'agency' ? (
                            item.type === 'select' ? (
                              <select 
                                value={displayValue(item.field as any, item.value || '') as string}
                                onChange={(e) => updateField(item.field as any, e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#b50a0a]"
                              >
                                {(item.options || []).map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input 
                                type={item.type}
                                value={displayValue(item.field as any, item.value || '') as string}
                                onChange={(e) => updateField(item.field as any, e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-[#b50a0a]"
                              />
                            )
                          ) : (
                            <div className="text-[13px] font-bold text-slate-800">
                              {item.value || 'N/A'}
                            </div>
                          )}
                          <PendingEditBadge field={item.field} />
                        </div>
                      ))}
                    </div>

                    {editingSection === 'agency' && (
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
                      <h3 className="text-base font-bold text-slate-900 tracking-wide">Company Profile</h3>
                      <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mt-1">Agency Brand & History</p>
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
                      rows={8}
                      className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-4 md:p-8 text-[13px] font-medium text-slate-600 leading-relaxed shadow-inner focus:ring-2 focus:ring-[#b50a0a] focus:border-transparent outline-none transition-all resize-none"
                      value={displayValue('bio', agent.bio || '') as string}
                      onChange={(e) => updateField('bio', e.target.value)}
                      placeholder="Describe your agency&apos;s mission, key achievements, and roster focus..."
                    />
                    <div className="flex gap-4">
                      <button onClick={handleSaveChanges} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold tracking-[0.2em] hover:bg-[#b50a0a] transition-all shadow-lg shadow-slate-200">Save Biography</button>
                      <button onClick={() => { setEditingSection(null); setEditedFields({}); }} className="px-10 py-4 bg-white text-slate-400 border border-slate-200 rounded-2xl text-xs font-bold tracking-wide hover:bg-slate-50 transition-all">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="p-4 md:p-8 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 relative group/bio shadow-inner">
                      <div className="text-[13px] font-medium text-slate-600 leading-[1.8] whitespace-pre-wrap">
                        {agent.bio || "No company profile has been provided yet."}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold tracking-tighter text-slate-900">Talent <span className="text-[#b50a0a]">Roster</span></h3>
                    <p className="text-xs font-bold tracking-wide text-slate-400 mt-1">Manage linked athletes and representation status</p>
                  </div>
                  <button 
                    onClick={() => setIsAddTalentModalOpen(true)}
                    className="bg-black hover:bg-[#b50a0a] text-white px-6 py-3 rounded-2xl font-bold text-xs tracking-wide transition-all flex items-center gap-2 shadow-xl shadow-black/10"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Add Talent
                  </button>
               </div>

               {clients.length > 0 ? (
                  <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-4 md:px-8 py-5 text-xs font-bold tracking-wide text-slate-400">Athlete</th>
                          <th className="px-6 py-5 text-xs font-bold tracking-wide text-slate-400">Role</th>
                          <th className="px-6 py-5 text-xs font-bold tracking-wide text-slate-400">Country</th>
                          <th className="px-6 py-5 text-xs font-bold tracking-wide text-slate-400">Status</th>
                          <th className="px-6 py-5 text-xs font-bold tracking-wide text-slate-400">Contract</th>
                          <th className="px-4 md:px-8 py-5 text-xs font-bold tracking-wide text-slate-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clients.map((client) => (
                          <tr key={client.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors group">
                            <td className="px-4 md:px-8 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0 shadow-sm relative">
                                  {client.avatar_url ? (
                                    <Image src={client.avatar_url} alt={`${client.first_name} ${client.last_name}`} fill className="w-full h-full object-cover" />
                                  ) : (
                                    client.first_name[0]
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <Link 
                                    href={`/admin/${client.role === 'coach' ? 'coaches' : 'players'}/${client.slug}`}
                                    className="font-bold text-slate-900 text-sm leading-none mb-1 truncate block hover:text-[#b50a0a] transition-colors"
                                  >
                                    {client.first_name} {client.last_name}
                                  </Link>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-slate-600 tracking-wide bg-slate-100 px-2 py-1 rounded-md">
                                {client.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <FlagIcon country={client.country || ''} className="w-4 h-3 shadow-sm" />
                                <span className="text-xs font-bold text-slate-600 tracking-wide">{client.country || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-900">Professional</span>
                                  <span className="text-xs font-bold text-slate-400 tracking-wide mt-0.5">Active Agent</span>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-bold tracking-wide px-3 py-1 rounded-full ${client.agent_status === 'accepted' ? 'bg-green-100 text-green-600 shadow-sm shadow-green-100/50' : 'bg-amber-100 text-amber-600 shadow-sm shadow-amber-100/50'}`}>
                                {client.agent_status || 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 md:px-8 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link 
                                  href={`/admin/${client.role === 'coach' ? 'coaches' : 'players'}/${client.slug}`}
                                  className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-[#b50a0a] transition-all shadow-lg shadow-black/5"
                                  title="View Full Profile"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </Link>
                                <button 
                                  onClick={() => handleUnlinkTalent(client.id)}
                                  className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                  title="Remove from Roster"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               ) : (
                  <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Users className="w-8 h-8 text-slate-200" />
                     </div>
                     <h4 className="text-base font-bold tracking-wide text-slate-400">No athletes linked</h4>
                     <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto font-medium">Link players and coaches to manage their representation from this dashboard.</p>
                     <button 
                        onClick={() => setIsAddTalentModalOpen(true)}
                        className="mt-8 bg-black text-white px-4 md:px-8 py-3 rounded-2xl font-bold text-xs tracking-wide hover:bg-[#b50a0a] transition-all"
                     >
                        Link First Athlete
                     </button>
                  </div>
               )}
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
                       <span className={`${agent.is_subscribed ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-700'} px-4 md:px-8 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all`}>
                          {agent.is_subscribed ? 'Agency Premium' : 'Network Access'}
                       </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div>
                          <p className="text-xs font-bold text-slate-500 tracking-wide mb-3">Expiration Date</p>
                          <p className="text-4xl font-bold tracking-tighter">
                             {agent.users?.subscriptions?.[0]?.current_period_end ? (
                                <DateDisplay date={agent.users.subscriptions[0].current_period_end} />
                             ) : 'UNSET'}
                          </p>
                       </div>
                       <div className="flex flex-col justify-end items-end">
                          <p className="text-xs font-bold text-slate-500 tracking-wide mb-3">Service Level</p>
                          <p className="text-xl font-bold tracking-tighter text-right">
                             {agent.is_subscribed ? 'Active Management' : 'Restricted Access'}
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
                        {playerTransactions.map((tx, i) => (
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
                                {tx.currency === 'USD' ? '$' : tx.currency === 'NGN' ? 'â‚¦' : ''}{(tx.amount / 100).toLocaleString()}
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
      </div>

      {/* Add Talent Modal */}
      {isAddTalentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                 <div>
                    <h3 className="text-base md:text-xl font-bold tracking-tighter text-slate-900">Link New <span className="text-[#b50a0a]">Talent</span></h3>
                    <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">Search and represent athletes within your agency</p>
                 </div>
                 <button onClick={() => setIsAddTalentModalOpen(false)} className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all border border-slate-100">
                    <X className="w-4 h-4 text-slate-400" />
                 </button>
              </div>

              <div className="p-4 md:p-8 space-y-6 overflow-y-auto">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b50a0a]" />
                    <input 
                       type="text"
                       placeholder="Search athlete by name..."
                       value={talentSearchQuery}
                       onChange={(e) => handleTalentSearch(e.target.value)}
                       className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all text-slate-900 placeholder:text-slate-400"
                    />
                    {isSearchingTalent && (
                       <RefreshCcw className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b50a0a] animate-spin" />
                    )}
                 </div>

                 <div className="space-y-3">
                    {availableTalent.length > 0 ? (
                       availableTalent.map((talent) => (
                          <div 
                             key={talent.id} 
                             className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] hover:bg-white hover:border-[#b50a0a]/20 transition-all group"
                          >
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0">
                                   {talent.avatar_url ? (
                                      <img src={talent.avatar_url} alt="" className="w-full h-full object-cover" />
                                   ) : (
                                      talent.first_name[0]
                                   )}
                                </div>
                                <div className="min-w-0">
                                   <p className="text-xs font-bold text-slate-900 leading-none mb-1 truncate">{talent.first_name} {talent.last_name}</p>
                                   <div className="flex items-center gap-2">
                                      <span className="text-[7px] font-bold text-slate-400 tracking-[0.2em]">{talent.role}</span>
                                      <span className="text-[7px] font-bold text-slate-200 tracking-wide">â€¢</span>
                                      <span className="text-[7px] font-bold text-slate-400 tracking-[0.2em] flex items-center gap-1">
                                         <FlagIcon country={talent.country || ''} className="w-2 h-1.5" /> {talent.country || 'N/A'}
                                      </span>
                                   </div>
                                </div>
                             </div>
                             <button 
                                onClick={() => handleLinkTalent(talent.id)}
                                className="px-4 py-2 bg-black text-white rounded-xl font-bold text-xs tracking-wide hover:bg-[#b50a0a] transition-all shadow-lg shadow-black/5 shrink-0"
                             >
                                Link Profile
                             </button>
                          </div>
                       ))
                    ) : talentSearchQuery.length >= 2 ? (
                       <div className="text-center py-8">
                          <p className="text-xs font-bold text-slate-400 tracking-wide">No available talent found for "{talentSearchQuery}"</p>
                       </div>
                    ) : (
                       <div className="text-center py-8">
                          <p className="text-xs font-bold text-slate-400 tracking-wide">Start typing to search available athletes</p>
                       </div>
                    )}
                 </div>
              </div>

              <div className="p-4 md:p-8 pt-0 mt-auto shrink-0">
                 <p className="text-xs font-bold text-slate-400 tracking-[0.2em] text-center">Athletes already linked to an agent will not appear in search.</p>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
