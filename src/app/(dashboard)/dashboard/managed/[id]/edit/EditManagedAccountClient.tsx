'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { ChevronLeft, Save } from 'lucide-react';
import { RichTextEditor } from '@/components/cms/RichTextEditor';

export default function EditManagedAccountClient({ targetProfile, role }: { targetProfile: any, role: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    first_name: targetProfile.first_name || '',
    last_name: targetProfile.last_name || '',
    bio: targetProfile.bio || '',
    position: targetProfile.position || 'Striker',
    market_value: targetProfile.market_value || '',
    height_cm: targetProfile.height_cm || '',
    weight_kg: targetProfile.weight_kg || '',
    foot: targetProfile.foot || 'Right',
    jersey_number: targetProfile.jersey_number || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const isAdminOrOps = ['superadmin', 'admin', 'operations'].includes(role);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBioChange = (val: string) => {
    setFormData(prev => ({ ...prev, bio: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const changes: Record<string, { old: any; new: any }> = {};
    const fields = ['first_name', 'last_name', 'bio', 'position', 'market_value', 'height_cm', 'weight_kg', 'foot', 'jersey_number'];

    fields.forEach(f => {
      const newVal = formData[f as keyof typeof formData];
      const oldVal = targetProfile[f];
      if (newVal !== null && newVal !== undefined && String(newVal) !== String(oldVal || '')) {
        changes[f] = { old: oldVal, new: newVal };
      }
    });

    if (Object.keys(changes).length === 0) {
      showToast('No changes detected.', 'success');
      setIsSaving(false);
      return;
    }

    // Call action
    // wait I need to import requestProfileEdit from profile/actions
    const { requestProfileEdit } = await import('../../../profile/actions');
    const res = await requestProfileEdit(targetProfile.id, changes);
    
    if (res.error) {
      showToast(res.error, 'error');
    } else {
      showToast('Edits submitted to Admin for approval.', 'success');
      router.push('/dashboard/managed');
    }
    setIsSaving(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <button 
              onClick={() => router.push('/dashboard/managed')}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Managed Accounts
            </button>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              Request Edits for {targetProfile.first_name} {targetProfile.last_name}
            </h1>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">First Name</label>
                <input 
                  name="first_name" 
                  value={formData.first_name} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Last Name</label>
                <input 
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Bio</label>
              <div className="min-h-[200px] border border-gray-100 rounded-xl overflow-hidden">
                <RichTextEditor content={formData.bio} onChange={handleBioChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Primary Position</label>
                 <select 
                   name="position" 
                   value={formData.position} 
                   onChange={handleInputChange}
                   className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none appearance-none transition-all"
                 >
                   <option value="Striker">Striker</option>
                   <option value="Midfielder">Midfielder</option>
                   <option value="Defender">Defender</option>
                   <option value="Goalkeeper">Goalkeeper</option>
                 </select>
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Market Value ($)</label>
                 <input 
                   disabled={!isAdminOrOps} 
                   name="market_value" 
                   value={formData.market_value} 
                   onChange={handleInputChange}
                   className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none disabled:opacity-70 disabled:bg-gray-100 transition-all" 
                 />
                 {!isAdminOrOps && <p className="text-xs text-gray-400 font-bold mt-1">Market value edits require admin privileges.</p>}
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Height (cm)</label>
                 <input 
                   name="height_cm" 
                   type="number" 
                   value={formData.height_cm} 
                   onChange={handleInputChange}
                   className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none transition-all" 
                 />
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Weight (kg)</label>
                 <input 
                   name="weight_kg" 
                   type="number" 
                   value={formData.weight_kg} 
                   onChange={handleInputChange}
                   className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none transition-all" 
                 />
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Main Foot</label>
                 <select 
                   name="foot" 
                   value={formData.foot} 
                   onChange={handleInputChange}
                   className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none appearance-none transition-all"
                 >
                   <option value="Right">Right</option>
                   <option value="Left">Left</option>
                   <option value="Both">Both</option>
                 </select>
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Jersey Number</label>
                 <input 
                   name="jersey_number" 
                   type="number" 
                   value={formData.jersey_number} 
                   onChange={handleInputChange}
                   className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none transition-all" 
                 />
               </div>
            </div>

            <div className="flex gap-3 justify-end pt-8 border-t border-gray-100 mt-8">
              <button 
                type="button" 
                onClick={() => router.push('/dashboard/managed')} 
                className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving} 
                className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  'Submitting...'
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
