'use client';

import { useState } from 'react';
import {
   CreditCard, ExternalLink, Shield, Save,
   Zap, DollarSign, UserCheck, Search, Users
} from 'lucide-react';
import { updatePaymentSettings } from '@/app/admin/payments/subscriptions/actions';

export function SubscriptionsClient({
   initialSettings
}: {
   initialSettings: any
}) {
   const [settings, setSettings] = useState(initialSettings);
   const [isSaving, setIsSaving] = useState(false);
   const [errors, setErrors] = useState<{[key: string]: string}>({});

   const validate = () => {
      const errs: {[key: string]: string} = {};

      // 1. External Payment URL Validation
      if (settings.paymentLink) {
         try {
            new URL(settings.paymentLink);
         } catch (_) {
            errs.paymentLink = 'Please enter a valid URL starting with http:// or https://';
         }
      }

      // 2. Bank Settlement Validation
      if (settings.accountNumber && !/^\d+$/.test(settings.accountNumber)) {
         errs.accountNumber = 'Account number must contain digits only';
      }
      if (settings.accountNumber && (settings.accountNumber.length < 10 || settings.accountNumber.length > 12)) {
         errs.accountNumber = 'Local bank account numbers must be between 10 to 12 digits';
      }
      if ((settings.accountNumber || settings.accountName) && !settings.bankName) {
         errs.bankName = 'Institution / Bank name is required if bank details are provided';
      }

      // 3. Paystack Validation
      if (settings.paystackActive) {
         if (!settings.paystackSecret) {
            errs.paystackSecret = 'Secret key is required when Paystack is active';
         } else if (!settings.paystackSecret.startsWith('sk_')) {
            errs.paystackSecret = 'Secret key must be a valid Paystack key starting with sk_';
         }
      }

      // 4. Stripe Validation
      if (settings.stripeActive) {
         if (!settings.stripeKey) {
            errs.stripeKey = 'Publishable key is required when Stripe is active';
         } else if (!settings.stripeKey.startsWith('pk_')) {
            errs.stripeKey = 'Publishable key must be a valid Stripe key starting with pk_';
         }
         if (!settings.stripeSecret) {
            errs.stripeSecret = 'Secret key is required when Stripe is active';
         } else if (!settings.stripeSecret.startsWith('sk_')) {
            errs.stripeSecret = 'Secret key must be a valid Stripe key starting with sk_';
         }
      }

      // 5. PayPal Validation
      if (settings.paypalActive && !settings.paypalId) {
         errs.paypalId = 'Client ID is required when PayPal is active';
      }

      // 6. Role-Based Plans Validation
      const rolesToValidate = ['player', 'coach', 'agent', 'scout', 'organization'];
      rolesToValidate.forEach(roleId => {
         const plan = settings.plans?.[roleId] || {};
         const amountStr = String(plan.amount || '');
         if (!amountStr) {
            errs[`plan_amount_${roleId}`] = 'Plan charge amount is required';
         } else {
            const num = Number(amountStr);
            if (isNaN(num) || num < 0) {
               errs[`plan_amount_${roleId}`] = 'Amount must be a positive numeric value';
            }
         }
      });

      setErrors(errs);
      return Object.keys(errs).length === 0;
   };

   const handleSave = async () => {
      if (!validate()) {
         alert('Please correct the validation errors in the registry form before saving.');
         return;
      }

      setIsSaving(true);
      try {
         await updatePaymentSettings(settings);
         alert('Registry updated successfully');
      } catch (error) {
         alert('Failed to update registry');
      } finally {
         setIsSaving(false);
      }
   };

   const roles = [
      { id: 'player', label: 'Player Accounts', color: 'from-blue-600/20', icon: UserCheck },
      { id: 'coach', label: 'Coach Accounts', color: 'from-amber-600/20', icon: Zap },
      { id: 'agent', label: 'Agent Accounts', color: 'from-purple-600/20', icon: Shield },
      { id: 'scout', label: 'Scout Accounts', color: 'from-teal-600/20', icon: Search },
      { id: 'organization', label: 'Organization Accounts', color: 'from-rose-600/20', icon: Users },
   ];

   const updatePlan = (roleId: string, field: string, value: string) => {
      setSettings({
         ...settings,
         plans: {
            ...settings.plans,
            [roleId]: {
               ...(settings.plans?.[roleId] || {}),
               [field]: value
            }
         }
      });
   };

   return (
      <div className="space-y-12 animate-in fade-in duration-500 pb-20">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Subscription Registry</h1>
               <p className="text-gray-900 text-[10px] font-bold tracking-[0.2em] mt-1">
                  Centrally manage account growth rates, settlement channels, and gateway integrations.
               </p>
            </div>
            <button
               onClick={handleSave}
               disabled={isSaving}
               className="bg-black text-white px-4 md:px-8 py-3.5 rounded-2xl font-black text-[10px] tracking-wide shadow-xl shadow-gray-200 hover:bg-[#b50a0a] transition-all flex items-center gap-3 disabled:opacity-50"
            >
               {isSaving ? 'Processing...' : 'Deploy Changes'}
               <Save className="w-4 h-4" />
            </button>
         </div>

         {/* Validation Banner Summary */}
         {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-[2rem] text-red-700 space-y-2 animate-in slide-in-from-top-4 duration-300">
               <h4 className="text-sm font-black tracking-wide">Validation Errors Found ({Object.keys(errors).length})</h4>
               <p className="text-sm font-medium">Please review and fix the highlighted fields below before submitting.</p>
            </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8">
            {/* Universal Payment Link */}
            <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100">
                     <ExternalLink className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-base font-black text-gray-900">Legacy Checkout</h3>
                     <p className="text-[10px] font-bold text-gray-900 tracking-wide mt-0.5">Universal Redirect Link</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">External Payment URL</label>
                     <div className="relative group">
                        <input
                           type="text"
                           value={settings.paymentLink || ''}
                           onChange={(e) => setSettings({ ...settings, paymentLink: e.target.value })}
                           placeholder="https://..."
                           className={`w-full bg-gray-50 border rounded-xl p-4 text-[10px] font-bold focus:ring-2 focus:ring-gray-200 transition-all text-gray-900 ${errors.paymentLink ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`}
                        />
                        {settings.paymentLink && !errors.paymentLink && (
                           <a href={settings.paymentLink} target="_blank" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" />
                           </a>
                        )}
                     </div>
                     {errors.paymentLink && <p className="text-[9px] font-bold text-red-500 ml-1 mt-1">{errors.paymentLink}</p>}
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">Checkout Instructions</label>
                     <textarea
                        rows={2}
                        value={settings.instructions || ''}
                        onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
                        placeholder="Instructions shown for manual/universal links..."
                        className="w-full bg-gray-50 border-none rounded-xl p-4 text-[10px] font-bold focus:ring-2 focus:ring-gray-200 transition-all text-gray-900 resize-none"
                     />
                  </div>
               </div>
            </div>

            {/* Bank Settlement */}
            <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                     <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-base font-black text-gray-900">Bank Settlement</h3>
                     <p className="text-[10px] font-bold text-gray-900 tracking-wide mt-0.5">Local Transfers</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 gap-1.5">
                     <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">Institution</label>
                     <input
                        type="text"
                        value={settings.bankName || ''}
                        onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                        placeholder="Bank name"
                        className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-[10px] font-bold text-gray-900 focus:ring-2 focus:ring-amber-200 transition-all ${errors.bankName ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`}
                     />
                     {errors.bankName && <p className="text-[9px] font-bold text-red-500 ml-1 mt-1">{errors.bankName}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">Acc. Name</label>
                        <input
                           type="text"
                           value={settings.accountName || ''}
                           onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                           className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-[10px] font-bold text-gray-900"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">Number</label>
                        <input
                           type="text"
                           value={settings.accountNumber || ''}
                           onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                           className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-[10px] font-bold text-gray-900 focus:ring-2 focus:ring-amber-200 transition-all ${errors.accountNumber ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`}
                        />
                     </div>
                  </div>
                  {errors.accountNumber && <p className="text-[9px] font-bold text-red-500 ml-1">{errors.accountNumber}</p>}
               </div>
            </div>
         </div>


         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-3 gap-4 md:p-8">
            {/* Paystack Full Integration */}
            <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50/50 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-teal-100/50 transition-colors"></div>
               <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 transition-transform group-hover:scale-110">
                        <Zap className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-base font-black text-gray-900 tracking-tight">Paystack</h3>
                        <p className="text-[9px] font-bold text-gray-900 tracking-wide mt-0.5">Automated Gateway</p>
                     </div>
                  </div>
                  <button
                     onClick={() => setSettings({ ...settings, paystackActive: !settings.paystackActive })}
                     className={`w-10 h-5 rounded-full relative transition-colors ${settings.paystackActive ? 'bg-teal-500' : 'bg-gray-200'}`}
                  >
                     <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.paystackActive ? 'right-1' : 'left-1'}`}></div>
                  </button>
               </div>

               <div className="space-y-4 relative z-10">
                  <div className="space-y-1.5">
                     <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">Secret Key</label>
                     <input
                        type="password"
                        value={settings.paystackSecret || ''}
                        onChange={(e) => setSettings({ ...settings, paystackSecret: e.target.value })}
                        placeholder="sk_live_..."
                        className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-[10px] font-bold text-gray-900 focus:ring-2 focus:ring-teal-100 transition-all ${errors.paystackSecret ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`}
                     />
                     {errors.paystackSecret && <p className="text-[9px] font-bold text-red-500 ml-1 mt-1">{errors.paystackSecret}</p>}
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">Webhook URL</label>
                     <div className="p-3 bg-gray-50 rounded-xl text-[9px] font-mono text-gray-400 break-all select-all">
                        {typeof window !== 'undefined' ? `${window.location.origin}/api/hooks/paystack` : '.../api/hooks/paystack'}
                     </div>
                  </div>
               </div>
            </div>

            {/* Stripe Full Integration */}
            <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-indigo-100/50 transition-colors"></div>
               <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 transition-transform group-hover:scale-110">
                        <CreditCard className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-base font-black text-gray-900 tracking-tight">Stripe</h3>
                        <p className="text-[9px] font-bold text-gray-900 tracking-wide mt-0.5">Global Checkout</p>
                     </div>
                  </div>
                  <button
                     onClick={() => setSettings({ ...settings, stripeActive: !settings.stripeActive })}
                     className={`w-10 h-5 rounded-full relative transition-colors ${settings.stripeActive ? 'bg-indigo-500' : 'bg-gray-200'}`}
                  >
                     <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.stripeActive ? 'right-1' : 'left-1'}`}></div>
                  </button>
               </div>

               <div className="space-y-4 relative z-10">
                  <div className="space-y-1.5">
                     <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">Publishable Key</label>
                     <input
                        type="text"
                        value={settings.stripeKey || ''}
                        onChange={(e) => setSettings({ ...settings, stripeKey: e.target.value })}
                        placeholder="pk_live_..."
                        className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-[10px] font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all ${errors.stripeKey ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`}
                     />
                     {errors.stripeKey && <p className="text-[9px] font-bold text-red-500 ml-1 mt-1">{errors.stripeKey}</p>}
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">Secret Key</label>
                     <input
                        type="password"
                        value={settings.stripeSecret || ''}
                        onChange={(e) => setSettings({ ...settings, stripeSecret: e.target.value })}
                        placeholder="sk_live_..."
                        className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-[10px] font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all ${errors.stripeSecret ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`}
                     />
                     {errors.stripeSecret && <p className="text-[9px] font-bold text-red-500 ml-1 mt-1">{errors.stripeSecret}</p>}
                  </div>
               </div>
            </div>

            {/* PayPal Full Integration */}
            <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-blue-100/50 transition-colors"></div>
               <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 transition-transform group-hover:scale-110">
                        <DollarSign className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-base font-black text-gray-900 tracking-tight">PayPal</h3>
                        <p className="text-[9px] font-bold text-gray-900 tracking-wide mt-0.5">Braintree/Legacy</p>
                     </div>
                  </div>
                  <button
                     onClick={() => setSettings({ ...settings, paypalActive: !settings.paypalActive })}
                     className={`w-10 h-5 rounded-full relative transition-colors ${settings.paypalActive ? 'bg-blue-500' : 'bg-gray-200'}`}
                  >
                     <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.paypalActive ? 'right-1' : 'left-1'}`}></div>
                  </button>
               </div>

               <div className="space-y-4 relative z-10">
                  <div className="space-y-1.5">
                     <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">Client ID</label>
                     <input
                        type="text"
                        value={settings.paypalId || ''}
                        onChange={(e) => setSettings({ ...settings, paypalId: e.target.value })}
                        placeholder="AZ_..."
                        className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-[10px] font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all ${errors.paypalId ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`}
                     />
                     {errors.paypalId && <p className="text-[9px] font-bold text-red-500 ml-1 mt-1">{errors.paypalId}</p>}
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[8px] font-black text-gray-900 tracking-wide ml-1">Environment</label>
                     <select
                        value={settings.paypalEnv || 'sandbox'}
                        onChange={(e) => setSettings({ ...settings, paypalEnv: e.target.value })}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-[10px] font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all"
                     >
                        <option value="sandbox" className="text-gray-900 bg-white">Sandbox (Testing)</option>
                        <option value="live" className="text-gray-900 bg-white">Live (Production)</option>
                     </select>
                  </div>
               </div>
            </div>
         </div>

         {/* Role-Based Tiers */}
         <div className="space-y-8">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-gray-100"></div>
               <div className="text-center px-4">
                  <h2 className="text-xl font-black text-gray-900 tracking-tighter">Charge Rate Management</h2>
                  <p className="text-gray-900 text-[10px] font-bold tracking-[0.2em] mt-1">Configure subscription units for each account type.</p>
               </div>
               <div className="h-px flex-1 bg-gray-100"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-3 xl:grid-cols-1 md:grid-cols-3 gap-4 md:p-8">
               {roles.map((role) => {
                  const plan = settings.plans?.[role.id] || {};
                  const Icon = role.icon;
                  return (
                     <div key={role.id} className="bg-gray-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${role.color} to-transparent blur-[60px] rounded-full -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-700`}></div>

                        <div className="relative z-10 flex flex-col h-full gap-4 md:p-8">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                                 <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-[8px] font-black text-[#b50a0a] tracking-wide mb-0.5">{role.label}</p>
                                 <input
                                    type="text"
                                    value={plan.name || `CenterKick ${role.id.charAt(0).toUpperCase() + role.id.slice(1)} Pro`}
                                    onChange={(e) => updatePlan(role.id, 'name', e.target.value)}
                                    className="bg-transparent border-none text-[11px] font-black tracking-[0.1em] focus:ring-0 p-0 w-full text-white"
                                    placeholder="PLAN NAME"
                                 />
                              </div>
                           </div>

                           <div className="space-y-4">
                              <div className="space-y-2">
                                 <label className="text-[8px] font-black text-gray-200 tracking-wide ml-1">Amount / Charge Rate</label>
                                 <div className={`flex items-center gap-3 bg-white/5 border rounded-2xl p-4 focus-within:ring-2 focus-within:ring-[#b50a0a] transition-all ${errors[`plan_amount_${role.id}`] ? 'border-red-500' : 'border-white/10'}`}>
                                    <span className="text-2xl font-black tracking-tighter text-white/40 select-none">$</span>
                                    <input
                                       type="text"
                                       value={plan.amount || '0.00'}
                                       onChange={(e) => updatePlan(role.id, 'amount', e.target.value)}
                                       className="bg-transparent border-none text-3xl font-black tracking-tighter focus:ring-0 p-0 w-full text-white"
                                       placeholder="0.00"
                                    />
                                 </div>
                                 {errors[`plan_amount_${role.id}`] && <p className="text-[9px] font-bold text-red-500 ml-1 mt-1">{errors[`plan_amount_${role.id}`]}</p>}
                              </div>

                              <div className="space-y-2">
                                 <label className="text-[8px] font-black text-gray-200 tracking-wide ml-1">Billing Interval</label>
                                 <select
                                    value={plan.frequency || 'Lifetime Access'}
                                    onChange={(e) => updatePlan(role.id, 'frequency', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-gray-300 tracking-wide px-4 py-3 focus:ring-1 focus:ring-[#b50a0a]"
                                 >
                                    <option value="Lifetime Access" className="text-gray-900 bg-white">Lifetime Access</option>
                                    <option value="Monthly" className="text-gray-900 bg-white">Monthly Billing</option>
                                    <option value="Quarterly" className="text-gray-900 bg-white">Quarterly Billing</option>
                                    <option value="Yearly" className="text-gray-900 bg-white">Yearly Billing</option>
                                 </select>
                              </div>

                              <div className="space-y-2">
                                 <label className="text-[8px] font-black text-gray-200 tracking-wide ml-1">Inclusions / Pitch</label>
                                 <textarea
                                    rows={3}
                                    value={plan.description || `Specialized tier for all ${role.id} profiles.`}
                                    onChange={(e) => updatePlan(role.id, 'description', e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-[10px] font-medium text-gray-200 focus:ring-1 focus:ring-[#b50a0a] resize-none leading-relaxed"
                                    placeholder="Enter plan benefits..."
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
   );
}
