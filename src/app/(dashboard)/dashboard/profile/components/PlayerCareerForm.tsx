'use client';

import { Plus, Trash2, Activity } from 'lucide-react';

export function PlayerCareerForm({ data, onChange }: { data: any, onChange: (val: any) => void }) {
  
  const addTransfer = () => {
    const transfers = data.transfer_history || [];
    onChange({
      ...data,
      transfer_history: [...transfers, { club: '', fee: '', date: '', type: 'Permanent' }]
    });
  };

  const updateTransfer = (index: number, field: string, value: any) => {
    const transfers = [...(data.transfer_history || [])];
    transfers[index] = { ...transfers[index], [field]: value };
    onChange({ ...data, transfer_history: transfers });
  };

  const removeTransfer = (index: number) => {
    const transfers = (data.transfer_history || []).filter((_: any, i: number) => i !== index);
    onChange({ ...data, transfer_history: transfers });
  };

  const updatePhysical = (field: string, value: string) => {
    const attrs = data.physical_technical_attributes || {};
    onChange({ ...data, physical_technical_attributes: { ...attrs, [field]: value } });
  };

  return (
    <div className="space-y-8">
      {/* Physical & Technical Attributes */}
      <div className="space-y-4">
        <div>
           <h3 className="text-lg font-black text-gray-900">Physical & Technical Attributes</h3>
           <p className="text-sm text-gray-500 mt-1">Provide your current ratings or tags for key attributes.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
           <div>
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Pace / Speed</label>
             <input 
               type="text" 
               className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#b50a0a]" 
               placeholder="e.g. High, 85/100, etc." 
               value={data.physical_technical_attributes?.pace || ''} 
               onChange={(e) => updatePhysical('pace', e.target.value)} 
             />
           </div>
           <div>
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Stamina</label>
             <input 
               type="text" 
               className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#b50a0a]" 
               placeholder="e.g. Excellent, 90 mins" 
               value={data.physical_technical_attributes?.stamina || ''} 
               onChange={(e) => updatePhysical('stamina', e.target.value)} 
             />
           </div>
           <div>
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Passing Accuracy</label>
             <input 
               type="text" 
               className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#b50a0a]" 
               placeholder="e.g. 88%" 
               value={data.physical_technical_attributes?.passing || ''} 
               onChange={(e) => updatePhysical('passing', e.target.value)} 
             />
           </div>
           <div>
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Injury History</label>
             <input 
               type="text" 
               className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#b50a0a]" 
               placeholder="e.g. None, Minor Ankle Sprain (2022)" 
               value={data.physical_technical_attributes?.injury_history || ''} 
               onChange={(e) => updatePhysical('injury_history', e.target.value)} 
             />
           </div>
        </div>
      </div>

      {/* Transfer History */}
      <div className="space-y-4 border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between">
          <div>
             <h3 className="text-lg font-black text-gray-900">Transfer History</h3>
             <p className="text-sm text-gray-500 mt-1">List your previous clubs and transfer details.</p>
          </div>
          <button type="button" onClick={addTransfer} className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" /> Add Transfer
          </button>
        </div>

        <div className="space-y-4">
          {(data.transfer_history || []).map((record: any, index: number) => (
            <div key={index} className="p-5 bg-white border border-gray-200 rounded-2xl relative group shadow-sm hover:shadow-md transition-shadow">
              <button type="button" onClick={() => removeTransfer(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg p-1 z-10 opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Previous Club</label>
                   <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={record.club} onChange={(e) => updateTransfer(index, 'club', e.target.value)} placeholder="e.g. Real Madrid" />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Transfer Date (Year)</label>
                   <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={record.date} onChange={(e) => updateTransfer(index, 'date', e.target.value)} placeholder="e.g. 2023" />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Transfer Type</label>
                   <select className="w-full px-3 py-2 border rounded-lg text-sm bg-white" value={record.type} onChange={(e) => updateTransfer(index, 'type', e.target.value)}>
                     <option value="Permanent">Permanent</option>
                     <option value="Loan">Loan</option>
                     <option value="Free Transfer">Free Transfer</option>
                   </select>
                </div>
                <div className="md:col-span-2 lg:col-span-4">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Transfer Fee (Optional)</label>
                   <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={record.fee} onChange={(e) => updateTransfer(index, 'fee', e.target.value)} placeholder="e.g. €50M, Undisclosed" />
                </div>
              </div>
            </div>
          ))}
          
          {(data.transfer_history?.length || 0) === 0 && (
            <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
               <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
               <p className="text-sm text-gray-500 font-medium">No transfer history added.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
