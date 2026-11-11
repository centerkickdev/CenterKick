import { createAdminClient } from '@/lib/supabase/admin';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import AgentsClient from './AgentsClient';
import { isProfileComplete } from '@/lib/utils/profile';
import { getGlobalCMSData } from '@/app/admin/manage-ui/actions';
import { getCachedData } from '@/lib/redis';

export default async function AgentsPage() {
   const adminSupabase = createAdminClient();

   const [{ navContent, footerContent, siteSettings }, filteredAgents] = await Promise.all([
      getGlobalCMSData(),
      getCachedData('directory_agents_list_v2', async () => {
         const { data: agents, error } = await adminSupabase
            .from('profiles')
            .select('id, slug, first_name, last_name, avatar_url, cover_url, gallery_urls, video_links, agency_name, bio, country, status, role, users:users!profiles_user_id_fkey!inner(role, subscriptions(status))')
            .eq('users.role', 'agent')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

         if (error) console.error('[AgentsPage] fetch error:', error.message);

         return (agents || []).filter(agent => {
            const userObj = agent.users as any;
            const userRole = userObj?.role;
            if (['admin', 'superadmin', 'blogger', 'operations', 'finance'].includes(userRole)) return false;
            return isProfileComplete(agent);
         });
      }, 300)
   ]);

   return (
      <div className="min-h-screen bg-white">
         <Navbar content={navContent} settings={siteSettings} />
         <main className="pt-[72px] lg:pt-[76px]">
            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a0000] py-12 sm:py-20 px-4">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0 text-center sm:text-left">
                  <span className="text-white font-bold text-sm tracking-[0.4em] mb-3 block">Certified Network</span>
                  <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white leading-none mb-4 tracking-tighter">
                     Pro <span className="text-[#a20000]">Agents</span>
                  </h1>
                  <p className="text-gray-400 text-base sm:text-base leading-relaxed max-w-lg mx-auto sm:mx-0">
                     Connect with certified football agents and agencies offering professional representation globally.
                  </p>
               </div>
            </div>
            <AgentsClient agents={filteredAgents || []} />
         </main>
         <Footer content={footerContent} settings={siteSettings} />
      </div>
   );
}
