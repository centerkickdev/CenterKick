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
  Search
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ProfileEditor() {
  const [activeTab, setActiveTab] = useState('Basic Info');
  const [role, setRole] = useState('player');
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{type: 'success'|'error', msg: string}|null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);

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
      market_value: formData.get('market_value'),
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

  if (isLoading) return <div className="pt-20 text-center font-black uppercase tracking-widest animate-pulse">Loading Editor...</div>;

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">My <span className="text-[#b50a0a]">Profile</span></h1>
          <p className="text-gray-900 text-[10px] font-bold uppercase tracking-widest mt-1">Manage your professional data & public appearance.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3.5 bg-gray-900 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
        >
          {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-xl text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 duration-500 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
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
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap lg:w-full ${activeTab === tab.id ? 'bg-[#b50a0a] text-white shadow-lg shadow-red-900/20' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.id}
              </button>
            ))}
          </nav>
        </aside>

        {/* Editor Main Content */}
        <div className="flex-1">
          <form id="profile-form" className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden p-8 md:p-12 space-y-12">
            
            {activeTab === 'Basic Info' && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex flex-col items-center justify-center md:items-start md:justify-start">
                   <div className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-900 group-hover:border-[#b50a0a] group-hover:bg-red-50 transition-all overflow-hidden">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Camera className="w-6 h-6 mb-1 group-hover:text-[#b50a0a]" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Photo</span>
                          </>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-900 border-4 border-white flex items-center justify-center text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                         <Plus className="w-3 h-3" />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">First Name</label>
                    <input name="first_name" type="text" defaultValue={profile?.first_name} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Last Name</label>
                    <input name="last_name" type="text" defaultValue={profile?.last_name} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                      <input name="date_of_birth" type="date" defaultValue={profile?.date_of_birth} className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Country</label>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                      <input name="country" type="text" defaultValue={profile?.country} className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black" />
                    </div>
                  </div>
                </div>

                {/* Admin Doubly-Verified Identity Proof Section */}
                <div className="p-8 bg-red-50/20 border border-red-100/50 rounded-3xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-gray-900 tracking-widest">Official Nationality Verification</h4>
                      <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Required by Admin to prevent false citizenship reporting</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest self-start sm:self-center ${profile?.id_proof_url ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
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
                      className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 hover:border-[#b50a0a] hover:text-[#b50a0a] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                    >
                      Upload Passport / ID Card
                    </button>
                    {profile?.id_proof_url && (
                      <span className="text-[10px] text-green-600 font-bold uppercase">✓ ID File Loaded & Ready</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Public Contact Email</label>
                    <div className="relative">
                       <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                       <input name="contact_email" type="email" defaultValue={profile?.contact_email} placeholder="public@agency.com" className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black placeholder:text-gray-900" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Public Phone</label>
                    <div className="relative">
                       <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                       <input name="phone_number" type="tel" defaultValue={profile?.phone_number} placeholder="+234..." className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black placeholder:text-gray-900" />
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
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Professional Stats</h3>
                    <p className="text-[9px] font-bold text-gray-900 uppercase tracking-[0.2em] mt-0.5">Role Specific Performance Identifiers</p>
                  </div>
                </div>

                {role === 'athlete' || role === 'player' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Primary Position</label>
                      <select name="position" defaultValue={profile?.position} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-black">
                        <option value="Striker" className="text-black">Striker</option>
                        <option value="Midfielder" className="text-black">Midfielder</option>
                        <option value="Defender" className="text-black">Defender</option>
                        <option value="Goalkeeper" className="text-black">Goalkeeper</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Main Foot</label>
                      <select name="foot" defaultValue={profile?.foot} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-black">
                        <option value="Right" className="text-black">Right</option>
                        <option value="Left" className="text-black">Left</option>
                        <option value="Both" className="text-black">Both</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Jersey #</label>
                      <input name="jersey_number" type="number" defaultValue={profile?.jersey_number} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Height (cm)</label>
                      <input name="height_cm" type="number" defaultValue={profile?.height_cm} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Weight (kg)</label>
                      <input name="weight_kg" type="number" defaultValue={profile?.weight_kg} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Market Value ($)</label>
                      <input name="market_value" type="text" defaultValue={profile?.market_value} placeholder="12,000,000" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none font-mono text-black placeholder:text-gray-900" />
                    </div>
                  </div>
                ) : role === 'coach' ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Preferred Formation</label>
                        <select name="formation" defaultValue={profile?.formation} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-black">
                          <option value="4-3-3" className="text-black">4-3-3 Offensive</option>
                          <option value="4-4-2" className="text-black">4-4-2 Classic</option>
                          <option value="3-5-2" className="text-black">3-5-2 Wingbacks</option>
                          <option value="4-2-3-1" className="text-black">4-2-3-1 Modern</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Technical License</label>
                        <select name="license" defaultValue={profile?.license} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-black">
                          <option value="UEFA Pro" className="text-black">UEFA Pro</option>
                          <option value="UEFA A" className="text-black">UEFA A</option>
                          <option value="UEFA B" className="text-black">UEFA B</option>
                          <option value="CAF A" className="text-black">CAF A</option>
                        </select>
                      </div>
                    </div>

                    {/* Technical Coach License Verification */}
                    <div className="p-8 bg-red-50/20 border border-red-100/50 rounded-3xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-[10px] font-black uppercase text-gray-900 tracking-widest">Coaching License Verification</h4>
                          <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Required by Admin to verify technical credentials and coaching experience</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest self-start sm:self-center ${profile?.license_proof_url ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
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
                          className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 hover:border-[#b50a0a] hover:text-[#b50a0a] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                        >
                          Upload Coaching Certificate
                        </button>
                        {profile?.license_proof_url && (
                          <span className="text-[10px] text-green-600 font-bold uppercase">✓ Certificate Loaded & Ready</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Agency Name</label>
                        <input name="agency_name" type="text" defaultValue={profile?.agency_name} placeholder="Global Talent Management" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black placeholder:text-gray-900" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">FIFA License Code</label>
                        <input name="license_code" type="text" defaultValue={profile?.license_code} placeholder="FL-XXXXXXXX" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none font-mono text-black placeholder:text-gray-900" />
                      </div>
                    </div>

                    {/* FIFA Agent License Verification */}
                    <div className="p-8 bg-red-50/20 border border-red-100/50 rounded-3xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-[10px] font-black uppercase text-gray-900 tracking-widest">FIFA Agent License Verification</h4>
                          <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Required by Admin to authorize legal player transfers and representing rights</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest self-start sm:self-center ${profile?.license_proof_url ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
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
                          className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 hover:border-[#b50a0a] hover:text-[#b50a0a] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                        >
                          Upload FIFA Agent License
                        </button>
                        {profile?.license_proof_url && (
                          <span className="text-[10px] text-green-600 font-bold uppercase">✓ FIFA Document Loaded & Ready</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-8 border-t border-gray-50">
                   <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-6">Social Proof & Recognition</h4>
                   <div className="space-y-4">
                      {achievements.map((item, i) => (
                        <div key={i} className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-xl hover:border-white">
                           <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                              <Award className="w-6 h-6 text-yellow-500" />
                           </div>
                           <div className="flex-1">
                              <p className="text-xs font-black uppercase text-gray-900 leading-none mb-1">{item.title}</p>
                              <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">{item.year || 'Major Recognition'}</p>
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
                        className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-900 hover:border-[#b50a0a] hover:text-[#b50a0a] transition-all flex items-center justify-center gap-2"
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
                    <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Professional Bio</label>
                    <textarea name="bio" rows={8} defaultValue={profile?.bio} placeholder="Describe your professional journey, skills, and ambitions..." className="w-full bg-gray-50 border-none rounded-3xl px-8 py-6 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none leading-relaxed text-black placeholder:text-gray-900" />
                  </div>

                  {role === 'agent' && (
                    <div className="pt-8 border-t border-gray-50">
                       <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-6">Represented Talent Portfolio</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                               <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                               <div className="flex-1">
                                  <p className="text-[11px] font-black uppercase text-gray-900">Player Name {i + 1}</p>
                                  <p className="text-[9px] font-bold text-gray-900">Position • Market Value</p>
                               </div>
                               <button className="text-gray-300 hover:text-[#b50a0a]">
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                          ))}
                          <button className="p-4 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-gray-300 hover:text-[#b50a0a] transition-all">
                             <Plus className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  )}
               </div>
            )}

            {activeTab === 'Media Center' && (
               <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Video Highlights</h4>
                       <span className="text-[9px] font-bold bg-gray-900 text-white px-2 py-1 rounded">MP4 • max 50MB</span>
                    </div>
                    <div className="h-64 border-2 border-dashed border-gray-200 rounded-[40px] flex flex-col items-center justify-center text-center p-12 hover:bg-gray-50 hover:border-[#b50a0a] transition-all cursor-pointer group">
                       <div className="w-16 h-16 rounded-full bg-red-50 text-[#b50a0a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Camera className="w-8 h-8" />
                       </div>
                       <p className="text-xs font-black uppercase tracking-widest text-gray-900 mb-2">Upload Highlight Reel</p>
                       <p className="text-[10px] font-medium text-gray-900 leading-relaxed max-w-[250px]">Drag and drop your best match clips here or click to browse files.</p>
                    </div>
                  </div>

                  <div className="space-y-6 pt-10 border-t border-gray-50">
                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Action Photos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {[1, 2, 3].map((_, i) => (
                         <div key={i} className="aspect-square bg-gray-100 rounded-2xl relative group overflow-hidden">
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                               <button className="p-2 bg-white rounded-lg text-red-500 shadow-xl transform scale-50 group-hover:scale-100 transition-transform"><Trash2 className="w-4 h-4" /></button>
                            </div>
                         </div>
                       ))}
                       <button className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-900 hover:border-[#b50a0a] hover:text-[#b50a0a] transition-all">
                          <Plus className="w-6 h-6 mb-2" />
                          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Add Photo</span>
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
                          <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">{social.name}</label>
                          <div className="relative">
                             <social.icon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                             <input 
                               name={social.id}
                               type="text" 
                               defaultValue={social.value}
                               placeholder={social.placeholder} 
                               className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black placeholder:text-gray-900" 
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
    </div>
  );
}
