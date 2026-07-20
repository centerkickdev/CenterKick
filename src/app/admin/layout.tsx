import Link from 'next/link';
import { 
  Home, Shield, FileText, Activity, LogOut, LayoutDashboard, Settings, Menu, Bell, 
  Users, UserCheck, Briefcase, PenTool, ShieldCheck, CreditCard, Sliders 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/dashboard/SignOutButton';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import { headers } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname');
  const isPublicPath = pathname === '/admin/signup';

  if (isPublicPath) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        {children}
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('user_id', user.id)
    .maybeSingle();

  const adminRoles = ['superadmin', 'admin', 'blogger', 'operations', 'finance'];
  if (!userRecord || !adminRoles.includes(userRecord.role)) {
    redirect('/dashboard');
  }

  // Fetch Notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch Site Settings for Branding
  const { data: siteSettingsData } = await supabase
    .from('site_content')
    .select('content')
    .eq('page', 'settings')
    .eq('section', 'system')
    .single();

  const siteSettings = siteSettingsData?.content || {};

  const resolveUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${baseUrl}/storage/v1/object/public${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const adminLogoUrl = resolveUrl(siteSettings.adminLogoUrl || siteSettings.logoUrl);

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      {/* Admin Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-72 bg-gray-900 flex-col text-gray-300 shrink-0">
        <div className="h-20 flex items-center px-4 md:px-8 border-b border-gray-800 bg-black/20">
          <Link href="/admin" className="flex items-center gap-3">
            {adminLogoUrl ? (
               <div className="relative h-7 w-auto max-w-full flex items-center justify-start overflow-hidden">
                  <img src={adminLogoUrl} alt="Admin" className="h-full w-auto object-contain text-left" />
               </div>
            ) : (
               <>
                  <div className="w-10 h-10 rounded-xl bg-[#b50a0a] flex items-center justify-center shadow-lg shadow-red-900/40">
                     <Shield className="text-white w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-xl font-bold text-white tracking-tighter leading-none">Admin</span>
                     <span className="text-xs font-bold text-[#b50a0a] tracking-wide mt-1">Control Panel</span>
                  </div>
               </>
            )}
          </Link>
        </div>

        <AdminSidebar role={userRecord?.role || 'player'} />

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 sm:px-4 md:px-8 shadow-sm relative z-10 shrink-0">
          <div className="flex items-center gap-4">
            <AdminMobileNav role={userRecord?.role || 'player'} adminLogoUrl={adminLogoUrl} />
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <NotificationBell initialNotifications={notifications || []} />
            <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-gray-100">
               <div className="text-right hidden md:block">
                  <p className="text-xs font-bold text-gray-900">{user?.email}</p>
                  <p className="text-xs font-bold text-[#b50a0a] tracking-[0.2em]">{userRecord?.role || 'Admin'}</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-gray-900 border-2 border-gray-800 flex items-center justify-center font-bold text-white shadow-lg shrink-0 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.email?.[0]?.toUpperCase() || 'U'
                  )}
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-4 md:p-8">
           <div className="max-w-full max-w-[1400px] mx-auto animate-in fade-in duration-500">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
}
