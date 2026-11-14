import { createAdminClient } from '@/lib/supabase/admin';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PlayersClient from './PlayersClient';
import { isProfileComplete } from '@/lib/utils/profile';
import { getGlobalCMSData } from '@/lib/cms';
import { getCachedData } from '@/lib/redis';

export const revalidate = 120;

export default async function PlayersPage() {
   const adminSupabase = createAdminClient();

   const [{ navContent, footerContent, siteSettings }, filteredPlayers] = await Promise.all([
      getGlobalCMSData(),
      getCachedData('directory_players_list_v4', async () => {
         const { data: players, error } = await adminSupabase
            .from('profiles')
            .select('id, slug, first_name, last_name, avatar_url, cover_url, gallery_urls, position, country, status, role, users:users!profiles_user_id_fkey!inner(role)')
            .eq('users.role', 'player')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(100);

         if (error) console.error('[PlayersPage] fetch error:', error.message);

         return (players || []).filter(athlete => {
            const userObj = athlete.users as any;
            const userRole = userObj?.role;
            if (['admin', 'superadmin', 'blogger', 'operations', 'finance'].includes(userRole)) return false;
            return isProfileComplete(athlete);
         });
      }, 300)
   ]);

   return (
      <div className="min-h-screen bg-white">
         <Navbar content={navContent} settings={siteSettings} />
         <main className="pt-[72px] lg:pt-[76px]">
            <div className="bg-gradient-to-br from-gray-900 to-black py-12 sm:py-20 px-4">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0 text-center sm:text-left">
                  <span className="text-white font-bold text-sm tracking-[0.3em] mb-3 block">Rising Stars</span>
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-4 tracking-tight">
                     Discover <span className="text-[#a20000]">Talents</span>
                  </h1>
                  <p className="text-gray-400 text-base sm:text-base leading-relaxed max-w-lg mx-auto sm:mx-0">
                     Explore our directory of verified rising stars. Connect with elite players across Africa and beyond.
                  </p>
               </div>
            </div>
            <PlayersClient players={filteredPlayers || []} />
         </main>
         <Footer content={footerContent} settings={siteSettings} />
      </div>
   );
}
