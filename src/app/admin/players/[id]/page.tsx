import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PlayerProfileClient from '@/components/admin/players/PlayerProfileClient';

interface PlayerPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUUID) {
    return notFound();
  }
  
  // Fetch complete player profile with linked user data by slug
  const { data: player, error: playerError } = await supabase
    .from('profiles')
    .select('*, users!profiles_user_id_fkey(email, role, subscriptions(current_period_end, status))')
    .eq('slug', id)
    .single();

  if (playerError || !player) {
    return notFound();
  }

  // Fetch Agents for linking - Simple and reliable query
  const { data: agents, error: agentsError } = await supabase
    .from('profiles')
    .select('id, user_id, first_name, last_name, agency_name, email')
    .eq('role', 'agent');

  if (agentsError) {
    console.error('Error fetching agents:', agentsError);
  }

  // Fetch All Football Constants
  const { data: leagues } = await supabase.from('leagues').select('*, countries(name, code, flag_url)').order('name');
  const { data: clubs } = await supabase.from('clubs').select('*, leagues(name)').order('name');
  const { data: seasons } = await supabase.from('seasons').select('*').order('sort_order', { ascending: false });
  const { data: countries } = await supabase.from('countries').select('*').order('name');

  return (
    <div className="min-h-screen bg-gray-50/30">
      <PlayerProfileClient 
        player={player} 
        agents={agents || []} 
        leagues={leagues || []}
        clubs={clubs || []}
        seasons={seasons || []}
        countries={countries || []}
      />
    </div>
  );
}
