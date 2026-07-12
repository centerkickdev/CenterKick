'use client';

import { Plus, Trash2, Search } from 'lucide-react';
import { HybridLinkInput } from './HybridLinkInput';

export function ScoutDiscoveriesForm({ data, onChange }: { data: any, onChange: (val: any) => void, disabled?: boolean }) {
  const qualifications = ['PFSA Level 1', 'PFSA Level 2', 'PFSA Level 3', 'FA Talent ID Level 1', 'FA Talent ID Level 2', 'Other'];
  const methodologies = ['Live Match Scouting', 'Video Scouting', 'Data Analytics', 'Character Assessment'];
  const regions = ['Europe', 'South America', 'North America', 'Africa', 'Asia', 'Global'];

  const handleArrayChange = (field: string, value: string) => {
    const currentArray = data[field] || [];
    if (currentArray.includes(value)) {
      onChange({ ...data, [field]: currentArray.filter((v: string) => v !== value) });
    } else {
      onChange({ ...data, [field]: [...currentArray, value] });
    }
  };

  const addDiscovery = () => {
    const discoveries = data.past_discoveries || [];
    onChange({
      ...data,
      past_discoveries: [...discoveries, { playerName: '', year: '', recommendedTo: '', currentStatus: '' }]
    });
  };

  const updateDiscovery = (index: number, field: string, value: any) => {
    const discoveries = [...(data.past_discoveries || [])];
    discoveries[index] = { ...discoveries[index], [field]: value };
    onChange({ ...data, past_discoveries: discoveries });
  };

  const removeDiscovery = (index: number) => {
    const discoveries = (data.past_discoveries || []).filter((_: any, i: number) => i !== index);
    onChange({ ...data, past_discoveries: discoveries });
  };

  return (
    <div className="space-y-8">
      {/* Current Affiliation */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">Current Affiliation (Club / Agency)</label>
        <HybridLinkInput 
           value={data.current_affiliation || { name: '' }} 
           onChange={(val) => onChange({ ...data, current_affiliation: val })}
           placeholderName="Club or Agency Name"
           placeholderEmail="Organization Email (Optional for linking)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-100 pt-6">
         {/* Qualifications */}
         <div className="space-y-3 md:col-span-1">
            <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">Qualifications</label>
            <div className="flex flex-col gap-2">
              {qualifications.map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleArrayChange('scouting_qualifications', q)}
                  className={`px-3 py-2 rounded-lg text-left text-xs font-bold transition-all ${
                    (data.scouting_qualifications || []).includes(q) 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
         </div>

         {/* Regions & Methodologies */}
         <div className="md:col-span-2 space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">Specialized Regions</label>
              <div className="flex flex-wrap gap-2">
                {regions.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleArrayChange('specialized_regions', r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      (data.specialized_regions || []).includes(r) 
                        ? 'bg-[#b50a0a] text-white shadow-sm' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">Scouting Methodologies</label>
              <div className="flex flex-wrap gap-2">
                {methodologies.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleArrayChange('scouting_methodologies', m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      (data.scouting_methodologies || []).includes(m) 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
         </div>
      </div>

      {/* Past Discoveries */}
      <div className="space-y-4 border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between">
          <div>
             <h3 className="text-lg font-black text-gray-900">Past Discoveries</h3>
             <p className="text-sm text-gray-500 mt-1">List notable players you have scouted and recommended.</p>
          </div>
          <button type="button" onClick={addDiscovery} className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" /> Add Discovery
          </button>
        </div>

        <div className="space-y-4">
          {(data.past_discoveries || []).map((record: any, index: number) => (
            <div key={index} className="p-5 bg-white border border-gray-200 rounded-2xl relative group shadow-sm hover:shadow-md transition-shadow">
              <button type="button" onClick={() => removeDiscovery(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg p-1 z-10 opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Player Name</label>
                   <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={record.playerName} onChange={(e) => updateDiscovery(index, 'playerName', e.target.value)} />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Year Scouted</label>
                   <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={record.year} onChange={(e) => updateDiscovery(index, 'year', e.target.value)} placeholder="e.g. 2021" />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Recommended To (Club/Academy)</label>
                   <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={record.recommendedTo} onChange={(e) => updateDiscovery(index, 'recommendedTo', e.target.value)} />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Current Status / Achievements</label>
                   <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={record.currentStatus} onChange={(e) => updateDiscovery(index, 'currentStatus', e.target.value)} placeholder="e.g. Now plays in Premier League" />
                </div>
              </div>
            </div>
          ))}
          
          {(data.past_discoveries?.length || 0) === 0 && (
            <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
               <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
               <p className="text-sm text-gray-500 font-medium">No discoveries added yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
