import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from 'next/link';

// Sample data for Live Scores
const LIVE_SCORES = [
   {
      league: "Nigeria Premier League",
      matches: [
         {
            id: 1,
            time: "20:00",
            statusLabel: "1ST HALF",
            team1: "Kano Pillars",
            team2: "Rivers United",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Kano_Pillars_FC_logo.svg/1200px-Kano_Pillars_FC_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Rivers_United_F.C._logo.png/1200px-Rivers_United_F.C._logo.png",
            score: "2 - 0"
         },
         {
            id: 2,
            time: "20:00",
            statusLabel: "1ST HALF",
            team1: "Enyimba",
            team2: "Shooting Stars",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Enyimba_International_F.C._logo.png/1200px-Enyimba_International_F.C._logo.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/9/91/Shooting_Stars_SC_logo.png/1200px-Shooting_Stars_SC_logo.png",
            score: "2 - 1"
         },
         {
            id: 3,
            time: "20:00",
            statusLabel: "1ST HALF",
            team1: "Lobi Stars",
            team2: "Abia Warriors",
            logo1: "https://upload.wikimedia.org/wikipedia/en/e/eb/Lobi_Stars.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Abia_Warriors_FC_logo.png/220px-Abia_Warriors_FC_logo.png",
            score: "1 - 3"
         }
      ]
   },
   {
      league: "La Liga",
      matches: [
         {
            id: 4,
            time: "20:00",
            statusLabel: "1ST HALF",
            team1: "Valencia",
            team2: "Villarreal",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/Valenciacf.svg/1200px-Valenciacf.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/7/70/Villarreal_CF_logo.svg/1200px-Villarreal_CF_logo.svg.png",
            score: "1 - 2"
         },
         {
            id: 5,
            time: "20:00",
            statusLabel: "1ST HALF",
            team1: "Atletico",
            team2: "Cadiz",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/1200px-Atletico_Madrid_2017_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/5/58/C%C3%A1diz_CF_logo.svg/1200px-C%C3%A1diz_CF_logo.svg.png",
            score: "1 - 0"
         },
         {
            id: 6,
            time: "20:00",
            statusLabel: "1ST HALF",
            team1: "Getafe",
            team2: "Celta Vigo",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/4/46/Getafe_logo.svg/1200px-Getafe_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/RC_Celta_de_Vigo_logo.svg/1200px-RC_Celta_de_Vigo_logo.svg.png",
            score: "1 - 1"
         }
      ]
   },
   {
      league: "Serie A",
      matches: [
         {
            id: 7,
            time: "20:00",
            statusLabel: "1ST HALF",
            team1: "Juventus",
            team2: "Lazio",
            logo1: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_2017_icon_%28black%29.svg/1200px-Juventus_FC_2017_icon_%28black%29.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/S.S._Lazio_badge.svg/1200px-S.S._Lazio_badge.svg.png",
            score: "1 - 1"
         },
         {
            id: 8,
            time: "20:00",
            statusLabel: "1ST HALF",
            team1: "Atalanta",
            team2: "Verona",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/6/66/AtalantaBC.svg/1200px-AtalantaBC.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/9/92/Hellas_Verona_FC_logo.svg/1200px-Hellas_Verona_FC_logo.svg.png",
            score: "1 - 1"
         },
         {
            id: 9,
            time: "20:00",
            statusLabel: "1ST HALF",
            team1: "Sampdoria",
            team2: "Roma",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d2/U.C._Sampdoria_logo.svg/1200px-U.C._Sampdoria_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/AS_Roma_logo_%282017%29.svg/1200px-AS_Roma_logo_%282017%29.svg.png",
            score: "1 - 1"
         }
      ]
   },
   {
      league: "Bundesliga",
      matches: [
         {
            id: 10,
            time: "20:00",
            statusLabel: "1ST HALF",
            team1: "Wolfsburg",
            team2: "Mainz",
            logo1: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Logo-VfL-Wolfsburg.svg/1200px-Logo-VfL-Wolfsburg.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/FSV_Mainz_05_Logo.svg/1200px-FSV_Mainz_05_Logo.svg.png",
            score: "1 - 1"
         },
         {
            id: 11,
            time: "20:00",
            statusLabel: "1ST HALF",
            team1: "Schalke 04",
            team2: "Eintracht",
            logo1: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/FC_Schalke_04_Logo.svg/1200px-FC_Schalke_04_Logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Eintracht_Frankfurt_Logo.svg/1200px-Eintracht_Frankfurt_Logo.svg.png",
            score: "1 - 1"
         },
         {
            id: 12,
            time: "20:00",
            statusLabel: "1ST HALF",
            team1: "Freiburg",
            team2: "Bochum",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/SC_Freiburg_logo.svg/1200px-SC_Freiburg_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/VfL_Bochum_logo.svg/1200px-VfL_Bochum_logo.svg.png",
            score: "1 - 1"
         }
      ]
   },
   {
      league: "Premier League",
      matches: [
         {
            id: 13,
            time: "20:00",
            statusLabel: "1ST HALF",
            team1: "Leicester",
            team2: "Everton",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2d/Leicester_City_crest.svg/1200px-Leicester_City_crest.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Everton_FC_logo.svg/1200px-Everton_FC_logo.svg.png",
            score: "1 - 1"
         },
         {
            id: 14,
            time: "20:00",
            statusLabel: "1ST HALF",
            team1: "Arsenal",
            team2: "Chelsea",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/1200px-Chelsea_FC.svg.png",
            score: "1 - 1"
         },
         {
            id: 15,
            time: "20:00",
            statusLabel: "1ST HALF",
            team1: "Man City",
            team2: "West Ham",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/West_Ham_United_FC_logo.svg/1200px-West_Ham_United_FC_logo.svg.png",
            score: "1 - 1"
         }
      ]
   }
];


