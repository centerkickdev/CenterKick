'use client';

import { Plus, Trash2, Trophy } from 'lucide-react';

import { SearchableCombobox } from '@/components/common/SearchableCombobox';

export function CoachCareerForm({ data, onChange, achievements, onAchievementsChange, disabled, clubsList = [], leaguesList = [], seasonsList = [] }: { data: any, onChange: (val: any) => void, achievements?: any[], onAchievementsChange?: (val: any[]) => void, disabled?: boolean, clubsList?: any[], leaguesList?: any[], seasonsList?: any[] }) {
  const licenses = ['UEFA Pro', 'UEFA A', 'UEFA B', 'UEFA C', 'AFC Pro', 'AFC A', 'CONCACAF Pro', 'National Badge', 'Other(s)'];
  const specializations = ['Youth Development', 'Tactical Analysis', 'Physical Conditioning', 'Goalkeeping', 'Set Pieces', 'Data Analytics', 'Other(s)'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Arabic', 'Chinese', 'Other(s)'];
  const positions = ['Head Coach', 'Assistant Coach', 'Goalkeeper Coach', 'Academy Director', 'Fitness Coach', 'Free Agent'];
  const formations = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '3-4-3', '5-3-2', '4-1-4-1', '4-3-2-1'];

  const renderArrayFieldWithOthers = (
    label: string,
    field: string,
    predefinedList: string[],
    buttonColorClass: string,
    placeholderText: string
  ) => {
    const currentItems: string[] = data[field] || [];
    const standardItems = predefinedList.filter(item => item !== 'Other(s)');
    const customItems = currentItems.filter(item => item !== 'Other(s)' && !standardItems.includes(item));
    const isOthersSelected = currentItems.includes('Other(s)') || customItems.length > 0;

    const toggleStandardItem = (item: string) => {
      if (currentItems.includes(item)) {
        onChange({ ...data, [field]: currentItems.filter((v: string) => v !== item) });
      } else {
        onChange({ ...data, [field]: [...currentItems, item] });
      }
    };

    const toggleOthers = () => {
      if (isOthersSelected) {
        onChange({ ...data, [field]: currentItems.filter((v: string) => standardItems.includes(v)) });
      } else {
        onChange({ ...data, [field]: [...currentItems, 'Other(s)'] });
      }
    };

    const handleCustomTextChange = (text: string) => {
      const parsedCustom = text.split(',').map(s => s.trim()).filter(Boolean);
      const selectedStandard = currentItems.filter(v => standardItems.includes(v));
      const newArray = Array.from(new Set([...selectedStandard, 'Other(s)', ...parsedCustom]));
      onChange({ ...data, [field]: newArray });
    };

    const customTextValue = customItems.join(', ');

    return (
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">{label}</label>
        <div className="flex flex-wrap gap-2">
          {standardItems.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => toggleStandardItem(item)}
              disabled={disabled}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                currentItems.includes(item)
                  ? buttonColorClass
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            onClick={toggleOthers}
            disabled={disabled}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              isOthersSelected
                ? buttonColorClass
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Other(s)
          </button>
        </div>
        {isOthersSelected && (
          <div className="mt-2 animate-in fade-in duration-200">
            <input
              type="text"
              disabled={disabled}
              defaultValue={customTextValue}
              onChange={(e) => handleCustomTextChange(e.target.value)}
              placeholder={placeholderText}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:border-[#b50a0a] focus:ring-1 focus:ring-[#b50a0a] outline-none"
            />
            <p className="text-[11px] text-gray-400 mt-1 ml-1">Type multiple options separated by commas (e.g. Option 1, Option 2)</p>
          </div>
        )}
      </div>
    );
  };

  const handleArrayChange = (field: string, value: string) => {
    const currentArray = data[field] || [];
    if (currentArray.includes(value)) {
      onChange({ ...data, [field]: currentArray.filter((v: string) => v !== value) });
    } else {
      onChange({ ...data, [field]: [...currentArray, value] });
    }
  };

  const addManagerialRecord = () => {
    const history = data.managerial_history || [];
    onChange({
      ...data,
      managerial_history: [...history, { club: '', role: '', startDate: '', endDate: '', wins: 0, draws: 0, losses: 0 }]
    });
  };

  const updateManagerialRecord = (index: number, field: string, value: any) => {
    const history = [...(data.managerial_history || [])];
    history[index] = { ...history[index], [field]: value };
    onChange({ ...data, managerial_history: history });
  };

  const removeManagerialRecord = (index: number) => {
    const history = (data.managerial_history || []).filter((_: any, i: number) => i !== index);
    onChange({ ...data, managerial_history: history });
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
      {/* Basic Dropdowns/Multi-selects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Current Position</label>
          <select 
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#b50a0a] focus:ring-1 focus:ring-[#b50a0a]"
            value={(data.current_position && data.current_position[0]) || ''}
            onChange={(e) => onChange({ ...data, current_position: [e.target.value] })}
            disabled={disabled}
          >
            <option value="">Select current status...</option>
            {positions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        

        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Primary Formation</label>
          <SearchableCombobox
             disabled={disabled}
             options={formations.map(f => ({ id: f, name: f }))}
             value={data.formation || ''}
             valueField="name"
             displayField="name"
             onChange={(val, isNew, newName) => onChange({ ...data, formation: isNew ? newName : val })}
             placeholder="Select or enter formation..."
             className="w-full"
          />
        </div>
      </div>

      {/* Coaching Licenses */}
      <div className="border-t border-gray-100 pt-6">
        {renderArrayFieldWithOthers(
          'Coaching Licenses',
          'coaching_licenses',
          licenses,
          'bg-blue-600 text-white shadow-md shadow-blue-600/20',
          'Type custom licenses (e.g. CAF A, USSF Pro)...'
        )}
      </div>

      {/* Specializations & Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-6">
        {renderArrayFieldWithOthers(
          'Specializations',
          'specializations',
          specializations,
          'bg-amber-500 text-white shadow-sm',
          'Type custom specializations (e.g. Set Pieces, Youth Scouting)...'
        )}
        {renderArrayFieldWithOthers(
          'Languages Spoken',
          'languages_spoken',
          languages,
          'bg-emerald-600 text-white shadow-sm',
          'Type custom languages (e.g. Swahili, Yoruba, Igbo)...'
        )}
      </div>

      {/* Managerial History Dynamic Array */}
      <div className="space-y-4 border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between">
          <div>
             <h3 className="text-lg font-black text-gray-900">Managerial History</h3>
             <p className="text-sm text-gray-500 mt-1">Add your previous coaching roles and records.</p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={addManagerialRecord}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Role
            </button>
          )}
        </div>

        <div className="space-y-4">
          {(data.managerial_history || []).map((record: any, index: number) => (
            <div key={index} className="p-5 bg-white border border-gray-200 rounded-2xl relative group shadow-sm hover:shadow-md transition-shadow">
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeManagerialRecord(index)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg p-1 z-10 opacity-0 group-hover:opacity-100"
                  title="Remove Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Club/Organization</label>
                   <SearchableCombobox
                     disabled={disabled}
                     options={clubsList}
                     value={record.club || ''}
                     valueField="name"
                     displayField="name"
                     onChange={(val, isNew, newName) => updateManagerialRecord(index, 'club', isNew ? newName : val)}
                     placeholder="e.g. Manchester United"
                   />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Role Held</label>
                   <input type="text" disabled={disabled} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#b50a0a] outline-none" value={record.role} onChange={(e) => updateManagerialRecord(index, 'role', e.target.value)} placeholder="e.g. Assistant Coach" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div>
                     <label className="text-xs font-bold text-gray-400 uppercase block mb-1">From (Year)</label>
                     <input type="text" disabled={disabled} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#b50a0a] outline-none" value={record.startDate} onChange={(e) => updateManagerialRecord(index, 'startDate', e.target.value)} placeholder="2020" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-gray-400 uppercase block mb-1">To (Year/Present)</label>
                     <input type="text" disabled={disabled} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#b50a0a] outline-none" value={record.endDate} onChange={(e) => updateManagerialRecord(index, 'endDate', e.target.value)} placeholder="Present" />
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                   <div>
                     <label className="text-xs font-bold text-green-600 uppercase block mb-1">Wins</label>
                     <input type="number" min="0" disabled={disabled} className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-green-50/30 focus:border-[#b50a0a] outline-none" value={record.wins} onChange={(e) => updateManagerialRecord(index, 'wins', parseInt(e.target.value) || 0)} />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-amber-600 uppercase block mb-1">Draws</label>
                     <input type="number" min="0" disabled={disabled} className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-amber-50/30 focus:border-[#b50a0a] outline-none" value={record.draws} onChange={(e) => updateManagerialRecord(index, 'draws', parseInt(e.target.value) || 0)} />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-red-600 uppercase block mb-1">Losses</label>
                     <input type="number" min="0" disabled={disabled} className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-red-50/30 focus:border-[#b50a0a] outline-none" value={record.losses} onChange={(e) => updateManagerialRecord(index, 'losses', parseInt(e.target.value) || 0)} />
                   </div>
                </div>
              </div>
            </div>
          ))}
          
          {(data.managerial_history?.length || 0) === 0 && (
            <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
               <Trophy className="w-8 h-8 text-gray-300 mx-auto mb-2" />
               <p className="text-sm text-gray-500 font-medium">No managerial history added yet.</p>
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
                      <input type="text" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#b50a0a] focus:ring-1 focus:ring-[#b50a0a] outline-none text-gray-900 disabled:bg-gray-50 disabled:text-gray-500" value={title} onChange={(e) => updateAchievement(index, 'title', e.target.value)} placeholder="e.g. Manager of the Year" disabled={disabled} />
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
