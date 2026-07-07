import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, ChevronDown, CalendarPlus } from "lucide-react";
import Link from 'next/link';

// Sample data for fixtures
const FIXTURES = [
   {
      league: "Nigeria Premier League",
      matches: [
         {
            id: 1,
            date: "Mon, 24th May, 2023",
            time: "20:00",
            team1: "Kano Pillars",
            team2: "Rivers United",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Kano_Pillars_FC_logo.svg/1200px-Kano_Pillars_FC_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Rivers_United_F.C._logo.png/1200px-Rivers_United_F.C._logo.png",
            odds: { "1": "3.45", "X": "1.23", "2": "2.98" }
         },
         {
            id: 2,
            date: "Mon, 24th May, 2023",
            time: "20:00",
            team1: "Enyimba",
            team2: "Shooting Stars",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Enyimba_International_F.C._logo.png/1200px-Enyimba_International_F.C._logo.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/9/91/Shooting_Stars_SC_logo.png/1200px-Shooting_Stars_SC_logo.png",
            odds: { "1": "1.45", "X": "1.23", "2": "2.98" }
         },
         {
            id: 3,
            date: "Mon, 24th May, 2023",
            time: "20:00",
            team1: "Lobi Stars",
            team2: "Abia Warriors",
            logo1: "https://upload.wikimedia.org/wikipedia/en/e/eb/Lobi_Stars.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Abia_Warriors_FC_logo.png/220px-Abia_Warriors_FC_logo.png",
            odds: { "1": "2.45", "X": "1.23", "2": "2.98" }
         }
      ]
   },
   {
      league: "La Liga",
      matches: [
         {
            id: 4,
            date: "Mon, 24th May, 2023",
            time: "20:00",
            team1: "Valencia",
            team2: "Villarreal",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/Valenciacf.svg/1200px-Valenciacf.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/7/70/Villarreal_CF_logo.svg/1200px-Villarreal_CF_logo.svg.png",
            odds: { "1": "1.45", "X": "2.23", "2": "2.98" }
         },
         {
            id: 5,
            date: "Mon, 24th May, 2023",
            time: "20:00",
            team1: "Atletico",
            team2: "Cadiz",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/1200px-Atletico_Madrid_2017_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/5/58/C%C3%A1diz_CF_logo.svg/1200px-C%C3%A1diz_CF_logo.svg.png",
            odds: { "1": "1.45", "X": "1.23", "2": "2.98" }
         },
         {
            id: 6,
            date: "Mon, 24th May, 2023",
            time: "20:00",
            team1: "Getafe",
            team2: "Celta Vigo",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/4/46/Getafe_logo.svg/1200px-Getafe_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/RC_Celta_de_Vigo_logo.svg/1200px-RC_Celta_de_Vigo_logo.svg.png",
            odds: { "1": "1.45", "X": "1.23", "2": "2.98" }
         }
      ]
   },
   {
      league: "Serie A",
      matches: [
         {
            id: 7,
            date: "Mon, 24th May, 2023",
            time: "20:00",
            team1: "Juventus",
            team2: "Lazio",
            logo1: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_2017_icon_%28black%29.svg/1200px-Juventus_FC_2017_icon_%28black%29.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/S.S._Lazio_badge.svg/1200px-S.S._Lazio_badge.svg.png",
            odds: { "1": "3.45", "X": "1.23", "2": "2.88" }
         },
         {
            id: 8,
            date: "Mon, 24th May, 2023",
            time: "20:00",
            team1: "Atalanta",
            team2: "Verona",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/6/66/AtalantaBC.svg/1200px-AtalantaBC.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/9/92/Hellas_Verona_FC_logo.svg/1200px-Hellas_Verona_FC_logo.svg.png",
            odds: { "1": "1.45", "X": "1.23", "2": "2.98" }
         },
         {
            id: 9,
            date: "Mon, 24th May, 2023",
            time: "20:00",
            team1: "Sampdoria",
            team2: "Roma",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d2/U.C._Sampdoria_logo.svg/1200px-U.C._Sampdoria_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/AS_Roma_logo_%282017%29.svg/1200px-AS_Roma_logo_%282017%29.svg.png",
            odds: { "1": "1.45", "X": "1.23", "2": "2.98" }
         }
      ]
   },
   {
      league: "Bundesliga",
      matches: [
         {
            id: 10,
            date: "Mon, 24th May, 2023",
            time: "20:00",
            team1: "Wolfsburg",
            team2: "Mainz",
            logo1: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Logo-VfL-Wolfsburg.svg/1200px-Logo-VfL-Wolfsburg.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/FSV_Mainz_05_Logo.svg/1200px-FSV_Mainz_05_Logo.svg.png",
            odds: { "1": "2.45", "X": "1.23", "2": "2.18" }
         },
         {
            id: 11,
            date: "Mon, 24th May, 2023",
            time: "20:00",
            team1: "Schalke 04",
            team2: "Eintracht",
            logo1: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/FC_Schalke_04_Logo.svg/1200px-FC_Schalke_04_Logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Eintracht_Frankfurt_Logo.svg/1200px-Eintracht_Frankfurt_Logo.svg.png",
            odds: { "1": "1.45", "X": "1.23", "2": "2.98" }
         },
         {
            id: 12,
            date: "Mon, 24th May, 2023",
            time: "20:00",
            team1: "Freiburg",
            team2: "Bochum",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/SC_Freiburg_logo.svg/1200px-SC_Freiburg_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/VfL_Bochum_logo.svg/1200px-VfL_Bochum_logo.svg.png",
            odds: { "1": "1.45", "X": "1.23", "2": "2.98" }
         }
      ]
   },
   {
      league: "Premier League",
      matches: [
         {
            id: 13,
            date: "Mon, 24th May, 2023",
            time: "20:00",
            team1: "Leicester",
            team2: "Everton",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2d/Leicester_City_crest.svg/1200px-Leicester_City_crest.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Everton_FC_logo.svg/1200px-Everton_FC_logo.svg.png",
            odds: { "1": "1.45", "X": "1.23", "2": "1.98" }
         },
         {
            id: 14,
            date: "Mon, 24th May, 2023",
            time: "20:00",
            team1: "Arsenal",
            team2: "Chelsea",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/1200px-Chelsea_FC.svg.png",
            odds: { "1": "1.45", "X": "2.23", "2": "2.98" }
         },
         {
            id: 15,
            date: "Mon, 24th May, 2023",
            time: "20:00",
            team1: "Man City",
            team2: "West Ham",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/West_Ham_United_FC_logo.svg/1200px-West_Ham_United_FC_logo.svg.png",
            odds: { "1": "1.45", "X": "1.23", "2": "2.98" }
         }
      ]
   }
];


