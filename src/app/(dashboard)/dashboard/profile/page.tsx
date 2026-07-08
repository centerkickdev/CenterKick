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
import { createClient } from '@/lib/supabase/client';
import { requestProfileEdit } from './actions';

export default function ProfileEditor() {
  const [activeTab, setActiveTab] = useState('Basic Info');
  const [role, setRole] = useState('player');
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{type: 'success'|'error', msg: string}|null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [portfolioMembers, setPortfolioMembers] = useState<any[]>([]);
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [googleIdentity, setGoogleIdentity] = useState<any>(null);

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
        
        const { data: { identities } } = await supabase.auth.getUserIdentities();
        const googleId = identities?.find((id: any) => id.provider === 'google');
        setGoogleIdentity(googleId || null);

        setRole(userRecord?.role || 'player');
        setProfile(profileRecord || {});
        setAchievements(profileRecord?.achievements || []);
        setVideoLinks(profileRecord?.video_links || []);
        setGalleryUrls(profileRecord?.gallery_urls || []);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus(null);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatus({ type: 'error', msg: 'You must be logged in to save changes' });
      setIsSaving(false);
      return;
    }

    const form = document.getElementById('profile-form') as HTMLFormElement;
    if (!form) {
      setStatus({ type: 'error', msg: 'Form not found' });
      setIsSaving(false);
      return;
    }
    const formData = new FormData(form);
    
    const profileData: any = {
      user_id: user.id,
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      date_of_birth: formData.get('date_of_birth') || null,
      country: formData.get('country'),
      bio: formData.get('bio'),
      contact_email: formData.get('contact_email'),
      phone_number: formData.get('phone_number'),
      // Add other role-specific fields
      position: formData.get('position'),
      foot: formData.get('foot'),
      jersey_number: formData.get('jersey_number') || null,
      height_cm: formData.get('height_cm') || null,
      weight_kg: formData.get('weight_kg') || null,
      ...( ['superadmin', 'admin', 'operations'].includes(role) ? { market_value: formData.get('market_value') } : {} ),
      formation: formData.get('formation'),
      license: formData.get('license'),
      agency_name: formData.get('agency_name'),
      license_code: formData.get('license_code'),
      id_proof_url: profile?.id_proof_url || null,
      license_proof_url: profile?.license_proof_url || null,
      social_links: {
        instagram: formData.get('social_instagram'),
        facebook: formData.get('social_facebook'),
        twitter: formData.get('social_twitter'),
        linkedin: formData.get('social_linkedin'),
      },
      achievements: achievements,
      video_links: videoLinks,
      gallery_urls: galleryUrls,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(profileData);

    if (error) {
      console.error('Save error:', error);
      setStatus({ type: 'error', msg: `Error: ${error.message}` });
    } else {
      setStatus({ type: 'success', msg: 'Profile updated successfully' });
      setProfile({ ...profile, ...profileData });
    }
    
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsSaving(true);
    setStatus({ type: 'success', msg: 'Uploading photo...' });
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const fileName = `avatar_${user?.id}_${Date.now()}.webp`;
    const { data, error } = await supabase.storage.from('site-assets').upload(`avatars/${fileName}`, file, { upsert: true });
    
    if (error) {
      setStatus({ type: 'error', msg: `Upload failed: ${error.message}` });
    } else {
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(`avatars/${fileName}`);
      setProfile({ ...profile, avatar_url: publicUrl });
      setStatus({ type: 'success', msg: 'Photo uploaded! Click Save Changes.' });
    }
    setIsSaving(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsSaving(true);
    setStatus({ type: 'success', msg: 'Uploading cover photo...' });
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const fileName = `cover_${user?.id}_${Date.now()}.webp`;
    const { data, error } = await supabase.storage.from('site-assets').upload(`covers/${fileName}`, file, { upsert: true });
    
    if (error) {
      setStatus({ type: 'error', msg: `Upload failed: ${error.message}` });
    } else {
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(`covers/${fileName}`);
      setProfile({ ...profile, cover_url: publicUrl });
      setStatus({ type: 'success', msg: 'Cover photo uploaded! Click Save Changes.' });
    }
    setIsSaving(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsSaving(true);
    setStatus({ type: 'success', msg: 'Uploading gallery images...' });
    
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
      setGalleryUrls([...galleryUrls, ...newUrls]);
      setStatus({ type: 'success', msg: 'Gallery updated! Click Save Changes.' });
    } else {
      setStatus({ type: 'error', msg: 'Failed to upload images.' });
    }
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
    setStatus({ type: 'success', msg: 'Linking member...' });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: targetProfile, error: searchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.trim())
      .single();

    if (searchError || !targetProfile) {
      setStatus({ type: 'error', msg: 'Could not find a profile with that email.' });
      setIsSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ agent_id: user?.id })
      .eq('id', targetProfile.id);

    if (updateError) {
      setStatus({ type: 'error', msg: `Failed to link: ${updateError.message}` });
    } else {
      setStatus({ type: 'success', msg: 'Member successfully linked to your portfolio!' });
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
      setStatus({ type: 'error', msg: `Failed to unlink: ${error.message}` });
    } else {
      setStatus({ type: 'success', msg: 'Member successfully unlinked.' });
      setPortfolioMembers(portfolioMembers.filter((m: any) => m.id !== memberId));
    }
    setIsSaving(false);
  };

  const isAdminOrOps = ['superadmin', 'admin', 'operations'].includes(role);

  const handleLinkGoogle = async () => {
    setIsSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/profile`
      }
    });
    if (error) {
      setStatus({ type: 'error', msg: `Failed to link: ${error.message}` });
      setIsSaving(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!googleIdentity) return;
    if (!confirm("Are you sure you want to unlink your Google account? You will need to use your password to log in.")) return;
    
    setIsSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.unlinkIdentity(googleIdentity);
    if (error) {
      setStatus({ type: 'error', msg: `Failed to unlink: ${error.message}` });
    } else {
      setStatus({ type: 'success', msg: 'Google account unlinked successfully.' });
      setGoogleIdentity(null);
    }
    setIsSaving(false);
  };

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
       setStatus({ type: 'success', msg: 'No changes detected.' });
       setEditingMember(null);
       setIsSaving(false);
       return;
    }

    const res = await requestProfileEdit(editingMember.id, changes);
    if (res.error) {
       setStatus({ type: 'error', msg: res.error });
    } else {
       setStatus({ type: 'success', msg: 'Edits submitted to Admin for approval.' });
       setEditingMember(null);
    }
    setIsSaving(false);
  };

  if (isLoading) return <div className="pt-20 text-center font-bold tracking-wide animate-pulse">Loading Editor...</div>;

  return (
    <div className="max-w-full max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tighter">My <span className="text-[#b50a0a]">Profile</span></h1>
          <p className="text-gray-900 text-xs font-bold tracking-wide mt-1">Manage your professional data & public appearance.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 md:px-8 py-3.5 bg-gray-900 text-white rounded-xl text-xs font-bold tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
        >
          {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-xl text-sm font-bold tracking-wide animate-in fade-in slide-in-from-top-2 duration-500 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {status.msg}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Editor Sidebar Tabs */}
        <aside className="lg:w-1/4">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
            {[
              { id: 'Basic Info', icon: User },
              { id: 'Career Data', icon: BarChart3 },
              { id: 'Bio & Portfolio', icon: Info },
              { id: 'Media Center', icon: Camera },
              { id: 'Social Links', icon: Globe },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-bold tracking-wide transition-all whitespace-nowrap lg:w-full ${activeTab === tab.id ? 'bg-[#b50a0a] text-white shadow-lg shadow-red-900/20' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.id}
              </button>
            ))}
          </nav>
        </aside>

        {/* Editor Main Content */}
        <div className="flex-1">
          <form id="profile-form" className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden p-4 md:p-8 md:p-12 space-y-12">
            
            {activeTab === 'Basic Info' && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex flex-col items-center justify-center md:items-start md:justify-start">
                   <input type="file" id="avatar_upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                   <div 
                      onClick={() => document.getElementById('avatar_upload')?.click()}
                      className="relative group cursor-pointer"
                   >
                      <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-900 group-hover:border-[#b50a0a] group-hover:bg-red-50 transition-all overflow-hidden">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Camera className="w-6 h-6 mb-1 group-hover:text-[#b50a0a]" />
                            <span className="text-xs font-bold tracking-wide">Photo</span>
                          </>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-900 border-4 border-white flex items-center justify-center text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                         <Plus className="w-3 h-3" />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">First Name</label>
                    <input name="first_name" type="text" defaultValue={profile?.first_name} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Last Name</label>
                    <input name="last_name" type="text" defaultValue={profile?.last_name} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                      <input name="date_of_birth" type="date" defaultValue={profile?.date_of_birth} className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Country</label>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                      <input name="country" type="text" defaultValue={profile?.country} className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black" />
                    </div>
                  </div>
                </div>

                {/* Admin Doubly-Verified Identity Proof Section */}
                <div className="p-4 md:p-8 bg-red-50/20 border border-red-100/50 rounded-3xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 tracking-wide">Official Nationality Verification</h4>
                      <p className="text-xs text-gray-500 font-bold mt-0.5">Required by Admin to prevent false citizenship reporting</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide self-start sm:self-center ${profile?.id_proof_url ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {profile?.id_proof_url ? 'Pending Verification' : 'Proof Required'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                    <input 
                      type="file" 
                      id="id_proof_file" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setProfile({ ...profile, id_proof_url: URL.createObjectURL(file) });
                          setStatus({ type: 'success', msg: 'Nationality verification document uploaded! Click Save Changes above to commit.' });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('id_proof_file')?.click()}
                      className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 hover:border-[#b50a0a] hover:text-[#b50a0a] rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm"
                    >
                      Upload Passport / ID Card
                    </button>
                    {profile?.id_proof_url && (
                      <span className="text-xs text-green-600 font-bold">âœ“ ID File Loaded & Ready</span>
                    )}
                  </div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8 pt-8 border-t border-gray-50">
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Authentication Methods</label>
                      <div className="p-5 bg-gray-50 border-none rounded-2xl flex items-center justify-between">
                         <div>
                            <p className="text-sm font-bold text-gray-900">Google Fast Login</p>
                            <p className="text-xs font-bold text-gray-500 mt-1">Sign in instantly without a password</p>
                         </div>
                         {googleIdentity ? (
                            <button type="button" onClick={handleUnlinkGoogle} className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-bold tracking-wide hover:bg-red-200 transition-colors">
                               Unlink
                            </button>
                         ) : (
                            <button type="button" onClick={handleLinkGoogle} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold tracking-wide hover:bg-black transition-colors">
                               Link Account
                            </button>
                         )}
                      </div>
                    </div>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8 pt-8 border-t border-gray-50">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Public Contact Email</label>
                    <div className="relative">
                       <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                       <input name="contact_email" type="email" defaultValue={profile?.contact_email} placeholder="public@agency.com" className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black placeholder:text-gray-900" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Public Phone</label>
                    <div className="relative">
                       <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                       <input name="phone_number" type="tel" defaultValue={profile?.phone_number} placeholder="+234..." className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black placeholder:text-gray-900" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Career Data' && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-2 h-10 bg-[#b50a0a] rounded-full"></div>
                  <div>
                    <h3 className="text-base font-bold tracking-wide text-gray-900">Professional Stats</h3>
                    <p className="text-xs font-bold text-gray-900 tracking-[0.2em] mt-0.5">Role Specific Performance Identifiers</p>
                  </div>
                </div>

                {role === 'athlete' || role === 'player' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Primary Position</label>
                      <select name="position" defaultValue={profile?.position} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-black">
                        <option value="Striker" className="text-black">Striker</option>
                        <option value="Midfielder" className="text-black">Midfielder</option>
                        <option value="Defender" className="text-black">Defender</option>
                        <option value="Goalkeeper" className="text-black">Goalkeeper</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Main Foot</label>
                      <select name="foot" defaultValue={profile?.foot} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-black">
                        <option value="Right" className="text-black">Right</option>
                        <option value="Left" className="text-black">Left</option>
                        <option value="Both" className="text-black">Both</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Jersey #</label>
                      <input name="jersey_number" type="number" defaultValue={profile?.jersey_number} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Height (cm)</label>
                      <input name="height_cm" type="number" defaultValue={profile?.height_cm} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Weight (kg)</label>
                      <input name="weight_kg" type="number" defaultValue={profile?.weight_kg} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Market Value ($)</label>
                      <input 
                        name="market_value" 
                        type="text" 
                        defaultValue={profile?.market_value} 
                        disabled={!isAdminOrOps}
                        placeholder="12,000,000" 
                        className={`w-full ${isAdminOrOps ? 'bg-gray-50' : 'bg-gray-100 cursor-not-allowed opacity-80'} border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all outline-none font-mono text-black placeholder:text-gray-500`} 
                      />
                      {!isAdminOrOps && <p className="text-xs text-[#b50a0a] mt-1 font-bold ml-1">Only administrators can update market values.</p>}
                    </div>
                  </div>
                ) : role === 'coach' ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8">
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Preferred Formation</label>
                        <select name="formation" defaultValue={profile?.formation} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-black">
                          <option value="4-3-3" className="text-black">4-3-3 Offensive</option>
                          <option value="4-4-2" className="text-black">4-4-2 Classic</option>
                          <option value="3-5-2" className="text-black">3-5-2 Wingbacks</option>
                          <option value="4-2-3-1" className="text-black">4-2-3-1 Modern</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Technical License</label>
                        <select name="license" defaultValue={profile?.license} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-black">
                          <option value="UEFA Pro" className="text-black">UEFA Pro</option>
                          <option value="UEFA A" className="text-black">UEFA A</option>
                          <option value="UEFA B" className="text-black">UEFA B</option>
                          <option value="CAF A" className="text-black">CAF A</option>
                        </select>
                      </div>
                    </div>

                    {/* Technical Coach License Verification */}
                    <div className="p-4 md:p-8 bg-red-50/20 border border-red-100/50 rounded-3xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 tracking-wide">Coaching License Verification</h4>
                          <p className="text-xs text-gray-500 font-bold mt-0.5">Required by Admin to verify technical credentials and coaching experience</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide self-start sm:self-center ${profile?.license_proof_url ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {profile?.license_proof_url ? 'Pending Verification' : 'Proof Required'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                        <input 
                          type="file" 
                          id="license_proof_file" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setProfile({ ...profile, license_proof_url: URL.createObjectURL(file) });
                              setStatus({ type: 'success', msg: 'Technical coaching license document uploaded! Click Save Changes above to commit.' });
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('license_proof_file')?.click()}
                          className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 hover:border-[#b50a0a] hover:text-[#b50a0a] rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm"
                        >
                          Upload Coaching Certificate
                        </button>
                        {profile?.license_proof_url && (
                          <span className="text-xs text-green-600 font-bold">âœ“ Certificate Loaded & Ready</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8">
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Agency Name</label>
                        <input name="agency_name" type="text" defaultValue={profile?.agency_name} placeholder="Global Talent Management" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black placeholder:text-gray-900" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">FIFA License Code</label>
                        <input name="license_code" type="text" defaultValue={profile?.license_code} placeholder="FL-XXXXXXXX" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none font-mono text-black placeholder:text-gray-900" />
                      </div>
                    </div>

                    {/* FIFA Agent License Verification */}
                    <div className="p-4 md:p-8 bg-red-50/20 border border-red-100/50 rounded-3xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 tracking-wide">FIFA Agent License Verification</h4>
                          <p className="text-xs text-gray-500 font-bold mt-0.5">Required by Admin to authorize legal player transfers and representing rights</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide self-start sm:self-center ${profile?.license_proof_url ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {profile?.license_proof_url ? 'Pending Verification' : 'Proof Required'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                        <input 
                          type="file" 
                          id="agent_proof_file" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setProfile({ ...profile, license_proof_url: URL.createObjectURL(file) });
                              setStatus({ type: 'success', msg: 'FIFA agent license document uploaded! Click Save Changes above to commit.' });
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('agent_proof_file')?.click()}
                          className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 hover:border-[#b50a0a] hover:text-[#b50a0a] rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm"
                        >
                          Upload FIFA Agent License
                        </button>
                        {profile?.license_proof_url && (
                          <span className="text-xs text-green-600 font-bold">âœ“ FIFA Document Loaded & Ready</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-8 border-t border-gray-50">
                   <h4 className="text-xs font-bold text-gray-900 tracking-wide mb-6">Social Proof & Recognition</h4>
                   <div className="space-y-4">
                      {achievements.map((item, i) => (
                        <div key={i} className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-xl hover:border-white">
                           <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                              <Award className="w-6 h-6 text-yellow-500" />
                           </div>
                           <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900 leading-none mb-1">{item.title}</p>
                              <p className="text-xs font-bold text-gray-900 tracking-wide">{item.year || 'Major Recognition'}</p>
                           </div>
                           <button 
                             type="button"
                             onClick={() => setAchievements(achievements.filter((_, idx) => idx !== i))}
                             className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={() => {
                          const title = prompt('Achievement Title:');
                          const year = prompt('Year:');
                          if (title) setAchievements([...achievements, { title, year }]);
                        }}
                        className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-xs font-bold tracking-wide text-gray-900 hover:border-[#b50a0a] hover:text-[#b50a0a] transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Achievement
                      </button>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'Bio & Portfolio' && (
               <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Professional Bio</label>
                    <textarea name="bio" rows={8} defaultValue={profile?.bio} placeholder="Describe your professional journey, skills, and ambitions..." className="w-full bg-gray-50 border-none rounded-3xl px-4 md:px-8 py-6 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none leading-relaxed text-black placeholder:text-gray-900" />
                  </div>

                  {(role === 'agent' || role === 'organization') && (
                    <div className="pt-8 border-t border-gray-50">
                       <h4 className="text-xs font-bold text-gray-900 tracking-wide mb-6">Represented Talent Portfolio</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
               </div>
            )}

            {activeTab === 'Media Center' && (
               <div className="space-y-10 animate-in fade-in duration-500">
                  {/* Cover Photo */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-gray-900 tracking-wide">Cover Photo</h4>
                    <input type="file" id="cover_upload" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                    <div 
                      onClick={() => document.getElementById('cover_upload')?.click()}
                      className="h-48 border-2 border-dashed border-gray-200 rounded-[30px] flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-[#b50a0a] transition-all cursor-pointer group relative overflow-hidden"
                    >
                       {profile?.cover_url ? (
                         <div className="absolute inset-0 w-full h-full">
                           <img src={profile.cover_url} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Camera className="w-8 h-8 text-white mb-2" />
                             <span className="text-white text-xs font-bold tracking-wide">Change Cover</span>
                           </div>
                         </div>
                       ) : (
                         <>
                           <Camera className="w-8 h-8 text-gray-400 mb-2 group-hover:text-[#b50a0a]" />
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
                    
                    <div className="space-y-4">
                       {videoLinks.map((url, i) => {
                          const ytId = extractYoutubeId(url);
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
                               <button 
                                 type="button"
                                 onClick={() => setVideoLinks(videoLinks.filter((_, idx) => idx !== i))}
                                 className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                          );
                       })}
                       <div className="flex gap-2">
                         <input 
                           id="new_video_url" 
                           type="url" 
                           placeholder="https://youtube.com/watch?v=..." 
                           className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] outline-none"
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
                    </div>
                  </div>

                  {/* Action Photos (Gallery) */}
                  <div className="space-y-6 pt-10 border-t border-gray-50">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xs font-bold text-gray-900 tracking-wide">Action Photos</h4>
                       <span className="text-xs font-bold bg-gray-900 text-white px-2 py-1 rounded">Multiple Allowed</span>
                    </div>
                    <input type="file" id="gallery_upload" multiple className="hidden" accept="image/*" onChange={handleGalleryUpload} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {galleryUrls.map((url, i) => (
                         <div key={i} className="aspect-square bg-gray-100 rounded-2xl relative group overflow-hidden border border-gray-100">
                            <img src={url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                               <button 
                                 type="button"
                                 onClick={() => setGalleryUrls(galleryUrls.filter((_, idx) => idx !== i))}
                                 className="p-2 bg-white rounded-lg text-red-500 shadow-xl transform scale-50 group-hover:scale-100 transition-transform"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         </div>
                       ))}
                       <button 
                         type="button"
                         onClick={() => document.getElementById('gallery_upload')?.click()}
                         className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-900 hover:border-[#b50a0a] hover:text-[#b50a0a] hover:bg-gray-50 transition-all"
                       >
                          <Plus className="w-6 h-6 mb-2" />
                          <span className="text-xs font-bold tracking-[0.2em]">Add Photos</span>
                       </button>
                    </div>
                  </div>
               </div>
            )}

            {activeTab === 'Social Links' && (
               <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="space-y-8">
                     {[
                        { name: 'Instagram', id: 'social_instagram', icon: Globe, placeholder: 'instagram.com/handle', value: profile?.social_links?.instagram },
                        { name: 'Facebook', id: 'social_facebook', icon: Globe, placeholder: 'facebook.com/page', value: profile?.social_links?.facebook },
                        { name: 'Twitter / X', id: 'social_twitter', icon: Globe, placeholder: 'twitter.com/profile', value: profile?.social_links?.twitter },
                        { name: 'LinkedIn', id: 'social_linkedin', icon: Globe, placeholder: 'linkedin.com/in/name', value: profile?.social_links?.linkedin },
                     ].map((social, i) => (
                       <div key={i} className="space-y-4">
                          <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">{social.name}</label>
                          <div className="relative">
                             <social.icon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                             <input 
                               name={social.id}
                               type="text" 
                               defaultValue={social.value}
                               placeholder={social.placeholder} 
                               className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black placeholder:text-gray-900" 
                             />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            )}

           </form>
        </div>
      </div>

      {/* Editing Member Modal */}
      {editingMember && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[40px] max-w-2xl w-full p-8 md:p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto">
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
                  <button type="submit" disabled={isSaving} className="w-full bg-gray-900 text-white rounded-xl py-4 font-bold tracking-wide hover:bg-black mt-8">
                     {isSaving ? 'Submitting...' : 'Submit Edits for Review'}
                  </button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
