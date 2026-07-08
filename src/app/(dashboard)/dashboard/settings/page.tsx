'use client';

import { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Key, Save, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('Account');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    notificationsEnabled: true,
    weeklyDigest: false,
    marketingEmails: true,
    profileVisibility: 'public',
  });

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus(null);

    const data = new FormData(e.currentTarget);
    const password = data.get('password') as string;
    const confirmPassword = data.get('confirm_password') as string;

    if (password !== confirmPassword) {
      setStatus({ type: 'error', msg: 'Passwords do not match.' });
      setIsSaving(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus({ type: 'error', msg: error.message });
    } else {
      setStatus({ type: 'success', msg: 'Password updated successfully!' });
      e.currentTarget.reset();
    }
    setIsSaving(false);
  };

  const handlePreferencesSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setStatus({ type: 'success', msg: 'Preferences updated successfully!' });
      setIsSaving(false);
    }, 800);
  };

  if (isLoading) return <div className="pt-20 text-center font-bold tracking-wide animate-pulse">Loading Settings...</div>;

  return (
    <div className="max-w-full max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tighter">Account <span className="text-[#b50a0a]">Settings</span></h1>
        <p className="text-gray-900 text-xs font-bold tracking-wide mt-1">Manage your credentials, security and preferences.</p>
      </div>

      {status && (
        <div className={`p-4 rounded-xl text-sm font-bold tracking-wide ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {status.msg}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-1/4">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
            {[
              { id: 'Account', icon: Settings },
              { id: 'Security', icon: Key },
              { id: 'Notifications', icon: Bell },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-bold tracking-wide transition-all whitespace-nowrap lg:w-full ${activeSection === section.id ? 'bg-[#b50a0a] text-white shadow-lg' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                <section.icon className="w-4 h-4" />
                {section.id}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          {activeSection === 'Account' && (
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 md:p-8 md:p-12 space-y-8 animate-in fade-in duration-500">
              <h2 className="text-base font-bold tracking-wide text-gray-900">Profile & Visibility</h2>
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Email Address (Registered)</label>
                <input type="text" disabled defaultValue={userEmail} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold text-gray-400 cursor-not-allowed" />
              </div>

              <form onSubmit={handlePreferencesSave} className="space-y-6 pt-6 border-t border-gray-50">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Profile Visibility</label>
                  <select 
                    value={formData.profileVisibility} 
                    onChange={(e) => setFormData({...formData, profileVisibility: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold text-black appearance-none outline-none focus:ring-2 focus:ring-[#b50a0a]"
                  >
                    <option value="public">Public (Visible to Scouts & Agents)</option>
                    <option value="private">Private (Only visible to verified partners)</option>
                  </select>
                </div>

                <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-4 md:px-8 py-3.5 bg-gray-900 hover:bg-black text-white text-xs font-bold tracking-wide rounded-xl transition-all shadow-md">
                  Save Settings
                </button>
              </form>
            </div>
          )}

          {activeSection === 'Security' && (
            <form onSubmit={handlePasswordUpdate} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 md:p-8 md:p-12 space-y-8 animate-in fade-in duration-500">
              <h2 className="text-base font-bold tracking-wide text-gray-900">Update Password</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">New Password</label>
                  <input name="password" required type="password" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold text-black outline-none focus:ring-2 focus:ring-[#b50a0a]" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Confirm Password</label>
                  <input name="confirm_password" required type="password" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold text-black outline-none focus:ring-2 focus:ring-[#b50a0a]" />
                </div>
              </div>

              <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-4 md:px-8 py-3.5 bg-gray-900 hover:bg-black text-white text-xs font-bold tracking-wide rounded-xl transition-all shadow-md">
                {isSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          {activeSection === 'Notifications' && (
            <form onSubmit={handlePreferencesSave} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 md:p-8 md:p-12 space-y-8 animate-in fade-in duration-500">
              <h2 className="text-base font-bold tracking-wide text-gray-900">Email Notifications</h2>
              <div className="space-y-6">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.notificationsEnabled} 
                    onChange={(e) => setFormData({...formData, notificationsEnabled: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-[#b50a0a] focus:ring-[#b50a0a]" 
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-wide text-gray-900">In-App Activity Notifications</span>
                    <span className="text-xs text-gray-500 font-bold mt-0.5">Receive alerts when scouting views your profile</span>
                  </div>
                </label>

                <label className="flex items-center gap-4 cursor-pointer pt-4 border-t border-gray-50">
                  <input 
                    type="checkbox" 
                    checked={formData.weeklyDigest} 
                    onChange={(e) => setFormData({...formData, weeklyDigest: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-[#b50a0a] focus:ring-[#b50a0a]" 
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-wide text-gray-900">Weekly Performance Digest</span>
                    <span className="text-xs text-gray-500 font-bold mt-0.5">Receive profile view and transfer statistics once a week</span>
                  </div>
                </label>
              </div>

              <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-4 md:px-8 py-3.5 bg-gray-900 hover:bg-black text-white text-xs font-bold tracking-wide rounded-xl transition-all shadow-md">
                Save Preferences
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
