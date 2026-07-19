import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, ChevronDown, CalendarPlus } from "lucide-react";
import Link from 'next/link';

// Sample data for Results
const RESULTS = [
   {
      league: "Nigeria Premier League",
      matches: [
         {
            id: 1,
            timeLabel: "Today, 14:00",
            team1: "Kano Pillars",
            team2: "Rivers United",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Kano_Pillars_FC_logo.svg/1200px-Kano_Pillars_FC_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Rivers_United_F.C._logo.png/1200px-Rivers_United_F.C._logo.png",
            score: "1 - 2",
            isLive: true,
            hasRedCard1: false,
            hasRedCard2: true
         },
         {
            id: 2,
            timeLabel: "Yesterday",
            team1: "Enyimba",
            team2: "Shooting Stars",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Enyimba_International_F.C._logo.png/1200px-Enyimba_International_F.C._logo.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/9/91/Shooting_Stars_SC_logo.png/1200px-Shooting_Stars_SC_logo.png",
            score: "1 - 1",
            isLive: false,
            hasRedCard1: true,
            hasRedCard2: false
         },
         {
            id: 3,
            timeLabel: "Yesterday",
            team1: "Lobi Stars",
            team2: "Abia Warriors",
            logo1: "https://upload.wikimedia.org/wikipedia/en/e/eb/Lobi_Stars.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Abia_Warriors_FC_logo.png/220px-Abia_Warriors_FC_logo.png",
            score: "3 - 0",
            isLive: false,
            hasRedCard1: false,
            hasRedCard2: true
         },
         {
            id: 4,
            timeLabel: "2 days ago",
            team1: "Rangers",
            team2: "Kwara Utd",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Enugu_Rangers_logo.png/1200px-Enugu_Rangers_logo.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kwara_United_F.C._logo.png/1200px-Kwara_United_F.C._logo.png",
            score: "0 - 2",
            isLive: false,
            hasRedCard1: true,
            hasRedCard2: false
         },
         {
            id: 5,
            timeLabel: "2 days ago",
            team1: "Akwa Utd",
            team2: "Plateau Utd",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Akwa_United_F.C._logo.png/1200px-Akwa_United_F.C._logo.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/6/67/Plateau_United_F.C._logo.png",
            score: "1 - 1",
            isLive: false,
            hasRedCard1: false,
            hasRedCard2: false
         },
         {
            id: 6,
            timeLabel: "3 days ago",
            team1: "Nasarawa",
            team2: "Wikki Tourists",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Nasarawa_United_F.C._logo.svg/1200px-Nasarawa_United_F.C._logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/c/ca/Wikki_Tourists_F.C._logo.png",
            score: "2 - 0",
            isLive: false,
            hasRedCard1: false,
            hasRedCard2: true
         }
      ]
   },
   {
      league: "La Liga",
      matches: [
         {
            id: 7,
            timeLabel: "Yesterday",
            team1: "Barcelona",
            team2: "Valencia",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/Valenciacf.svg/1200px-Valenciacf.svg.png",
            score: "3 - 1",
            isLive: false,
            hasRedCard1: false,
            hasRedCard2: true
         },
         {
            id: 8,
            timeLabel: "Yesterday",
            team1: "Sevilla",
            team2: "Celta",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Sevilla_FC_logo.svg/1200px-Sevilla_FC_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/RC_Celta_de_Vigo_logo.svg/1200px-RC_Celta_de_Vigo_logo.svg.png",
            score: "1 - 0",
            isLive: false,
            hasRedCard1: true,
            hasRedCard2: false
         },
         {
            id: 9,
            timeLabel: "2 days ago",
            team1: "Real Madrid",
            team2: "Sociedad",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Real_Sociedad_logo.svg/1200px-Real_Sociedad_logo.svg.png",
            score: "2 - 2",
            isLive: false,
            hasRedCard1: false,
            hasRedCard2: true
         }
      ]
   },
   {
      league: "Serie A",
      matches: [
         {
            id: 10,
            timeLabel: "Today, 18:00",
            team1: "Juventus",
            team2: "Lazio",
            logo1: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_2017_icon_%28black%29.svg/1200px-Juventus_FC_2017_icon_%28black%29.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/S.S._Lazio_badge.svg/1200px-S.S._Lazio_badge.svg.png",
            score: "2 - 1",
            isLive: true,
            hasRedCard1: false,
            hasRedCard2: true
         },
         {
            id: 11,
            timeLabel: "Yesterday",
            team1: "Atalanta",
            team2: "Verona",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/6/66/AtalantaBC.svg/1200px-AtalantaBC.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/9/92/Hellas_Verona_FC_logo.svg/1200px-Hellas_Verona_FC_logo.svg.png",
            score: "0 - 1",
            isLive: false,
            hasRedCard1: true,
            hasRedCard2: false
         },
         {
            id: 12,
            timeLabel: "Yesterday",
            team1: "Sampdoria",
            team2: "Roma",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d2/U.C._Sampdoria_logo.svg/1200px-U.C._Sampdoria_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/AS_Roma_logo_%282017%29.svg/1200px-AS_Roma_logo_%282017%29.svg.png",
            score: "1 - 0",
            isLive: false,
            hasRedCard1: false,
            hasRedCard2: true
         },
         {
            id: 13,
            timeLabel: "2 days ago",
            team1: "Fiorentina",
            team2: "Monza",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/ACF_Fiorentina_2.svg/1200px-ACF_Fiorentina_2.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/AC_Monza_logo.svg/1200px-AC_Monza_logo.svg.png",
            score: "0 - 2",
            isLive: false,
            hasRedCard1: false,
            hasRedCard2: false
         },
         {
            id: 14,
            timeLabel: "3 days ago",
            team1: "Milan",
            team2: "Torino",
            logo1: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/1200px-Logo_of_AC_Milan.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/Torino_FC_Logo.svg/1200px-Torino_FC_Logo.svg.png",
            score: "3 - 0",
            isLive: false,
            hasRedCard1: false,
            hasRedCard2: false
         },
         {
            id: 15,
            timeLabel: "3 days ago",
            team1: "Inter Milan",
            team2: "Napoli",
            logo1: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/1200px-FC_Internazionale_Milano_2021.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/SSC_Napoli.svg/1200px-SSC_Napoli.svg.png",
            score: "0 - 1",
            isLive: false,
            hasRedCard1: true,
            hasRedCard2: false
         }
      ]
   },
   {
      league: "Bundesliga",
      matches: [
         {
            id: 16,
            timeLabel: "Yesterday",
            team1: "KÃ¶ln",
            team2: "Mainz",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/1._FC_K%C3%B6ln_logo.svg/1200px-1._FC_K%C3%B6ln_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/FSV_Mainz_05_Logo.svg/1200px-FSV_Mainz_05_Logo.svg.png",
            score: "2 - 1",
            isLive: false,
            hasRedCard1: false,
            hasRedCard2: true
         },
         {
            id: 17,
            timeLabel: "Yesterday",
            team1: "Leipzig",
            team2: "Schalke",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/RB_Leipzig_2014_logo.svg/1200px-RB_Leipzig_2014_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/FC_Schalke_04_Logo.svg/1200px-FC_Schalke_04_Logo.svg.png",
            score: "1 - 0",
            isLive: false,
            hasRedCard1: true,
            hasRedCard2: false
         }
      ]
   },
   {
      league: "Champions League (Group F)",
      matches: [
         {
            id: 18,
            timeLabel: "Today, 20:00",
            team1: "Dortmund",
            team2: "PSG",
            logo1: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/1200px-Borussia_Dortmund_logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/1200px-Paris_Saint-Germain_F.C..svg.png",
            score: "1 - 1",
            isLive: true,
            hasRedCard1: false,
            hasRedCard2: true
         },
         {
            id: 19,
            timeLabel: "Today, 20:00",
            team1: "Newcastle",
            team2: "AC Milan",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/1200px-Newcastle_United_Logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/1200px-Logo_of_AC_Milan.svg.png",
            score: "1 - 2",
            isLive: true,
            hasRedCard1: true,
            hasRedCard2: false
         }
      ]
   },
   {
      league: "Premier League",
      matches: [
         {
            id: 20,
            timeLabel: "Yesterday",
            team1: "Leicester",
            team2: "Everton",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2d/Leicester_City_crest.svg/1200px-Leicester_City_crest.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Everton_FC_logo.svg/1200px-Everton_FC_logo.svg.png",
            score: "2 - 2",
            isLive: false,
            hasRedCard1: false,
            hasRedCard2: true
         },
         {
            id: 21,
            timeLabel: "Yesterday",
            team1: "Arsenal",
            team2: "Chelsea",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/1200px-Chelsea_FC.svg.png",
            score: "3 - 1",
            isLive: false,
            hasRedCard1: true,
            hasRedCard2: false
         },
         {
            id: 22,
            timeLabel: "2 days ago",
            team1: "Newcastle",
            team2: "West Ham",
            logo1: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/1200px-Newcastle_United_Logo.svg.png",
            logo2: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/West_Ham_United_FC_logo.svg/1200px-West_Ham_United_FC_logo.svg.png",
            score: "1 - 1",
            isLive: false,
            hasRedCard1: false,
            hasRedCard2: false
         }
      ]
   }
];


