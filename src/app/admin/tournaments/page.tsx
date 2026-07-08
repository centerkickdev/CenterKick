import { createClient } from '@/lib/supabase/server';
import { Trophy, Plus, Calendar, Settings2, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function AdminTournamentsPage() {
  const supabase = await createClient();
  
  const { data: tournaments, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 shadow-sm">
              <Trophy className="w-5 h-5 text-[#b50a0a]" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tighter">Manage Tournaments</h1>
          </div>
          <p className="text-gray-500 font-bold text-xs tracking-[0.2em] ml-1">
            Global Tournament Control Center
          </p>
        </div>

        <Link href="/admin/tournaments/new">
          <button className="bg-gray-900 text-white px-4 md:px-8 py-5 rounded-[20px] font-bold tracking-wide text-xs hover:bg-[#b50a0a] transition-all flex items-center gap-3 shadow-xl transform active:scale-95 group">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> 
            Create Tournament
          </button>
        </Link>
      </div>

      {/* Tournament Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-2 xl:grid-cols-1 md:grid-cols-3 gap-4 md:p-8">
        {tournaments?.map((tournament) => (
          <div key={tournament.id} className="bg-white border border-gray-100 rounded-[40px] overflow-hidden group hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col">
            <div className="h-40 bg-gray-50 relative overflow-hidden flex items-center justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#b50a0a] blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
              {tournament.logo_url ? (
                <img src={tournament.logo_url} alt={tournament.name} className="h-24 w-auto object-contain relative z-10" />
              ) : (
                <Trophy className="w-16 h-16 text-gray-200 relative z-10 group-hover:scale-110 transition-transform duration-700" />
              )}
              
              <div className="absolute top-6 right-6">
                <span className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide ${tournament.is_active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                  {tournament.is_active ? 'Active' : 'Archived'}
                </span>
              </div>
            </div>

            <div className="p-10 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-[#b50a0a] tracking-wide">{tournament.type} Tournament</span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-4 group-hover:text-[#b50a0a] transition-colors">
                {tournament.name}
              </h3>
              
              <p className="text-gray-500 text-sm font-bold leading-relaxed mb-10 line-clamp-2">
                {tournament.description || 'No description provided for this tournament.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 tracking-wide">Starts</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900">
                    {tournament.start_date ? format(new Date(tournament.start_date), 'MMM dd, yyyy') : 'TBA'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Settings2 className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 tracking-wide">Season</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900">2026/27</p>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                <Link href={`/admin/tournaments/${tournament.id}`} className="flex items-center gap-2 text-xs font-bold tracking-wide text-gray-900 hover:text-[#b50a0a] transition-colors">
                  Manage <ArrowRight className="w-3 h-3" />
                </Link>
                <button className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all border border-gray-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!tournaments?.length && (
          <div className="lg:col-span-2 xl:col-span-3 py-32 flex flex-col items-center justify-center text-center space-y-6 bg-white border border-dashed border-gray-200 rounded-[60px]">
            <div className="w-20 h-20 rounded-[30px] bg-gray-50 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-gray-200" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">No Tournaments Found</h3>
              <p className="text-sm font-bold text-gray-400 tracking-wide">Get started by creating your first professional tournament.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