export default function LiveScoresPage() {
   return (
      <div className="min-h-screen bg-[#e5e5e5]">
         <Navbar />

         <main className="pt-32">
            {/* Page Header */}
            <div className="bg-[#383838] py-8">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
                  <h1 className="text-white text-3xl font-black tracking-wide uppercase">Live Scores</h1>
               </div>
            </div>

            {/* Sub-Navigation */}
            <div className="bg-[#292929] border-b border-gray-800">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
                  <ul className="flex items-center gap-8 overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth whitespace-nowrap">
                     <li>
                        <Link href="/news" className="text-white hover:text-[#b50a0a] transition-colors text-[10px] font-bold uppercase tracking-widest py-4 block">
                           All News
                        </Link>
                     </li>
                     <li>
                        <Link href="/news/fixtures" className="text-white hover:text-[#b50a0a] transition-colors text-[10px] font-bold uppercase tracking-widest py-4 block">
                           Match Fixtures
                        </Link>
                     </li>
                     <li>
                        <Link href="/news/results" className="text-white hover:text-[#b50a0a] transition-colors text-[10px] font-bold uppercase tracking-widest py-4 block">
                           Results
                        </Link>
                     </li>
                     <li>
                        <Link href="/news/tables" className="text-white hover:text-[#b50a0a] transition-colors text-[10px] font-bold uppercase tracking-widest py-4 block">
                           Tables
                        </Link>
                     </li>
                     <li>
                        <Link href="/news/live-scores" className="text-[#b50a0a] text-[10px] font-bold uppercase tracking-widest py-4 block">
                           Live Scores
                        </Link>
                     </li>
                  </ul>
               </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-12">
               
               {/* Live Matches List */}
               <div className="space-y-12">
                  {LIVE_SCORES.map((leagueGroup, index) => (
                     <div key={index} className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{leagueGroup.league}</h2>
                        
                        {leagueGroup.matches.map((match) => (
                           <div key={match.id} className="relative bg-white rounded shadow-sm hover:shadow-md transition-shadow">
                              <div className="p-6">
                                 
                                 {/* Absolute Live Indicator text in top right */}
                                 <div className="absolute top-4 right-6 text-[10px] font-black text-gray-900 flex items-center gap-1.5 uppercase">
                                    Live <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                                 </div>

                                 {/* Top Info Header */}
                                 <div className="flex justify-center mb-6">
                                    <div className="text-center">
                                       <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Match details/info</span>
                                    </div>
                                 </div>

                                 {/* Central Score Block */}
                                 <div className="flex items-center justify-between max-w-[600px] mx-auto px-4">
                                    {/* Team 1 */}
                                    <div className="flex items-center justify-end w-[35%] gap-4">
                                       <span className="font-bold text-[13px] text-gray-900">{match.team1}</span>
                                       <img src={match.logo1} className="w-10 h-10 object-contain" alt={match.team1} />
                                    </div>
                                    
                                    {/* Score Central Block */}
                                    <div className="w-[30%] flex flex-col items-center justify-center">
                                       <div className="font-black text-[28px] text-gray-900 tracking-[0.2em] leading-none mb-2">
                                          {match.score}
                                       </div>
                                       <span className="text-[10px] font-bold text-[#b50a0a] uppercase tracking-widest">
                                          {match.statusLabel}
                                       </span>
                                       <span className="text-[9px] font-bold text-[#b50a0a] uppercase">
                                          {match.time}
                                       </span>
                                    </div>
                                    
                                    {/* Team 2 */}
                                    <div className="flex items-center justify-start w-[35%] gap-4">
                                       <img src={match.logo2} className="w-10 h-10 object-contain" alt={match.team2} />
                                       <span className="font-bold text-[13px] text-gray-900">{match.team2}</span>
                                    </div>
                                 </div>
                                 
                              </div>
                           </div>
                        ))}

                        {/* Load More Button for current League */}
                        <div className="flex justify-center mt-2 mb-4">
                           <button className="bg-[#b50a0a] hover:bg-[#8b0000] text-white font-bold text-[10px] uppercase tracking-widest px-10 py-3 rounded shadow-md transition-colors">
                              LOAD MORE
                           </button>
                        </div>
                     </div>
                  ))}
               </div>

            </div>
         </main>

         <Footer />
      </div>
   );
}
