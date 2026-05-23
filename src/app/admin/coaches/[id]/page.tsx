import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CoachProfileClient from '@/components/admin/coaches/CoachProfileClient';

export default async function CoachProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUUID) {
    return notFound();
  }

  // Fetch Coach Data from profiles by slug
  const { data: coach, error } = await supabase
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
    .eq('slug', id)
    .single();

  if (error || !coach) {
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
    <div className="min-h-screen bg-[#fcfcfc]">
      <CoachProfileClient 
        coach={coach} 
        agents={agents || []} 
        leagues={leagues || []}
        clubs={clubs || []}
        seasons={seasons || []}
        countries={countries || []}
      />
    </div>
  );
}
