'use client';

import { Plus, Trash2, Building, Trophy, Users, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { HybridLinkInput } from './HybridLinkInput';

export function OrganizationDetailsForm({ data, onChange, onUploadImage }: { data: any, onChange: (val: any) => void, disabled?: boolean, onUploadImage?: (file: File) => Promise<string | null> }) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const orgTypes = ['Pro Club', 'Semi-Pro Club', 'Academy', 'Agency', 'Scouting Network', 'Football Association'];

  const addPersonnel = () => {
    const personnel = data.key_personnel || [];
    onChange({
      ...data,
      key_personnel: [...personnel, { name: '', email: '', role: '' }]
    });
  };

  const updatePersonnelLink = (index: number, linkData: any) => {
    const personnel = [...(data.key_personnel || [])];
    personnel[index] = { ...personnel[index], ...linkData };
    onChange({ ...data, key_personnel: personnel });
  };
  
  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;
    setUploadingIndex(index);
    try {
      const url = await onUploadImage(file);
      if (url) {
        const personnel = [...(data.key_personnel || [])];
        personnel[index] = { ...personnel[index], image_url: url };
        onChange({ ...data, key_personnel: personnel });
      }
    } finally {
      setUploadingIndex(null);
    }
  };

  const updatePersonnelRole = (index: number, role: string) => {
    const personnel = [...(data.key_personnel || [])];
    personnel[index] = { ...personnel[index], role };
    onChange({ ...data, key_personnel: personnel });
  };

  const removePersonnel = (index: number) => {
    const personnel = (data.key_personnel || []).filter((_: any, i: number) => i !== index);
    onChange({ ...data, key_personnel: personnel });
  };

  const addHonor = () => {
    const honors = data.organization_honors || [];
    onChange({
      ...data,
      organization_honors: [...honors, { title: '', year: '', category: 'Trophy' }]
    });
  };

  const updateHonor = (index: number, field: string, value: any) => {
    const honors = [...(data.organization_honors || [])];
    honors[index] = { ...honors[index], [field]: value };
    onChange({ ...data, organization_honors: honors });
  };

  const removeHonor = (index: number) => {
    const honors = (data.organization_honors || []).filter((_: any, i: number) => i !== index);
    onChange({ ...data, organization_honors: honors });
  };

  const updateFacilities = (field: string, value: string) => {
    const facilities = data.facilities_infrastructure || {};
    onChange({ ...data, facilities_infrastructure: { ...facilities, [field]: value } });
  };

  return (
    <div className="space-y-8">
      {/* Basic Org Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Organization Type</label>
          <select 
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#b50a0a]"
            value={data.organization_type || ''}
            onChange={(e) => onChange({ ...data, organization_type: e.target.value })}
          >
            <option value="">Select type...</option>
            {orgTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-3">
           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Year Established</label>
           <input 
             type="text"
             pattern="^[0-9]{4}$"
             maxLength={4}
             className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#b50a0a]"
             placeholder="e.g. 1995"
             value={data.year_established || ''}
             onChange={(e) => {
               const val = e.target.value.replace(/\D/g, '');
               if (val.length === 4) {
                 const currentYear = new Date().getFullYear();
                 if (parseInt(val) > currentYear) return;
               }
               onChange({ ...data, year_established: val });
             }}
           />
        </div>
      </div>

      {/* Facilities & Infrastructure */}
      <div className="space-y-4 border-t border-gray-100 pt-8">
        <div>
           <h3 className="text-lg font-black text-gray-900 flex items-center gap-2"><Building className="w-5 h-5 text-[#b50a0a]"/> Facilities & Infrastructure</h3>
           <p className="text-sm text-gray-500 mt-1">Provide details about your training grounds, stadium, and youth academy.</p>
        </div>
        <div className="flex flex-col gap-6">
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
             <label className="text-xs font-bold text-gray-900 tracking-wide block">Training Ground Details</label>
             <textarea 
               className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none min-h-[100px]" 
               placeholder="e.g. State-of-the-art facility with 3 full-size pitches." 
               value={data.facilities_infrastructure?.training_ground || ''} 
               onChange={(e) => updateFacilities('training_ground', e.target.value)} 
             />
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
             <label className="text-xs font-bold text-gray-900 tracking-wide block">Stadium Capacity</label>
             <input 
               type="text" 
               className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none" 
               placeholder="e.g. 5,000" 
               value={data.facilities_infrastructure?.stadium_capacity || ''} 
               onChange={(e) => updateFacilities('stadium_capacity', e.target.value)} 
             />
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
             <label className="text-xs font-bold text-gray-900 tracking-wide block">Youth Academy Level</label>
             <input 
               type="text" 
               className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none" 
               placeholder="e.g. Category 1" 
               value={data.facilities_infrastructure?.academy_level || ''} 
               onChange={(e) => updateFacilities('academy_level', e.target.value)} 
             />
           </div>
        </div>
      </div>

      {/* Key Personnel */}
      <div className="space-y-4 border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between">
          <div>
             <h3 className="text-lg font-black text-gray-900 flex items-center gap-2"><Users className="w-5 h-5 text-[#b50a0a]"/> Key Personnel</h3>
             <p className="text-sm text-gray-500 mt-1">List your Director of Football, Head Coach, Head Scout, etc.</p>
          </div>
          <button type="button" onClick={addPersonnel} className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" /> Add Personnel
          </button>
        </div>

        <div className="space-y-4">
          {(data.key_personnel || []).map((person: any, index: number) => (
            <div key={index} className="relative group p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
              <button
                type="button"
                onClick={() => removePersonnel(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-full p-1.5 z-10 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="mb-4">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Role/Title in Organization</label>
                 <input 
                   type="text" 
                   className="w-full md:w-1/2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-[#b50a0a]" 
                   placeholder="e.g. Director of Football" 
                   value={person.role || ''} 
                   onChange={(e) => updatePersonnelRole(index, e.target.value)} 
                 />
              </div>
              
              <HybridLinkInput 
                 value={person} 
                 onChange={(val) => updatePersonnelLink(index, val)} 
                 placeholderName="Person's Name"
                 placeholderEmail="Email (For linking profile)"
              />
            </div>
          ))}
          {(data.key_personnel?.length || 0) === 0 && (
            <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
               <p className="text-sm text-gray-500 font-medium">No personnel added yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Organization Honors */}
      <div className="space-y-4 border-t border-gray-100 pt-8">
        <div className="flex items-center justify-between">
          <div>
             <h3 className="text-lg font-black text-gray-900 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500"/> Achievements & Honors</h3>
             <p className="text-sm text-gray-500 mt-1">List notable cups, leagues won, or academy milestones.</p>
          </div>
          <button type="button" onClick={addHonor} className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" /> Add Honor
          </button>
        </div>

        <div className="space-y-4">
          {(data.organization_honors || []).map((record: any, index: number) => (
            <div key={index} className="p-4 bg-white border border-gray-200 rounded-2xl relative group shadow-sm flex items-end gap-4">
              <div className="flex-1">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Title</label>
                 <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:border-[#b50a0a] outline-none" value={record.title} onChange={(e) => updateHonor(index, 'title', e.target.value)} placeholder="e.g. U18 Premier League" />
              </div>
              <div className="w-32">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Year</label>
                 <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:border-[#b50a0a] outline-none" value={record.year} onChange={(e) => updateHonor(index, 'year', e.target.value)} placeholder="e.g. 2023" />
              </div>
              <div className="w-48">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Category</label>
                 <select className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:border-[#b50a0a] outline-none" value={record.category} onChange={(e) => updateHonor(index, 'category', e.target.value)}>
                   <option value="Trophy">Trophy / Cup</option>
                   <option value="League">League Title</option>
                   <option value="Academy Milestone">Academy Milestone</option>
                   <option value="Other">Other</option>
                 </select>
              </div>
              <button type="button" onClick={() => removeHonor(index)} className="px-3 py-2 text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