export default function ResultsPage() {
   return (
      <div className="min-h-screen bg-[#e5e5e5]">
         <Navbar />

         <main className="pt-32">
            {/* Page Header */}
            <div className="bg-[#383838] py-8">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
                  <h1 className="text-white text-3xl font-bold tracking-wide">Results</h1>
               </div>
            </div>

            {/* Sub-Navigation */}
            <div className="bg-[#292929] border-b border-gray-800">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
                  <ul className="flex items-center gap-8 overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth whitespace-nowrap">
                     <li>
                        <Link href="/news" className="text-white hover:text-[#b50a0a] transition-colors text-xs font-bold tracking-wide py-4 block">
                           All News
                        </Link>
                     </li>
                     <li>
                        <Link href="/news/fixtures" className="text-white hover:text-[#b50a0a] transition-colors text-xs font-bold tracking-wide py-4 block">
                           Match Fixtures
                        </Link>
                     </li>
                     <li>
                        <Link href="/news/results" className="text-[#b50a0a] text-xs font-bold tracking-wide py-4 block">
                           Results
                        </Link>
                     </li>
                     <li>
                        <Link href="/news/tables" className="text-white hover:text-[#b50a0a] transition-colors text-xs font-bold tracking-wide py-4 block">
                           Tables
                        </Link>
                     </li>
                     <li>
                        <Link href="/news/live-scores" className="text-white hover:text-[#b50a0a] transition-colors text-xs font-bold tracking-wide py-4 block">
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
                     <span className="text-xs font-bold text-[#b50a0a] tracking-wide">Filter By Date:</span>
                     <button className="flex items-center gap-1 text-xs font-bold text-gray-900 ml-1">
                        Yesterday <ChevronDown className="w-3 h-3" />
                     </button>
                  </div>
                  
                  <div className="flex items-center gap-2 border-r border-gray-300 pr-6 pl-2">
                     <span className="text-xs font-bold text-[#b50a0a] tracking-wide">Filter By:</span>
                     <button className="flex items-center gap-1 text-xs font-bold text-gray-900 ml-1">
                        ALL <ChevronDown className="w-3 h-3" />
                     </button>
                  </div>

                  <div className="flex items-center gap-2 pl-2 flex-1">
                     <Search className="w-4 h-4 text-gray-400" />
                     <input type="text" placeholder="Search Teams" className="bg-transparent border-none focus:outline-none text-xs font-bold w-full tracking-wide placeholder:text-gray-400" />
                  </div>
               </div>

               {/* Results List */}
               <div className="space-y-12">
                  {RESULTS.map((leagueGroup, index) => (
                     <div key={index} className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{leagueGroup.league}</h2>
                        <div className="bg-white rounded shadow-sm hover:shadow-md transition-shadow">
                           <div className="p-6">
                               {/* League Wide Top Info just for visual consistency if needed, but going with rows */}
                               <div className="flex justify-center mb-6">
                                    <div className="text-center">
                                       <span className="text-xs font-bold text-gray-400 tracking-wide block mb-1">Match details/info</span>
                                       <span className="text-xs font-bold text-gray-900 tracking-wide">Recent Results</span>
                                    </div>
                                 </div>

                              <div className="flex flex-col gap-1">
                                 {leagueGroup.matches.map((match) => (
                                    <div key={match.id} className="relative flex items-center justify-between py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors rounded px-2">
                                       
                                       {/* Date/Time indicator */}
                                       <div className="absolute left-2 text-xs font-bold text-gray-400 tracking-wide w-16">
                                          {match.timeLabel}
                                       </div>

                                       <div className="flex items-center justify-between max-w-[650px] mx-auto w-full px-12 md:px-0">
                                          {/* Team 1 */}
                                          <div className="flex items-center justify-end w-[35%] gap-4 relative">
                                             <span className="font-bold text-sm text-gray-900">{match.team1}</span>
                                             <img src={match.logo1} className="w-8 h-8 object-contain" alt={match.team1} />
                                             {match.hasRedCard1 && (
                                                <div className="absolute -right-2 top-0 w-2 h-3 bg-red-600 rounded-sm"></div>
                                             )}
                                          </div>
                                          
                                          {/* Score Box */}
                                          <div className="w-[30%] flex justify-center">
                                             <div className={`font-bold text-base px-4 py-1.5 rounded-sm ${match.isLive ? 'text-[#b50a0a] bg-red-50 border border-red-100 animate-pulse' : 'text-gray-900 bg-gray-100'}`}>
                                                {match.score}
                                             </div>
                                          </div>

                                          {/* Team 2 */}
                                          <div className="flex items-center justify-start w-[35%] gap-4 relative">
                                             <img src={match.logo2} className="w-8 h-8 object-contain" alt={match.team2} />
                                             <span className="font-bold text-sm text-gray-900">{match.team2}</span>
                                             {match.hasRedCard2 && (
                                                <div className="absolute -left-2 top-0 w-2 h-3 bg-red-600 rounded-sm"></div>
                                             )}
                                          </div>
                                       </div>

                                       {/* Optional Event icon spacing (e.g for goals/cards) */}
                                       <div className="absolute right-4 hidden md:flex items-center gap-2">
                                          {match.isLive ? (
                                             <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div> LIVE
                                             </span>
                                          ) : (
                                             <span className="text-xs font-bold text-gray-400">FT</span>
                                          )}
                                       </div>

                                    </div>
                                 ))}
                              </div>

                           </div>
                        </div>

                        {/* Load More Button for current League */}
                        <div className="flex justify-center mt-2 mb-4">
                           <button className="bg-[#b50a0a] hover:bg-[#8b0000] text-white font-bold text-xs tracking-wide px-10 py-3 rounded shadow-md transition-colors">
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
