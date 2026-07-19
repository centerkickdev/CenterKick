'use client';

import { Plus, Trash2, Activity, Trophy } from 'lucide-react';

import { SearchableCombobox } from '@/components/common/SearchableCombobox';

export function PlayerCareerForm({ data, onChange, achievements, onAchievementsChange, disabled, clubsList = [], leaguesList = [], seasonsList = [] }: { data: any, onChange: (val: any) => void, achievements?: any[], onAchievementsChange?: (val: any[]) => void, disabled?: boolean, clubsList?: any[], leaguesList?: any[], seasonsList?: any[] }) {
  
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

  const addAchievement = () => {
    if (!onAchievementsChange) return;
    const current = achievements || [];
    onAchievementsChange([...current, { title: '', year: '', category: 'Individual' }]);
  };

  const updateAchievement = (index: number, field: string, value: any) => {
    if (!onAchievementsChange) return;
    const current = [...(achievements || [])];
    if (typeof current[index] === 'string') {
      current[index] = { title: current[index], year: '', category: 'Individual' };
    }
    current[index] = { ...current[index], [field]: value };
    onAchievementsChange(current);
  };

  const removeAchievement = (index: number) => {
    if (!onAchievementsChange) return;
    const current = (achievements || []).filter((_: any, i: number) => i !== index);
    onAchievementsChange(current);
  };

  return (
    <div className="space-y-8">
      {/* Physical & Technical Attributes */}
      {false && (
      <div className="space-y-4">
        <div>
           <h3 className="text-lg font-black text-gray-900">Physical & Technical Attributes</h3>
           <p className="text-sm text-gray-500 mt-1">Provide your current ratings or tags for key attributes.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
           <div>
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Pace / Speed</label>
             <input 
               type="text" 
               className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#b50a0a]" 
               placeholder="e.g. High, 85/100, etc." 
               value={data.physical_technical_attributes?.pace || ''} 
               onChange={(e) => updatePhysical('pace', e.target.value)} 
               disabled={disabled}
             />
           </div>
           <div>
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Stamina</label>
             <input 
               type="text" 
               className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#b50a0a]" 
               placeholder="e.g. Excellent, 90 mins" 
               value={data.physical_technical_attributes?.stamina || ''} 
               onChange={(e) => updatePhysical('stamina', e.target.value)} 
               disabled={disabled}
             />
           </div>
           <div>
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Passing Accuracy</label>
             <input 
               type="text" 
               className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#b50a0a]" 
               placeholder="e.g. 88%" 
               value={data.physical_technical_attributes?.passing || ''} 
               onChange={(e) => updatePhysical('passing', e.target.value)} 
               disabled={disabled}
             />
           </div>
           <div>
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Injury History</label>
             <input 
               type="text" 
               className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#b50a0a]" 
               placeholder="e.g. None, Minor Ankle Sprain (2022)" 
               value={data.physical_technical_attributes?.injury_history || ''} 
               onChange={(e) => updatePhysical('injury_history', e.target.value)} 
               disabled={disabled}
             />
           </div>
        </div>
      </div>
      )}

      {/* Transfer History */}
      <div className="space-y-4 border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between">
          <div>
             <h3 className="text-lg font-black text-gray-900">Transfer History</h3>
             <p className="text-sm text-gray-500 mt-1">List your previous clubs and transfer details.</p>
          </div>
          {!disabled && (
            <button type="button" onClick={addTransfer} className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-colors">
              <Plus className="w-4 h-4" /> Add Transfer
            </button>
          )}
        </div>

        <div className="space-y-4">
          {(data.transfer_history || []).map((record: any, index: number) => (
            <div key={index} className="p-5 bg-white border border-gray-200 rounded-2xl relative group shadow-sm hover:shadow-md transition-shadow">
              {!disabled && (
                <button type="button" onClick={() => removeTransfer(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg p-1 z-10 opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Previous Club</label>
                   <SearchableCombobox
                     disabled={disabled}
                     options={clubsList}
                     value={record.club || ''}
                     valueField="name"
                     displayField="name"
                     onChange={(val, isNew, newName) => updateTransfer(index, 'club', isNew ? newName : val)}
                     placeholder="e.g. Real Madrid"
                   />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                     Transfer Date (Season) <span className="text-red-500">*</span>
                   </label>
                   <SearchableCombobox
                     disabled={disabled}
                     options={seasonsList}
                     value={record.date || ''}
                     valueField="name"
                     displayField="name"
                     onChange={(val, isNew, newName) => updateTransfer(index, 'date', isNew ? newName : val)}
                     placeholder="Select Season"
                   />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                     Transfer Type {!!record.club && <span className="text-red-500">*</span>}
                   </label>
                   <select required={!!record.club} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#b50a0a] focus:ring-1 focus:ring-[#b50a0a] outline-none text-gray-900 disabled:bg-gray-50 disabled:text-gray-500" value={record.type} onChange={(e) => updateTransfer(index, 'type', e.target.value)} disabled={disabled}>
                     <option value="Permanent">Permanent</option>
                     <option value="Loan">Loan</option>
                     <option value="Free Transfer">Free Transfer</option>
                   </select>
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Transfer Fee (Optional)</label>
                   <input type="text" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#b50a0a] focus:ring-1 focus:ring-[#b50a0a] outline-none text-gray-900 disabled:bg-gray-50 disabled:text-gray-500" value={record.fee} onChange={(e) => updateTransfer(index, 'fee', e.target.value)} placeholder="e.g. €50M, Undisclosed" disabled={disabled} />
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

      {/* Awards & Honours */}
      {achievements !== undefined && onAchievementsChange && (
        <div className="space-y-4 border-t border-gray-100 pt-8">
          <div className="flex items-center justify-between">
            <div>
               <h3 className="text-lg font-black text-gray-900 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Awards & Honours</h3>
               <p className="text-sm text-gray-500 mt-1">Capture your individual, club, and country awards.</p>
            </div>
            {!disabled && (
              <button type="button" onClick={addAchievement} className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-colors">
                <Plus className="w-4 h-4" /> Add Honour
              </button>
            )}
          </div>

          <div className="space-y-4">
            {(achievements || []).map((record: any, index: number) => {
              const isString = typeof record === 'string';
              const title = isString ? record : record.title;
              const year = isString ? '' : (record.year || '');
              const category = isString ? 'Individual' : (record.category || 'Individual');

              return (
                <div key={index} className="p-5 bg-white border border-gray-200 rounded-2xl relative group shadow-sm hover:shadow-md transition-shadow">
                  {!disabled && (
                    <button type="button" onClick={() => removeAchievement(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg p-1 z-10 opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Honour Title</label>
                      <input type="text" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#b50a0a] focus:ring-1 focus:ring-[#b50a0a] outline-none text-gray-900 disabled:bg-gray-50 disabled:text-gray-500" value={title} onChange={(e) => updateAchievement(index, 'title', e.target.value)} placeholder="e.g. Player of the Year" disabled={disabled} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Year {!!title && <span className="text-red-500">*</span>}
                      </label>
                      <input required={!!title} type="text" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#b50a0a] focus:ring-1 focus:ring-[#b50a0a] outline-none text-gray-900 disabled:bg-gray-50 disabled:text-gray-500" value={year} onChange={(e) => updateAchievement(index, 'year', e.target.value)} placeholder="e.g. 2023" disabled={disabled} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Category {!!title && <span className="text-red-500">*</span>}
                      </label>
                      <select required={!!title} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#b50a0a] focus:ring-1 focus:ring-[#b50a0a] outline-none text-gray-900 disabled:bg-gray-50 disabled:text-gray-500" value={category} onChange={(e) => updateAchievement(index, 'category', e.target.value)} disabled={disabled}>
                        <option value="Individual">Individual</option>
                        <option value="Club">Club</option>
                        <option value="Country">Country</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {(achievements?.length || 0) === 0 && (
              <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                <Trophy className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">No honours recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
