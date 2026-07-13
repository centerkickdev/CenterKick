import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ScoutsClient from './ScoutsClient';
import { isProfileComplete } from '@/lib/utils/profile';

export default async function ScoutsPage() {
   const supabase = await createClient();
   const adminSupabase = createAdminClient();
   const { data: scouts, error } = await adminSupabase
      .from('profiles')
      .select('id, slug, first_name, last_name, avatar_url, cover_url, gallery_urls, video_links, agency_name, country, status, role, users:users!profiles_user_id_fkey!inner(role, subscriptions(status))')
      .eq('users.role', 'scout')
      .order('created_at', { ascending: false });

   const filteredScouts = (scouts || []).filter(scout => {
      const userObj = scout.users as any;
      const userRole = userObj?.role;
      if (userRole === 'admin' || userRole === 'superadmin') return false;

      const isComplete = isProfileComplete(scout);
      return isComplete;
   });

   if (error) console.error('[ScoutsPage] fetch error:', error.message);

   return (
      <div className="min-h-screen bg-white">
         <Navbar />
         <main className="pt-[72px] lg:pt-[76px]">
            <div className="bg-gradient-to-br from-gray-900 to-black py-12 sm:py-20 px-4">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0 text-center sm:text-left">
                  <span className="text-white font-bold text-sm tracking-[0.3em] mb-3 block">Talent Identifiers</span>
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-4 tracking-tight">
                     Elite <span className="text-[#a20000]">Scouts</span>
                  </h1>
                  <p className="text-gray-400 text-base sm:text-base leading-relaxed max-w-lg mx-auto sm:mx-0">
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
