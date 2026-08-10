import { createAdminClient } from "@/lib/supabase/admin";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import TransferFocusClient from "./TransferFocusClient";
import { isProfileComplete } from "@/lib/utils/profile";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function TransferFocusPage() {
   const adminSupabase = createAdminClient();
   const transferCategoryIds = ['2978eee7-d598-4097-b11a-805a280c7b06', '82ad8313-7dad-451b-86fc-8f22e0d61703'];

   let profiles: any[] = [];
   let newsPosts: any[] = [];

   try {
      // Query adminSupabase for players and coaches
      const [profilesRes, newsRes] = await Promise.all([
         adminSupabase
            .from('profiles')
            .select('id, slug, first_name, last_name, role, position, agency_name, current_club, country, date_of_birth, avatar_url, cover_url, gallery_urls, video_links, contract_expiry, tactics, formation, license, managerial_history, users:users!profiles_user_id_fkey!inner(role)')
            .in('users.role', ['player', 'coach'])
            .order('created_at', { ascending: false }),

         adminSupabase
            .from('cms_posts')
            .select('id, slug, title, cover_image_url, published_at, created_at, category_id')
            .eq('is_draft', false)
            .in('category_id', transferCategoryIds)
            .order('published_at', { ascending: false })
            .limit(6)
      ]);

      if (profilesRes.error) {
         console.error("[TransferFocusPage] profiles fetch error:", profilesRes.error.message);
      } else {
         const rawProfiles = profilesRes.data || [];
         profiles = rawProfiles.filter((p: any) => {
            const userRole = (p.users as any)?.role || p.role;
            if (['admin', 'superadmin', 'blogger', 'operations', 'finance'].includes(userRole)) return false;
            
            // Strictly players and coaches only
            if (userRole !== 'player' && userRole !== 'coach') return false;

            return isProfileComplete(p);
         });
      }

      if (newsRes.error) {
         console.error("[TransferFocusPage] news fetch error:", newsRes.error.message);
      } else {
         newsPosts = newsRes.data || [];
      }
   } catch (error) {
      console.error("[TransferFocusPage] unexpected error:", error);
   }

   return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
         <Navbar />
         <main className="flex-grow pt-[72px] lg:pt-[76px]">
            <TransferFocusClient profiles={profiles} newsPosts={newsPosts} />
         </main>
         <Footer />
      </div>
   );
}
