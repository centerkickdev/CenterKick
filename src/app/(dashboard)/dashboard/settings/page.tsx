'use client';

import { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Key, Save, CheckCircle2, Link2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('Account');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [googleIdentity, setGoogleIdentity] = useState<any>(null);
  const [formData, setFormData] = useState({
    notificationsEnabled: true,
    weeklyDigest: false,
    marketingEmails: true,
    profileVisibility: 'public',
    email_reminders_enabled: true,
    profile_reminders_enabled: true,
    subscription_reminders_enabled: true,
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
          const { data: profile } = await supabase
            .from('profiles')
            .select('visibility, email_reminders_enabled, profile_reminders_enabled, subscription_reminders_enabled')
            .eq('user_id', user.id)
            .single();
          if (profile) {
            setFormData(prev => ({
              ...prev,
              profileVisibility: profile.visibility || 'public',
              email_reminders_enabled: profile.email_reminders_enabled !== false,
              profile_reminders_enabled: profile.profile_reminders_enabled !== false,
              subscription_reminders_enabled: profile.subscription_reminders_enabled !== false,
            }));
          }
          const identities = user.identities || [];
          const googleId = identities.find((id: any) => id.provider === 'google');
          setGoogleIdentity(googleId);
        }
      } catch (err) {
        console.error("Failed to load user settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleLinkGoogle = async () => {
    setIsSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`
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

  const handlePreferencesSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Update profile preferences
      await supabase.from('profiles').update({ 
        visibility: formData.profileVisibility,
        email_reminders_enabled: formData.email_reminders_enabled,
        profile_reminders_enabled: formData.profile_reminders_enabled,
        subscription_reminders_enabled: formData.subscription_reminders_enabled,
      }).eq('user_id', user.id);
      
      // Update email if changed
      if (userEmail !== user.email) {
        const { error } = await supabase.auth.updateUser({ email: userEmail });
        if (error) {
          setStatus({ type: 'error', msg: `Email update failed: ${error.message}` });
          setIsSaving(false);
          return;
        } else {
          setStatus({ type: 'success', msg: 'Preferences updated! A confirmation link has been sent to both your old and new email addresses to verify the change.' });
          setIsSaving(false);
          return;
        }
      }
    }
    
    setStatus({ type: 'success', msg: 'Preferences updated successfully!' });
    setIsSaving(false);
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
              { id: 'Connections', icon: Link2 },
              { id: 'Security', icon: Key },
              { id: 'Notifications', icon: Bell },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold tracking-wide transition-all whitespace-nowrap lg:w-full ${activeSection === section.id ? 'bg-[#b50a0a] text-white shadow-lg' : 'text-gray-900 hover:bg-gray-100'}`}
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
                <input type="text" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3 text-base font-bold text-black outline-none focus:ring-2 focus:ring-[#b50a0a]" />
              </div>

              <form onSubmit={handlePreferencesSave} className="space-y-6 pt-6 border-t border-gray-50">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Profile Visibility</label>
                  <select 
                    value={formData.profileVisibility} 
                    onChange={(e) => setFormData({...formData, profileVisibility: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3 text-base font-bold text-black appearance-none outline-none focus:ring-2 focus:ring-[#b50a0a]"
                  >
                    <option value="public">Public (Visible for general view)</option>
                    <option value="private">Private (Visible only to admin, linked agent/organization, or yourself)</option>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">New Password</label>
                  <input name="password" required type="password" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3 text-base font-bold text-black outline-none focus:ring-2 focus:ring-[#b50a0a]" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Confirm Password</label>
                  <input name="confirm_password" required type="password" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3 text-base font-bold text-black outline-none focus:ring-2 focus:ring-[#b50a0a]" />
                </div>
              </div>

              <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-4 md:px-8 py-3.5 bg-gray-900 hover:bg-black text-white text-xs font-bold tracking-wide rounded-xl transition-all shadow-md">
                {isSaving ? 'Updating...' : 'Update Password'}
              </button>

            </form>
          )}

          {activeSection === 'Connections' && (
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 md:p-8 md:p-12 space-y-8 animate-in fade-in duration-500">
              <h2 className="text-base font-bold tracking-wide text-gray-900">Connected Accounts</h2>
              
              <div className="space-y-4">
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between transition-all hover:shadow-sm">
                   <div className="flex flex-col">
                      <p className="text-sm font-bold text-gray-900 tracking-wide">Google Account</p>
                      <p className="text-xs font-bold text-gray-500 mt-1">Sign in instantly without a password</p>
                   </div>
                   <button 
                     type="button" 
                     onClick={googleIdentity ? handleUnlinkGoogle : handleLinkGoogle} 
                     disabled={isSaving}
                     className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-colors ${googleIdentity ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-gray-900 text-white hover:bg-black'}`}
                   >
                      {googleIdentity ? 'Unlink Account' : 'Link Account'}
                   </button>
                </div>
                
                {/* Future placeholders for other providers */}
                <div className="p-5 bg-gray-50/50 border border-transparent rounded-2xl flex items-center justify-between opacity-50 cursor-not-allowed">
                   <div className="flex flex-col">
                      <p className="text-sm font-bold text-gray-900 tracking-wide">Apple ID</p>
                      <p className="text-xs font-bold text-gray-500 mt-1">Coming soon</p>
                   </div>
                   <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-xl text-xs font-bold tracking-wide cursor-not-allowed">
                      Unavailable
                   </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'Notifications' && (
            <form onSubmit={handlePreferencesSave} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 md:p-8 md:p-12 space-y-8 animate-in fade-in duration-500">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900">Email & Notification Preferences</h2>
                <p className="text-xs font-bold text-gray-500 mt-1">Control which automated email updates and reminders you receive.</p>
              </div>

              <div className="space-y-4">
                {/* Master Email Reminders */}
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between transition-all hover:shadow-sm">
                  <div className="flex flex-col pr-4">
                    <p className="text-sm font-bold text-gray-900 tracking-wide">Automated Email Reminders</p>
                    <p className="text-xs font-bold text-gray-500 mt-1">Master switch to allow periodic reminder emails regarding your account</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, email_reminders_enabled: !prev.email_reminders_enabled }))}
                    className={`relative inline-flex items-center h-7 w-12 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none ${formData.email_reminders_enabled ? 'bg-emerald-600' : 'bg-[#b50a0a]'}`}
                  >
                    <span 
                      style={{
                        transform: formData.email_reminders_enabled ? 'translateX(20px)' : 'translateX(0px)',
                        transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md" 
                    />
                  </button>
                </div>

                {/* Profile Completion Reminders */}
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between transition-all hover:shadow-sm">
                  <div className="flex flex-col pr-4">
                    <p className="text-sm font-bold text-gray-900 tracking-wide">Profile Completion Reminders</p>
                    <p className="text-xs font-bold text-gray-500 mt-1">Weekly reminders on Mondays to finish your profile setup and boost scout visibility</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, profile_reminders_enabled: !prev.profile_reminders_enabled }))}
                    className={`relative inline-flex items-center h-7 w-12 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none ${formData.profile_reminders_enabled ? 'bg-emerald-600' : 'bg-[#b50a0a]'}`}
                  >
                    <span 
                      style={{
                        transform: formData.profile_reminders_enabled ? 'translateX(20px)' : 'translateX(0px)',
                        transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md" 
                    />
                  </button>
                </div>

                {/* Subscription Reminders */}
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between transition-all hover:shadow-sm">
                  <div className="flex flex-col pr-4">
                    <p className="text-sm font-bold text-gray-900 tracking-wide">Subscription & Plan Reminders</p>
                    <p className="text-xs font-bold text-gray-500 mt-1">Weekly prompts regarding subscription plans and premium membership benefits</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, subscription_reminders_enabled: !prev.subscription_reminders_enabled }))}
                    className={`relative inline-flex items-center h-7 w-12 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none ${formData.subscription_reminders_enabled ? 'bg-emerald-600' : 'bg-[#b50a0a]'}`}
                  >
                    <span 
                      style={{
                        transform: formData.subscription_reminders_enabled ? 'translateX(20px)' : 'translateX(0px)',
                        transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md" 
                    />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-3.5 bg-gray-900 hover:bg-black text-white text-xs font-bold tracking-wide rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving Preferences...' : 'Save Notification Preferences'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
