'use client';

import { useState } from 'react';
import { DateDisplay } from '@/components/common/DateDisplay';
import { useRouter } from 'next/navigation';
import { 
  Globe, Mail, Shield, Layers, RefreshCw, 
  Save, Trash2, CheckCircle2, AlertCircle,
  Eye, EyeOff, Zap, Upload, Loader2, Database, ChevronRight, Activity, Trophy
} from 'lucide-react';
import { updateSystemSettings, clearSystemCache, uploadSiteAsset, sendTestEmail } from '@/app/admin/settings/actions';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';

function ImageUpload({ label, value, onUpload, path }: { label: string, value: string, onUpload: (url: string) => void, path: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const { showToast, hideToast } = useToast();

  const resolveUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${baseUrl}/storage/v1/object/public${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = showToast(`Uploading ${label}...`, 'loading');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      
      const { publicUrl } = await uploadSiteAsset(formData);
      onUpload(publicUrl);
      showToast(`${label} uploaded successfully`, 'success');
    } catch (error) {
      showToast(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsUploading(false);
      hideToast(toastId);
    }
  };

  const currentUrl = resolveUrl(value);

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className={`w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-3 ${isUploading ? 'opacity-50' : 'hover:border-gray-300 hover:bg-gray-100/50'}`}>
          {value ? (
            <div className="relative w-full aspect-video md:aspect-auto md:h-24 flex items-center justify-center bg-white rounded-xl overflow-hidden border border-gray-100">
               <Image src={currentUrl} alt={label} fill className="h-full object-contain p-2" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
               {isUploading ? <Loader2 className="w-6 h-6 text-black animate-spin" /> : <Upload className="w-6 h-6 text-black" />}
               <p className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">Click to upload {label.split(' ')[1]}</p>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            disabled={isUploading}
          />
        </div>
        {value && !isUploading && (
           <p className="text-[8px] font-bold text-gray-900 mt-2 truncate max-w-full px-2 italic">{value}</p>
        )}
      </div>
    </div>
  );
}

export function SettingsClient({ initialSettings }: { initialSettings: Record<string, any> }) {
  const [activeSection, setActiveSection] = useState('Global Configuration');
  const [settings, setSettings] = useState<Record<string, any>>(initialSettings || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { showToast, hideToast } = useToast();
  const router = useRouter();

  const sections = [
    { title: 'Global Configuration', label: 'Core', icon: Globe },
    { title: 'Mail & SMTP Settings', label: 'Infrastructure', icon: Mail },
    { title: 'Security & Access', label: 'System', icon: Shield },
    { title: 'Banners & Assets', label: 'Branding', icon: Layers },
    { title: 'Social Links', label: 'Marketing', icon: Layers },
  ];

  const handleSave = async () => {
    // 1. Enforce Platform Name
    if (!settings.siteTitle || settings.siteTitle.trim() === '') {
      showToast('Platform Name is required', 'error');
      return;
    }

    // 2. Enforce SMTP From Email (if present)
    if (settings.fromEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Extract email from Resend format e.g. "Name <email@domain.com>"
      const emailMatch = settings.fromEmail.match(/<(.+)>/);
      const extractedEmail = emailMatch ? emailMatch[1]?.trim() : settings.fromEmail.trim();
      
      if (!emailRegex.test(extractedEmail)) {
        showToast('Please enter a valid Sender Email address (e.g. info@domain.com)', 'error');
        return;
      }
    }

    setIsSaving(true);
    const toastId = showToast('Saving configuration...', 'loading');
    try {
      await updateSystemSettings(settings);
      showToast('System configuration updated successfully', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
      hideToast(toastId);
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    const toastId = showToast('Clearing system cache...', 'loading');
    try {
       await clearSystemCache();
       showToast('System cache cleared successfully', 'success');
    } catch (error) {
       showToast('Cache clear failed', 'error');
    } finally {
       setIsClearing(false);
       hideToast(toastId);
    }
  };

   const updateSetting = (key: string, value: unknown) => {
    setSettings((prev: Record<string, any>) => ({ ...prev, [key]: value }));
  };

  const handleResetSection = () => {
    const sectionKeys: Record<string, string[]> = {
      'Global Configuration': ['siteTitle', 'allowReg', 'publicSearch', 'maintenanceMode'],
      'Mail & SMTP Settings': ['resendKey', 'fromEmail'],
      'Security & Access': ['enable2fa', 'strictPass', 'sessionTimeout'],
      'Banners & Assets': ['logoUrl', 'faviconUrl', 'ogImage'],
      'Social Links': ['facebookUrl', 'instagramUrl', 'twitterUrl', 'youtubeUrl']
    };

    const keysToReset = sectionKeys[activeSection] || [];
    const newSettings = { ...settings };
    keysToReset.forEach(key => delete newSettings[key]);
    setSettings(newSettings);
    setShowResetConfirm(false);
    showToast(`${activeSection.split(' ')[0]} settings reset (click Save to persist)`, 'success');
  };

  const handleTestEmail = async () => {
    if (!settings.resendKey) {
       showToast('Please provide a Resend API key first', 'error');
       return;
    }
    if (!testEmail || !testEmail.includes('@')) {
       showToast('Please provide a valid test recipient email', 'error');
       return;
    }

    setIsTestingEmail(true);
    const toastId = showToast('Sending test email...', 'loading');
    try {
       await sendTestEmail(settings.resendKey, settings.fromEmail, testEmail);
       showToast(`Test email sent to ${testEmail}`, 'success');
    } catch (error) {
       showToast(error instanceof Error ? error.message : 'Test email failed', 'error');
    } finally {
       setIsTestingEmail(false);
       hideToast(toastId);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-4 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">Reset {activeSection}?</h3>
            <p className="text-[11px] text-gray-900 font-bold uppercase tracking-widest leading-relaxed mb-8 italic">
              This will only clear the variables for the <span className="text-red-500">{activeSection}</span> module. Other settings will remain untouched.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleResetSection}
                className="flex-1 bg-red-500 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-red-600 shadow-xl shadow-red-100"
              >
                Confirm Reset
              </button>
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">System Settings</h1>
          <p className="text-gray-900 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Configure global platform variables and system maintenance.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleClearCache}
            disabled={isClearing}
            className="group min-w-0 md:min-w-full max-w-[200px] bg-white border border-gray-200 text-gray-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-start gap-3 hover:bg-gray-50 hover:border-gray-100 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-orange-500 ${isClearing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            <span className="text-left leading-none">{isClearing ? 'Clearing...' : 'Clear System Cache'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:p-8">
        {/* Navigation Sidebar */}
        <div className="space-y-3">
          {sections.map((section) => (
            <button
              key={section.title}
              onClick={() => setActiveSection(section.title)}
              className={`w-full flex items-center justify-between px-6 py-5 rounded-[2rem] transition-all border-2 ${
                activeSection === section.title
                  ? 'bg-white border-gray-900 shadow-xl scale-[1.02] z-10'
                  : 'bg-transparent border-transparent hover:bg-white/50 hover:border-gray-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                   activeSection === section.title ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-400'
                }`}>
                   <section.icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${
                    activeSection === section.title ? 'text-gray-900' : 'text-gray-900'
                  }`}>
                    {section.title}
                  </p>
                  <p className="text-[8px] font-bold text-gray-900 uppercase tracking-widest opacity-60">
                    {section.label}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
            
            {activeSection === 'Global Configuration' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                   <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Platform DNA</h3>
                      <p className="text-[10px] text-gray-900 font-bold mt-1 uppercase">Core identity and accessibility rules</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:p-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Platform Name</label>
                      <input 
                        type="text" 
                        value={settings.siteTitle || 'CenterKick'}
                        onChange={(e) => updateSetting('siteTitle', e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-xs font-bold text-black focus:ring-2 focus:ring-gray-900" 
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: 'Allow User Registration', key: 'allowReg', icon: Globe },
                        { label: 'Enable Public Search', key: 'publicSearch', icon: Layers },
                        { label: 'Maintenance Mode', key: 'maintenanceMode', icon: AlertCircle, critical: true },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl group hover:bg-gray-100 transition-colors">
                           <div className="flex items-center gap-3">
                              <item.icon className={`w-4 h-4 ${settings[item.key] ? 'text-green-500' : 'text-gray-400'}`} />
                              <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">{item.label}</span>
                           </div>
                           <button 
                             onClick={() => updateSetting(item.key, !settings[item.key])}
                             className={`w-12 h-6 rounded-full p-1 transition-all ${settings[item.key] ? (item.critical ? 'bg-red-500' : 'bg-green-500') : 'bg-gray-300'}`}
                           >
                              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings[item.key] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                           </button>
                        </div>
                      ))}
                   </div>
                </div>

                 <div className="mt-10 pt-10 border-t border-gray-50 flex justify-end">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gray-900 text-white px-4 md:px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-black flex items-center gap-4 disabled:opacity-50 shadow-xl shadow-gray-100"
                    >
                      <Save className="w-4 h-4 text-[#b50a0a]" />
                      {isSaving ? 'Saving...' : 'Save Global Settings'}
                    </button>
                 </div>
              </div>
            )}

            {activeSection === 'Mail & SMTP Settings' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                   <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Email Service (Resend)</h3>
                      <p className="text-[10px] text-gray-900 font-bold mt-1 uppercase">Infrastructure for transactional emails</p>
                   </div>
                   <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 italic">
                      <Zap className="w-3 h-3" />
                      Resend API Active
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8">
                   <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Resend API Key</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          value={settings.resendKey || ''} 
                          onChange={(e) => updateSetting('resendKey', e.target.value)}
                          placeholder="re_..."
                          className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-xs font-bold text-black focus:ring-2 focus:ring-gray-900" 
                        />
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
                        >
                           {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                   </div>
                    <div className="space-y-2 col-span-2">
                       <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">From Email (Sender)</label>
                       <input 
                         type="text" 
                         value={settings.fromEmail || 'no-reply@centerkick.net'}
                         onChange={(e) => updateSetting('fromEmail', e.target.value)}
                         placeholder="Onboarding <onboarding@resend.dev>"
                         className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-xs font-bold text-black focus:ring-2 focus:ring-gray-900" 
                       />
                    </div>

                    <div className="space-y-4 col-span-2 mt-4 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                       <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-3.5 h-3.5 text-indigo-500" />
                          <h4 className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Connectivity Test</h4>
                       </div>
                       <div className="flex flex-col sm:flex-row gap-3">
                          <input 
                            type="email" 
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="Recipient email for test..."
                            className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-black focus:ring-2 focus:ring-indigo-500" 
                          />
                          <button 
                            onClick={handleTestEmail}
                            disabled={isTestingEmail}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                             {isTestingEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                             Verify Connection
                          </button>
                       </div>
                       <p className="text-[8px] text-gray-900 font-bold uppercase tracking-widest italic ml-1">
                          Sends a secure test mail to verify your Resend configuration before saving.
                       </p>
                    </div>
                 </div>

                 <div className="mt-10 pt-10 border-t border-gray-50 flex justify-end">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gray-900 text-white px-4 md:px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-black flex items-center gap-4 disabled:opacity-50 shadow-xl shadow-gray-100"
                    >
                      <Save className="w-4 h-4 text-[#b50a0a]" />
                      {isSaving ? 'Saving...' : 'Save Mail Settings'}
                    </button>
                 </div>
              </div>
            )}

            {activeSection === 'Security & Access' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                   <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Hardened Perimeter</h3>
                      <p className="text-[10px] text-gray-900 font-bold mt-1 uppercase">Advanced authentication policies</p>
                   </div>
                </div>

                <div className="space-y-6">
                   {[
                     { label: 'Enable Two-Factor (2FA)', key: 'enable2fa' },
                     { label: 'Strict Password Policy', key: 'strictPass' },
                     { label: 'Session Timeout (24h)', key: 'sessionTimeout' },
                   ].map((item) => (
                     <div key={item.key} className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem]">
                        <div className="space-y-1">
                           <span className="text-[11px] font-black text-gray-800 uppercase tracking-widest">{item.label}</span>
                           <p className="text-[8px] font-bold text-gray-900 uppercase tracking-[0.1em]">Recommended for admin roles</p>
                        </div>
                        <button 
                          onClick={() => updateSetting(item.key, !settings[item.key])}
                          className={`w-14 h-7 rounded-full p-1.5 transition-all ${settings[item.key] ? 'bg-gray-900' : 'bg-gray-200'}`}
                        >
                           <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings[item.key] ? 'translate-x-7' : 'translate-x-0'}`}></div>
                        </button>
                     </div>
                   ))}
                </div>

                 <div className="mt-10 pt-10 border-t border-gray-50 flex justify-end">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gray-900 text-white px-4 md:px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-black flex items-center gap-4 disabled:opacity-50 shadow-xl shadow-gray-100"
                    >
                      <Save className="w-4 h-4 text-[#b50a0a]" />
                      {isSaving ? 'Saving...' : 'Save Security Settings'}
                    </button>
                 </div>
              </div>
            )}

            {activeSection === 'Banners & Assets' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                   <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Brand Assets</h3>
                      <p className="text-[10px] text-gray-900 font-bold mt-1 uppercase">Global imagery and iconography</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:p-8">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8">
   <div className="space-y-6">
      <h4 className="text-[9px] font-black text-gray-900 uppercase tracking-widest px-1">Site & Footer</h4>
      <ImageUpload 
        label="Main Header Logo" 
        value={settings.logoUrl || ''} 
        onUpload={(url) => updateSetting('logoUrl', url)} 
        path="site-logo"
      />
      <ImageUpload 
        label="Footer Brand Logo" 
        value={settings.footerLogoUrl || ''} 
        onUpload={(url) => updateSetting('footerLogoUrl', url)} 
        path="footer-logo"
      />
   </div>
   <div className="space-y-6">
      <h4 className="text-[9px] font-black text-gray-900 uppercase tracking-widest px-1">Internal Portals</h4>
      <ImageUpload 
        label="Admin Sidebar Logo" 
        value={settings.adminLogoUrl || ''} 
        onUpload={(url) => updateSetting('adminLogoUrl', url)} 
        path="admin-logo"
      />
      <ImageUpload 
        label="Profiles Sidebar Logo" 
        value={settings.sidebarLogoUrl || ''} 
        onUpload={(url) => updateSetting('sidebarLogoUrl', url)} 
        path="sidebar-logo"
      />
   </div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8 pt-6">
    <ImageUpload 
      label="Favicon Asset (ICO/PNG)" 
      value={settings.faviconUrl || ''} 
      onUpload={(url) => updateSetting('faviconUrl', url)} 
      path="site-favicon"
    />
    <ImageUpload 
      label="Default OG Image (1200 x 630 px)" 
      value={settings.ogImage || ''} 
      onUpload={(url) => updateSetting('ogImage', url)} 
      path="site-og"
    />
</div>
                 </div>

                 <div className="mt-10 pt-10 border-t border-gray-50 flex justify-end">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gray-900 text-white px-4 md:px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-black flex items-center gap-4 disabled:opacity-50 shadow-xl shadow-gray-100"
                    >
                      <Save className="w-4 h-4 text-[#b50a0a]" />
                      {isSaving ? 'Saving...' : 'Save Assets Configuration'}
                    </button>
                 </div>
              </div>
            )}

            {activeSection === 'Social Links' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                   <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Social Profiles</h3>
                      <p className="text-[10px] text-gray-900 font-bold mt-1 uppercase">Manage platform social handles</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Facebook URL</label>
                     <input 
                       className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[11px] font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all text-black placeholder:text-gray-300"
                       placeholder="https://facebook.com/..."
                       value={settings.facebookUrl || '#'}
                       onChange={(e) => updateSetting('facebookUrl', e.target.value)}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Instagram URL</label>
                     <input 
                       className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[11px] font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all text-black placeholder:text-gray-300"
                       placeholder="https://instagram.com/..."
                       value={settings.instagramUrl || '#'}
                       onChange={(e) => updateSetting('instagramUrl', e.target.value)}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">X (Twitter) URL</label>
                     <input 
                       className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[11px] font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all text-black placeholder:text-gray-300"
                       placeholder="https://twitter.com/..."
                       value={settings.twitterUrl || '#'}
                       onChange={(e) => updateSetting('twitterUrl', e.target.value)}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">YouTube URL</label>
                     <input 
                       className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[11px] font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all text-black placeholder:text-gray-300"
                       placeholder="https://youtube.com/..."
                       value={settings.youtubeUrl || '#'}
                       onChange={(e) => updateSetting('youtubeUrl', e.target.value)}
                     />
                   </div>
                </div>

                 <div className="mt-10 pt-10 border-t border-gray-50 flex justify-end">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gray-900 text-white px-4 md:px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-black flex items-center gap-4 disabled:opacity-50 shadow-xl shadow-gray-100"
                    >
                      <Save className="w-4 h-4 text-[#b50a0a]" />
                      {isSaving ? 'Saving...' : 'Save Social Links'}
                    </button>
                 </div>
              </div>
            )}


            {/* Footer containing Granular Reset */}
            <div className="mt-auto pt-10 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-all hover:translate-x-1"
              >
                <Trash2 className="w-4 h-4" /> Reset {activeSection.split(' ')[0]} to Defaults
              </button>
               <div className="text-right">
                 <p className="text-[8px] font-black text-gray-900 uppercase tracking-widest italic opacity-50">
                   Last deploy: <DateDisplay date={new Date()} />
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
