import { createClient } from '@/lib/supabase/server';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import AgentsClient from './AgentsClient';

export default async function AgentsPage() {
   const supabase = await createClient();
   const { data: agents, error } = await supabase
      .from('profiles')
      .select('id, slug, first_name, last_name, avatar_url, agency_name, country, bio, status, role, users:users!profiles_user_id_fkey(role)')
      .eq('role', 'agent')
      .order('created_at', { ascending: false });

   const filteredAgents = (agents || []).filter(agent => {
      const userRole = (agent.users as any)?.role;
      return userRole !== 'admin' && userRole !== 'superadmin';
   });

   if (error) console.error('[AgentsPage] fetch error:', error.message);

   return (
      <div className="min-h-screen bg-white">
         <Navbar />
         <main className="pt-32 sm:pt-40">
            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a0000] py-12 sm:py-20 px-4">
               <div className="max-w-[1200px] mx-auto text-center sm:text-left">
                  <span className="text-[#a20000] font-black text-xs uppercase tracking-[0.4em] mb-3 block">Certified Network</span>
                  <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white leading-none mb-4 tracking-tighter uppercase">
                     Pro <span className="text-[#a20000]">Agents</span>
                  </h1>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto sm:mx-0">
                     Connect with certified football agents and agencies offering professional representation globally.
                  </p>
               </div>
            </div>
            <AgentsClient agents={filteredAgents || []} />
         </main>
         <Footer />
      </div>
   );
}