export default function FixturesPage() {
   return (
      <div className="min-h-screen bg-[#e5e5e5]">
         <Navbar />

         <main className="pt-32">
            {/* Page Header */}
            <div className="bg-[#383838] py-8">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
                  <h1 className="text-white text-3xl font-black tracking-wide">Fixtures</h1>
               </div>
            </div>

            {/* Sub-Navigation */}
            <div className="bg-[#292929] border-b border-gray-800">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
                  <ul className="flex items-center gap-8 overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth whitespace-nowrap">
                     <li>
                        <Link href="/news" className="text-white hover:text-[#b50a0a] transition-colors text-[10px] font-bold tracking-wide py-4 block">
                           All News
                        </Link>
                     </li>
                     <li>
                        <Link href="/news/fixtures" className="text-[#b50a0a] text-[10px] font-bold tracking-wide py-4 block">
                           Match Fixtures
                        </Link>
                     </li>
                     <li>
                        <Link href="/news/results" className="text-white hover:text-[#b50a0a] transition-colors text-[10px] font-bold tracking-wide py-4 block">
                           Results
                        </Link>
                     </li>
                     <li>
                        <Link href="/news/tables" className="text-white hover:text-[#b50a0a] transition-colors text-[10px] font-bold tracking-wide py-4 block">
                           Tables
                        </Link>
                     </li>
                     <li>
                        <Link href="/news/live-scores" className="text-white hover:text-[#b50a0a] transition-colors text-[10px] font-bold tracking-wide py-4 block">
                           Live Scores
                        </Link>
                     </li>
                  </ul>
               </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8">
               
               {/* Filters / Toolbar */}
               <div className="flex flex-wrap items-center gap-4 border-y border-gray-300 py-3 mb-8">
                  <div className="flex items-center gap-2 border-r border-gray-300 pr-6">
                     <span className="text-[10px] font-bold text-[#b50a0a] tracking-wide">Filter By Date:</span>
                     <button className="flex items-center gap-1 text-[11px] font-black text-gray-900 ml-1">
                        Next 7 Days <ChevronDown className="w-3 h-3" />
                     </button>
                  </div>
                  
                  <div className="flex items-center gap-2 border-r border-gray-300 pr-6 pl-2">
                     <span className="text-[10px] font-bold text-[#b50a0a] tracking-wide">Filter By:</span>
                     <button className="flex items-center gap-1 text-[11px] font-black text-gray-900 ml-1">
                        ALL <ChevronDown className="w-3 h-3" />
                     </button>
                  </div>

                  <div className="flex items-center gap-2 pl-2 flex-1">
                     <Search className="w-4 h-4 text-gray-400" />
                     <input type="text" placeholder="Search Teams" className="bg-transparent border-none focus:outline-none text-[11px] font-bold w-full tracking-wide placeholder:text-gray-400" />
                  </div>

                  <div className="hidden md:flex border-l border-gray-300 pl-6 h-full items-center">
                     <button className="flex items-center gap-2 text-[10px] font-bold text-gray-600 tracking-wide hover:text-gray-900 transition-colors">
                        <CalendarPlus className="w-4 h-4" /> Add Fixtures To Calendar
                     </button>
                  </div>
               </div>

               {/* Fixtures List */}
               <div className="space-y-12">
                  {FIXTURES.map((leagueGroup, index) => (
                     <div key={index} className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{leagueGroup.league}</h2>
                        
                        {leagueGroup.matches.map((match) => (
                           <div key={match.id} className="bg-white rounded shadow-sm hover:shadow-md transition-shadow">
                              <div className="p-6">
                                 {/* Top Info */}
                                 <div className="flex justify-center mb-6">
                                    <div className="text-center">
                                       <span className="text-[9px] font-bold text-gray-400 tracking-wide block mb-1">Match details/info</span>
                                       <span className="text-[11px] font-black text-gray-900 tracking-wide">{match.date} | {match.time}</span>
                                    </div>
                                 </div>

                                 {/* Teams Row */}
                                 <div className="flex items-center justify-between max-w-[600px] mx-auto px-4">
                                    <div className="flex items-center justify-end w-[40%] gap-4">
                                       <span className="font-bold text-[13px] text-gray-900">{match.team1}</span>
                                       <img src={match.logo1} className="w-10 h-10 object-contain" alt={match.team1} />
                                    </div>
                                    <div className="w-[20%] flex justify-center">
                                       <span className="font-black text-[13px] text-gray-400 bg-gray-50 px-3 py-1 rounded">VS</span>
                                    </div>
                                    <div className="flex items-center justify-start w-[40%] gap-4">
                                       <img src={match.logo2} className="w-10 h-10 object-contain" alt={match.team2} />
                                       <span className="font-bold text-[13px] text-gray-900">{match.team2}</span>
                                    </div>
                                 </div>
                                 
                                 {/* Odds Row */}
                                 <div className="flex items-center justify-center gap-4 mt-8">
                                    {Object.entries(match.odds).map(([key, value]) => (
                                       <div key={key} className="flex items-center border border-gray-200 rounded text-[9px] font-black w-20 overflow-hidden shadow-sm">
                                          <div className="bg-gray-50 text-gray-500 w-6 h-6 flex justify-center items-center border-r border-gray-200">{key}</div>
                                          <div className="bg-white text-gray-900 flex-1 h-6 flex justify-center items-center">{value}</div>
                                       </div>
                                    ))}
                                    <div className="flex items-center ml-2">
                                       <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">bet9ja</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}

                        {/* Load More Button for current League */}
                        <div className="flex justify-center mt-2 mb-4">
                           <button className="bg-[#b50a0a] hover:bg-[#8b0000] text-white font-bold text-[10px] tracking-wide px-10 py-3 rounded shadow-md transition-colors">
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
