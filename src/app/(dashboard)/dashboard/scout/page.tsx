import { Search, Filter, Star } from 'lucide-react';

export default function ScoutDashboard() {
  const players = [
    { id: 1, name: 'Bamidele Adeniyi', position: 'Midfielder', age: 19, rating: 85 },
    { id: 2, name: 'Yemi Daniel', position: 'Striker', age: 21, rating: 88 },
    { id: 3, name: 'Akere Samuel', position: 'Defender', age: 20, rating: 82 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Scout & Agent Dashboard</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search players by name, country, or club..." 
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <button className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-colors">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-3 gap-6">
          {players.map((player) => (
            <div key={player.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-48 bg-gray-900 relative">
                <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80')" }}></div>
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-sm font-bold border border-white/20">
                  {player.position}
                </div>
                <button className="absolute bottom-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-primary transition-colors hover:text-white text-white/80">
                  <Star className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{player.name}</h3>
                  <span className="text-primary font-black">{player.rating}</span>
                </div>
                <div className="text-base text-gray-500 mb-4">
                  {player.age} yrs • Free Agent
                </div>
                <button className="w-full py-2 bg-gray-50 hover:bg-red-50 text-gray-800 hover:text-primary rounded-lg font-medium text-base transition-colors border border-gray-100">
                  View Full Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
