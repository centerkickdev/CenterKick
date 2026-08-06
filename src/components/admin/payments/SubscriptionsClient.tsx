'use client';

import { useState } from 'react';
import {
   CreditCard, ExternalLink, Shield, Save,
   Zap, DollarSign, UserCheck, Search, Users
} from 'lucide-react';
import { updatePaymentSettings } from '@/app/admin/payments/subscriptions/actions';
import { useToast } from '@/context/ToastContext';

export function SubscriptionsClient({
   initialSettings
}: {
   initialSettings: any
}) {
   const [settings, setSettings] = useState(initialSettings);
   const [isSaving, setIsSaving] = useState(false);
   const [errors, setErrors] = useState<{[key: string]: string}>({});
   const { showToast } = useToast();

   const validate = () => {
      const errs: {[key: string]: string} = {};

      // 1. External Payment URL Validation
      if (settings.legacyLinkActive && settings.paymentLink) {
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
         if (!settings.paystackPublicKey) {
            errs.paystackPublicKey = 'Public key is required when Paystack is active';
         } else if (!settings.paystackPublicKey.startsWith('pk_')) {
            errs.paystackPublicKey = 'Public key must be a valid Paystack key starting with pk_';
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
         showToast('Please correct the validation errors in the registry form before saving.', 'error');
         return;
      }

      setIsSaving(true);
      try {
         await updatePaymentSettings(settings);
         showToast('Registry updated successfully', 'success');
      } catch (error) {
         showToast('Failed to update registry', 'error');
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
      <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-500 pb-20">
         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tighter">Subscription Registry</h1>
               <p className="text-xs sm:text-sm font-normal text-gray-500 mt-1">
                  Centrally manage account growth rates, settlement channels, and gateway integrations.
               </p>
            </div>
            <button
               onClick={handleSave}
               disabled={isSaving}
               className="w-full sm:w-auto bg-black text-white px-6 py-3.5 rounded-2xl font-bold text-xs tracking-wide shadow-xl shadow-gray-200 hover:bg-[#b50a0a] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shrink-0"
            >
               {isSaving ? 'Processing...' : 'Deploy Changes'}
               <Save className="w-4 h-4" />
            </button>
         </div>

         {/* Validation Banner Summary */}
         {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] text-red-700 space-y-2 animate-in slide-in-from-top-4 duration-300">
               <h4 className="text-xs sm:text-sm font-bold tracking-wide">Validation Errors Found ({Object.keys(errors).length})</h4>
               <p className="text-xs sm:text-sm font-medium">Please review and fix the highlighted fields below before submitting.</p>
            </div>
         )}

         {/* Gateway Integrations Section */}
         <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-8 sm:mb-12">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Gateway / Channel</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap text-center">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest min-w-[400px]">Configuration Keys & Settings</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {/* Legacy Checkout */}
                     <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-6 align-top whitespace-nowrap">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100">
                                 <ExternalLink className="w-6 h-6" />
                              </div>
                              <div>
                                 <h3 className="text-base font-bold text-gray-900">Legacy Checkout</h3>
                                 <p className="text-xs font-bold text-gray-500 tracking-wide mt-0.5">Universal Redirect Link</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6 align-top text-center">
                           <button
                              onClick={() => setSettings({ ...settings, legacyLinkActive: !settings.legacyLinkActive })}
                              className={`w-10 h-5 rounded-full relative transition-colors inline-block mt-3 ${settings.legacyLinkActive ? 'bg-gray-900' : 'bg-gray-200'}`}
                           >
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.legacyLinkActive ? 'right-1' : 'left-1'}`}></div>
                           </button>
                        </td>
                        <td className="px-6 py-6 align-top">
                           {settings.legacyLinkActive ? (
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                 <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">External Payment URL</label>
                                    <div className="relative group">
                                       <input
                                          type="text"
                                          value={settings.paymentLink || ''}
                                          onChange={(e) => setSettings({ ...settings, paymentLink: e.target.value })}
                                          placeholder="https://..."
                                          className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-gray-200 transition-all text-gray-900 ${errors.paymentLink ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`}
                                       />
                                       {settings.paymentLink && !errors.paymentLink && (
                                          <a href={settings.paymentLink} target="_blank" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                                             <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                       )}
                                    </div>
                                    {errors.paymentLink && <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.paymentLink}</p>}
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Checkout Instructions</label>
                                    <textarea
                                       rows={2}
                                       value={settings.instructions || ''}
                                       onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
                                       placeholder="Instructions shown for manual/universal links..."
                                       className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-gray-200 transition-all text-gray-900 resize-none"
                                    />
                                 </div>
                              </div>
                           ) : (
                              <span className="text-xs font-bold text-gray-400 italic mt-4 block">Disabled</span>
                           )}
                        </td>
                     </tr>

                     {/* Bank Settlement */}
                     <tr className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-6 py-6 align-top whitespace-nowrap">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                                 <DollarSign className="w-6 h-6" />
                              </div>
                              <div>
                                 <h3 className="text-base font-bold text-gray-900">Bank Settlement</h3>
                                 <p className="text-xs font-bold text-gray-500 tracking-wide mt-0.5">Local Transfers</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6 align-top text-center">
                           <span className="inline-block mt-3 px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-md">Always Active</span>
                        </td>
                        <td className="px-6 py-6 align-top">
                           <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Institution</label>
                                 <input
                                    type="text"
                                    value={settings.bankName || ''}
                                    onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                                    placeholder="Bank name"
                                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-amber-200 transition-all ${errors.bankName ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`}
                                 />
                                 {errors.bankName && <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.bankName}</p>}
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Acc. Name</label>
                                 <input
                                    type="text"
                                    value={settings.accountName || ''}
                                    onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-gray-900"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Number</label>
                                 <input
                                    type="text"
                                    value={settings.accountNumber || ''}
                                    onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                                    className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-amber-200 transition-all ${errors.accountNumber ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`}
                                 />
                                 {errors.accountNumber && <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.accountNumber}</p>}
                              </div>
                           </div>
                        </td>
                     </tr>

                     {/* Paystack */}
                     <tr className="hover:bg-teal-50/30 transition-colors">
                        <td className="px-6 py-6 align-top whitespace-nowrap">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                                 <Zap className="w-6 h-6" />
                              </div>
                              <div>
                                 <h3 className="text-base font-bold text-gray-900">Paystack</h3>
                                 <p className="text-xs font-bold text-gray-500 tracking-wide mt-0.5">Automated Gateway</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6 align-top text-center">
                           <button
                              onClick={() => setSettings({ ...settings, paystackActive: !settings.paystackActive })}
                              className={`w-10 h-5 rounded-full relative transition-colors inline-block mt-3 ${settings.paystackActive ? 'bg-teal-500' : 'bg-gray-200'}`}
                           >
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.paystackActive ? 'right-1' : 'left-1'}`}></div>
                           </button>
                        </td>
                        <td className="px-6 py-6 align-top">
                           {settings.paystackActive ? (
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                 <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Secret Key</label>
                                    <input
                                       type="password"
                                       value={settings.paystackSecret || ''}
                                       onChange={(e) => setSettings({ ...settings, paystackSecret: e.target.value })}
                                       placeholder="sk_live_..."
                                       className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-teal-100 transition-all ${errors.paystackSecret ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`}
                                    />
                                    {errors.paystackSecret && <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.paystackSecret}</p>}
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Public Key</label>
                                    <input
                                       type="text"
                                       value={settings.paystackPublicKey || ''}
                                       onChange={(e) => setSettings({ ...settings, paystackPublicKey: e.target.value })}
                                       placeholder="pk_live_..."
                                       className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-teal-100 transition-all ${errors.paystackPublicKey ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`}
                                    />
                                    {errors.paystackPublicKey && <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.paystackPublicKey}</p>}
                                 </div>
                                 <div className="space-y-1.5 xl:col-span-2">
                                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Webhook URL</label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-xs font-mono text-gray-400 break-all select-all border border-gray-100">
                                       {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/paystack` : '.../api/webhooks/paystack'}
                                    </div>
                                 </div>
                              </div>
                           ) : (
                              <span className="text-xs font-bold text-gray-400 italic mt-4 block">Disabled</span>
                           )}
                        </td>
                     </tr>

                     {/* Stripe */}
                     <tr className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-6 align-top whitespace-nowrap">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                 <CreditCard className="w-6 h-6" />
                              </div>
                              <div>
                                 <h3 className="text-base font-bold text-gray-900">Stripe</h3>
                                 <p className="text-xs font-bold text-gray-500 tracking-wide mt-0.5">Global Checkout</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6 align-top text-center">
                           <button
                              onClick={() => setSettings({ ...settings, stripeActive: !settings.stripeActive })}
                              className={`w-10 h-5 rounded-full relative transition-colors inline-block mt-3 ${settings.stripeActive ? 'bg-indigo-500' : 'bg-gray-200'}`}
                           >
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.stripeActive ? 'right-1' : 'left-1'}`}></div>
                           </button>
                        </td>
                        <td className="px-6 py-6 align-top">
                           {settings.stripeActive ? (
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                 <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Publishable Key</label>
                                    <input
                                       type="text"
                                       value={settings.stripeKey || ''}
                                       onChange={(e) => setSettings({ ...settings, stripeKey: e.target.value })}
                                       placeholder="pk_live_..."
                                       className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all ${errors.stripeKey ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`}
                                    />
                                    {errors.stripeKey && <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.stripeKey}</p>}
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Secret Key</label>
                                    <input
                                       type="password"
                                       value={settings.stripeSecret || ''}
                                       onChange={(e) => setSettings({ ...settings, stripeSecret: e.target.value })}
                                       placeholder="sk_live_..."
                                       className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 transition-all ${errors.stripeSecret ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`}
                                    />
                                    {errors.stripeSecret && <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.stripeSecret}</p>}
                                 </div>
                              </div>
                           ) : (
                              <span className="text-xs font-bold text-gray-400 italic mt-4 block">Disabled</span>
                           )}
                        </td>
                     </tr>

                     {/* PayPal */}
                     <tr className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-6 align-top whitespace-nowrap">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                 <DollarSign className="w-6 h-6" />
                              </div>
                              <div>
                                 <h3 className="text-base font-bold text-gray-900">PayPal</h3>
                                 <p className="text-xs font-bold text-gray-500 tracking-wide mt-0.5">Braintree/Legacy</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6 align-top text-center">
                           <button
                              onClick={() => setSettings({ ...settings, paypalActive: !settings.paypalActive })}
                              className={`w-10 h-5 rounded-full relative transition-colors inline-block mt-3 ${settings.paypalActive ? 'bg-blue-500' : 'bg-gray-200'}`}
                           >
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.paypalActive ? 'right-1' : 'left-1'}`}></div>
                           </button>
                        </td>
                        <td className="px-6 py-6 align-top">
                           {settings.paypalActive ? (
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                 <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Client ID</label>
                                    <input
                                       type="text"
                                       value={settings.paypalId || ''}
                                       onChange={(e) => setSettings({ ...settings, paypalId: e.target.value })}
                                       placeholder="AZ_..."
                                       className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all ${errors.paypalId ? 'border-red-500 focus:ring-red-200' : 'border-transparent'}`}
                                    />
                                    {errors.paypalId && <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.paypalId}</p>}
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Environment</label>
                                    <select
                                       value={settings.paypalEnv || 'sandbox'}
                                       onChange={(e) => setSettings({ ...settings, paypalEnv: e.target.value })}
                                       className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all"
                                    >
                                       <option value="sandbox" className="text-gray-900 bg-white">Sandbox (Testing)</option>
                                       <option value="live" className="text-gray-900 bg-white">Live (Production)</option>
                                    </select>
                                 </div>
                              </div>
                           ) : (
                              <span className="text-xs font-bold text-gray-400 italic mt-4 block">Disabled</span>
                           )}
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>

            {/* Mobile Stacked Cards View */}
            <div className="block lg:hidden divide-y divide-gray-100">
               {/* Legacy Checkout Mobile Card */}
               <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100 shrink-0">
                           <ExternalLink className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-sm font-bold text-gray-900">Legacy Checkout</h3>
                           <p className="text-[11px] font-bold text-gray-500">Universal Redirect Link</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setSettings({ ...settings, legacyLinkActive: !settings.legacyLinkActive })}
                        className={`w-10 h-5 rounded-full relative transition-colors inline-block ${settings.legacyLinkActive ? 'bg-gray-900' : 'bg-gray-200'}`}
                     >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.legacyLinkActive ? 'right-1' : 'left-1'}`}></div>
                     </button>
                  </div>
                  {settings.legacyLinkActive ? (
                     <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-900">External Payment URL</label>
                           <input
                              type="text"
                              value={settings.paymentLink || ''}
                              onChange={(e) => setSettings({ ...settings, paymentLink: e.target.value })}
                              placeholder="https://..."
                              className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-xs font-bold focus:ring-2 focus:ring-gray-200 transition-all text-gray-900 ${errors.paymentLink ? 'border-red-500' : 'border-transparent'}`}
                           />
                           {errors.paymentLink && <p className="text-xs font-bold text-red-500 mt-1">{errors.paymentLink}</p>}
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-900">Checkout Instructions</label>
                           <textarea
                              rows={2}
                              value={settings.instructions || ''}
                              onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
                              placeholder="Instructions shown for manual/universal links..."
                              className="w-full bg-gray-50 border-none rounded-xl px-3.5 py-2.5 text-xs font-bold focus:ring-2 focus:ring-gray-200 transition-all text-gray-900 resize-none"
                           />
                        </div>
                     </div>
                  ) : (
                     <span className="text-xs font-bold text-gray-400 italic block">Gateway Disabled</span>
                  )}
               </div>

               {/* Bank Settlement Mobile Card */}
               <div className="p-4 sm:p-6 space-y-4 bg-amber-50/20">
                  <div className="flex items-center justify-between gap-3">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
                           <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-sm font-bold text-gray-900">Bank Settlement</h3>
                           <p className="text-[11px] font-bold text-gray-500">Local Bank Transfers</p>
                        </div>
                     </div>
                     <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded-md shrink-0">Active</span>
                  </div>
                  <div className="space-y-3 pt-2">
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-900">Institution Name</label>
                        <input
                           type="text"
                           value={settings.bankName || ''}
                           onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                           placeholder="Bank name"
                           className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 ${errors.bankName ? 'border-red-500' : 'border-slate-200'}`}
                        />
                        {errors.bankName && <p className="text-xs font-bold text-red-500 mt-1">{errors.bankName}</p>}
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-900">Account Name</label>
                        <input
                           type="text"
                           value={settings.accountName || ''}
                           onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                           className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-900">Account Number</label>
                        <input
                           type="text"
                           value={settings.accountNumber || ''}
                           onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                           className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 ${errors.accountNumber ? 'border-red-500' : 'border-slate-200'}`}
                        />
                        {errors.accountNumber && <p className="text-xs font-bold text-red-500 mt-1">{errors.accountNumber}</p>}
                     </div>
                  </div>
               </div>

               {/* Paystack Mobile Card */}
               <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 shrink-0">
                           <Zap className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-sm font-bold text-gray-900">Paystack</h3>
                           <p className="text-[11px] font-bold text-gray-500">Automated Gateway</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setSettings({ ...settings, paystackActive: !settings.paystackActive })}
                        className={`w-10 h-5 rounded-full relative transition-colors inline-block ${settings.paystackActive ? 'bg-teal-500' : 'bg-gray-200'}`}
                     >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.paystackActive ? 'right-1' : 'left-1'}`}></div>
                     </button>
                  </div>
                  {settings.paystackActive ? (
                     <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-900">Secret Key</label>
                           <input
                              type="password"
                              value={settings.paystackSecret || ''}
                              onChange={(e) => setSettings({ ...settings, paystackSecret: e.target.value })}
                              placeholder="sk_live_..."
                              className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 ${errors.paystackSecret ? 'border-red-500' : 'border-transparent'}`}
                           />
                           {errors.paystackSecret && <p className="text-xs font-bold text-red-500 mt-1">{errors.paystackSecret}</p>}
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-900">Public Key</label>
                           <input
                              type="text"
                              value={settings.paystackPublicKey || ''}
                              onChange={(e) => setSettings({ ...settings, paystackPublicKey: e.target.value })}
                              placeholder="pk_live_..."
                              className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 ${errors.paystackPublicKey ? 'border-red-500' : 'border-transparent'}`}
                           />
                           {errors.paystackPublicKey && <p className="text-xs font-bold text-red-500 mt-1">{errors.paystackPublicKey}</p>}
                        </div>
                     </div>
                  ) : (
                     <span className="text-xs font-bold text-gray-400 italic block">Gateway Disabled</span>
                  )}
               </div>

               {/* Stripe Mobile Card */}
               <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                           <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-sm font-bold text-gray-900">Stripe</h3>
                           <p className="text-[11px] font-bold text-gray-500">Global Checkout</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setSettings({ ...settings, stripeActive: !settings.stripeActive })}
                        className={`w-10 h-5 rounded-full relative transition-colors inline-block ${settings.stripeActive ? 'bg-indigo-500' : 'bg-gray-200'}`}
                     >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.stripeActive ? 'right-1' : 'left-1'}`}></div>
                     </button>
                  </div>
                  {settings.stripeActive ? (
                     <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-900">Publishable Key</label>
                           <input
                              type="text"
                              value={settings.stripeKey || ''}
                              onChange={(e) => setSettings({ ...settings, stripeKey: e.target.value })}
                              placeholder="pk_live_..."
                              className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 ${errors.stripeKey ? 'border-red-500' : 'border-transparent'}`}
                           />
                           {errors.stripeKey && <p className="text-xs font-bold text-red-500 mt-1">{errors.stripeKey}</p>}
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-900">Secret Key</label>
                           <input
                              type="password"
                              value={settings.stripeSecret || ''}
                              onChange={(e) => setSettings({ ...settings, stripeSecret: e.target.value })}
                              placeholder="sk_live_..."
                              className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 ${errors.stripeSecret ? 'border-red-500' : 'border-transparent'}`}
                           />
                           {errors.stripeSecret && <p className="text-xs font-bold text-red-500 mt-1">{errors.stripeSecret}</p>}
                        </div>
                     </div>
                  ) : (
                     <span className="text-xs font-bold text-gray-400 italic block">Gateway Disabled</span>
                  )}
               </div>

               {/* PayPal Mobile Card */}
               <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                           <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-sm font-bold text-gray-900">PayPal</h3>
                           <p className="text-[11px] font-bold text-gray-500">Braintree/Legacy</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setSettings({ ...settings, paypalActive: !settings.paypalActive })}
                        className={`w-10 h-5 rounded-full relative transition-colors inline-block ${settings.paypalActive ? 'bg-blue-500' : 'bg-gray-200'}`}
                     >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.paypalActive ? 'right-1' : 'left-1'}`}></div>
                     </button>
                  </div>
                  {settings.paypalActive ? (
                     <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-900">Client ID</label>
                           <input
                              type="text"
                              value={settings.paypalId || ''}
                              onChange={(e) => setSettings({ ...settings, paypalId: e.target.value })}
                              placeholder="AZ_..."
                              className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 ${errors.paypalId ? 'border-red-500' : 'border-transparent'}`}
                           />
                           {errors.paypalId && <p className="text-xs font-bold text-red-500 mt-1">{errors.paypalId}</p>}
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-bold text-gray-900">Environment</label>
                           <select
                              value={settings.paypalEnv || 'sandbox'}
                              onChange={(e) => setSettings({ ...settings, paypalEnv: e.target.value })}
                              className="w-full bg-gray-50 border-none rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900"
                           >
                              <option value="sandbox" className="text-gray-900 bg-white">Sandbox (Testing)</option>
                              <option value="live" className="text-gray-900 bg-white">Live (Production)</option>
                           </select>
                        </div>
                     </div>
                  ) : (
                     <span className="text-xs font-bold text-gray-400 italic block">Gateway Disabled</span>
                  )}
               </div>
            </div>
         </div>

         {/* Role-Based Tiers */}
         <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-gray-100"></div>
               <div className="text-center px-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tighter">Charge Rate Management</h2>
                  <p className="text-gray-900 text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-[0.2em] mt-1">Configure subscription units for each account type.</p>
               </div>
               <div className="h-px flex-1 bg-gray-100"></div>
            </div>

            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
               {/* Desktop Table View */}
               <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                           <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Account Type</th>
                           <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Plan Name</th>
                           <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Charge Rate</th>
                           <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Billing Interval</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {roles.map((role) => {
                           const plan = settings.plans?.[role.id] || {};
                           return (
                              <tr key={role.id} className="hover:bg-gray-50/50 transition-colors group">
                                 <td className="px-6 py-5 whitespace-nowrap">
                                    <span className="text-sm font-bold text-gray-900">{role.label}</span>
                                 </td>
                                 <td className="px-6 py-5 min-w-[200px]">
                                    <input
                                       type="text"
                                       value={plan.name || `CenterKick ${role.id.charAt(0).toUpperCase() + role.id.slice(1)}`}
                                       onChange={(e) => updatePlan(role.id, 'name', e.target.value)}
                                       className="w-full bg-transparent border-none text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-amber-200 rounded-lg px-3 py-2 transition-all placeholder:text-gray-300"
                                       placeholder="PLAN NAME"
                                    />
                                 </td>
                                 <td className="px-6 py-5 min-w-[180px]">
                                    <div className={`flex items-center gap-2 bg-gray-50 border rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-amber-200 transition-all ${errors[`plan_amount_${role.id}`] ? 'border-red-500' : 'border-transparent'}`}>
                                       <span className="text-sm font-bold text-gray-400 select-none">₦</span>
                                       <input
                                          type="text"
                                          value={plan.amount || '0.00'}
                                          onChange={(e) => updatePlan(role.id, 'amount', e.target.value)}
                                          className="bg-transparent border-none text-sm font-bold text-gray-900 focus:ring-0 p-0 w-full"
                                          placeholder="0.00"
                                       />
                                    </div>
                                    {errors[`plan_amount_${role.id}`] && <p className="text-xs font-bold text-red-500 mt-1">{errors[`plan_amount_${role.id}`]}</p>}
                                 </td>
                                 <td className="px-6 py-5 min-w-[180px]">
                                    <select
                                       value={plan.frequency || 'Lifetime Access'}
                                       onChange={(e) => updatePlan(role.id, 'frequency', e.target.value)}
                                       className="w-full bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-900 px-4 py-2 focus:ring-2 focus:ring-amber-200 transition-all"
                                    >
                                       <option value="Lifetime Access">Lifetime Access</option>
                                       <option value="Monthly">Monthly Billing</option>
                                       <option value="Quarterly">Quarterly Billing</option>
                                       <option value="Biannually">Biannually (6 Months)</option>
                                       <option value="Yearly">Yearly Billing</option>
                                    </select>
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>

               {/* Mobile Stacked Cards View */}
               <div className="block lg:hidden divide-y divide-gray-100">
                  {roles.map((role) => {
                     const plan = settings.plans?.[role.id] || {};
                     const Icon = role.icon;
                     return (
                        <div key={role.id} className="p-4 sm:p-6 space-y-3">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                                 <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-bold text-gray-900">{role.label}</span>
                           </div>

                           <div className="space-y-3 pt-1">
                              <div className="space-y-1">
                                 <label className="text-xs font-bold text-gray-400">Plan Name</label>
                                 <input
                                    type="text"
                                    value={plan.name || `CenterKick ${role.id.charAt(0).toUpperCase() + role.id.slice(1)}`}
                                    onChange={(e) => updatePlan(role.id, 'name', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 text-xs font-bold text-gray-900 rounded-xl px-3.5 py-2.5 placeholder:text-gray-300"
                                    placeholder="PLAN NAME"
                                 />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                 <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400">Charge Rate</label>
                                    <div className={`flex items-center gap-2 bg-gray-50 border rounded-xl px-3.5 py-2.5 ${errors[`plan_amount_${role.id}`] ? 'border-red-500' : 'border-gray-100'}`}>
                                       <span className="text-xs font-bold text-gray-400 select-none">₦</span>
                                       <input
                                          type="text"
                                          value={plan.amount || '0.00'}
                                          onChange={(e) => updatePlan(role.id, 'amount', e.target.value)}
                                          className="bg-transparent border-none text-xs font-bold text-gray-900 focus:ring-0 p-0 w-full"
                                          placeholder="0.00"
                                       />
                                    </div>
                                    {errors[`plan_amount_${role.id}`] && <p className="text-xs font-bold text-red-500 mt-1">{errors[`plan_amount_${role.id}`]}</p>}
                                 </div>

                                 <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400">Billing Interval</label>
                                    <select
                                       value={plan.frequency || 'Lifetime Access'}
                                       onChange={(e) => updatePlan(role.id, 'frequency', e.target.value)}
                                       className="w-full bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 px-3.5 py-2.5"
                                    >
                                       <option value="Lifetime Access">Lifetime Access</option>
                                       <option value="Monthly">Monthly Billing</option>
                                       <option value="Quarterly">Quarterly Billing</option>
                                       <option value="Biannually">Biannually (6 Months)</option>
                                       <option value="Yearly">Yearly Billing</option>
                                    </select>
                                 </div>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
      </div>
   );
}
