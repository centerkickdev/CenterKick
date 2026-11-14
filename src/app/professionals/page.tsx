import { createAdminClient } from '@/lib/supabase/admin';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ProfessionalsClient from './ProfessionalsClient';
import { isProfileComplete } from '@/lib/utils/profile';
import { getGlobalCMSData } from '@/lib/cms';
import { getCachedData } from '@/lib/redis';

export const revalidate = 120;

export const metadata = {
  title: 'Sports Professionals | CenterKick',
  description: 'Discover sports medicine doctors, analysts, referees, media staff, and other football industry professionals on CenterKick.',
};

export default async function ProfessionalsPage() {
  const adminSupabase = createAdminClient();

  const [{ navContent, footerContent, siteSettings }, filteredProfessionals] = await Promise.all([
     getGlobalCMSData(),
     getCachedData('directory_professionals_list_v3', async () => {
        const { data: professionals, error } = await adminSupabase
           .from('profiles')
           .select('id, slug, first_name, last_name, avatar_url, cover_url, profession_title, profession_category, country, status, role, users:users!profiles_user_id_fkey!inner(role)')
           .eq('users.role', 'professional')
           .eq('status', 'active')
           .order('created_at', { ascending: false })
           .limit(100);

        if (error) console.error('[ProfessionalsPage] fetch error:', error.message);

        return (professionals || []).filter(pro => {
           const userObj = pro.users as any;
           const userRole = userObj?.role;
           if (['admin', 'superadmin', 'blogger', 'operations', 'finance'].includes(userRole)) return false;
           return isProfileComplete(pro);
        });
     }, 300)
  ]);

  return (
     <div className="min-h-screen bg-white">
        <Navbar content={navContent} settings={siteSettings} />
        <main className="pt-[72px] lg:pt-[76px]">
           <div className="bg-gradient-to-br from-gray-900 to-black py-12 sm:py-20 px-4">
              <div className="max-w-[1200px] mx-auto px-4 lg:px-0 text-center sm:text-left">
                 <span className="text-white font-bold text-sm tracking-[0.3em] mb-3 block">Sports Industry Network</span>
                 <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-4 tracking-tight">
                    Sports <span className="text-[#a20000]">Professionals</span>
                 </h1>
                 <p className="text-gray-400 text-base sm:text-base leading-relaxed max-w-lg mx-auto sm:mx-0">
                    Doctors, analysts, referees, media staff, and every other role that keeps football running.
                 </p>
              </div>
           </div>
           <ProfessionalsClient professionals={filteredProfessionals || []} />
        </main>
        <Footer content={footerContent} settings={siteSettings} />
     </div>
  );
}
