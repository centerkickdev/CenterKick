import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChevronDown, RotateCcw, Check, X, Minus } from "lucide-react";
import Link from 'next/link';

// Form Icon Component
const FormIcon = ({ type }: { type: 'W' | 'D' | 'L' | 'N' }) => {
   if (type === 'W') {
      return (
         <div className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
            <Check className="w-2.5 h-2.5" />
         </div>
      );
   }
   if (type === 'L') {
      return (
         <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
            <X className="w-2.5 h-2.5" />
         </div>
      );
   }
   return (
      <div className="w-4 h-4 rounded-full bg-[#afafaf] text-white flex items-center justify-center font-bold">
         <Minus className="w-2.5 h-2.5" />
      </div>
   );
}

// Sample data for Tables Group A
const GROUP_A = [
   { pos: 1, posColor: "bg-red-50 text-gray-900 border-r-2 border-red-500", club: "Bendel", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f0/Bendel_Insurance_F.C._logo.svg/1200px-Bendel_Insurance_F.C._logo.svg.png", p: 17, w: 8, d: 9, l: 0, gf: 21, ga: 10, gd: 11, pts: 33, form: ['N', 'N', 'W', 'N', 'N'] },
   { pos: 2, posColor: "bg-white text-gray-900", club: "Enyimba", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Enyimba_International_F.C._logo.png/1200px-Enyimba_International_F.C._logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 30, form: ['W', 'W', 'N', 'W', 'W'] },
   { pos: 3, posColor: "bg-white text-gray-900", club: "Remo Star", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Remo_Stars_FC_logo.png/1200px-Remo_Stars_FC_logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 29, form: ['W', 'W', 'N', 'N', 'N'] },
   { pos: 4, posColor: "bg-white text-gray-900", club: "Akwa United", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Akwa_United_F.C._logo.png/1200px-Akwa_United_F.C._logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 26, form: ['W', 'L', 'W', 'L', 'N'] },
   { pos: 5, posColor: "bg-yellow-50 text-gray-900", club: "Plateau United", logo: "https://upload.wikimedia.org/wikipedia/en/6/67/Plateau_United_F.C._logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 22, form: ['L', 'N', 'W', 'W', 'L'] },
   { pos: 6, posColor: "bg-yellow-50 text-gray-900", club: "Abia Warriors", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Abia_Warriors_FC_logo.png/220px-Abia_Warriors_FC_logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 19, form: ['L', 'W', 'L', 'W', 'L'] },
   { pos: 7, posColor: "bg-yellow-50 text-gray-900", club: "Gombe United", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e9/Gombe_United_F.C._logo.png/1200px-Gombe_United_F.C._logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 17, form: ['L', 'N', 'L', 'N', 'W'] },
   { pos: 8, posColor: "bg-white text-gray-900", club: "El Kanemi", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/El-Kanemi_Warriors_logo.png/1200px-El-Kanemi_Warriors_logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 17, form: ['L', 'N', 'L', 'N', 'W'] },
   { pos: 9, posColor: "bg-white text-gray-900", club: "Abia Warriors", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Abia_Warriors_FC_logo.png/220px-Abia_Warriors_FC_logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 17, form: ['L', 'N', 'L', 'N', 'W'] },
   { pos: 10, posColor: "bg-white text-gray-900", club: "Abia Warriors", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Abia_Warriors_FC_logo.png/220px-Abia_Warriors_FC_logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 17, form: ['L', 'N', 'L', 'N', 'W'] }
];

// Sample data for Tables Group B
const GROUP_B = [
   { pos: 1, posColor: "bg-red-50 text-gray-900 border-r-2 border-red-500", club: "Bendel", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f0/Bendel_Insurance_F.C._logo.svg/1200px-Bendel_Insurance_F.C._logo.svg.png", p: 17, w: 8, d: 9, l: 0, gf: 21, ga: 10, gd: 11, pts: 33, form: ['N', 'N', 'W', 'N', 'N'] },
   { pos: 2, posColor: "bg-white text-gray-900", club: "Enyimba", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Enyimba_International_F.C._logo.png/1200px-Enyimba_International_F.C._logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 30, form: ['W', 'W', 'N', 'W', 'W'] },
   { pos: 3, posColor: "bg-white text-gray-900", club: "Remo Star", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Remo_Stars_FC_logo.png/1200px-Remo_Stars_FC_logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 29, form: ['W', 'W', 'N', 'N', 'N'] },
   { pos: 4, posColor: "bg-white text-gray-900", club: "Akwa United", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Akwa_United_F.C._logo.png/1200px-Akwa_United_F.C._logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 26, form: ['W', 'L', 'W', 'L', 'N'] },
   { pos: 5, posColor: "bg-white text-gray-900", club: "Plateau United", logo: "https://upload.wikimedia.org/wikipedia/en/6/67/Plateau_United_F.C._logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 22, form: ['L', 'N', 'W', 'W', 'L'] },
   { pos: 6, posColor: "bg-[#fbdca7] text-gray-900", club: "Abia Warriors", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Abia_Warriors_FC_logo.png/220px-Abia_Warriors_FC_logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 19, form: ['L', 'W', 'L', 'W', 'L'] },
   { pos: 7, posColor: "bg-[#fbdca7] text-gray-900", club: "Gombe United", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e9/Gombe_United_F.C._logo.png/1200px-Gombe_United_F.C._logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 17, form: ['L', 'N', 'L', 'N', 'W'] },
   { pos: 8, posColor: "bg-white text-gray-900", club: "El Kanemi", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/El-Kanemi_Warriors_logo.png/1200px-El-Kanemi_Warriors_logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 17, form: ['L', 'N', 'L', 'N', 'W'] },
   { pos: 9, posColor: "bg-white text-gray-900", club: "Abia Warriors", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Abia_Warriors_FC_logo.png/220px-Abia_Warriors_FC_logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 17, form: ['L', 'N', 'L', 'N', 'W'] },
   { pos: 10, posColor: "bg-white text-gray-900", club: "Abia Warriors", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Abia_Warriors_FC_logo.png/220px-Abia_Warriors_FC_logo.png", p: 17, w: 9, d: 4, l: 4, gf: 25, ga: 12, gd: 13, pts: 17, form: ['L', 'N', 'L', 'N', 'W'] }
];

export default function TablesPage() {
   return (
      <div className="min-h-screen bg-white">
         <Navbar />

         <main className="pt-32">
            {/* Page Header */}
            <div className="bg-[#383838] py-8">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
                  <h1 className="text-white text-3xl font-bold tracking-wide">Tables</h1>
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
                        <Link href="/news/results" className="text-white hover:text-[#b50a0a] transition-colors text-xs font-bold tracking-wide py-4 block">
                           Results
                        </Link>
                     </li>
                     <li>
                        <Link href="/news/tables" className="text-[#b50a0a] text-xs font-bold tracking-wide py-4 block">
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
            <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-12">
               
               {/* Filters Bar */}
               <div className="flex flex-wrap items-center border border-gray-200 py-3 px-6 mb-12 shadow-sm rounded-sm">
                  <div className="flex flex-col border-r border-gray-200 pr-8">
                     <span className="text-xs font-bold text-[#b50a0a] tracking-wide">Filter By Competition:</span>
                     <button className="flex items-center gap-1 text-sm font-bold text-gray-900 mt-1">
                        Nigeria League <ChevronDown className="w-3 h-3" />
                     </button>
                  </div>
                  
                  <div className="flex flex-col border-r border-gray-200 px-8">
                     <span className="text-xs font-bold text-[#b50a0a] tracking-wide">Filter By Season:</span>
                     <button className="flex items-center gap-1 text-sm font-bold text-gray-900 mt-1">
                        2022/23 <ChevronDown className="w-3 h-3" />
                     </button>
                  </div>

                  <div className="flex flex-col border-r border-gray-200 px-8">
                     <span className="text-xs font-bold text-[#b50a0a] tracking-wide">Filter By Matchweek:</span>
                     <button className="flex items-center gap-1 text-sm font-bold text-gray-900 mt-1">
                        All Matchweeks <ChevronDown className="w-3 h-3" />
                     </button>
                  </div>

                  <div className="flex flex-col border-r border-gray-200 px-8">
                     <span className="text-xs font-bold text-[#b50a0a] tracking-wide">Filter By Home / Away:</span>
                     <button className="flex items-center gap-1 text-sm font-bold text-gray-900 mt-1">
                        All Matches <ChevronDown className="w-3 h-3" />
                     </button>
                  </div>

                  <div className="flex flex-col pl-8 ml-auto">
                     <button className="flex items-center gap-2 text-xs font-bold text-gray-900 hover:text-[#b50a0a] transition-colors">
                        <RotateCcw className="w-3 h-3" /> Reset Filters
                     </button>
                  </div>
               </div>

               {/* League Header */}
               <div className="flex justify-center items-center gap-3 mb-12">
                  <span className="text-3xl font-light text-gray-800">Nigeria</span>
                  {/* Nigeria League Logo placeholder */}
                  <div className="w-10 h-10 object-contain mx-2">
                     <svg viewBox="0 0 100 100" className="w-full h-full text-green-600" fill="currentColor">
                        <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 90C27.9 90 10 72.1 10 50S27.9 10 50 10s40 17.9 40 40-17.9 40-40 40z"/><path d="M50 20L30 80h40z"/>
                     </svg>
                  </div>
                  <span className="text-3xl font-light text-gray-800">Premier League</span>
               </div>

               {/* Group A Table */}
               <div className="mb-16">
                  <h2 className="text-lg font-bold text-gray-900 tracking-wide mb-6">Group A</h2>
                  
                  <div className="w-full overflow-x-auto">
                     <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                           <tr className="bg-[#e5e5e5] border-b-2 border-white">
                              <th className="font-bold text-xs text-gray-500 px-4 py-3 text-center w-12">Pos</th>
                              <th className="font-bold text-xs text-gray-500 px-4 py-3">Club</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-12">Played</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-12">Won</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-12">Drawn</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-12">Lost</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-12">GF</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-12">GA</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-12">GD</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-16">Points</th>
                              <th className="font-bold text-xs text-gray-500 px-4 py-3 text-center w-40">Form</th>
                           </tr>
                        </thead>
                        <tbody>
                           {GROUP_A.map((row) => (
                              <tr key={row.pos} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                 <td className={`font-bold text-xs px-4 py-3 text-center ${row.posColor}`}>
                                    {row.pos}
                                 </td>
                                 <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                       <img src={row.logo} className="w-6 h-6 object-contain" alt={row.club} />
                                       <span className="font-bold text-xs text-gray-700">{row.club}</span>
                                    </div>
                                 </td>
                                 <td className="font-bold text-xs text-gray-400 text-center px-2 py-3">{row.p}</td>
                                 <td className="font-bold text-xs text-gray-700 text-center px-2 py-3">{row.w}</td>
                                 <td className="font-bold text-xs text-gray-700 text-center px-2 py-3">{row.d}</td>
                                 <td className="font-bold text-xs text-gray-700 text-center px-2 py-3">{row.l}</td>
                                 <td className="font-bold text-xs text-gray-400 text-center px-2 py-3">{row.gf}</td>
                                 <td className="font-bold text-xs text-gray-400 text-center px-2 py-3">{row.ga}</td>
                                 <td className="font-bold text-xs text-gray-400 text-center px-2 py-3">{row.gd}</td>
                                 <td className="font-bold text-xs text-gray-900 text-center px-2 py-3">{row.pts}</td>
                                 <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1.5">
                                       {row.form.map((f, i) => (
                                          <FormIcon key={i} type={f as 'W' | 'D' | 'L' | 'N'} />
                                       ))}
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Group B Table */}
               <div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-wide mb-6">Group B</h2>
                  
                  <div className="w-full overflow-x-auto">
                     <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                           <tr className="bg-[#e5e5e5] border-b-2 border-white">
                              <th className="font-bold text-xs text-gray-500 px-4 py-3 text-center w-12">Pos</th>
                              <th className="font-bold text-xs text-gray-500 px-4 py-3">Club</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-12">Played</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-12">Won</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-12">Drawn</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-12">Lost</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-12">GF</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-12">GA</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-12">GD</th>
                              <th className="font-bold text-xs text-gray-500 px-2 py-3 text-center w-16">Points</th>
                              <th className="font-bold text-xs text-gray-500 px-4 py-3 text-center w-40">Form</th>
                           </tr>
                        </thead>
                        <tbody>
                           {GROUP_B.map((row) => (
                              <tr key={row.pos} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                 <td className={`font-bold text-xs px-4 py-3 text-center ${row.posColor}`}>
                                    {row.pos}
                                 </td>
                                 <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                       <img src={row.logo} className="w-6 h-6 object-contain" alt={row.club} />
                                       <span className="font-bold text-xs text-gray-700">{row.club}</span>
                                    </div>
                                 </td>
                                 <td className="font-bold text-xs text-gray-400 text-center px-2 py-3">{row.p}</td>
                                 <td className="font-bold text-xs text-gray-700 text-center px-2 py-3">{row.w}</td>
                                 <td className="font-bold text-xs text-gray-700 text-center px-2 py-3">{row.d}</td>
                                 <td className="font-bold text-xs text-gray-700 text-center px-2 py-3">{row.l}</td>
                                 <td className="font-bold text-xs text-gray-400 text-center px-2 py-3">{row.gf}</td>
                                 <td className="font-bold text-xs text-gray-400 text-center px-2 py-3">{row.ga}</td>
                                 <td className="font-bold text-xs text-gray-400 text-center px-2 py-3">{row.gd}</td>
                                 <td className="font-bold text-xs text-gray-900 text-center px-2 py-3">{row.pts}</td>
                                 <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1.5">
                                       {row.form.map((f, i) => (
                                          <FormIcon key={i} type={f as 'W' | 'D' | 'L' | 'N'} />
                                       ))}
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

            </div>
         </main>

         <Footer />
      </div>
   );
}
