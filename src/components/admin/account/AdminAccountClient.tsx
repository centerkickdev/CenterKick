'use client';

import { useState, useRef } from 'react';
import { 
  User, Mail, Lock, Camera, Save, CheckCircle, AlertTriangle, 
  ShieldCheck, Shield, Key, RefreshCw, Sparkles, ArrowRight
} from 'lucide-react';
import { 
  updateAdminProfile, 
  updateAdminEmail, 
  updateAdminPassword, 
  uploadAdminAvatar 
} from '@/app/admin/account/actions';
import { useRouter } from 'next/navigation';

interface AdminAccountClientProps {
  user: {
    id: string;
    email: string;
    created_at?: string;
  };
  role: string;
  profile: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  } | null;
}

export function AdminAccountClient({ user, role, profile }: AdminAccountClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'email'>('profile');

  // Form states
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & Loading
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image size must be under 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await uploadAdminAvatar(formData);
    setIsUploading(false);

    if (res.success && res.url) {
      setAvatarUrl(res.url);
      showToast('success', 'Profile picture uploaded! Click Save Profile to apply.');
    } else {
      showToast('error', res.error || 'Failed to upload image.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const res = await updateAdminProfile({
      firstName,
      lastName,
      avatarUrl,
    });
    setIsSavingProfile(false);

    if (res.success) {
      showToast('success', 'Profile information updated successfully!');
      router.refresh();
    } else {
      showToast('error', res.error || 'Failed to update profile.');
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || email === user.email) return;

    setIsSavingEmail(true);
    const res = await updateAdminEmail(email);
    setIsSavingEmail(false);

    if (res.success) {
      showToast('success', res.message || 'Confirmation email sent!');
      router.refresh();
    } else {
      showToast('error', res.error || 'Failed to update email.');
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      showToast('error', 'Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      showToast('error', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      showToast('error', 'Passwords do not match.');
      return;
    }

    setIsSavingPassword(true);
    const res = await updateAdminPassword(password);
    setIsSavingPassword(false);

    if (res.success) {
      showToast('success', res.message || 'Password updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } else {
      showToast('error', res.error || 'Failed to update password.');
    }
  };

  const displayName = `${firstName} ${lastName}`.trim() || 'Admin User';

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' 
            ? 'bg-white border-green-100 text-green-700' 
            : 'bg-white border-red-100 text-red-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <p className="text-xs font-bold tracking-wide">{toast.message}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-gray-900 via-black to-[#3a0000] rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl overflow-hidden border border-gray-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#b50a0a]/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          {/* Avatar Upload Area */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-gray-800 border-4 border-white/20 shadow-2xl relative flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-white">{displayName[0]?.toUpperCase()}</span>
              )}

              {isUploading && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#b50a0a]" />
                  <span className="text-[10px] font-bold tracking-wide">Uploading...</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 p-3 bg-[#b50a0a] hover:bg-red-700 text-white rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-95"
              title="Upload new profile picture"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Identity Info */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold tracking-widest uppercase text-red-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{role} Account</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{displayName}</h1>
            <p className="text-xs sm:text-sm font-bold text-gray-400 tracking-wide">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 border border-gray-100 rounded-2xl shadow-sm gap-2 overflow-x-auto">
        {[
          { id: 'profile', label: 'Display & Photo', icon: User },
          { id: 'security', label: 'Password & Security', icon: Lock },
          { id: 'email', label: 'Email Credentials', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-[#b50a0a] text-white shadow-lg shadow-red-950/20' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 sm:p-10">
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Personal Details</h2>
              <p className="text-xs font-bold text-gray-400 tracking-wide mt-1">Update your display name and public admin identity.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 tracking-wide ml-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a]/20 focus:border-[#b50a0a] transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 tracking-wide ml-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Morgan"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a]/20 focus:border-[#b50a0a] transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-8 py-3.5 bg-[#b50a0a] hover:bg-red-800 text-white text-xs font-bold tracking-wide rounded-xl shadow-lg shadow-red-950/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handleSavePassword} className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Security Credentials</h2>
              <p className="text-xs font-bold text-gray-400 tracking-wide mt-1">Update your password to keep your administrator account secure.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 tracking-wide ml-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a]/20 focus:border-[#b50a0a] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 tracking-wide ml-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a]/20 focus:border-[#b50a0a] transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-end">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="px-8 py-3.5 bg-gray-900 hover:bg-black text-white text-xs font-bold tracking-wide rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingPassword ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === 'email' && (
          <form onSubmit={handleSaveEmail} className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Email Address</h2>
              <p className="text-xs font-bold text-gray-400 tracking-wide mt-1">Change your admin email address. A confirmation email will be sent for security.</p>
            </div>

            <div className="space-y-2 max-w-lg">
              <label className="text-xs font-bold text-gray-700 tracking-wide ml-1">Admin Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a]/20 focus:border-[#b50a0a] transition-all"
                required
              />
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-end">
              <button
                type="submit"
                disabled={isSavingEmail || email === user.email}
                className="px-8 py-3.5 bg-gray-900 hover:bg-black text-white text-xs font-bold tracking-wide rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingEmail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                <span>Update Email</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
