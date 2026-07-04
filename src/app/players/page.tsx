import { createClient } from '@/lib/supabase/server';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PlayersClient from './PlayersClient';

export default async function PlayersPage() {
   const supabase = await createClient();
   const { data: players, error } = await supabase
      .from('profiles')
      .select('id, slug, first_name, last_name, avatar_url, position, country, status, role, users:users!profiles_user_id_fkey(role)')
      .eq('role', 'player')
      .order('created_at', { ascending: false });

   const filteredPlayers = (players || []).filter(athlete => {
      const userRole = (athlete.users as any)?.role;
      return userRole !== 'admin' && userRole !== 'superadmin';
   });

   if (error) console.error('[PlayersPage] fetch error:', error.message);

   return (
      <div className="min-h-screen bg-white">
         <Navbar />
         <main className="pt-32 sm:pt-40">
            <div className="bg-gradient-to-br from-gray-900 to-black py-12 sm:py-20 px-4">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0 text-center sm:text-left">
                  <span className="text-[#a20000] font-bold text-xs uppercase tracking-[0.3em] mb-3 block">Rising Stars</span>
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-4 uppercase tracking-tight">
                     Discover <span className="text-[#a20000]">Talent</span>
                  </h1>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto sm:mx-0">
                     Explore our database of verified rising stars. Connect with elite players across Africa and beyond.
                  </p>
               </div>
            </div>
            <PlayersClient players={filteredPlayers || []} />
         </main>
         <Footer />
      </div>
   );
}
