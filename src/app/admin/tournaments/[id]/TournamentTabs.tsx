'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Users, 
  Calendar, 
  BarChart3, 
  Plus, 
  Trash2, 
  Settings, 
  Save, 
  X, 
  Edit2, 
  CheckCircle2, 
  ChevronRight,
  MoreVertical,
  Flag,
  MapPin,
  Activity,
  Search,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { updateTournament, addTeam, removeTeam, addFixture, updateFixture, deleteFixture, getTeamRoster } from '../actions';
import { LiveMatchModal } from './LiveMatchModal';

interface TournamentTabsProps {
  tournament: any;
  teams: any[];
  fixtures: any[];
  matchEvents: any[];
}

export function TournamentTabs({ tournament, teams, fixtures, matchEvents }: TournamentTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [isAddingFixture, setIsAddingFixture] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'fixtures', label: 'Fixtures & Results', icon: Calendar },
    { id: 'standings', label: 'Standings', icon: BarChart3 },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-[24px] border border-gray-100 w-fit shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-[18px] text-[10px] font-black tracking-wide transition-all duration-300
 ${isActive 
 ? 'bg-gray-900 text-white shadow-lg' 
 : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
 }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#b50a0a]' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab tournament={tournament} />
          )}
          {activeTab === 'teams' && (
            <TeamsTab tournament={tournament} teams={teams} isAdding={isAddingTeam} setIsAdding={setIsAddingTeam} />
          )}
          {activeTab === 'fixtures' && (
            <FixturesTab tournament={tournament} fixtures={fixtures} teams={teams} isAdding={isAddingFixture} setIsAdding={setIsAddingFixture} matchEvents={matchEvents} />
          )}
          {activeTab === 'standings' && (
            <StandingsTab teams={teams} fixtures={fixtures} type={tournament.type} />
          )}
          {activeTab === 'stats' && (
            <StatisticsTab matchEvents={matchEvents} fixtures={fixtures} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StatisticsTab({ matchEvents, fixtures }: { matchEvents: any[], fixtures: any[] }) {
  const finishedFixturesCount = fixtures.filter(f => f.status === 'finished').length;

  const aggregateStats = (type: string) => {
    const stats = matchEvents.filter(e => e.event_type === type).reduce((acc: any, e) => {
      acc[e.player_name] = (acc[e.player_name] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count);
  };

  const goals = aggregateStats('goal');
  const assists = aggregateStats('assist');
  const yellowCards = aggregateStats('yellow_card');
  const redCards = aggregateStats('red_card');
  const saves = aggregateStats('save');
  const cleanSheets = aggregateStats('clean_sheet');
  const shots = aggregateStats('shot');
  const keyPasses = aggregateStats('key_pass');
  const chancesCreated = aggregateStats('chance_created');
  const chancesMissed = aggregateStats('chance_missed');
  const penalties = aggregateStats('penalty');
  const freeKicks = aggregateStats('free_kick');

  // Calculate Goals + Assists
  const combinedStats = [...new Set([...goals.map(g => g.name), ...assists.map(a => a.name)])].map(name => {
    const gCount = goals.find(g => g.name === name)?.count || 0;
    const aCount = assists.find(a => a.name === name)?.count || 0;
    return { name, count: gCount + aCount, goals: gCount, assists: aCount };
  }).sort((a, b) => b.count - a.count);

  const StatCard = ({ title, data, unit = '', color = 'text-gray-900' }: { title: string, data: any[], unit?: string, color?: string }) => (
    <div className="bg-white border border-gray-100 rounded-[32px] p-4 md:p-8 shadow-sm space-y-6">
      <h4 className="text-[10px] font-black text-gray-400 tracking-wide">{title}</h4>
      <div className="space-y-4">
        {data.slice(0, 3).map((item, i) => (
          <div key={item.name} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black ${i === 0 ? 'text-[#b50a0a]' : 'text-gray-300'}`}>0{i + 1}</span>
              <span className="text-[11px] font-black text-gray-900 tracking-tight group-hover:text-[#b50a0a] transition-colors">{item.name}</span>
            </div>
            <span className={`text-base font-black ${color}`}>{item.count}{unit}</span>
          </div>
        ))}
        {data.length === 0 && <p className="text-[10px] font-bold text-gray-300">No data yet</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Tournament Statistics</h3>
          <p className="text-[10px] font-bold text-gray-400 tracking-wide">In-depth performance analysis of the tournament</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[9px] font-black text-gray-400 tracking-wide">Games Analyzed</p>
            <p className="text-xl font-black text-gray-900">{finishedFixturesCount}</p>
          </div>
          <div className="w-px h-10 bg-gray-100"></div>
          <div className="text-right">
            <p className="text-[9px] font-black text-gray-400 tracking-wide">Total Events</p>
            <p className="text-xl font-black text-[#b50a0a]">{matchEvents.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Top Goal Scorers" data={goals} />
        <StatCard title="Assist Kings" data={assists} />
        <StatCard title="Goals + Assists" data={combinedStats} />
        <StatCard title="Clean Sheets" data={cleanSheets} color="text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-4 md:p-8 pt-4">
        <div className="lg:col-span-2 bg-gray-900 rounded-[40px] p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#b50a0a] blur-[150px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 space-y-8">
            <h4 className="text-[10px] font-black text-gray-400 tracking-wide">Gameplay Efficiency</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              <div className="space-y-2">
                <p className="text-[9px] font-black text-gray-500">Shots PG</p>
                <p className="text-3xl font-black">{(shots.reduce((a, b) => a + b.count, 0) / (finishedFixturesCount || 1)).toFixed(1)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black text-gray-500">Key Passes PG</p>
                <p className="text-3xl font-black">{(keyPasses.reduce((a, b) => a + b.count, 0) / (finishedFixturesCount || 1)).toFixed(1)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black text-gray-500">Saves PG</p>
                <p className="text-3xl font-black text-green-500">{(saves.reduce((a, b) => a + b.count, 0) / (finishedFixturesCount || 1)).toFixed(1)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black text-gray-500">Conversion Rate</p>
                <p className="text-3xl font-black text-[#b50a0a]">
                  {Math.round((goals.reduce((a, b) => a + b.count, 0) / (shots.reduce((a, b) => a + b.count, 0) || 1)) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm space-y-8">
          <h4 className="text-[10px] font-black text-gray-400 tracking-wide">Discipline Record</h4>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-yellow-50 rounded-3xl border border-yellow-100">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-yellow-800">Total Yellow Cards</p>
                <p className="text-2xl font-black text-yellow-900">{yellowCards.reduce((a, b) => a + b.count, 0)}</p>
              </div>
              <div className="w-8 h-12 bg-yellow-400 rounded-lg shadow-sm"></div>
            </div>
            <div className="flex items-center justify-between p-6 bg-red-50 rounded-3xl border border-red-100">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-red-800">Total Red Cards</p>
                <p className="text-2xl font-black text-red-900">{redCards.reduce((a, b) => a + b.count, 0)}</p>
              </div>
              <div className="w-8 h-12 bg-red-600 rounded-lg shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Chances Created" data={chancesCreated} />
        <StatCard title="Chances Missed" data={chancesMissed} color="text-red-500" />
        <StatCard title="Penalty Goals" data={penalties} />
        <StatCard title="Free Kick Goals" data={freeKicks} />
      </div>
    </div>
  );
}

import { useRef } from 'react';

function OverviewTab({ tournament }: { tournament: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(tournament.logo_url || null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    formData.append('current_logo_url', tournament.logo_url || '');
    
    await updateTournament(tournament.id, formData);
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-4 md:p-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white border border-gray-100 rounded-[40px] p-10 space-y-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Basic Information</h3>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-[10px] font-black text-[#b50a0a] tracking-wide hover:opacity-70 transition-opacity"
              >
                <Edit2 className="w-3 h-3" /> Edit Details
              </button>
            )}
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0 relative group cursor-pointer hover:border-[#b50a0a] transition-colors">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <Trophy className="w-8 h-8 text-gray-300 group-hover:text-[#b50a0a] transition-colors" />
                  )}
                  <input 
                    type="file" 
                    name="logo" 
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleLogoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-gray-900">Tournament Logo</p>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wide">Click to change</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 tracking-[0.2em]">Tournament Name</label>
                  <input name="name" defaultValue={tournament.name} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 tracking-[0.2em]">Start Date</label>
                  <input name="start_date" type="date" defaultValue={tournament.start_date || ''} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 tracking-[0.2em]">End Date</label>
                  <input name="end_date" type="date" defaultValue={tournament.end_date || ''} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 tracking-[0.2em]">Status</label>
                  <select name="is_active" defaultValue={tournament.is_active ? 'true' : 'false'} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none">
                    <option value="true">Active</option>
                    <option value="false">Archived</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 tracking-[0.2em]">Description</label>
                <textarea name="description" defaultValue={tournament.description} rows={3} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none resize-none" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl border border-gray-200 text-[10px] font-black tracking-wide text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
                <button type="submit" disabled={isSaving} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black tracking-wide text-[10px] hover:bg-[#b50a0a] transition-all flex items-center gap-2">
                  {isSaving ? 'Saving...' : <><Save className="w-3 h-3" /> Save Changes</>}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2">
                  {tournament.logo_url ? (
                    <img src={tournament.logo_url} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Trophy className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 tracking-wide">Logo</p>
                  <p className="text-base font-black text-gray-900">Tournament Profile</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 tracking-[0.2em]">Tournament Name</label>
                  <p className="text-lg font-black text-gray-900">{tournament.name}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 tracking-[0.2em]">Format</label>
                  <p className="text-lg font-black text-gray-900">{tournament.type}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 tracking-[0.2em]">Start Date</label>
                  <p className="text-lg font-black text-gray-900">
                    {tournament.start_date ? format(new Date(tournament.start_date), 'MMMM dd, yyyy') : 'Not Set'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 tracking-[0.2em]">End Date</label>
                  <p className="text-lg font-black text-gray-900">
                    {tournament.end_date ? format(new Date(tournament.end_date), 'MMMM dd, yyyy') : 'Not Set'}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-gray-50">
                <label className="text-[9px] font-black text-gray-400 tracking-[0.2em]">Description</label>
                <p className="text-gray-500 font-bold text-sm leading-relaxed max-w-2xl">
                  {tournament.description || 'No description provided for this tournament.'}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="bg-gray-900 rounded-[40px] p-10 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#b50a0a] blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                <Flag className="w-5 h-5 text-[#b50a0a]" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Public Visibility</h3>
            </div>
            <p className="text-gray-400 text-sm font-bold leading-relaxed max-w-md tracking-wide">
              Control whether this tournament is visible to the public. Private leagues are only accessible via special links or invitations.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <button className="bg-[#b50a0a] text-white px-4 md:px-8 py-4 rounded-2xl font-black tracking-wide text-[10px] hover:bg-white hover:text-gray-900 transition-all">
                Make Private
              </button>
              <button className="bg-white/5 text-white px-4 md:px-8 py-4 rounded-2xl font-black tracking-wide text-[10px] hover:bg-white/10 transition-all border border-white/10">
                Generate Access Key
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-gray-100 rounded-[40px] p-4 md:p-8 space-y-6 shadow-sm">
          <h4 className="text-[10px] font-black text-gray-400 tracking-wide">Quick Stats</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[9px] font-black text-gray-500">Teams</span>
              <span className="text-lg font-black text-gray-900">{tournament.teams?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[9px] font-black text-gray-500">Matches</span>
              <span className="text-lg font-black text-gray-900">{tournament.fixtures?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[9px] font-black text-gray-500">Completed</span>
              <span className="text-lg font-black text-green-600">
                {tournament.fixtures?.filter((f: any) => f.status === 'finished').length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';

function TeamRosterModal({ team, onClose }: { team: any, onClose: () => void }) {
  const [roster, setRoster] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRoster() {
      const data = await getTeamRoster(team.id);
      setRoster(data);
      setIsLoading(false);
    }
    loadRoster();
  }, [team.id]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden border border-gray-100 shadow-2xl"
      >
        <div className="p-4 md:p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
              {team.team_logo_url ? (
                <img src={team.team_logo_url} alt={team.team_name} className="w-8 h-8 object-contain" />
              ) : (
                <Trophy className="w-5 h-5 text-gray-200" />
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 tracking-tight">{team.team_name}</h3>
              <p className="text-[9px] font-bold text-gray-400 tracking-wide">Squad Roster</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 md:p-8 max-h-[400px] overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 border-2 border-[#b50a0a]/30 border-t-[#b50a0a] rounded-full animate-spin"></div>
            </div>
          ) : roster.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Users className="w-8 h-8 text-gray-200 mx-auto" />
              <h4 className="text-[10px] font-black text-gray-400 tracking-wide">No Registered Members</h4>
              <p className="text-[9px] font-bold text-gray-300 tracking-wide">Athletes and coaches must select this team on signup</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {roster.map((member) => (
                <div key={member.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 tracking-tight">{member.first_name} {member.last_name}</h4>
                      <p className="text-[9px] font-bold text-gray-400 tracking-wide">{member.position || 'No Position Specified'}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[8px] font-black tracking-wide ${
 member.users?.role === 'coach' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
 }`}>
                    {member.users?.role || 'player'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function TeamsTab({ tournament, teams, isAdding, setIsAdding }: { tournament: any, teams: any[], isAdding: boolean, setIsAdding: (v: boolean) => void }) {
  const [activeRosterTeam, setActiveRosterTeam] = useState<any | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Participating Teams</h3>
          <p className="text-[10px] font-bold text-gray-400 tracking-wide">Manage the elite squads in this tournament</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-gray-900 text-white px-4 md:px-8 py-4 rounded-2xl font-black tracking-wide text-[10px] hover:bg-[#b50a0a] transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-3.5 h-3.5" /> Add Team
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[40px] p-10 flex flex-col items-center gap-6"
        >
          <div className="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center shadow-sm">
            <Users className="w-8 h-8 text-[#b50a0a]" />
          </div>
          <div className="text-center space-y-2">
            <h4 className="text-lg font-black text-gray-900">Add New Team</h4>
            <p className="text-[10px] font-bold text-gray-400 tracking-wide max-w-full max-w-[200px]">Enter team details to register them</p>
          </div>
          <form action={async (formData) => {
            await addTeam(tournament.id, formData);
            setIsAdding(false);
          }} className="flex flex-col gap-4 w-full max-w-md">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black text-gray-400 tracking-wide ml-1">Team Name</label>
              <input 
                name="team_name"
                placeholder="E.G. LAGOS RANGERS"
                className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-[10px] font-black text-gray-900 tracking-wide focus:ring-2 focus:ring-[#b50a0a] outline-none shadow-sm placeholder:text-gray-300"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black text-gray-400 tracking-wide ml-1">Team Logo</label>
              <input 
                name="team_logo"
                type="file"
                accept="image/*"
                className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-3.5 text-[10px] font-black text-gray-500 tracking-wide file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 cursor-pointer shadow-sm"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button className="flex-1 bg-[#b50a0a] text-white px-4 md:px-8 py-4 rounded-2xl font-black tracking-wide text-[10px] hover:bg-gray-900 transition-all">
                Add Team
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-4 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-gray-900 transition-all font-black tracking-wide text-[10px]">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-white border border-gray-100 rounded-[32px] p-4 md:p-8 flex items-center justify-between group hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform duration-500">
                {team.team_logo_url ? (
                  <img src={team.team_logo_url} alt={team.team_name} className="w-10 h-10 object-contain" />
                ) : (
                  <Trophy className="w-6 h-6 text-gray-200" />
                )}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-base font-black text-gray-900 tracking-tight">{team.team_name}</h4>
                <p className="text-[9px] font-bold text-gray-400 tracking-wide">ID: {team.id.slice(0, 8)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveRosterTeam(team)}
                className="p-3 rounded-xl bg-gray-50 text-gray-500 hover:bg-[#b50a0a] hover:text-white transition-all text-[9px] font-black tracking-wide"
              >
                Roster
              </button>
              <button 
                onClick={async () => {
                  if(confirm('Remove this team?')) {
                    await removeTeam(team.id, tournament.id);
                  }
                }}
                className="p-3 rounded-xl bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {activeRosterTeam && (
          <TeamRosterModal 
            team={activeRosterTeam} 
            onClose={() => setActiveRosterTeam(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FixturesTab({ tournament, fixtures, teams, isAdding, setIsAdding, matchEvents }: { tournament: any, fixtures: any[], teams: any[], isAdding: boolean, setIsAdding: (v: boolean) => void, matchEvents: any[] }) {
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [activeFixture, setActiveFixture] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filter fixtures
  const filteredFixtures = fixtures.filter(f => {
    const matchesSearch = 
      f.home_team?.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.away_team?.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.round?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Group by round
  const groupedFixtures = filteredFixtures.reduce((acc: Record<string, any[]>, fixture) => {
    const round = fixture.round || 'Unassigned';
    if (!acc[round]) acc[round] = [];
    acc[round].push(fixture);
    return acc;
  }, {});

  // Sort rounds (e.g., Week 1, Week 2...)
  const sortedRounds = Object.keys(groupedFixtures).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Fixtures & Results</h3>
          <p className="text-[10px] font-bold text-gray-400 tracking-wide">Scheduled matches and historical results</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-gray-900 text-white px-4 md:px-8 py-4 rounded-2xl font-black tracking-wide text-[10px] hover:bg-[#b50a0a] transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-3.5 h-3.5" /> Create Fixture
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-xl"
        >
          <div className="flex items-center justify-between mb-10">
            <h4 className="text-xl font-black text-gray-900">Create New Fixture</h4>
            <button onClick={() => setIsAdding(false)} className="p-3 rounded-xl hover:bg-gray-50 transition-all">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <form action={async (formData) => {
            await addFixture(tournament.id, formData);
            setIsAdding(false);
            setHomeTeamId('');
            setAwayTeamId('');
          }} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8">
            <div className="space-y-3">
              <label className="text-[9px] font-black text-gray-400 tracking-wide ml-1">Home Team</label>
              <select 
                name="home_team_id" 
                value={homeTeamId}
                onChange={(e) => setHomeTeamId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[10px] font-black text-gray-900 tracking-wide outline-none focus:ring-2 focus:ring-[#b50a0a]" 
                required
              >
                <option value="">Select Team</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id} disabled={t.id === awayTeamId}>
                    {t.team_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black text-gray-400 tracking-wide ml-1">Away Team</label>
              <select 
                name="away_team_id" 
                value={awayTeamId}
                onChange={(e) => setAwayTeamId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[10px] font-black text-gray-900 tracking-wide outline-none focus:ring-2 focus:ring-[#b50a0a]" 
                required
              >
                <option value="">Select Team</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id} disabled={t.id === homeTeamId}>
                    {t.team_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black text-gray-400 tracking-wide ml-1">Match Date & Time</label>
              <input type="datetime-local" name="match_date" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[10px] font-black text-gray-900 tracking-wide outline-none focus:ring-2 focus:ring-[#b50a0a]" required />
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black text-gray-400 tracking-wide ml-1">Venue</label>
              <input name="venue" placeholder="E.G. NATIONAL STADIUM" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[10px] font-black text-gray-900 tracking-wide outline-none focus:ring-2 focus:ring-[#b50a0a] placeholder:text-gray-300" />
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black text-gray-400 tracking-wide ml-1">Round / Week</label>
              <select name="round" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-[10px] font-black text-gray-900 tracking-wide outline-none focus:ring-2 focus:ring-[#b50a0a]" required>
                <option value="">Select Week</option>
                {Array.from({ length: 40 }, (_, i) => (
                  <option key={i + 1} value={`Week ${i + 1}`}>Week {i + 1}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 pt-6">
              <button className="w-full bg-gray-900 text-white py-5 rounded-[20px] font-black tracking-wide text-[10px] hover:bg-[#b50a0a] transition-all shadow-xl">
                Schedule Match
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {['all', 'scheduled', 'live', 'finished', 'postponed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-wide whitespace-nowrap transition-all ${
 filterStatus === status 
 ? 'bg-gray-900 text-white shadow-md' 
 : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900'
 }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search matches..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-[10px] font-black text-gray-900 tracking-wide outline-none focus:ring-2 focus:ring-[#b50a0a] placeholder:text-gray-300"
          />
        </div>
      </div>

      <div className="space-y-10">
        {sortedRounds.map(round => (
          <div key={round} className="space-y-4">
            <h4 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-3">
              <span className="w-8 h-px bg-gray-200"></span>
              {round}
              <span className="flex-1 h-px bg-gray-100"></span>
            </h4>
            
            <div className="space-y-3">
              {groupedFixtures[round].map((fixture: any) => (
                <div key={fixture.id} className="bg-white border border-gray-100 rounded-[24px] p-4 flex items-center justify-between group hover:shadow-lg hover:border-gray-200 transition-all duration-300">
                  {/* Compact Date Block */}
                  <div className="flex items-center gap-4 min-w-full max-w-[150px]">
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-[#b50a0a] rounded-2xl shadow-sm group-hover:scale-105 transition-transform">
                      <span className="text-[8px] font-black text-white/80">
                        {format(new Date(fixture.match_date), 'MMM')}
                      </span>
                      <span className="text-xl font-black text-white leading-none mt-0.5">
                        {format(new Date(fixture.match_date), 'dd')}
                      </span>
                    </div>
                    <div className="hidden sm:block space-y-0.5">
                      <span className="block text-[9px] font-black text-[#b50a0a] tracking-wide">{fixture.round}</span>
                      <div className="flex items-center gap-1 text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <span className="text-[8px] font-bold tracking-wide truncate max-w-full max-w-[100px]">{fixture.venue || 'TBA'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Scoreline */}
                  <div className="flex-1 flex items-center justify-center gap-4 md:gap-4 md:p-8 px-4">
                    <span className="flex-1 text-right text-sm md:text-base font-black text-gray-900 tracking-tight truncate">
                      {fixture.home_team?.team_name}
                    </span>
                    
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl">
                        <span className="text-lg md:text-xl font-black text-gray-900 w-6 text-center">{fixture.home_score}</span>
                        <span className="text-gray-300 font-black">-</span>
                        <span className="text-lg md:text-xl font-black text-gray-900 w-6 text-center">{fixture.away_score}</span>
                      </div>
                      <span className={`text-[8px] font-black tracking-wide mt-1.5 ${
 fixture.status === 'live' ? 'text-[#b50a0a] animate-pulse' : 
 fixture.status === 'finished' ? 'text-green-600' : 'text-gray-400'
 }`}>
                        {fixture.status}
                      </span>
                    </div>

                    <span className="flex-1 text-left text-sm md:text-base font-black text-gray-900 tracking-tight truncate">
                      {fixture.away_team?.team_name}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pl-4 border-l border-gray-50 shrink-0">
                    <button 
                      onClick={() => setActiveFixture(fixture)}
                      className="bg-gray-900 text-white px-4 py-3 rounded-xl font-black tracking-wide text-[9px] hover:bg-[#b50a0a] transition-all flex items-center gap-1.5"
                    >
                      <Activity className="w-3 h-3" /> <span className="hidden md:inline">Manage Live</span>
                    </button>
                    <button 
                      onClick={async () => {
                        if(confirm('Delete this fixture?')) await deleteFixture(fixture.id, tournament.id);
                      }}
                      className="p-3 rounded-xl bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border border-gray-100 hover:border-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {sortedRounds.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <Search className="w-10 h-10 text-gray-200" />
            <div className="space-y-1">
              <h4 className="text-lg font-black text-gray-900">No Fixtures Found</h4>
              <p className="text-[10px] font-bold text-gray-400 tracking-wide">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeFixture && (
          <LiveMatchModal 
            fixture={activeFixture} 
            tournamentId={tournament.id} 
            matchEvents={matchEvents} 
            onClose={() => setActiveFixture(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StandingsTab({ teams, fixtures, type }: { teams: any[], fixtures: any[], type: string }) {
  // Calculate standings dynamically from finished fixtures
  const standings = teams.map(team => {
    let played = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let goals_for = 0;
    let goals_against = 0;

    fixtures.filter(f => f.status === 'finished').forEach(fixture => {
      if (fixture.home_team_id === team.id) {
        played++;
        goals_for += fixture.home_score;
        goals_against += fixture.away_score;
        if (fixture.home_score > fixture.away_score) won++;
        else if (fixture.home_score === fixture.away_score) drawn++;
        else lost++;
      } else if (fixture.away_team_id === team.id) {
        played++;
        goals_for += fixture.away_score;
        goals_against += fixture.home_score;
        if (fixture.away_score > fixture.home_score) won++;
        else if (fixture.away_score === fixture.home_score) drawn++;
        else lost++;
      }
    });

    const points = (won * 3) + (drawn * 1);
    const goal_difference = goals_for - goals_against;

    return {
      ...team,
      played, won, drawn, lost, goals_for, goals_against, points, goal_difference
    };
  });

  // Sort teams by points, then goal difference, then goals for
  const sortedTeams = standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
    return b.goals_for - a.goals_for;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">League Standings</h3>
          <p className="text-[10px] font-bold text-gray-400 tracking-wide">Real-time table based on match results</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-100 px-6 py-3.5 rounded-2xl text-[9px] font-black tracking-wide text-gray-500 hover:text-gray-900 transition-all shadow-sm">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full pb-4 custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 md:px-8 py-6 text-[9px] font-black text-gray-400 tracking-wide">#</th>
                <th className="px-4 md:px-8 py-6 text-[9px] font-black text-gray-400 tracking-wide">Team</th>
                <th className="px-6 py-6 text-[9px] font-black text-gray-400 tracking-wide text-center">P</th>
                <th className="px-6 py-6 text-[9px] font-black text-gray-400 tracking-wide text-center">W</th>
                <th className="px-6 py-6 text-[9px] font-black text-gray-400 tracking-wide text-center">D</th>
                <th className="px-6 py-6 text-[9px] font-black text-gray-400 tracking-wide text-center">L</th>
                <th className="px-6 py-6 text-[9px] font-black text-gray-400 tracking-wide text-center">GF</th>
                <th className="px-6 py-6 text-[9px] font-black text-gray-400 tracking-wide text-center">GA</th>
                <th className="px-6 py-6 text-[9px] font-black text-gray-400 tracking-wide text-center">GD</th>
                <th className="px-4 md:px-8 py-6 text-[9px] font-black text-gray-900 tracking-wide text-center">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedTeams.map((team, index) => (
                <tr key={team.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 md:px-8 py-6">
                    <span className={`text-sm font-black ${index < 3 ? 'text-[#b50a0a]' : 'text-gray-400'}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                        {team.team_logo_url ? (
                          <img src={team.team_logo_url} alt={team.team_name} className="w-7 h-7 object-contain" />
                        ) : (
                          <Trophy className="w-5 h-5 text-gray-200" />
                        )}
                      </div>
                      <span className="text-[11px] font-black text-gray-900 tracking-tight">{team.team_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-[11px] font-bold text-gray-500 text-center">{team.played}</td>
                  <td className="px-6 py-6 text-[11px] font-bold text-gray-500 text-center">{team.won}</td>
                  <td className="px-6 py-6 text-[11px] font-bold text-gray-500 text-center">{team.drawn}</td>
                  <td className="px-6 py-6 text-[11px] font-bold text-gray-500 text-center">{team.lost}</td>
                  <td className="px-6 py-6 text-[11px] font-bold text-gray-500 text-center">{team.goals_for}</td>
                  <td className="px-6 py-6 text-[11px] font-bold text-gray-500 text-center">{team.goals_against}</td>
                  <td className="px-6 py-6 text-[11px] font-bold text-gray-500 text-center">
                    {team.goal_difference}
                  </td>
                  <td className="px-4 md:px-8 py-6 text-base font-black text-gray-900 text-center">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
