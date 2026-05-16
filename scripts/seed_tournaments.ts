import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load env variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('🚀 Starting seed process...');

  // 1. Clear existing data
  await supabase.from('tournaments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 2. Lagos Premier League (League)
  console.log('⚽ Seeding Lagos Premier League...');
  const { data: league, error: leagueErr } = await supabase
    .from('tournaments')
    .insert([{
      name: 'Lagos Premier League',
      slug: 'lagos-premier-league',
      type: 'league',
      description: 'The most prestigious local league in Lagos state.',
      is_active: true,
      start_date: '2026-01-10',
      end_date: '2026-12-20'
    }])
    .select()
    .single();

  if (leagueErr) throw leagueErr;

  const leagueTeams = [
    { team_name: 'Ikeja United', points: 12, played: 5, won: 4, drawn: 0, lost: 1, goals_for: 10, goals_against: 3 },
    { team_name: 'Lekki FC', points: 10, played: 5, won: 3, drawn: 1, lost: 1, goals_for: 8, goals_against: 5 },
    { team_name: 'Surulere Warriors', points: 7, played: 5, won: 2, drawn: 1, lost: 2, goals_for: 6, goals_against: 6 },
    { team_name: 'Badagry Blazers', points: 6, played: 5, won: 2, drawn: 0, lost: 3, goals_for: 5, goals_against: 8 },
    { team_name: 'Epe Eagles', points: 4, played: 5, won: 1, drawn: 1, lost: 3, goals_for: 4, goals_against: 9 },
    { team_name: 'Ikorodu Stars', points: 3, played: 5, won: 1, drawn: 0, lost: 4, goals_for: 3, goals_against: 5 }
  ].map(t => ({ ...t, tournament_id: league.id }));

  const { data: insertedLeagueTeams, error: teamsErr } = await supabase
    .from('tournament_teams')
    .insert(leagueTeams)
    .select();

  if (teamsErr) throw teamsErr;

  // 3. Super 4 Cup (Knockout)
  console.log('🏆 Seeding Super 4 Cup...');
  const { data: cup, error: cupErr } = await supabase
    .from('tournaments')
    .insert([{
      name: 'Super 4 Cup',
      slug: 'super-4-cup',
      type: 'knockout',
      description: 'A high-stakes knockout tournament for the top 4 teams.',
      is_active: true,
      start_date: '2026-05-01',
      end_date: '2026-05-15'
    }])
    .select()
    .single();

  if (cupErr) throw cupErr;

  const cupTeams = [
    { team_name: 'Team Alpha' },
    { team_name: 'Team Beta' },
    { team_name: 'Team Gamma' },
    { team_name: 'Team Delta' }
  ].map(t => ({ ...t, tournament_id: cup.id }));

  const { data: insertedCupTeams, error: cupTeamsErr } = await supabase
    .from('tournament_teams')
    .insert(cupTeams)
    .select();

  if (cupTeamsErr) throw cupTeamsErr;

  // 4. National Championship (Hybrid)
  console.log('🌍 Seeding National Championship...');
  const { data: hybrid, error: hybridErr } = await supabase
    .from('tournaments')
    .insert([{
      name: 'National Championship',
      slug: 'national-championship',
      type: 'hybrid',
      description: 'The ultimate competition combining group stages and knockouts.',
      is_active: true,
      start_date: '2026-06-01',
      end_date: '2026-07-30'
    }])
    .select()
    .single();

  if (hybridErr) throw hybridErr;

  const hybridTeams = Array.from({ length: 8 }).map((_, i) => ({
    team_name: `Province ${i + 1}`,
    tournament_id: hybrid.id
  }));

  const { data: insertedHybridTeams, error: hybridTeamsErr } = await supabase
    .from('tournament_teams')
    .insert(hybridTeams)
    .select();

  if (hybridTeamsErr) throw hybridTeamsErr;

  // 5. Fixtures for League
  console.log('📅 Seeding Fixtures...');
  const team1 = insertedLeagueTeams[0].id;
  const team2 = insertedLeagueTeams[1].id;
  const team3 = insertedLeagueTeams[2].id;
  const team4 = insertedLeagueTeams[3].id;

  const fixtures = [
    {
      tournament_id: league.id,
      home_team_id: team1,
      away_team_id: team2,
      match_date: new Date('2026-01-10T16:00:00Z').toISOString(),
      venue: 'Ikeja Stadium',
      status: 'finished',
      home_score: 2,
      away_score: 1,
      round: 'Week 1'
    },
    {
      tournament_id: league.id,
      home_team_id: team3,
      away_team_id: team4,
      match_date: new Date('2026-01-11T16:00:00Z').toISOString(),
      venue: 'Surulere Arena',
      status: 'finished',
      home_score: 0,
      away_score: 0,
      round: 'Week 1'
    },
    {
      tournament_id: league.id,
      home_team_id: team1,
      away_team_id: team3,
      match_date: new Date('2026-04-20T16:00:00Z').toISOString(),
      venue: 'Ikeja Stadium',
      status: 'scheduled',
      round: 'Week 6'
    }
  ];

  const { data: insertedFixtures, error: fixturesErr } = await supabase
    .from('fixtures')
    .insert(fixtures)
    .select();

  if (fixturesErr) throw fixturesErr;

  // 6. Detailed Stats (Match Events) for all finished fixtures
  console.log('📊 Seeding Comprehensive Match Events...');
  
  const allFixtures = [
    ...insertedFixtures,
    // Add more fixtures for other tournaments if they exist
  ];

  const players = [
    'Ahmed Musa', 'Victor Osimhen', 'Alex Iwobi', 'Wilfred Ndidi', 'Samuel Chukwueze',
    'Kelechi Iheanacho', 'Moses Simon', 'Ola Aina', 'William Troost-Ekong', 'Kenneth Omeruo',
    'Francis Uzoho', 'Maduka Okoye', 'Joe Aribo', 'Frank Onyeka', 'Calvin Bassey',
    'Zaidu Sanusi', 'Semi Ajayi', 'Chidozie Awaziem', 'Taiwo Awoniyi', 'Terem Moffi'
  ];

  const eventTypes = [
    'goal', 'assist', 'yellow_card', 'red_card', 'penalty', 'free_kick', 
    'shot', 'chance_created', 'chance_missed', 'key_pass', 'save', 'clean_sheet'
  ];

  const allEvents = [];

  for (const fixture of insertedFixtures) {
    if (fixture.status !== 'finished') continue;

    const teams = [fixture.home_team_id, fixture.away_team_id];
    
    // Assign a GK for each team for clean sheets/saves
    const homeGK = players[Math.floor(Math.random() * players.length)];
    const awayGK = players[Math.floor(Math.random() * players.length)];

    // Add some goals
    for (let i = 0; i < fixture.home_score; i++) {
      const scorer = players[Math.floor(Math.random() * players.length)];
      allEvents.push({ 
        fixture_id: fixture.id, 
        team_id: fixture.home_team_id, 
        player_name: scorer, 
        event_type: 'goal', 
        minute: Math.floor(Math.random() * 90) + 1 
      });
      // 70% chance of an assist
      if (Math.random() > 0.3) {
        let assister = players[Math.floor(Math.random() * players.length)];
        while (assister === scorer) assister = players[Math.floor(Math.random() * players.length)];
        allEvents.push({ 
          fixture_id: fixture.id, 
          team_id: fixture.home_team_id, 
          player_name: assister, 
          event_type: 'assist', 
          minute: allEvents[allEvents.length - 1].minute 
        });
      }
    }

    for (let i = 0; i < fixture.away_score; i++) {
      const scorer = players[Math.floor(Math.random() * players.length)];
      allEvents.push({ 
        fixture_id: fixture.id, 
        team_id: fixture.away_team_id, 
        player_name: scorer, 
        event_type: 'goal', 
        minute: Math.floor(Math.random() * 90) + 1 
      });
      if (Math.random() > 0.3) {
        let assister = players[Math.floor(Math.random() * players.length)];
        while (assister === scorer) assister = players[Math.floor(Math.random() * players.length)];
        allEvents.push({ 
          fixture_id: fixture.id, 
          team_id: fixture.away_team_id, 
          player_name: assister, 
          event_type: 'assist', 
          minute: allEvents[allEvents.length - 1].minute 
        });
      }
    }

    // Add random stats for players
    for (const teamId of teams) {
      const teamPlayers = players.sort(() => 0.5 - Math.random()).slice(0, 11);
      const isGK = (p: string) => (teamId === fixture.home_team_id ? p === homeGK : p === awayGK);

      for (const player of teamPlayers) {
        // Shots
        const shots = Math.floor(Math.random() * 5);
        for (let s = 0; s < shots; s++) {
          allEvents.push({ fixture_id: fixture.id, team_id: teamId, player_name: player, event_type: 'shot', minute: Math.floor(Math.random() * 90) + 1 });
        }

        // Key Passes
        const keyPasses = Math.floor(Math.random() * 4);
        for (let k = 0; k < keyPasses; k++) {
          allEvents.push({ fixture_id: fixture.id, team_id: teamId, player_name: player, event_type: 'key_pass', minute: Math.floor(Math.random() * 90) + 1 });
        }

        // Chances Created
        const chances = Math.floor(Math.random() * 3);
        for (let c = 0; c < chances; c++) {
          allEvents.push({ fixture_id: fixture.id, team_id: teamId, player_name: player, event_type: 'chance_created', minute: Math.floor(Math.random() * 90) + 1 });
        }

        // Discipline
        if (Math.random() > 0.8) {
          allEvents.push({ fixture_id: fixture.id, team_id: teamId, player_name: player, event_type: 'yellow_card', minute: Math.floor(Math.random() * 90) + 1 });
        }

        // GK Specific
        if (isGK(player)) {
          const saves = Math.floor(Math.random() * 6) + 1;
          for (let sv = 0; sv < saves; sv++) {
            allEvents.push({ fixture_id: fixture.id, team_id: teamId, player_name: player, event_type: 'save', minute: Math.floor(Math.random() * 90) + 1 });
          }
          
          const opponentScore = teamId === fixture.home_team_id ? fixture.away_score : fixture.home_score;
          if (opponentScore === 0) {
            allEvents.push({ fixture_id: fixture.id, team_id: teamId, player_name: player, event_type: 'clean_sheet', minute: 90 });
          }
        }
      }
    }
  }

  const { error: eventsErr } = await supabase
    .from('match_events')
    .insert(allEvents);

  if (eventsErr) throw eventsErr;

  console.log('✅ Seeding completed successfully!');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
