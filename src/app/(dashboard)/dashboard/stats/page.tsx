'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Eye, Trophy, Calendar, Plus, Trash2, Video, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function StatsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const [stats, setStats] = useState({
    matchesPlayed: 14,
    goals: 8,
    assists: 5,
    minutesPlayed: 1120,
    cleanSheets: 0,
    yellowCards: 1,
    redCards: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('jersey_number, height_cm, weight_kg, position')
          .eq('user_id', user.id)
          .single();
        // Fallback or load from profiles if needed
      }
      setIsLoading(false);
    }
    loadStats();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setStatus({ type: 'success', msg: 'Performance stats saved successfully!' });
      setIsSaving(false);
    }, 800);
  };

  if (isLoading) return <div className="pt-20 text-center font-black tracking-wide animate-pulse">Loading Stats & Analytics...</div>;

  return (
    <div className="max-w-full max-w-[1000px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Stats & <span className="text-[#b50a0a]">Media</span></h1>
          <p className="text-gray-900 text-[10px] font-bold tracking-wide mt-1">Track your performance data and manage media reels.</p>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-xl text-sm font-black tracking-wide ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {status.msg}
        </div>
      )}

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-4 md:p-8 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#b50a0a] flex items-center justify-center shadow-inner">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold tracking-wide">Profile Views</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">1,420</h3>
            <p className="text-[8px] text-green-600 font-bold mt-1">↑ 12% this week</p>
          </div>
        </div>

        <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-4 md:p-8 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#b50a0a] flex items-center justify-center shadow-inner">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold tracking-wide">Scouting Inquiries</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">4</h3>
            <p className="text-[8px] text-green-600 font-bold mt-1">↑ 2 active chats</p>
          </div>
        </div>

        <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-4 md:p-8 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#b50a0a] flex items-center justify-center shadow-inner">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold tracking-wide">Scout Rating</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">A+</h3>
            <p className="text-[8px] text-[#b50a0a] font-bold mt-1">Top 5% in category</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-4 md:p-8">
        {/* Match Statistics Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 md:p-8 md:p-12 space-y-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-2 h-10 bg-[#b50a0a] rounded-full"></div>
            <div>
              <h3 className="text-base font-black tracking-wide text-gray-900">Career Statistics</h3>
              <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] mt-0.5">Keep your metrics fresh and up-to-date</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Matches Played</label>
              <input type="number" value={stats.matchesPlayed} onChange={(e) => setStats({...stats, matchesPlayed: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold text-black outline-none focus:ring-2 focus:ring-[#b50a0a]" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Goals Scored</label>
              <input type="number" value={stats.goals} onChange={(e) => setStats({...stats, goals: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold text-black outline-none focus:ring-2 focus:ring-[#b50a0a]" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Assists Created</label>
              <input type="number" value={stats.assists} onChange={(e) => setStats({...stats, assists: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold text-black outline-none focus:ring-2 focus:ring-[#b50a0a]" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Minutes Played</label>
              <input type="number" value={stats.minutesPlayed} onChange={(e) => setStats({...stats, minutesPlayed: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold text-black outline-none focus:ring-2 focus:ring-[#b50a0a]" />
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-4 md:px-8 py-4 bg-gray-900 hover:bg-black text-white text-[11px] font-black tracking-wide rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save Performance Stats
          </button>
        </form>

        {/* Media Reels Side panel */}
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 md:p-8 space-y-6">
          <h3 className="text-sm font-black tracking-wide text-gray-900">Featured Highlight</h3>
          <div className="aspect-video bg-gray-900 rounded-3xl flex flex-col items-center justify-center text-center p-6 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-full bg-[#b50a0a] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform cursor-pointer">
              <Video className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[8px] font-black tracking-wide text-gray-400 mt-3">Watch Highlight Reel</span>
          </div>
          
          <div className="pt-4 border-t border-gray-50 space-y-4">
            <h4 className="text-[10px] font-black text-gray-900 tracking-wide">Video Checklist</h4>
            <ul className="space-y-2 text-[9px] font-bold text-gray-500 tracking-wide">
              <li className="flex items-center gap-2">✓ Match clip uploads</li>
              <li className="flex items-center gap-2">✓ Training highlights</li>
              <li className="flex items-center gap-2 text-gray-400">○ Technical coach feedback</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
