'use client';

import { Plus, Trash2 } from 'lucide-react';

export function AgentPortfolioForm({ data, onChange, disabled, isSigned }: { data: any, onChange: (val: any) => void, disabled?: boolean, isSigned?: boolean }) {
  const roles = ['Director', 'Intermediary', 'Scout', 'Legal Advisor'];
  const regions = ['Europe (UEFA)', 'South America (CONMEBOL)', 'North America (CONCACAF)', 'Africa (CAF)', 'Asia (AFC)', 'Global'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Arabic'];

  const handleArrayChange = (field: string, value: string) => {
    const currentArray = data[field] || [];
    if (currentArray.includes(value)) {
      onChange({ ...data, [field]: currentArray.filter((v: string) => v !== value) });
    } else {
      onChange({ ...data, [field]: [...currentArray, value] });
    }
  };

  const addTransfer = () => {
    const transfers = data.notable_transfers || [];
    onChange({
      ...data,
      notable_transfers: [...transfers, { playerName: '', date: '', fromClub: '', toClub: '', fee: '', agentRole: '' }]
    });
  };

  const updateTransfer = (index: number, field: string, value: any) => {
    const transfers = [...(data.notable_transfers || [])];
    transfers[index] = { ...transfers[index], [field]: value };
    onChange({ ...data, notable_transfers: transfers });
  };

  const removeTransfer = (index: number) => {
    const transfers = (data.notable_transfers || []).filter((_: any, i: number) => i !== index);
    onChange({ ...data, notable_transfers: transfers });
  };

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">FIFA/FA License Number</label>
          <input 
             type="text"
             disabled={disabled}
             className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#b50a0a] disabled:opacity-70 disabled:bg-gray-100"
             placeholder="e.g. FA-12345"
             value={data.fa_license_number || ''}
             onChange={(e) => onChange({ ...data, fa_license_number: e.target.value })}
           />
        </div>
        {isSigned !== false && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Agency Role</label>
            <select 
              disabled={disabled}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#b50a0a] disabled:opacity-70 disabled:bg-gray-100"
              value={data.agency_role || ''}
              onChange={(e) => onChange({ ...data, agency_role: e.target.value })}
            >
              <option value="">Select role...</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-6">
         <div className="space-y-3">
            <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">Regions of Operation</label>
            <div className="flex flex-wrap gap-2">
              {regions.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleArrayChange('regions_of_operation', r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    (data.regions_of_operation || []).includes(r) 
                      ? 'bg-[#b50a0a] text-white shadow-sm' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
         </div>
      </div>

      {/* Notable Transfers */}
      <div className="space-y-4 border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between">
          <div>
             <h3 className="text-lg font-black text-gray-900">Notable Transfers</h3>
             <p className="text-sm text-gray-500 mt-1">Highlight key deals you have facilitated.</p>
          </div>
          <button type="button" onClick={addTransfer} className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" /> Add Transfer
          </button>
        </div>

        <div className="space-y-4">
          {(data.notable_transfers || []).map((record: any, index: number) => (
            <div key={index} className="p-5 bg-white border border-gray-200 rounded-2xl relative group shadow-sm hover:shadow-md transition-shadow">
              <button type="button" onClick={() => removeTransfer(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg p-1 z-10 opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Player Name</label>
                   <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#b50a0a] outline-none" value={record.playerName} onChange={(e) => updateTransfer(index, 'playerName', e.target.value)} />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Transfer Date (Year/Month)</label>
                   <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#b50a0a] outline-none" value={record.date} onChange={(e) => updateTransfer(index, 'date', e.target.value)} placeholder="e.g. Aug 2023" />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase block mb-1">From Club</label>
                   <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#b50a0a] outline-none" value={record.fromClub} onChange={(e) => updateTransfer(index, 'fromClub', e.target.value)} />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase block mb-1">To Club</label>
                   <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#b50a0a] outline-none" value={record.toClub} onChange={(e) => updateTransfer(index, 'toClub', e.target.value)} />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Estimated Fee (Optional)</label>
                   <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#b50a0a] outline-none" value={record.fee} onChange={(e) => updateTransfer(index, 'fee', e.target.value)} placeholder="e.g. Undisclosed, €2M" />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Your Role</label>
                   <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#b50a0a] outline-none" value={record.agentRole} onChange={(e) => updateTransfer(index, 'agentRole', e.target.value)} placeholder="e.g. Represented Player" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
