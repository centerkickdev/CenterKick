'use client';

import { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Camera,
  Save,
  Plus,
  Trash2,
  ChevronRight,
  Info,
  Globe,
  Award,
  BarChart3,
  Search,
  Edit,
  X
} from 'lucide-react';
import { ProfileCompletenessWidget } from '@/components/dashboard/ProfileCompletenessWidget';
import { createClient } from '@/lib/supabase/client';
import { requestProfileEdit } from './actions';
import { useToast } from '@/context/ToastContext';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useRouter } from 'next/navigation';
import { invalidateProfileCache } from './actions';
import { CopyableProfileLink } from '@/components/dashboard/CopyableProfileLink';
import { CoachCareerForm } from './components/CoachCareerForm';
import { PlayerCareerForm } from './components/PlayerCareerForm';
import { AgentPortfolioForm } from './components/AgentPortfolioForm';
import { ScoutDiscoveriesForm } from './components/ScoutDiscoveriesForm';
import { OrganizationDetailsForm } from './components/OrganizationDetailsForm';


const calculateAge = (dob: string) => {
  if (!dob) return '';
  const diff_ms = Date.now() - new Date(dob).getTime();
  const age_dt = new Date(diff_ms);
  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

export default function ProfileEditor() {
  const [activeTab, setActiveTab] = useState('Basic Info');
  const [role, setRole] = useState('player');
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const { showToast } = useToast();
  const router = useRouter();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [portfolioMembers, setPortfolioMembers] = useState<any[]>([]);
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [editingMember, setEditingMember] = useState<any>(null);
  
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [roleProofFile, setRoleProofFile] = useState<File | null>(null);

  // Data tables
  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [clubsList, setClubsList] = useState<any[]>([]);
  const [leaguesList, setLeaguesList] = useState<any[]>([]);
  const [seasonsList, setSeasonsList] = useState<any[]>([]);

  // New complex states
  const [careerStats, setCareerStats] = useState<any[]>([]);
  const [transferHistory, setTransferHistory] = useState<any[]>([]);
  const [roleData, setRoleData] = useState<any>({});

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        const { data: profileRecord } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setRole(userRecord?.role || 'player');
        setProfile(profileRecord || {});
        setAchievements(profileRecord?.achievements || []);
        setVideoLinks(profileRecord?.video_links || []);
        setGalleryUrls(profileRecord?.gallery_urls || []);
        setCareerStats(profileRecord?.career_stats || []); setIsDirty(true);
        setTransferHistory(profileRecord?.transfer_history || []); setIsDirty(true);
        
        // Initialize role data
        setRoleData({
          coaching_licenses: profileRecord?.coaching_licenses || [],
          specializations: profileRecord?.specializations || [],
          languages_spoken: profileRecord?.languages_spoken || [],
          managerial_history: profileRecord?.managerial_history || [],
          current_position: profileRecord?.current_position || [],
          years_of_experience: profileRecord?.years_of_experience || '',
          physical_technical_attributes: profileRecord?.physical_technical_attributes || {},
          fa_license_number: profileRecord?.fa_license_number || '',
          agency_role: profileRecord?.agency_role || '',
          regions_of_operation: profileRecord?.regions_of_operation || [],
          client_portfolio: profileRecord?.client_portfolio || [],
          notable_transfers: profileRecord?.notable_transfers || [],
          scouting_qualifications: profileRecord?.scouting_qualifications || [],
          specialized_regions: profileRecord?.specialized_regions || [],
          scouting_methodologies: profileRecord?.scouting_methodologies || [],
          current_affiliation: profileRecord?.current_affiliation || {},
          past_discoveries: profileRecord?.past_discoveries || [],
          organization_type: profileRecord?.organization_type || '',
          year_established: profileRecord?.year_established || '',
          facilities_infrastructure: profileRecord?.facilities_infrastructure || {},
          key_personnel: profileRecord?.key_personnel || [],
          organization_honors: profileRecord?.organization_honors || [],
          official_links: profileRecord?.official_links || {},
          transfer_history: profileRecord?.transfer_history || [],
        });

        const { data: countries } = await supabase.from('countries').select('name, code').order('name');
        setCountriesList(countries || []);

        const { data: clubs } = await supabase.from('clubs').select('name, league_id').order('name');
        const { data: leagues } = await supabase.from('leagues').select('id, name').order('name');
        const { data: seasons } = await supabase.from('seasons').select('id, name').order('name');
        setSeasonsList(seasons || []);
        setLeaguesList(leagues || []);
        setClubsList(clubs || []);

        if (userRecord?.role === 'agent' || userRecord?.role === 'organization') {
          const { data: members } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, role, market_value, avatar_url, position, email, user_id')
            .eq('agent_id', user.id);
          setPortfolioMembers(members || []);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  
  const getSupabaseAndUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return { supabase, user };
  };

  const uploadVerificationProof = async (file: File, type: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('verification_proofs').upload(fileName, file, { upsert: true });
    if (error) {
      showToast(`Proof upload failed: ${error.message}`, 'error');
      return null;
    }
    return data.path;
  };

  const saveBasicInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const { supabase, user } = await getSupabaseAndUser();
    if (!user) { showToast('You must be logged in', 'error'); setIsSaving(false); return; }
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Upload files if they exist
    let idProofUrl = null;
    if (idProofFile) {
       idProofUrl = await uploadVerificationProof(idProofFile, 'id_proof');
    }
    let roleProofUrl = null;
    if (roleProofFile) {
       roleProofUrl = await uploadVerificationProof(roleProofFile, 'role_proof');
    }

    // Prepare sensitive changes for Admin
    const sensitiveChanges: any = {};
    const trackChange = (field: string, formField: string, label: string) => {
       const newVal = formData.get(formField) as string;
       if (newVal !== undefined && newVal !== null && newVal !== (profile?.[field] || '')) {
          sensitiveChanges[label] = { old: profile?.[field], new: newVal };
       }
    };
    
    trackChange('first_name', 'first_name', 'First Name');
    trackChange('last_name', 'last_name', 'Last Name');
    trackChange('date_of_birth', 'date_of_birth', 'Date of Birth');
    trackChange('id_number', 'id_number', 'ID Number');

    if (idProofUrl) {
       sensitiveChanges['Identity Verification'] = { old: null, new: 'Uploaded Document', document_url: idProofUrl };
    }
    if (roleProofUrl) {
       let certLabel = 'Certificate Verification';
       if (role === 'player') certLabel = 'Birth Certificate Verification';
       if (role === 'coach' || role === 'scout') certLabel = 'License Verification';
       if (role === 'organization') certLabel = 'FA Affiliation Verification';
       sensitiveChanges[certLabel] = { old: null, new: 'Uploaded Document', document_url: roleProofUrl };
    }

    if (Object.keys(sensitiveChanges).length > 0) {
       const res = await requestProfileEdit(profile?.id, sensitiveChanges);
       if (res.error) {
          showToast(res.error, 'error');
       } else {
          showToast('Sensitive changes and documents submitted to Admin for verification!', 'success');
       }
    }

    const profileData: any = {
      gender: formData.get('gender') || null,
      country: formData.get('country'),
      contact_email: formData.get('contact_email'),
      phone_number: formData.get('phone_number'),
      position: formData.get('position'),
      foot: formData.get('foot'),
      jersey_number: formData.get('jersey_number') || null,
      height_cm: formData.get('height_cm') || null,
      weight_kg: formData.get('weight_kg') || null,
      ...(['superadmin', 'admin', 'operations'].includes(role) ? { market_value: formData.get('market_value') } : {}),
      is_signed: formData.get('is_signed') === 'true',
      contract_expiry: formData.get('contract_expiry') || null,
      formation: formData.get('formation'),
      license: formData.get('license'),
      agency_name: formData.get('agency_name'),
      license_code: formData.get('license_code'),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('profiles').update(profileData).eq('id', profile?.id);
    if (error) {
      console.error('Save error:', error);
      showToast(`Error: ${error.message}`, 'error');
    } else {
      if (Object.keys(sensitiveChanges).length === 0) showToast('Basic Info updated successfully', 'success');
      
      const updatedProfile = { 
        ...profile, 
        ...profileData,
        ...(idProofFile ? { id_proof_url: URL.createObjectURL(idProofFile) } : {})
      };
      setProfile(updatedProfile);
      
      setIdProofFile(null);
      setRoleProofFile(null);
      setIsDirty(false);
      await invalidateProfileCache();
      router.refresh();
    }
    setIsSaving(false);
  };

  const saveCareerData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const { supabase, user } = await getSupabaseAndUser();
    if (!user) { showToast('You must be logged in', 'error'); setIsSaving(false); return; }

    const formData = new FormData(e.target as HTMLFormElement);
    const profileData: any = {
      id: profile?.id,
      user_id: user.id,
      achievements: achievements,
      league: formData.get('league') || profile?.league || null,
      current_club: formData.get('current_club') || profile?.current_club || null,
      contract_expiry: formData.get('contract_expiry') || profile?.contract_expiry || null,
      updated_at: new Date().toISOString()
    };
    
    if (role === 'coach') {
      profileData.coaching_licenses = roleData.coaching_licenses;
      profileData.specializations = roleData.specializations;
      profileData.languages_spoken = roleData.languages_spoken;
      profileData.managerial_history = roleData.managerial_history;
      profileData.current_position = roleData.current_position;
      profileData.years_of_experience = roleData.years_of_experience;
    } else if (role === 'player') {
      profileData.career_stats = careerStats;
      profileData.transfer_history = roleData.transfer_history;
      profileData.physical_technical_attributes = roleData.physical_technical_attributes;
    } else if (role === 'agent') {
      profileData.fa_license_number = roleData.fa_license_number;
      profileData.agency_role = roleData.agency_role;
      profileData.regions_of_operation = roleData.regions_of_operation;
      profileData.client_portfolio = roleData.client_portfolio;
      profileData.notable_transfers = roleData.notable_transfers;
    } else if (role === 'scout') {
      profileData.scouting_qualifications = roleData.scouting_qualifications;
      profileData.specialized_regions = roleData.specialized_regions;
      profileData.scouting_methodologies = roleData.scouting_methodologies;
      profileData.current_affiliation = roleData.current_affiliation;
      profileData.past_discoveries = roleData.past_discoveries;
    } else if (role === 'organization') {
      profileData.organization_type = roleData.organization_type;
      profileData.year_established = roleData.year_established;
      profileData.facilities_infrastructure = roleData.facilities_infrastructure;
      profileData.key_personnel = roleData.key_personnel;
      profileData.organization_honors = roleData.organization_honors;
    }

    const { error } = await supabase.from('profiles').update(profileData).eq('id', profile?.id);
    if (error) {
      console.error('Save error:', error);
      showToast(`Error: ${error.message}`, 'error');
    } else {
      showToast('Career Data updated successfully', 'success');
      setProfile({ ...profile, ...profileData });
      setIsDirty(false);
      await invalidateProfileCache();
      router.refresh();
    }
    setIsSaving(false);
  };


  const saveBioAndPortfolio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const { supabase, user } = await getSupabaseAndUser();
    if (!user) { showToast('You must be logged in', 'error'); setIsSaving(false); return; }

    const profileData: any = {
      bio: profile?.bio,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('profiles').update(profileData).eq('id', profile?.id);
    if (error) {
      console.error('Save error:', error);
      showToast(`Error: ${error.message}`, 'error');
    } else {
      showToast('Bio & Portfolio updated successfully', 'success');
      setIsDirty(false);
      await invalidateProfileCache();
      router.refresh();
    }
    setIsSaving(false);
  };

  const saveMediaCenter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const { supabase, user } = await getSupabaseAndUser();
    if (!user) { showToast('You must be logged in', 'error'); setIsSaving(false); return; }

    const profileData: any = {
      video_links: videoLinks,
      gallery_urls: galleryUrls,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('profiles').update(profileData).eq('id', profile?.id);
    if (error) {
      console.error('Save error:', error);
      showToast(`Error: ${error.message}`, 'error');
    } else {
      showToast('Media Center updated successfully', 'success');
      setIsDirty(false);
      await invalidateProfileCache();
      router.refresh();
    }
    setIsSaving(false);
  };

  const saveSocialLinks = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const { supabase, user } = await getSupabaseAndUser();
    if (!user) { showToast('You must be logged in', 'error'); setIsSaving(false); return; }

    const formData = new FormData(e.target as HTMLFormElement);
    const updatedOfficialLinks = {
      ...(roleData.official_links || {}),
      instagram: formData.get('social_instagram'),
      facebook: formData.get('social_facebook'),
      twitter: formData.get('social_twitter'),
      linkedin: formData.get('social_linkedin'),
    };

    const profileData: any = {
      id: profile?.id,
      user_id: user.id,
      official_links: updatedOfficialLinks,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('profiles').update(profileData).eq('id', profile?.id);
    if (error) {
      console.error('Save error:', error);
      showToast(`Error: ${error.message}`, 'error');
    } else {
      showToast('Official Links updated successfully', 'success');
      setProfile({ ...profile, ...profileData });
      setIsDirty(false);
      await invalidateProfileCache();
      router.refresh();
    }
    setIsSaving(false);
  };

  // Immediate save helper for media uploads
  const immediateProfileUpdate = async (updatePayload: any, successMsg: string) => {
    const { supabase, user } = await getSupabaseAndUser();
    if (!user) return;
    const { error } = await supabase.from('profiles').update(updatePayload).eq('id', profile?.id);
    if (error) {
       showToast(`Save failed: ${error.message}`, 'error');
    } else {
       showToast(successMsg, 'success');
       setProfile({ ...profile, ...updatePayload });
       await invalidateProfileCache();
      router.refresh();
    }
  };
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    showToast('Uploading photo...', 'success');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const fileName = `avatar_${user?.id}_${Date.now()}.webp`;
    const { data, error } = await supabase.storage.from('site-assets').upload(`avatars/${fileName}`, file, { upsert: true });

    if (error) {
      setStatus({ type: 'error', msg: `Upload failed: ${error.message}` });
    } else {
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(`avatars/${fileName}`);
      await immediateProfileUpdate({ avatar_url: publicUrl }, 'Profile photo updated successfully!');
    }
    setIsSaving(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    showToast('Uploading cover photo...', 'success');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const fileName = `cover_${user?.id}_${Date.now()}.webp`;
    const { data, error } = await supabase.storage.from('site-assets').upload(`covers/${fileName}`, file, { upsert: true });

    if (error) {
      setStatus({ type: 'error', msg: `Upload failed: ${error.message}` });
    } else {
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(`covers/${fileName}`);
      await immediateProfileUpdate({ cover_url: publicUrl }, 'Cover photo updated successfully!');
    }
    setIsSaving(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsSaving(true);
    showToast('Uploading gallery images...', 'success');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `gallery_${user?.id}_${Date.now()}_${i}.webp`;
      const { data, error } = await supabase.storage.from('site-assets').upload(`gallery/${fileName}`, file, { upsert: true });
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(`gallery/${fileName}`);
        newUrls.push(publicUrl);
      }
    }

    if (newUrls.length > 0) {
      const updatedGallery = [...galleryUrls, ...newUrls];
      setGalleryUrls(updatedGallery);
      await immediateProfileUpdate({ gallery_urls: updatedGallery }, 'Gallery updated automatically!');
    } else {
      showToast('Failed to upload images.', 'error');
    }
    
    e.target.value = ''; // Allow selecting the same file again
    setIsSaving(false);
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAddMember = async () => {
    const email = prompt("Enter the player or coach's exact email address to link them:");
    if (!email) return;

    setIsSaving(true);
    showToast('Linking member...', 'success');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: targetProfile, error: searchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.trim())
      .single();

    if (searchError || !targetProfile) {
      showToast('Could not find a profile with that email.', 'error');
      setIsSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ agent_id: user?.id })
      .eq('id', targetProfile.id);

    if (updateError) {
      console.error('Link member error:', updateError);
      showToast(`Failed to link: ${updateError.message}`, 'error');
    } else {
      showToast('Member successfully linked to your portfolio!', 'success');
      setPortfolioMembers([...portfolioMembers, targetProfile]);
    }
    setIsSaving(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to unlink this member from your portfolio?")) return;
    setIsSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ agent_id: null })
      .eq('id', memberId);

    if (error) {
      console.error('Unlink error:', error);
      showToast(`Failed to unlink: ${error.message}`, 'error');
    } else {
      showToast('Member successfully unlinked.', 'success');
      setPortfolioMembers(portfolioMembers.filter((m: any) => m.id !== memberId));
    }
    setIsSaving(false);
  };

  const isAdminOrOps = ['superadmin', 'admin', 'operations'].includes(role);



  const handleRequestEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setIsSaving(true);
    setStatus(null);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const changes: Record<string, { old: any; new: any }> = {};
    const fields = ['first_name', 'last_name', 'bio', 'position', 'market_value', 'height_cm', 'weight_kg', 'foot', 'jersey_number'];

    fields.forEach(f => {
      const newVal = formData.get(f);
      const oldVal = editingMember[f];
      if (newVal !== null && newVal !== undefined && String(newVal) !== String(oldVal || '')) {
        changes[f] = { old: oldVal, new: newVal };
      }
    });

    if (Object.keys(changes).length === 0) {
      showToast('No changes detected.', 'success');
      setEditingMember(null);
      setIsSaving(false);
      return;
    }

    const res = await requestProfileEdit(editingMember.id, changes);
    if (res.error) {
      showToast(res.error, 'error');
    } else {
      showToast('Edits submitted to Admin for approval.', 'success');
      setEditingMember(null);
    }
    setIsSaving(false);
  };

  if (isLoading) return <div className="pt-20 text-center font-bold tracking-wide animate-pulse">Loading Editor...</div>;

  const checks = [
    Boolean(profile?.avatar_url),
    Boolean(profile?.cover_url),
    Boolean(profile?.gallery_urls?.length >= 2),
    Boolean(profile?.video_links?.length >= 1),
    Boolean(profile?.first_name),
    Boolean(profile?.last_name)
  ];
  const isProfileComplete = checks.filter(Boolean).length === checks.length;

  return (
    <div className="max-w-full max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <ProfileCompletenessWidget 
        formData={{
          avatar_url: profile?.avatar_url,
          cover_url: profile?.cover_url,
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          gallery_urls: galleryUrls,
          video_links: videoLinks
        }} 
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tighter">My <span className="text-[#b50a0a]">Profile</span></h1>
          <p className="text-gray-900 text-xs font-bold tracking-wide mt-1">Manage your professional data & public appearance.</p>
        </div>
        {(profile?.slug || profile?.id) && (
          <CopyableProfileLink slugOrId={profile.slug || profile.id} role={role} />
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        {/* Sticky Sidebar Navigation */}
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 space-y-2">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {[
              { id: 'Basic Info', icon: User },
              { id: 'Career Data', icon: BarChart3 },
              { id: 'Bio & Portfolio', icon: Info },
              { id: 'Media Center', icon: Camera },
              { id: 'Official Links', icon: Globe },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsDirty(false); router.refresh(); }}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold tracking-wide transition-all whitespace-nowrap lg:w-full ${activeTab === tab.id ? 'bg-[#b50a0a] text-white shadow-lg shadow-red-900/20' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.id}
              </button>
            ))}
          </nav>
        </aside>

        {/* Editor Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">{activeTab}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={async () => { setIsEditing(!isEditing); if (isEditing) setIsDirty(false);
        await invalidateProfileCache();
        router.refresh(); }}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${isEditing ? 'bg-red-100 text-red-700' : 'bg-gray-900 text-white hover:bg-black'}`}
              >
                {isEditing ? 'Close Editor' : 'Edit Profile'}
              </button>
            </div>
          </div>
          <div className={`bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden p-4 md:p-8 md:p-6 space-y-8 ${!isEditing && 'opacity-90 pointer-events-none'}`} onClickCapture={(e) => { if (!isEditing) { e.preventDefault(); e.stopPropagation(); showToast('Click "Edit Profile" to make changes.', 'error'); } }}>

            {activeTab === 'Basic Info' && (
              <form onSubmit={saveBasicInfo} onChange={() => setIsDirty(true)} className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:p-2 border-b border-gray-50 pb-8 mb-4">
                  <div className="flex flex-col items-center justify-center md:items-start md:justify-start">
                    <input type="file" disabled={!isEditing} id="avatar_upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    <div
                      onClick={() => isEditing && document.getElementById('avatar_upload')?.click()}
                      className={`relative group ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className={`w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-900 overflow-hidden transition-all ${isEditing ? 'group-hover:border-[#b50a0a] group-hover:bg-red-50' : ''}`}>
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Camera className={`w-6 h-6 mb-1 ${isEditing ? 'group-hover:text-[#b50a0a]' : ''}`} />
                            <span className="text-xs font-bold tracking-wide">Photo</span>
                          </>
                        )}
                      </div>
                      {isEditing && (
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-900 border-4 border-white flex items-center justify-center text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4 w-full md:w-1/3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Contract Status</label>
                      <select disabled={!isEditing} name="is_signed" defaultValue={profile?.is_signed ? 'true' : 'false'} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-black disabled:opacity-70 disabled:bg-gray-100">
                        <option value="true">Signed Agent / Club</option>
                        <option value="false">Free Agent</option>
                      </select>
                      {profile?.is_signed && !profile?.agent_id && !profile?.organization_id && (
                        <p className="text-xs text-amber-600 font-bold ml-1 mt-1">No linked Agent or Organization.</p>
                      )}
                    </div>
                    {(profile?.agent_id || profile?.organization_id) && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Linked Organization</label>
                        <input disabled type="text" value="Linked Partner Verified" className="w-full bg-green-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-green-800 disabled:opacity-100 cursor-not-allowed" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:p-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">First Name</label>
                    <input disabled={!isEditing} name="first_name" type="text" pattern="[A-Za-z']+" title="Only letters and single quotes allowed" defaultValue={profile?.first_name} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black disabled:opacity-70 disabled:bg-gray-100" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Last Name</label>
                    <input disabled={!isEditing} name="last_name" type="text" pattern="[A-Za-z']+" title="Only letters and single quotes allowed" defaultValue={profile?.last_name} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black disabled:opacity-70 disabled:bg-gray-100" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:p-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Gender</label>
                    <select disabled={!isEditing} name="gender" defaultValue={profile?.gender} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-black disabled:opacity-70 disabled:bg-gray-100">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Date of Birth {profile?.date_of_birth && <span className="text-gray-500 font-bold ml-1">({calculateAge(profile.date_of_birth)} yrs)</span>}</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input disabled={!isEditing} name="date_of_birth" type="date" defaultValue={profile?.date_of_birth} onChange={(e) => setProfile({...profile, date_of_birth: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black disabled:opacity-70 disabled:bg-gray-100" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:p-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Country of Origin</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <select disabled={!isEditing} name="country" defaultValue={profile?.country} className="w-full bg-gray-50 border-none rounded-2xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-black disabled:opacity-70 disabled:bg-gray-100">
                        <option value="">Select Country</option>
                        {countriesList.map((c: any) => (
                          <option key={c.code} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">National ID / Passport Number</label>
                    <input disabled={!isEditing} name="id_number" type="text" defaultValue={profile?.id_number} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black disabled:opacity-70 disabled:bg-gray-100" />
                  </div>
                </div>

                <div className="p-4 md:p-8 bg-red-50/20 border border-red-100/50 rounded-3xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 tracking-wide">Official Nationality Verification</h4>
                      <p className="text-xs text-gray-500 font-bold mt-0.5">Required by Admin to prevent false citizenship reporting</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide self-start sm:self-center ${profile?.id_proof_url ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {profile?.id_proof_url ? 'Pending Verification' : 'Proof Required'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                    <input
                      disabled={!isEditing}
                      type="file"
                      id="id_proof_file"
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            showToast('File exceeds 5MB limit.', 'error');
                            return;
                          }
                          if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                            showToast('Only images or PDF files are allowed.', 'error');
                            return;
                          }
                          setIdProofFile(file);
                          setProfile({ ...profile, id_proof_url: URL.createObjectURL(file) });
                          showToast('Nationality verification document selected! Click Save Changes above to commit.', 'success');
                        }
                      }}
                    />
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => document.getElementById('id_proof_file')?.click()}
                        className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 hover:border-[#b50a0a] hover:text-[#b50a0a] rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm"
                      >
                        Upload Passport / ID Card
                      </button>
                    )}
                    {profile?.id_proof_url && (
                      <span className="text-xs text-green-600 font-bold">✓ ID File Loaded & Ready</span>
                    )}
                  </div>
                </div>

                {role !== 'agent' && (
                  <div className="p-4 md:p-8 bg-blue-50/20 border border-blue-100/50 rounded-3xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 tracking-wide">
                          {role === 'player' && 'Birth Certificate Verification'}
                          {(role === 'coach' || role === 'scout') && 'License Certificate Verification'}
                          {role === 'organization' && 'FA Affiliation Verification'}
                        </h4>
                        <p className="text-xs text-gray-500 font-bold mt-0.5">Required by Admin to verify your role credentials</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide self-start sm:self-center ${roleProofFile ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {roleProofFile ? 'Pending Verification' : 'Proof Required'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                      <input
                        disabled={!isEditing}
                        type="file"
                        id="role_proof_file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              showToast('File exceeds 5MB limit.', 'error');
                              return;
                            }
                            if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                              showToast('Only images or PDF files are allowed.', 'error');
                              return;
                            }
                            setRoleProofFile(file);
                            showToast('Role verification document selected! Click Save Changes above to commit.', 'success');
                          }
                        }}
                      />
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => document.getElementById('role_proof_file')?.click()}
                          className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 hover:border-[#b50a0a] hover:text-[#b50a0a] rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm"
                        >
                          Upload Certificate
                        </button>
                      )}
                      {roleProofFile && (
                        <span className="text-xs text-green-600 font-bold">✓ Certificate File Loaded & Ready</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:p-2 pt-8 border-t border-gray-50">
                  <div className="space-y-1.5 h-full flex flex-col justify-end">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Public Contact Email</label>
                    <p className="text-[10px] text-gray-500 font-medium ml-1">This can be your sign-up email or a dedicated public email.</p>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input disabled={!isEditing} name="contact_email" type="email" defaultValue={profile?.contact_email} placeholder="public@agency.com" className="w-full bg-gray-50 border-none rounded-2xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black placeholder:text-gray-400 disabled:opacity-70 disabled:bg-gray-100" />
                    </div>
                  </div>
                  <div className="space-y-1.5 h-full flex flex-col justify-end">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Public Phone</label>
                    <div className="relative">
                      <PhoneInput
                        disabled={!isEditing}
                        international
                        defaultCountry="US"
                        value={profile?.phone_number}
                        onChange={(v) => setProfile({ ...profile, phone_number: v })}
                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus-within:ring-2 focus-within:ring-[#b50a0a] focus-within:bg-white transition-all outline-none text-black disabled:opacity-70 disabled:bg-gray-100 phone-input-container"
                      />
                      <input type="hidden" name="phone_number" value={profile?.phone_number || ''} />
                    </div>
                  </div>
                </div>


                {(role === 'athlete' || role === 'player') && (
                  <div className="pt-8 border-t border-gray-50">
                    <h3 className="text-sm font-bold tracking-wide text-gray-900 mb-6">Physical Attributes</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Primary Position</label>
                        <select disabled={!isEditing} name="position" defaultValue={profile?.position} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-black disabled:opacity-70 disabled:bg-gray-100">
                          <option value="Striker">Striker</option>
                          <option value="Midfielder">Midfielder</option>
                          <option value="Defender">Defender</option>
                          <option value="Goalkeeper">Goalkeeper</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Main Foot</label>
                        <select disabled={!isEditing} name="foot" defaultValue={profile?.foot} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-black disabled:opacity-70 disabled:bg-gray-100">
                          <option value="Right">Right</option>
                          <option value="Left">Left</option>
                          <option value="Both">Both</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Height (cm)</label>
                        <input disabled={!isEditing} name="height_cm" type="number" defaultValue={profile?.height_cm} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black disabled:opacity-70 disabled:bg-gray-100" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Weight (kg)</label>
                        <input disabled={!isEditing} name="weight_kg" type="number" defaultValue={profile?.weight_kg} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black disabled:opacity-70 disabled:bg-gray-100" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:gap-6 mt-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Jersey #</label>
                        <input disabled={!isEditing} name="jersey_number" type="number" defaultValue={profile?.jersey_number} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black disabled:opacity-70 disabled:bg-gray-100" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Market Value ($)</label>
                        <input disabled={!(['superadmin', 'admin', 'operations'].includes(role))} name="market_value" type="text" defaultValue={profile?.market_value} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black disabled:opacity-70 disabled:bg-gray-100" />
                        {!['superadmin', 'admin', 'operations'].includes(role) && (
                          <p className="text-[10px] font-bold text-gray-400 ml-1">Only admins can update market value.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="pt-6 border-t border-gray-50 flex justify-end">
                    <button type="submit" disabled={isSaving || !isEditing || !isDirty} className="px-8 py-3 bg-[#b50a0a] text-white rounded-xl font-bold tracking-wide shadow-md hover:bg-red-800 transition-colors">
                      {isSaving ? 'Saving...' : 'Save Basic Info'}
                    </button>
                  </div>
                )}
              </form>
            )}
            {activeTab === 'Career Data' && (
              <form onSubmit={saveCareerData} onChange={() => setIsDirty(true)} className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-2 h-10 bg-[#b50a0a] rounded-full"></div>
                  <div>
                    <h3 className="text-base font-bold tracking-wide text-gray-900">Current Club</h3>
                    <p className="text-xs font-bold text-gray-500 tracking-wide mt-0.5">Where the player is currently playing</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:p-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Current League</label>
                    <select
                      disabled={!isEditing}
                      name="league"
                      value={profile?.league || ''}
                      onChange={(e) => setProfile({...profile, league: e.target.value, current_club: ''})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-black disabled:opacity-70 disabled:bg-gray-100"
                    >
                      <option value="">Select League</option>
                      {leaguesList.map((l: any) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Current Club</label>
                    <select
                      disabled={!isEditing || !profile?.league}
                      name="current_club"
                      value={profile?.current_club || ''}
                      onChange={(e) => setProfile({...profile, current_club: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-black disabled:opacity-70 disabled:bg-gray-100"
                    >
                      <option value="">Select Club</option>
                      {clubsList.filter(c => c.league_id === profile?.league).map((c: any) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5 md:p-2">
                  <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Contract Expiry Date</label>
                  <input disabled={!isEditing} name="contract_expiry" type="date" min={new Date().toISOString().split('T')[0]} defaultValue={profile?.contract_expiry} className="w-full md:w-1/2 bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black disabled:opacity-70 disabled:bg-gray-100" />
                </div>

                {/* Per-Season Statistics */}
                {(role === 'player' || role === 'athlete') && (
                  <div className="pt-8 border-t border-gray-50">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 tracking-wide">Per-Season Statistics</h4>
                        <p className="text-xs text-gray-500 font-bold mt-0.5">Player's historical apperances</p>
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => setCareerStats([...careerStats, { season: '', league: '', club: '', apps: 0, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0 }])}
                          className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Add Season
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {careerStats.map((stat, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-wrap gap-4 relative">
                          {isEditing && (
                            <button type="button" onClick={() => setCareerStats(careerStats.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full shadow hover:bg-red-200">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          <div className="flex flex-col space-y-1 flex-1 min-w-[120px]">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Season</label>
                            <select disabled={!isEditing} value={stat.season} onChange={(e) => { const newStats = [...careerStats]; newStats[i].season = e.target.value; setCareerStats(newStats); setIsDirty(true); }} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] disabled:opacity-70 disabled:bg-gray-100 outline-none"><option value="">Select Season</option>{seasonsList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select>
                          </div>
                          <div className="flex flex-col space-y-1 flex-1 min-w-[120px]">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">League</label>
                            <select disabled={!isEditing} value={stat.league} onChange={(e) => { const newStats = [...careerStats]; newStats[i].league = e.target.value; newStats[i].club = ''; setCareerStats(newStats); setIsDirty(true); }} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] disabled:opacity-70 disabled:bg-gray-100"><option value="">Select League</option>{leaguesList.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
                          </div>
                          <div className="flex flex-col space-y-1 flex-1 min-w-[120px]">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Club</label>
                            <select disabled={!isEditing || !stat.league} value={stat.club} onChange={(e) => { const newStats = [...careerStats]; newStats[i].club = e.target.value; setCareerStats(newStats); setIsDirty(true); }} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] disabled:opacity-70 disabled:bg-gray-100"><option value="">Select Club</option>{clubsList.filter(c => c.league_id === stat.league).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <div className="flex flex-col space-y-1 w-16">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Apps</label>
                              <input disabled={!isEditing} type="number" placeholder="0" value={stat.apps} onChange={(e) => { const newStats = [...careerStats]; newStats[i].apps = Number(e.target.value); setCareerStats(newStats); setIsDirty(true); }} className="w-full bg-white border border-gray-200 rounded-xl px-2 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] text-center outline-none disabled:opacity-70 disabled:bg-gray-100" />
                            </div>
                            <div className="flex flex-col space-y-1 w-16">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Gls</label>
                              <input disabled={!isEditing} type="number" placeholder="0" value={stat.goals} onChange={(e) => { const newStats = [...careerStats]; newStats[i].goals = Number(e.target.value); setCareerStats(newStats); setIsDirty(true); }} className="w-full bg-white border border-gray-200 rounded-xl px-2 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] text-center outline-none disabled:opacity-70 disabled:bg-gray-100" />
                            </div>
                            <div className="flex flex-col space-y-1 w-16">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Ast</label>
                              <input disabled={!isEditing} type="number" placeholder="0" value={stat.assists} onChange={(e) => { const newStats = [...careerStats]; newStats[i].assists = Number(e.target.value); setCareerStats(newStats); setIsDirty(true); }} className="w-full bg-white border border-gray-200 rounded-xl px-2 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] text-center outline-none disabled:opacity-70 disabled:bg-gray-100" />
                            </div>
                            <div className="flex flex-col space-y-1 w-16">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Yel</label>
                              <input disabled={!isEditing} type="number" placeholder="0" value={stat.yellow_cards} onChange={(e) => { const newStats = [...careerStats]; newStats[i].yellow_cards = Number(e.target.value); setCareerStats(newStats); setIsDirty(true); }} className="w-full bg-white border border-yellow-200 bg-yellow-50 rounded-xl px-2 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] text-center outline-none disabled:opacity-70 disabled:bg-yellow-100" />
                            </div>
                            <div className="flex flex-col space-y-1 w-16">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Red</label>
                              <input disabled={!isEditing} type="number" placeholder="0" value={stat.red_cards} onChange={(e) => { const newStats = [...careerStats]; newStats[i].red_cards = Number(e.target.value); setCareerStats(newStats); setIsDirty(true); }} className="w-full bg-white border border-red-200 bg-red-50 rounded-xl px-2 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] text-center outline-none disabled:opacity-70 disabled:bg-red-100" />
                            </div>
                          </div>
                        </div>
                      ))}
                      {careerStats.length === 0 && <div className="p-8 text-center text-xs font-bold text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">{isEditing ? 'Click "+ Add Season" above to record a new season.' : 'No statistics recorded. Click "Edit Profile" to add your career history.'}</div>}
                    </div>
                  </div>
                )}

                <div className="pt-8 border-t border-gray-50">
                   {role === 'coach' && <CoachCareerForm data={roleData} onChange={(data) => {setRoleData(data); setIsDirty(true);}} disabled={!isEditing} />}
                   {(role === 'player' || role === 'athlete') && <PlayerCareerForm data={roleData} onChange={(data) => {setRoleData(data); setIsDirty(true);}} disabled={!isEditing} />}
                   {role === 'agent' && <AgentPortfolioForm data={roleData} onChange={(data) => {setRoleData(data); setIsDirty(true);}} disabled={!isEditing} />}
                   {role === 'scout' && <ScoutDiscoveriesForm data={roleData} onChange={(data) => {setRoleData(data); setIsDirty(true);}} disabled={!isEditing} />}
                   {role === 'organization' && <OrganizationDetailsForm data={roleData} onChange={(data) => {setRoleData(data); setIsDirty(true);}} disabled={!isEditing} />}
                </div>

                {isEditing && (
                  <div className="pt-6 border-t border-gray-50 flex justify-end">
                    <button type="submit" disabled={isSaving || !isEditing || !isDirty} className="px-8 py-3 bg-[#b50a0a] text-white rounded-xl font-bold tracking-wide shadow-md hover:bg-red-800 transition-colors">
                      {isSaving ? 'Saving...' : 'Save Career Data'}
                    </button>
                  </div>
                )}
              </form>
            )}
            {activeTab === 'Bio & Portfolio' && (
              <form onSubmit={saveBioAndPortfolio} onChange={() => setIsDirty(true)} className="space-y-6 animate-in fade-in duration-500">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1 mb-2">
                    <label className="text-xs font-bold text-gray-900 tracking-wide">Professional Bio</label>
                    <span className="text-[10px] font-bold text-gray-500">{(profile?.bio || '').trim().split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <textarea name="bio" rows={8} value={profile?.bio || ''} onChange={(e) => setProfile({...profile, bio: e.target.value})} placeholder="Describe your professional journey, skills, and ambitions..." className="w-full bg-gray-50 border-none rounded-3xl px-4 md:px-8 py-6 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none leading-relaxed text-black placeholder:text-gray-900" />
                </div>

                {(role === 'agent' || role === 'organization') && (
                  <div className="pt-8 border-t border-gray-50">
                    <h4 className="text-xs font-bold text-gray-900 tracking-wide mb-6">Represented Talent Portfolio</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {portfolioMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                            {member.avatar_url && <img src={member.avatar_url} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{member.first_name} {member.last_name}</p>
                            <p className="text-xs font-bold text-gray-900 truncate">{member.position || member.role} {member.market_value ? `â€¢ $${member.market_value}` : ''}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingMember(member)}
                            className="text-gray-300 hover:text-blue-500"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-gray-300 hover:text-[#b50a0a]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddMember}
                        className="p-4 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-gray-300 hover:text-[#b50a0a] transition-all min-h-[74px]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                {isEditing && (
                  <div className="pt-6 border-t border-gray-50 flex justify-end">
                    <button type="submit" disabled={isSaving || !isEditing || !isDirty} className="px-8 py-3 bg-[#b50a0a] text-white rounded-xl font-bold tracking-wide shadow-md hover:bg-red-800 transition-colors">
                      {isSaving ? 'Saving...' : 'Save Bio & Portfolio'}
                    </button>
                  </div>
                )}
              </form>
            )}

            {activeTab === 'Media Center' && (
              <form onSubmit={saveMediaCenter} onChange={() => setIsDirty(true)} className="space-y-6 animate-in fade-in duration-500">
                {/* Cover Photo */}
                <div className="space-y-6">
                  <h4 className="text-xs font-bold text-gray-900 tracking-wide">Cover Photo</h4>
                  <input disabled={!isEditing} type="file" id="cover_upload" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                  <div
                    onClick={() => isEditing && document.getElementById('cover_upload')?.click()}
                    className={`h-48 border-2 border-dashed border-gray-200 rounded-[30px] flex flex-col items-center justify-center text-center transition-all group relative overflow-hidden ${isEditing ? 'hover:bg-gray-50 hover:border-[#b50a0a] cursor-pointer' : 'cursor-default'}`}
                  >
                    {profile?.cover_url ? (
                      <div className="absolute inset-0 w-full h-full">
                        <img src={profile.cover_url} className="w-full h-full object-cover" />
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white mb-2" />
                            <span className="text-white text-xs font-bold tracking-wide">Change Cover</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <Camera className={`w-8 h-8 text-gray-400 mb-2 ${isEditing ? 'group-hover:text-[#b50a0a]' : ''}`} />
                        <p className="text-sm font-bold tracking-wide text-gray-900 mb-2">Upload Cover Image</p>
                        <p className="text-xs font-medium text-gray-500">Ideal aspect ratio 3:1 (e.g. 1200x400)</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Embedded Videos */}
                <div className="space-y-6 pt-10 border-t border-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900 tracking-wide">Video Highlights</h4>
                    <span className="text-xs font-bold bg-gray-900 text-white px-2 py-1 rounded">YouTube / Vimeo</span>
                  </div>

                  <div className="space-y-1.5">
                    {videoLinks.map((url, i) => {
                      const ytId = url.includes('v=') ? url.split('v=')[1]?.substring(0, 11) : null;
                      return (
                        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                          {ytId ? (
                            <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} className="w-16 h-12 object-cover rounded" />
                          ) : (
                            <div className="w-16 h-12 bg-gray-200 flex items-center justify-center rounded"><Camera className="w-4 h-4 text-gray-400" /></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{url}</p>
                          </div>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => setVideoLinks(videoLinks.filter((_, idx) => idx !== i))}
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {isEditing && (
                      <div className="flex gap-2">
                        <input
                          id="new_video_url"
                          type="url"
                          placeholder="https://youtube.com/watch?v=..."
                          className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById('new_video_url') as HTMLInputElement;
                            if (el && el.value) {
                              setVideoLinks([...videoLinks, el.value]);
                              el.value = '';
                            }
                          }}
                          className="bg-gray-900 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-black transition-all whitespace-nowrap"
                        >
                          Add Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Photos (Gallery) */}
                <div className="space-y-6 pt-10 border-t border-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900 tracking-wide">Action Photos</h4>
                    <span className="text-xs font-bold bg-gray-900 text-white px-2 py-1 rounded">Multiple Allowed</span>
                  </div>
                  <input disabled={!isEditing} type="file" id="gallery_upload" multiple className="hidden" accept="image/*" onChange={handleGalleryUpload} />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryUrls.map((url, i) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded-2xl relative group overflow-hidden border border-gray-100">
                        <img src={url} className="w-full h-full object-cover" />
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => setGalleryUrls(galleryUrls.filter((_, idx) => idx !== i))}
                              className="p-2 bg-white rounded-lg text-red-500 shadow-xl transform scale-50 group-hover:scale-100 transition-transform"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                      <button
                        type="button"
                        onClick={() => document.getElementById('gallery_upload')?.click()}
                        className={`aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-900 hover:border-[#b50a0a] hover:text-[#b50a0a] hover:bg-gray-50 transition-all ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Plus className="w-6 h-6 mb-2" />
                        <span className="text-xs font-bold tracking-[0.2em]">Add Photos</span>
                      </button>
                  </div>
                </div>
                {isEditing && (
                  <div className="pt-6 border-t border-gray-50 flex justify-end">
                    <button type="submit" disabled={isSaving || !isEditing || !isDirty} className="px-8 py-3 bg-[#b50a0a] text-white rounded-xl font-bold tracking-wide shadow-md hover:bg-red-800 transition-colors">
                      {isSaving ? 'Saving...' : 'Save Media Center'}
                    </button>
                  </div>
                )}
              </form>
            )}
            {activeTab === 'Official Links' && (
              <form onSubmit={saveSocialLinks} onChange={() => setIsDirty(true)} className="space-y-6 animate-in fade-in duration-500">
                <div className="space-y-8">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                      <input
                        disabled={!isEditing}
                        type="url"
                        value={roleData?.official_links?.website || ''}
                        onChange={(e) => { setRoleData({ ...roleData, official_links: { ...roleData.official_links, website: e.target.value } }); setIsDirty(true); }}
                        placeholder="https://www.example.com"
                        className="w-full bg-gray-50 border-none rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black placeholder:text-gray-500 disabled:opacity-70 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                  {[
                    { name: 'Instagram', id: 'social_instagram', icon: Globe, placeholder: 'instagram.com/handle', value: roleData?.official_links?.instagram || profile?.social_links?.instagram },
                    { name: 'Facebook', id: 'social_facebook', icon: Globe, placeholder: 'facebook.com/page', value: roleData?.official_links?.facebook || profile?.social_links?.facebook },
                    { name: 'Twitter / X', id: 'social_twitter', icon: Globe, placeholder: 'twitter.com/profile', value: roleData?.official_links?.twitter || profile?.social_links?.twitter },
                    { name: 'LinkedIn', id: 'social_linkedin', icon: Globe, placeholder: 'linkedin.com/in/name', value: roleData?.official_links?.linkedin || profile?.social_links?.linkedin },
                  ].map((social, i) => (
                    <div key={i} className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">{social.name}</label>
                      <div className="relative">
                        <social.icon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                        <input
                          disabled={!isEditing}
                          name={social.id}
                          type="text"
                          defaultValue={social.value}
                          placeholder={social.placeholder}
                          className="w-full bg-gray-50 border-none rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black placeholder:text-gray-500 disabled:opacity-70 disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <div className="pt-6 border-t border-gray-50 flex justify-end">
                    <button type="submit" disabled={isSaving || !isEditing || !isDirty} className="px-8 py-3 bg-[#b50a0a] text-white rounded-xl font-bold tracking-wide shadow-md hover:bg-red-800 transition-colors">
                      {isSaving ? 'Saving...' : 'Save Official Links'}
                    </button>
                  </div>
                )}
              </form>
            )}


    </div>
        </div >
      </div >

    {/* Editing Member Modal */ }
  {
    editingMember && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[40px] max-w-2xl w-full p-8 md:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
          <button type="button" onClick={() => setEditingMember(null)} className="absolute top-8 right-8 text-gray-400 hover:text-black">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Profile Edits</h2>
          <p className="text-xs font-bold tracking-wide text-gray-500 mb-8">Editing {editingMember.first_name} {editingMember.last_name}. Changes will be reviewed by administrators.</p>

          <form onSubmit={handleRequestEdit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold tracking-wide ml-1">First Name</label>
                <input name="first_name" defaultValue={editingMember.first_name} className="w-full bg-gray-50 rounded-2xl px-4 py-3 font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wide ml-1">Last Name</label>
                <input name="last_name" defaultValue={editingMember.last_name} className="w-full bg-gray-50 rounded-2xl px-4 py-3 font-bold" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold tracking-wide ml-1">Bio</label>
              <textarea name="bio" defaultValue={editingMember.bio} rows={3} className="w-full bg-gray-50 rounded-2xl px-4 py-3 font-bold" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold tracking-wide ml-1">Position</label>
                <input name="position" defaultValue={editingMember.position} className="w-full bg-gray-50 rounded-2xl px-4 py-3 font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wide ml-1">Foot</label>
                <input name="foot" defaultValue={editingMember.foot} className="w-full bg-gray-50 rounded-2xl px-4 py-3 font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wide ml-1">Jersey #</label>
                <input name="jersey_number" type="number" defaultValue={editingMember.jersey_number} className="w-full bg-gray-50 rounded-2xl px-4 py-3 font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wide ml-1">Height (cm)</label>
                <input name="height_cm" type="number" defaultValue={editingMember.height_cm} className="w-full bg-gray-50 rounded-2xl px-4 py-3 font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wide ml-1">Weight (kg)</label>
                <input name="weight_kg" type="number" defaultValue={editingMember.weight_kg} className="w-full bg-gray-50 rounded-2xl px-4 py-3 font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wide ml-1">Market Value</label>
                <input name="market_value" defaultValue={editingMember.market_value} className="w-full bg-gray-50 rounded-2xl px-4 py-3 font-bold" />
              </div>
            </div>
            <button type="submit" disabled={isSaving || !isEditing || !isDirty} className="w-full bg-gray-900 text-white rounded-xl py-4 font-bold tracking-wide hover:bg-black mt-8">
              {isSaving ? 'Submitting...' : 'Submit Edits for Review'}
            </button>
          </form>
        </div>
      </div>
    )
  }
    </div >
  );
}
