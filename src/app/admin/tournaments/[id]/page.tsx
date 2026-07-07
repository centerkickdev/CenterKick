import { createClient } from '@/lib/supabase/server';
import { Trophy, Calendar, Users, List, Settings, ArrowLeft, Plus, Trash2, Edit3, Save, X, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import { 
  updateTournament, 
  deleteTournament, 
  addTeam, 
  removeTeam, 
  addFixture, 
  updateFixture, 
  deleteFixture,
  recordMatchEvent 
} from '../actions';
import { TournamentTabs } from './TournamentTabs';

export default async function TournamentManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch tournament details with teams and fixtures
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      teams:tournament_teams(*),
      fixtures:fixtures(
        *,
        home_team:tournament_teams!home_team_id(*),
        away_team:tournament_teams!away_team_id(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !tournament) {
    return notFound();
  }

  // Sort fixtures by date
  const sortedFixtures = tournament.fixtures?.sort((a: any, b: any) => 
    new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
  ) || [];

  const fixtureIds = sortedFixtures.map((f: any) => f.id);
  const { data: matchEvents } = await supabase
    .from('match_events')
    .select('*')
    .in('fixture_id', fixtureIds);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-6">
        <Link href="/admin/tournaments" className="flex items-center gap-2 text-[10px] font-black tracking-wide text-gray-400 hover:text-[#b50a0a] transition-colors w-fit">
          <ArrowLeft className="w-3 h-3" /> Back to Tournaments
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-red-50 text-[#b50a0a] text-[9px] font-black tracking-wide rounded-full border border-red-100">
                {tournament.type} Tournament
              </span>
              <span className={`px-3 py-1 text-[9px] font-black tracking-wide rounded-full border ${tournament.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                {tournament.is_active ? 'Active' : 'Archived'}
              </span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
              {tournament.name}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-4 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm">
              <Trash2 className="w-5 h-5" />
            </button>
            <button className="bg-gray-900 text-white px-4 md:px-8 py-4 rounded-2xl font-black tracking-wide text-[10px] hover:bg-[#b50a0a] transition-all shadow-xl">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area with Tabs */}
      <TournamentTabs 
        tournament={tournament} 
        fixtures={sortedFixtures} 
        teams={tournament.teams || []} 
        matchEvents={matchEvents || []}
      />
    </div>
  );
}
