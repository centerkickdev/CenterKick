import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import AgentProfileClient from '../../../../components/admin/agents/AgentProfileClient';

export default async function AgentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUUID) {
    return notFound();
  }
  
  // Fetch Agent Data by slug
  const { data: agent, error } = await supabase
    .from('profiles')
    .select(`
      *,
      users:user_id (
        email,
        role,
        subscriptions (
          current_period_end,
          status
        )
      )
    `)
    .eq('role', 'agent')
    .eq('slug', id)
    .single();

  if (error || !agent) {
    return notFound();
  }

  // Fetch Linked Talent (Players and Coaches)
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, slug, first_name, last_name, role, avatar_url, country, status, agent_id, agent_status')
    .eq('agent_id', agent.user_id)
    .order('last_name', { ascending: true });

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <AgentProfileClient 
        agent={agent} 
        initialClients={clients || []}
      />
    </div>
  );
}
