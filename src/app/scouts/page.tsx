import { createClient } from '@/lib/supabase/server';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ScoutsClient from './ScoutsClient';

export default async function ScoutsPage() {
   const supabase = await createClient();
   const { data: scouts, error } = await supabase
      .from('profiles')
      .select('id, slug, first_name, last_name, avatar_url, agency_name, country, status, role, users:users!profiles_user_id_fkey(role)')
      .eq('role', 'scout')
      .order('created_at', { ascending: false });

   const filteredScouts = (scouts || []).filter(scout => {
      const userRole = (scout.users as any)?.role;
      return userRole !== 'admin' && userRole !== 'superadmin';
   });

   if (error) console.error('[ScoutsPage] fetch error:', error.message);

   return (
      <div className="min-h-screen bg-white">
         <Navbar />
         <main className="pt-32 sm:pt-40">
            <div className="bg-gradient-to-br from-gray-900 to-black py-12 sm:py-20 px-4">
               <div className="max-w-[1200px] mx-auto text-center sm:text-left">
                  <span className="text-[#a20000] font-bold text-xs uppercase tracking-[0.3em] mb-3 block">Talent Identifiers</span>
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-4 uppercase tracking-tight">
                     Elite <span className="text-[#a20000]">Scouts</span>
                  </h1>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto sm:mx-0">
                     Connect with certified scouts covering grassroots to professional tiers worldwide.
                  </p>
               </div>
            </div>
            <ScoutsClient scouts={filteredScouts || []} />
         </main>
         <Footer />
      </div>
   );
}
