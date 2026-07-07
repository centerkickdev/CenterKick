'use client';

import { useState, useEffect } from 'react';
import { 
  Trophy, Building2, Calendar, Plus, Search, 
  Edit, Trash2, Globe, CheckCircle2, AlertCircle,
  Database, RefreshCw, X, ChevronRight, Activity, MapPin,
  Filter, MoreHorizontal, ArrowUpDown, Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import { 
  getLeagues, addLeague, updateLeague, deleteLeague,
  getClubs, addClub, updateClub, deleteClub,
  getSeasons, addSeason, updateSeason, deleteSeason,
  getCountries, addCountry, updateCountry, deleteCountry,
  seedFootballData
} from '@/app/admin/settings/actions';
import { useToast } from '@/context/ToastContext';
import { FlagIcon } from '@/components/common/FlagIcon';

type TabType = 'countries' | 'leagues' | 'clubs' | 'seasons';

const getSingularLabel = (tab: TabType) => {
  switch (tab) {
    case 'countries': return 'Country';
    case 'leagues': return 'League';
    case 'clubs': return 'Club';
    case 'seasons': return 'Season';
    default: return 'Entry';
  }
};

export default function FootballDataManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('countries');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Record<TabType, Record<string, any>[]>>({ countries: [], leagues: [], clubs: [], seasons: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const toast = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [cRes, lRes, clRes, sRes] = await Promise.all([
        getCountries(),
        getLeagues(),
        getClubs(),
        getSeasons()
      ]);

      setData({
        countries: (cRes.success ? cRes.data ?? [] : []) as Record<string, any>[],
        leagues: (lRes.success ? lRes.data ?? [] : []) as Record<string, any>[],
        clubs: (clRes.success ? clRes.data ?? [] : []) as Record<string, any>[],
        seasons: (sRes.success ? sRes.data ?? [] : []) as Record<string, any>[]
      });
    } catch (error) {
      toast.showToast('Failed to load registry data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

   const handleOpenModal = (item: Record<string, any> | null = null) => {
    setEditingItem(item);
    if (item) {
      setFormData(item);
    } else {
      if (activeTab === 'countries') setFormData({ name: '', code: '', flag_url: '' });
      else if (activeTab === 'leagues') setFormData({ name: '', country_id: '', is_active: true });
      else if (activeTab === 'clubs') setFormData({ name: '', league_id: '', logo_url: '', is_active: true });
      else setFormData({ name: '', is_current: false, sort_order: new Date().getFullYear() });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      let res;
      if (activeTab === 'countries') {
        res = editingItem ? await updateCountry(editingItem.id, formData) : await addCountry(formData);
      } else if (activeTab === 'leagues') {
        res = editingItem ? await updateLeague(editingItem.id, formData) : await addLeague(formData);
      } else if (activeTab === 'clubs') {
        res = editingItem ? await updateClub(editingItem.id, formData) : await addClub(formData);
      } else {
        res = editingItem ? await updateSeason(editingItem.id, formData) : await addSeason(formData);
      }

      if (res?.success) {
        toast.showToast(`Successfully ${editingItem ? 'updated' : 'added'} ${getSingularLabel(activeTab)}`, 'success');
        setIsModalOpen(false);
        fetchAllData();
      } else {
        toast.showToast(res?.error || 'Operation failed', 'error');
      }
    } catch (error) {
      toast.showToast('An unexpected error occurred', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this ${getSingularLabel(activeTab)}?`)) return;
    setIsActionLoading(true);
    try {
      let res;
      if (activeTab === 'countries') res = await deleteCountry(id);
      else if (activeTab === 'leagues') res = await deleteLeague(id);
      else if (activeTab === 'clubs') res = await deleteClub(id);
      else res = await deleteSeason(id);

      if (res?.success) {
        toast.showToast(`Deleted ${getSingularLabel(activeTab)}`, 'success');
        fetchAllData();
      } else {
        toast.showToast(res?.error || 'Delete failed', 'error');
      }
    } catch (error) {
      toast.showToast('An unexpected error occurred', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm('This will seed initial data from constants. Proceed?')) return;
    setIsLoading(true);
    const res = await seedFootballData();
    if (res.success) {
      toast.showToast('Data seeded successfully', 'success');
      fetchAllData();
    } else {
      toast.showToast('Seeding failed', 'error');
    }
    setIsLoading(false);
  };

   const filteredData = (data[activeTab] || []).filter((item: Record<string, any>) => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.countries?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <Database className="w-8 h-8 text-[#b50a0a]" />
            Data <span className="text-[#b50a0a]">Management</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mt-1">Ecosystem constants & historical records management</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSeed}
            className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl text-[10px] font-black tracking-wide hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black tracking-wide hover:bg-[#b50a0a] transition-all flex items-center gap-2 shadow-lg shadow-slate-200 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add New {getSingularLabel(activeTab)}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm w-fit">
        {[
          { id: 'countries', label: 'Countries', icon: Globe },
          { id: 'leagues', label: 'Leagues', icon: Trophy },
          { id: 'clubs', label: 'Clubs', icon: Building2 },
          { id: 'seasons', label: 'Seasons', icon: Calendar },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as TabType); setSearchQuery(''); }}
            className={`flex items-center gap-3 px-6 py-4 rounded-[1.8rem] text-[10px] font-black tracking-wide transition-all ${
 activeTab === tab.id 
 ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.02]' 
 : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
 }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-300'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* List Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Sub-header with Search */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#b50a0a] transition-colors" />
            <input 
              type="text" 
              placeholder={`Search in ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#b50a0a] focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-[10px] font-black tracking-wide text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort: Name
             </div>
             <p className="text-[10px] font-black text-slate-400 tracking-wide">
                <span className="text-slate-900">{filteredData.length}</span> Records Found
             </p>
          </div>
        </div>

        {/* List Table */}
        <div className="overflow-x-auto w-full pb-4 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-[#b50a0a] animate-spin mb-4"></div>
              <p className="text-[10px] font-black text-slate-400 tracking-wide">Synchronizing registry table...</p>
            </div>
          ) : filteredData.length > 0 ? (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/30 border-b border-slate-100">
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 tracking-wide">Identifier</th>
                  {activeTab === 'countries' && (
                    <>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 tracking-wide">ISO Code</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 tracking-wide text-center">Flag</th>
                    </>
                  )}
                  {activeTab === 'leagues' && (
                    <>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 tracking-wide">Country</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 tracking-wide text-center">Status</th>
                    </>
                  )}
                  {activeTab === 'clubs' && (
                    <>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 tracking-wide">League</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 tracking-wide text-center">Logo</th>
                    </>
                  )}
                  {activeTab === 'seasons' && (
                    <>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 tracking-wide">Sort order</th>
                      <th className="px-6 py-3 text-[10px] font-black text-slate-400 tracking-wide text-center">Current</th>
                    </>
                  )}
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((item: Record<string, any>) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-[#b50a0a] group-hover:bg-white transition-all">
                          {activeTab === 'countries' ? <Globe className="w-4 h-4" /> : 
                           activeTab === 'leagues' ? <Trophy className="w-4 h-4" /> : 
                           activeTab === 'clubs' ? <Building2 className="w-4 h-4" /> : 
                           <Calendar className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-black text-slate-900 tracking-tight">{item.name}</span>
                      </div>
                    </td>

                    {activeTab === 'countries' && (
                      <>
                        <td className="px-6 py-3.5">
                          <code className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 tracking-wide">
                            {item.code || 'NA'}
                          </code>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <div className="flex justify-center">
                            <FlagIcon country={item.name} className="w-8 h-6 rounded shadow-sm border border-slate-100" />
                          </div>
                        </td>
                      </>
                    )}

                    {activeTab === 'leagues' && (
                      <>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                             <FlagIcon country={item.countries?.name} className="w-5 h-4 rounded-sm" />
                             <span className="text-[10px] font-bold text-slate-500 tracking-wide">{item.countries?.name || 'International'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                           <span className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black tracking-wide ${item.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                             {item.is_active ? 'Active' : 'Archived'}
                           </span>
                        </td>
                      </>
                    )}

                    {activeTab === 'clubs' && (
                      <>
                        <td className="px-6 py-3.5">
                           <span className="text-[10px] font-bold text-slate-500 tracking-wide">{item.leagues?.name || 'Independent'}</span>
                        </td>
                         <td className="px-6 py-3.5 text-center">
                          <div className="flex justify-center">
                            {item.logo_url ? (
                               <div className="relative w-8 h-8">
                                 <Image src={item.logo_url} alt={item.name} fill className="object-contain" />
                               </div>
                            ) : (
                               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-300">
                                  <Building2 className="w-4 h-4" />
                               </div>
                            )}
                          </div>
                        </td>
                      </>
                    )}

                    {activeTab === 'seasons' && (
                      <>
                        <td className="px-6 py-3.5 text-center">
                           <span className="text-sm font-bold text-slate-400">{item.sort_order}</span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <div className="flex justify-center">
                             {item.is_current ? (
                               <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                               </div>
                             ) : (
                               <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                                  <X className="w-3 h-3" />
                               </div>
                             )}
                          </div>
                        </td>
                      </>
                    )}

                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleOpenModal(item)} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                            <Edit className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDelete(item.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 text-center">
               <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
                  <Search className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-black text-slate-900 tracking-tighter">Entry Not Found</h3>
               <p className="text-[11px] font-bold text-slate-400 tracking-[0.2em] mt-2 max-w-full max-w-[300px] leading-relaxed">The requested data point was not found in the {activeTab} registry.</p>
               <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-8 text-[10px] font-black text-[#b50a0a] tracking-wide border-b-2 border-[#b50a0a]/20 hover:border-[#b50a0a] transition-all"
               >
                  Clear Search Filters
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-black tracking-tighter flex items-center gap-3">
                  {editingItem ? <Edit className="w-6 h-6 border-2 border-white/20 p-1.5 rounded-lg" /> : <Plus className="w-6 h-6 border-2 border-white/20 p-1.5 rounded-lg" />}
                  {editingItem ? 'Update' : 'Register'} {getSingularLabel(activeTab)}
                </h2>
                <p className="text-[8px] font-black text-white/40 tracking-[0.4em] mt-1">Blockchain-grade Registry Node</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-6 overflow-y-auto">
              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-wide pl-1">Display Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] outline-none transition-all shadow-inner"
                    placeholder={`Registry name for ${getSingularLabel(activeTab)}...`}
                  />
                </div>

                {activeTab === 'countries' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 tracking-wide pl-1">Country ISO-2 Code</label>
                    <input 
                      type="text" 
                      maxLength={2}
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] outline-none transition-all shadow-inner"
                      placeholder="e.g. GB, NG, ES"
                    />
                  </div>
                )}

                {activeTab === 'leagues' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 tracking-wide pl-1">Assigned Sovereignty</label>
                    <select 
                      required
                      value={formData.country_id || ''}
                      onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] outline-none transition-all shadow-inner"
                    >
                       <option value="">Select Country</option>
                      {data.countries.map((c: Record<string, any>) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === 'clubs' && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 tracking-wide pl-1">Parent League</label>
                      <select 
                        required
                        value={formData.league_id || ''}
                        onChange={(e) => setFormData({ ...formData, league_id: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] outline-none transition-all shadow-inner"
                      >
                         <option value="">Select League</option>
                        {data.leagues.map((l: Record<string, any>) => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 tracking-wide pl-1">Logo Identity URL</label>
                      <div className="relative">
                         <input 
                           type="text" 
                           value={formData.logo_url || ''}
                           onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                           className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] outline-none transition-all shadow-inner pl-14"
                           placeholder="https://..."
                         />
                         <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'seasons' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 tracking-wide pl-1">Temporal Sort Index</label>
                      <input 
                        type="number" 
                        value={formData.sort_order || ''}
                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                        className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#b50a0a] outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div className="flex items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dotted border-slate-200 p-4 mt-6">
                      <label className="flex items-center gap-4 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={formData.is_current || false}
                          onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
                          className="w-6 h-6 rounded-lg border-slate-300 text-[#b50a0a] focus:ring-[#b50a0a] transition-all"
                        />
                        <span className="text-[10px] font-black text-slate-500 tracking-wide group-hover:text-slate-900 transition-colors">Current Active Season</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-10 border-t border-slate-50 shrink-0">
                <button 
                  type="submit" 
                  disabled={isActionLoading}
                  className="flex-1 px-10 py-5 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black tracking-[0.3em] hover:bg-[#b50a0a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-slate-200 group"
                >
                  {isActionLoading ? 'Saving Registry...' : 'Commit to Registry'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-10 py-5 bg-white text-slate-400 border-2 border-slate-100 rounded-[2rem] text-[10px] font-black tracking-wide hover:bg-slate-50 transition-all font-bold"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
