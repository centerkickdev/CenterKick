import { createClient } from '@/lib/supabase/server';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Trophy, Calendar, Users, ArrowRight } from "lucide-react";
import Link from 'next/link';

export default async function TournamentsPage() {
  const supabase = await createClient();
  
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('is_active', true)
    .order('start_date', { ascending: false });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
          <div className="mb-20 space-y-4">
             <div className="inline-flex items-center gap-3 bg-red-50 px-5 py-2 rounded-full border border-red-100">
                <div className="w-2 h-2 rounded-full bg-[#a20000] animate-pulse"></div>
                <span className="text-xs font-bold text-[#a20000] tracking-wide underline underline-offset-4">Live Competitions</span>
             </div>
             <h1 className="text-6xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-none">
                LEAGUES & <br />
                <span className="text-[#a20000]">TOURNAMENTS.</span>
             </h1>
             <p className="text-gray-800 text-xl font-medium max-w-2xl leading-relaxed">
                Track the progress of elite local and private tournaments. View standings, fixtures, and detailed statistics for every match.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {tournaments?.map((tournament) => (
              <Link 
                key={tournament.id} 
                href={`/tournaments/${tournament.slug}`}
                className="group bg-white border border-gray-100 rounded-[50px] overflow-hidden hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-700 flex flex-col h-full"
              >
                <div className="h-56 bg-gray-50 relative overflow-hidden flex items-center justify-center p-12">
                   <div className="absolute inset-0 bg-gradient-to-br from-[#a20000]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                   {tournament.logo_url ? (
                     <img src={tournament.logo_url} alt={tournament.name} className="h-full w-auto object-contain relative z-10 group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                     <Trophy className="w-24 h-24 text-gray-200 group-hover:text-[#a20000]/20 transition-colors duration-700" />
                   )}
                   
                   <div className="absolute top-8 right-8">
                     <span className="px-5 py-2 rounded-full bg-white/80 backdrop-blur-md text-xs font-bold tracking-wide border border-gray-100 shadow-sm">
                       {tournament.type}
                     </span>
                   </div>
                </div>

                <div className="p-10 flex-1 flex flex-col">
                   <h3 className="text-3xl font-bold text-gray-900 tracking-tighter mb-4 group-hover:text-[#a20000] transition-colors">
                      {tournament.name}
                   </h3>
                   
                   <p className="text-gray-600 text-base font-semibold leading-relaxed mb-10 line-clamp-2">
                      {tournament.description || 'Global professional tournament sanctioned by CenterKick.'}
                   </p>

                   <div className="grid grid-cols-2 gap-6 mb-10 mt-auto">
                      <div className="space-y-2">
                         <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#a20000]" />
                            <span className="text-xs font-bold text-gray-400 tracking-wide">Season</span>
                         </div>
                         <p className="text-sm font-bold text-gray-900">2026/27</p>
                      </div>
                      <div className="space-y-2">
                         <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#a20000]" />
                            <span className="text-xs font-bold text-gray-400 tracking-wide">Format</span>
                         </div>
                         <p className="text-sm font-bold text-gray-900">{tournament.type}</p>
                      </div>
                   </div>

                   <button className="w-full py-5 rounded-2xl border-2 border-gray-900 text-gray-900 font-bold tracking-wide text-xs group-hover:bg-gray-900 group-hover:text-white transition-all flex items-center justify-center gap-3">
                      View Match Center <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              </Link>
            ))}

            {!tournaments?.length && (
              <div className="col-span-full py-40 flex flex-col items-center justify-center text-center space-y-8 bg-gray-50 rounded-[80px] border-2 border-dashed border-gray-200">
                <Trophy className="w-20 h-20 text-gray-200" />
                <div className="space-y-2">
                   <h2 className="text-3xl font-bold text-gray-900 tracking-tighter">No Active Tournaments</h2>
                   <p className="text-gray-500 font-bold text-base tracking-wide">Check back soon for upcoming elite football competitions.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
