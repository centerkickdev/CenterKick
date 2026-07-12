import { createClient } from '@/lib/supabase/server';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PlayersClient from './PlayersClient';

export default async function PlayersPage() {
   const supabase = await createClient();
   const { data: players, error } = await supabase
      .from('profiles')
      .select('id, slug, first_name, last_name, avatar_url, cover_url, gallery_urls, video_links, position, country, status, role, users:users!profiles_user_id_fkey(role, subscriptions(status))')
      .eq('role', 'player')
      .order('created_at', { ascending: false });

   const filteredPlayers = (players || []).filter(athlete => {
      const userObj = athlete.users as any;
      const userRole = userObj?.role;
      if (['admin', 'superadmin', 'blogger', 'operations', 'finance'].includes(userRole)) return false;

      const isComplete = Boolean(
         athlete.avatar_url &&
         athlete.cover_url &&
         athlete.gallery_urls?.length >= 2 &&
         athlete.video_links?.length >= 1 &&
         athlete.first_name &&
         athlete.last_name
      );

      const isSubscribed = userObj?.subscriptions?.some((s: any) => s.status === 'active');
      return isComplete && isSubscribed;
   });

   if (error) console.error('[PlayersPage] fetch error:', error.message);

   return (
      <div className="min-h-screen bg-white">
         <Navbar />
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
         <Footer />
      </div>
   );
}
