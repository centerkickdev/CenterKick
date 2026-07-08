'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Clock, Trophy, Activity, Plus, Trash2 } from 'lucide-react';
import { updateFixture, recordMatchEvent } from '../actions';
import { format } from 'date-fns';

interface LiveMatchModalProps {
  fixture: any;
  tournamentId: string;
  matchEvents: any[];
  onClose: () => void;
}

export function LiveMatchModal({ fixture, tournamentId, matchEvents, onClose }: LiveMatchModalProps) {
  const [homeScore, setHomeScore] = useState(fixture.home_score || 0);
  const [awayScore, setAwayScore] = useState(fixture.away_score || 0);
  const [status, setStatus] = useState(fixture.status || 'scheduled');
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  const fixtureEvents = matchEvents
    .filter(e => e.fixture_id === fixture.id)
    .sort((a, b) => b.minute - a.minute);

  const handleUpdateMatchInfo = async () => {
    setIsSavingScore(true);
    await updateFixture(fixture.id, tournamentId, {
      home_score: homeScore,
      away_score: awayScore,
      status: status
    });
    setIsSavingScore(false);
  };

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingEvent(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const eventData = {
      team_id: formData.get('team_id'),
      event_type: formData.get('event_type'),
      player_name: formData.get('player_name'),
      minute: parseInt(formData.get('minute') as string),
    };

    await recordMatchEvent(fixture.id, tournamentId, eventData);
    form.reset();
    setIsSavingEvent(false);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal': return '⚽';
      case 'yellow_card': return '🟨';
      case 'red_card': return '🟥';
      case 'sub': return '🔄';
      case 'save': return '🧤';
      case 'clean_sheet': return '🛡️';
      case 'shot': return '🎯';
      case 'key_pass': return '👟';
      case 'chance_created': return '✨';
      case 'chance_missed': return '❌';
      case 'penalty': return '🎯';
      case 'free_kick': return '👟';
      default: return '📍';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-4 md:px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 text-[#b50a0a]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Live Match Management</h3>
              <p className="text-xs font-bold text-gray-400 tracking-wide">{fixture.round} • {format(new Date(fixture.match_date), 'MMM dd, yyyy')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-200 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col md:flex-row gap-4 md:p-8">
          {/* Left Column: Score & Status */}
          <div className="w-full md:w-1/2 space-y-8">
            <div className="bg-gray-900 rounded-[32px] p-4 md:p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#b50a0a] blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-full flex items-center justify-between gap-4">
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 tracking-wide text-center">{fixture.home_team?.team_name}</span>
                    <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl">
                      <button onClick={() => setHomeScore(Math.max(0, homeScore - 1))} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/20 font-bold">-</button>
                      <span className="text-4xl font-bold w-12 text-center">{homeScore}</span>
                      <button onClick={() => setHomeScore(homeScore + 1)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/20 font-bold">+</button>
                    </div>
                  </div>
                  
                  <span className="text-2xl font-bold text-gray-600">-</span>
                  
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 tracking-wide text-center">{fixture.away_team?.team_name}</span>
                    <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl">
                      <button onClick={() => setAwayScore(Math.max(0, awayScore - 1))} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/20 font-bold">-</button>
                      <span className="text-4xl font-bold w-12 text-center">{awayScore}</span>
                      <button onClick={() => setAwayScore(awayScore + 1)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/20 font-bold">+</button>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-white/10"></div>

                <div className="w-full flex items-center justify-between gap-4">
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-[#b50a0a]"
                  >
                    <option value="scheduled" className="text-gray-900">Scheduled</option>
                    <option value="live" className="text-gray-900">Live</option>
                    <option value="finished" className="text-gray-900">Finished</option>
                    <option value="postponed" className="text-gray-900">Postponed</option>
                    <option value="cancelled" className="text-gray-900">Cancelled</option>
                  </select>
                  
                  <button 
                    onClick={handleUpdateMatchInfo}
                    disabled={isSavingScore}
                    className="bg-[#b50a0a] text-white px-6 py-3 rounded-xl font-bold tracking-wide text-xs hover:bg-white hover:text-gray-900 transition-all flex items-center gap-2"
                  >
                    {isSavingScore ? 'Saving...' : 'Update Match'}
                  </button>
                </div>
              </div>
            </div>

            {/* Event Form */}
            <div className="bg-white border border-gray-100 rounded-[32px] p-4 md:p-8 shadow-sm">
              <h4 className="text-xs font-bold text-gray-400 tracking-wide mb-6">Log New Event</h4>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 tracking-wide">Team</label>
                    <select name="team_id" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 tracking-wide outline-none focus:ring-2 focus:ring-[#b50a0a]">
                      <option value={fixture.home_team_id}>{fixture.home_team?.team_name}</option>
                      <option value={fixture.away_team_id}>{fixture.away_team?.team_name}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 tracking-wide">Type</label>
                    <select name="event_type" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 tracking-wide outline-none focus:ring-2 focus:ring-[#b50a0a]">
                      <option value="goal">Goal</option>
                      <option value="yellow_card">Yellow Card</option>
                      <option value="red_card">Red Card</option>
                      <option value="sub">Substitution</option>
                      <option value="save">Save</option>
                      <option value="clean_sheet">Clean Sheet</option>
                      <option value="shot">Shot</option>
                      <option value="key_pass">Key Pass</option>
                      <option value="chance_created">Chance Created</option>
                      <option value="chance_missed">Chance Missed</option>
                      <option value="penalty">Penalty Goal</option>
                      <option value="free_kick">Free Kick Goal</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 tracking-wide">Player Name</label>
                    <input name="player_name" required placeholder="E.G. JOHN DOE" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 tracking-wide outline-none focus:ring-2 focus:ring-[#b50a0a] placeholder:text-gray-300" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 tracking-wide">Minute</label>
                    <input name="minute" type="number" required min="1" max="130" placeholder="45" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 text-center tracking-wide outline-none focus:ring-2 focus:ring-[#b50a0a] placeholder:text-gray-300" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSavingEvent}
                  className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl font-bold tracking-wide text-xs hover:bg-[#b50a0a] hover:text-white transition-all mt-2"
                >
                  {isSavingEvent ? 'Adding...' : 'Add Event'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Timeline */}
          <div className="w-full md:w-1/2 flex flex-col">
            <h4 className="text-xs font-bold text-gray-400 tracking-wide mb-4">Match Timeline</h4>
            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-[32px] p-6 overflow-y-auto min-h-[300px]">
              <div className="space-y-4">
                {fixtureEvents.map((event, idx) => (
                  <div key={event.id || idx} className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-base shrink-0">
                      {event.minute}'
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg leading-none">{getEventIcon(event.event_type)}</span>
                        <p className="text-sm font-bold text-gray-900 tracking-tight">{event.player_name}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-400 tracking-wide mt-1">
                        {event.team_id === fixture.home_team_id ? fixture.home_team?.team_name : fixture.away_team?.team_name}
                      </p>
                    </div>
                  </div>
                ))}
                
                {fixtureEvents.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-50 py-10">
                    <Clock className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm font-bold text-gray-900">No Events Yet</p>
                    <p className="text-xs font-bold text-gray-400 tracking-wide">Log events as they happen</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
