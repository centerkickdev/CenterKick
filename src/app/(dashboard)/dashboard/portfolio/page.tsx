'use client';

import { useState } from 'react';
import { Briefcase, Users, Plus, Trash2, Shield, Search, Star, ExternalLink } from 'lucide-react';

export default function PortfolioPage() {
  const [players, setPlayers] = useState([
    { id: 1, name: 'Bamidele Adeniyi', position: 'Midfielder', age: 19, value: '$250,000', status: 'Active' },
    { id: 2, name: 'Yemi Daniel', position: 'Striker', age: 21, value: '$1,200,000', status: 'Active' },
    { id: 3, name: 'Akere Samuel', position: 'Defender', age: 20, value: '$150,000', status: 'Pending Transfer' },
  ]);

  const [isAdding, setIsAdding] = useState(false);

  const handleAddPlayer = () => {
    const name = prompt('Enter Player Name:');
    const position = prompt('Enter Position (Striker, Midfielder, Defender, Goalkeeper):');
    const age = parseInt(prompt('Enter Age:') || '0');
    const value = prompt('Enter Market Value ($):');

    if (name && position && age) {
      setPlayers([...players, {
        id: Date.now(),
        name,
        position,
        age,
        value: `$${value}`,
        status: 'Active'
      }]);
    }
  };

  return (
    <div className="max-w-full max-w-[1000px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tighter">My Talent <span className="text-[#b50a0a]">Portfolio</span></h1>
          <p className="text-gray-900 text-xs font-bold tracking-wide mt-1">Manage and represent your exclusive list of professional players.</p>
        </div>
        <button 
          onClick={handleAddPlayer}
          className="px-4 md:px-8 py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl"
        >
          <Plus className="w-4 h-4" /> Represent New Player
        </button>
      </div>

      {/* Grid of Represented Players */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-3 gap-6">
        {players.map((player) => (
          <div key={player.id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 md:p-8 space-y-6 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-red-50 text-[#b50a0a] rounded-full text-xs font-bold tracking-wide">
                {player.position}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${player.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                {player.status}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-[#b50a0a] transition-colors">{player.name}</h3>
              <p className="text-xs text-gray-400 font-bold mt-1">{player.age} Years Old â€¢ Professional</p>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-bold tracking-wide">Estimated Value</p>
                <p className="text-base font-bold text-gray-900 font-mono mt-0.5">{player.value}</p>
              </div>
              <button 
                onClick={() => setPlayers(players.filter(p => p.id !== player.id))}
                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
