'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Shield, X, Check } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { savePricingPlan, deletePricingPlan } from './actions';

export function PricingClient({ initialPlans }: { initialPlans: any[] }) {
  const { showToast } = useToast();
  const [plans, setPlans] = useState(initialPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await savePricingPlan(formData);
    
    if (res.success) {
      showToast('Pricing plan saved successfully', 'success');
      setIsModalOpen(false);
      window.location.reload();
    } else {
      showToast(res.error || 'Failed to save plan', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this pricing plan?')) {
      const res = await deletePricingPlan(id);
      if (res.success) {
        showToast('Pricing plan deleted', 'success');
        setPlans(plans.filter(p => p.id !== id));
      } else {
        showToast(res.error || 'Failed to delete plan', 'error');
      }
    }
  };

  const roles = ['player', 'coach', 'agent', 'scout', 'organization'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Active Plans</h2>
        <button 
          onClick={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
          className="bg-[#b50a0a] text-white px-4 py-2 rounded-lg font-bold text-xs tracking-wide hover:bg-black transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
            {!plan.is_active && (
              <div className="absolute top-4 right-4 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded uppercase tracking-wider">
                Inactive
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#b50a0a]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">{plan.role}</p>
                <h3 className="text-lg font-bold text-gray-900">{plan.plan_name}</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">${plan.amount}</span>
              <span className="text-gray-500 text-sm font-bold"> / {plan.duration_months} mo</span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setEditingPlan(plan);
                  setIsModalOpen(true);
                }}
                className="flex-1 bg-gray-50 text-gray-900 px-4 py-2 rounded-lg font-bold text-xs tracking-wide hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                <Edit className="w-3 h-3" /> Edit
              </button>
              <button 
                onClick={() => handleDelete(plan.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-bold">No pricing plans configured.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900">{editingPlan ? 'Edit Plan' : 'New Plan'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {editingPlan && <input type="hidden" name="id" value={editingPlan.id} />}
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Target Role</label>
                <select name="role" defaultValue={editingPlan?.role || 'player'} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a]">
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Plan Name</label>
                <input required type="text" name="plan_name" defaultValue={editingPlan?.plan_name} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a]" placeholder="e.g. Pro Player Yearly" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Amount ($)</label>
                  <input required type="number" step="0.01" name="amount" defaultValue={editingPlan?.amount} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a]" placeholder="0.00" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Duration (Months)</label>
                  <input required type="number" min="1" name="duration_months" defaultValue={editingPlan?.duration_months || 12} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a]" />
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input type="checkbox" name="is_active" value="true" defaultChecked={editingPlan ? editingPlan.is_active : true} className="w-4 h-4 accent-[#b50a0a]" />
                  <span className="text-sm font-bold text-gray-900">Active (Available for purchase)</span>
                </label>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-[#b50a0a] text-white py-3 rounded-xl font-bold tracking-wide hover:bg-black transition-colors">
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
