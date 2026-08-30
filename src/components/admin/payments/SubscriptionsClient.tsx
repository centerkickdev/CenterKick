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
      const paystackEnv = settings.paystackEnv || 'live';
      const activePaystackSecret = paystackEnv === 'test' ? settings.paystackTestSecretKey : settings.paystackSecret;
      const activePaystackPublic = paystackEnv === 'test' ? settings.paystackTestPublicKey : settings.paystackPublicKey;

      if (settings.paystackActive) {
         if (!activePaystackSecret) {
            errs.paystackSecret = `Paystack Secret key (${paystackEnv.toUpperCase()}) is required when Paystack is active`;
         } else if (!activePaystackSecret.startsWith('sk_')) {
            errs.paystackSecret = 'Secret key must be a valid Paystack key starting with sk_';
         }
         if (!activePaystackPublic) {
            errs.paystackPublicKey = `Paystack Public key (${paystackEnv.toUpperCase()}) is required when Paystack is active`;
         } else if (!activePaystackPublic.startsWith('pk_')) {
            errs.paystackPublicKey = 'Public key must be a valid Paystack key starting with pk_';
         }
      }

      // 4. Stripe Validation
      const stripeEnv = settings.stripeEnv || 'live';
      const activeStripeKey = stripeEnv === 'test' ? settings.stripeTestPublicKey : settings.stripeKey;
      const activeStripeSecret = stripeEnv === 'test' ? settings.stripeTestSecretKey : settings.stripeSecret;

      if (settings.stripeActive) {
         if (!activeStripeKey) {
            errs.stripeKey = `Stripe Publishable key (${stripeEnv.toUpperCase()}) is required when Stripe is active`;
         } else if (!activeStripeKey.startsWith('pk_')) {
            errs.stripeKey = 'Publishable key must be a valid Stripe key starting with pk_';
         }
         if (!activeStripeSecret) {
            errs.stripeSecret = `Stripe Secret key (${stripeEnv.toUpperCase()}) is required when Stripe is active`;
         } else if (!activeStripeSecret.startsWith('sk_')) {
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
         <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-gray-100 shadow-sm p-4 sm:p-8 mb-8 sm:mb-12 space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
               <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Payment Gateways & Integrations</h2>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-0.5">Configure live and test environment API credentials for player and agent subscriptions.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-8">
               {/* Legacy Checkout Card */}
               <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-700 border border-slate-200 shadow-sm shrink-0">
                           <ExternalLink className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900">Legacy Checkout</h3>
                              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-gray-200 text-gray-700 rounded-md">Universal</span>
                           </div>
                           <p className="text-xs font-semibold text-gray-600 mt-0.5">External Universal Payment Link & Fallback</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-700 sm:block hidden">{settings.legacyLinkActive ? 'Enabled' : 'Disabled'}</span>
                        <button
                           type="button"
                           onClick={() => setSettings({ ...settings, legacyLinkActive: !settings.legacyLinkActive })}
                           className={`w-12 h-6 rounded-full relative transition-colors inline-block ${settings.legacyLinkActive ? 'bg-slate-900' : 'bg-gray-300'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.legacyLinkActive ? 'right-1' : 'left-1'}`}></div>
                        </button>
                     </div>
                  </div>

                  {settings.legacyLinkActive && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200/60">
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-900 tracking-wide">External Payment URL</label>
                           <div className="relative group">
                              <input
                                 type="text"
                                 value={settings.paymentLink || ''}
                                 onChange={(e) => setSettings({ ...settings, paymentLink: e.target.value })}
                                 placeholder="https://..."
                                 className={`w-full bg-white border rounded-xl px-4 py-3 text-xs font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-slate-400 outline-none transition-all ${errors.paymentLink ? 'border-red-500' : 'border-gray-200'}`}
                              />
                              {settings.paymentLink && !errors.paymentLink && (
                                 <a href={settings.paymentLink} target="_blank" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                 </a>
                              )}
                           </div>
                           {errors.paymentLink && <p className="text-xs font-bold text-red-600 mt-1">{errors.paymentLink}</p>}
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-900 tracking-wide">Checkout Instructions</label>
                           <textarea
                              rows={2}
                              value={settings.instructions || ''}
                              onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
                              placeholder="Instructions shown for manual or fallback links..."
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-slate-400 outline-none transition-all resize-none"
                           />
                        </div>
                     </div>
                  )}
               </div>

               {/* Bank Settlement Card */}
               <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-amber-600 border border-amber-200 shadow-sm shrink-0">
                           <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900">Bank Settlement</h3>
                              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 rounded-md">Always Active</span>
                           </div>
                           <p className="text-xs font-semibold text-gray-600 mt-0.5">Manual Direct Bank Transfer Details</p>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-amber-200/60">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 tracking-wide">Institution / Bank Name</label>
                        <input
                           type="text"
                           value={settings.bankName || ''}
                           onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                           placeholder="e.g. Zenith Bank"
                           className={`w-full bg-white border rounded-xl px-4 py-3 text-xs font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-amber-300 outline-none transition-all ${errors.bankName ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {errors.bankName && <p className="text-xs font-bold text-red-600 mt-1">{errors.bankName}</p>}
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 tracking-wide">Account Name</label>
                        <input
                           type="text"
                           value={settings.accountName || ''}
                           onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                           placeholder="e.g. CenterKick Sports Ltd"
                           className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-amber-300 outline-none transition-all"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 tracking-wide">Account Number</label>
                        <input
                           type="text"
                           value={settings.accountNumber || ''}
                           onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                           placeholder="e.g. 1012345678"
                           className={`w-full bg-white border rounded-xl px-4 py-3 text-xs font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-amber-300 outline-none transition-all ${errors.accountNumber ? 'border-red-500' : 'border-gray-200'}`}
                        />
                        {errors.accountNumber && <p className="text-xs font-bold text-red-600 mt-1">{errors.accountNumber}</p>}
                     </div>
                  </div>
               </div>

               {/* Paystack Card */}
               <div className="bg-teal-50/30 border border-teal-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-6 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-teal-600 border border-teal-200 shadow-sm shrink-0">
                           <Zap className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900">Paystack</h3>
                              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-teal-800 text-white rounded-md tracking-wider">Automated Gateway</span>
                           </div>
                           <p className="text-xs font-semibold text-gray-600 mt-0.5">Cards, Transfer, USSD & Auto-Debit Billing</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-700 sm:block hidden">{settings.paystackActive ? 'Enabled' : 'Disabled'}</span>
                        <button
                           type="button"
                           onClick={() => setSettings({ ...settings, paystackActive: !settings.paystackActive })}
                           className={`w-12 h-6 rounded-full relative transition-colors inline-block ${settings.paystackActive ? 'bg-teal-600' : 'bg-gray-300'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.paystackActive ? 'right-1' : 'left-1'}`}></div>
                        </button>
                     </div>
                  </div>

                  {settings.paystackActive && (
                     <div className="space-y-6 pt-4 border-t border-teal-200/60">
                        {/* Active Mode Banner Switcher */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 sm:p-4 rounded-2xl border border-teal-100 shadow-sm gap-3">
                           <div>
                              <p className="text-xs sm:text-sm font-bold text-gray-900">Active Environment Mode</p>
                              <p className="text-[11px] font-bold text-gray-700">Toggle which API key pair is actively used during checkout.</p>
                           </div>
                           <div className="flex gap-1.5 bg-gray-200 p-1.5 rounded-xl border border-gray-300 shrink-0">
                              <button
                                 type="button"
                                 onClick={() => setSettings({ ...settings, paystackEnv: 'test' })}
                                 className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
                                    (settings.paystackEnv || 'live') === 'test'
                                       ? 'bg-amber-600 text-white shadow-md'
                                       : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                                 }`}
                              >
                                 Test / Sandbox
                              </button>
                              <button
                                 type="button"
                                 onClick={() => setSettings({ ...settings, paystackEnv: 'live' })}
                                 className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
                                    (settings.paystackEnv || 'live') === 'live'
                                       ? 'bg-teal-700 text-white shadow-md'
                                       : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                                 }`}
                              >
                                 Live / Production
                              </button>
                           </div>
                        </div>

                        {/* Dual Key Credentials Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                           {/* Test Credentials Block */}
                           <div className={`p-5 rounded-2xl border space-y-4 transition-all ${ (settings.paystackEnv || 'live') === 'test' ? 'bg-amber-50/70 border-amber-300 shadow-sm' : 'bg-white border-gray-300' }`}>
                              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                 <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">Test Credentials</span>
                                 {(settings.paystackEnv || 'live') === 'test' ? (
                                    <span className="text-[10px] font-extrabold bg-amber-600 text-white px-2.5 py-0.5 rounded-full shadow-sm">ACTIVE</span>
                                 ) : (
                                    <span className="text-[10px] font-extrabold bg-gray-200 text-gray-800 px-2.5 py-0.5 rounded-full">INACTIVE</span>
                                 )}
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-gray-900">Test Secret Key</label>
                                 <input
                                    type="password"
                                    value={settings.paystackTestSecretKey || (settings.paystackEnv === 'test' ? settings.paystackSecret : '') || ''}
                                    onChange={(e) => setSettings({ ...settings, paystackTestSecretKey: e.target.value })}
                                    placeholder="sk_test_..."
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-amber-400 outline-none"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-gray-900">Test Public Key</label>
                                 <input
                                    type="text"
                                    value={settings.paystackTestPublicKey || (settings.paystackEnv === 'test' ? settings.paystackPublicKey : '') || ''}
                                    onChange={(e) => setSettings({ ...settings, paystackTestPublicKey: e.target.value })}
                                    placeholder="pk_test_..."
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-amber-400 outline-none"
                                 />
                              </div>
                           </div>

                           {/* Live Credentials Block */}
                           <div className={`p-5 rounded-2xl border space-y-4 transition-all ${ (settings.paystackEnv || 'live') === 'live' ? 'bg-teal-50/70 border-teal-300 shadow-sm' : 'bg-white border-gray-300' }`}>
                              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                 <span className="text-xs font-extrabold text-teal-950 uppercase tracking-wider">Live Credentials</span>
                                 {(settings.paystackEnv || 'live') === 'live' ? (
                                    <span className="text-[10px] font-extrabold bg-teal-700 text-white px-2.5 py-0.5 rounded-full shadow-sm">ACTIVE</span>
                                 ) : (
                                    <span className="text-[10px] font-extrabold bg-gray-200 text-gray-800 px-2.5 py-0.5 rounded-full">INACTIVE</span>
                                 )}
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-gray-800">Live Secret Key</label>
                                 <input
                                    type="password"
                                    value={settings.paystackSecret || settings.paystackLiveSecretKey || ''}
                                    onChange={(e) => setSettings({ ...settings, paystackSecret: e.target.value, paystackLiveSecretKey: e.target.value })}
                                    placeholder="sk_live_..."
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-teal-400 outline-none"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-gray-800">Live Public Key</label>
                                 <input
                                    type="text"
                                    value={settings.paystackPublicKey || settings.paystackLivePublicKey || ''}
                                    onChange={(e) => setSettings({ ...settings, paystackPublicKey: e.target.value, paystackLivePublicKey: e.target.value })}
                                    placeholder="pk_live_..."
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-teal-400 outline-none"
                                 />
                              </div>
                           </div>
                        </div>

                        {(errors.paystackSecret || errors.paystackPublicKey) && (
                           <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">{errors.paystackSecret || errors.paystackPublicKey}</p>
                        )}

                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-900 tracking-wide">Webhook Callback URL</label>
                           <div className="px-4 py-3 bg-white rounded-xl text-xs font-mono text-gray-800 font-bold break-all select-all border border-gray-200 shadow-sm">
                              {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/paystack` : '.../api/webhooks/paystack'}
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               {/* Stripe Card */}
               <div className="bg-indigo-50/30 border border-indigo-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-6 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 border border-indigo-200 shadow-sm shrink-0">
                           <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900">Stripe</h3>
                              <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-indigo-900 text-white rounded-md tracking-wider">Global Gateway</span>
                           </div>
                           <p className="text-xs font-semibold text-gray-700 mt-0.5">International Cards & Apple Pay / Google Pay</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-800 sm:block hidden">{settings.stripeActive ? 'Enabled' : 'Disabled'}</span>
                        <button
                           type="button"
                           onClick={() => setSettings({ ...settings, stripeActive: !settings.stripeActive })}
                           className={`w-12 h-6 rounded-full relative transition-colors inline-block ${settings.stripeActive ? 'bg-indigo-600' : 'bg-gray-400'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.stripeActive ? 'right-1' : 'left-1'}`}></div>
                        </button>
                     </div>
                  </div>

                  {settings.stripeActive && (
                     <div className="space-y-6 pt-4 border-t border-indigo-200/60">
                        {/* Active Mode Banner Switcher */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 sm:p-4 rounded-2xl border border-indigo-200 shadow-sm gap-3">
                           <div>
                              <p className="text-xs sm:text-sm font-bold text-gray-900">Active Environment Mode</p>
                              <p className="text-[11px] font-bold text-gray-700">Toggle active Stripe API keys used for checkout.</p>
                           </div>
                           <div className="flex gap-1.5 bg-gray-200 p-1.5 rounded-xl border border-gray-300 shrink-0">
                              <button
                                 type="button"
                                 onClick={() => setSettings({ ...settings, stripeEnv: 'test' })}
                                 className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
                                    (settings.stripeEnv || 'live') === 'test'
                                       ? 'bg-amber-600 text-white shadow-md'
                                       : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                                 }`}
                              >
                                 Test / Sandbox
                              </button>
                              <button
                                 type="button"
                                 onClick={() => setSettings({ ...settings, stripeEnv: 'live' })}
                                 className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
                                    (settings.stripeEnv || 'live') === 'live'
                                       ? 'bg-indigo-700 text-white shadow-md'
                                       : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                                 }`}
                              >
                                 Live / Production
                              </button>
                           </div>
                        </div>

                        {/* Dual Key Credentials Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                           {/* Test Credentials Block */}
                           <div className={`p-5 rounded-2xl border space-y-4 transition-all ${ (settings.stripeEnv || 'live') === 'test' ? 'bg-amber-50/70 border-amber-300 shadow-sm' : 'bg-white border-gray-300' }`}>
                              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                 <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">Test Credentials</span>
                                 {(settings.stripeEnv || 'live') === 'test' ? (
                                    <span className="text-[10px] font-extrabold bg-amber-600 text-white px-2.5 py-0.5 rounded-full shadow-sm">ACTIVE</span>
                                 ) : (
                                    <span className="text-[10px] font-extrabold bg-gray-200 text-gray-800 px-2.5 py-0.5 rounded-full">INACTIVE</span>
                                 )}
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-gray-900">Test Publishable Key</label>
                                 <input
                                    type="text"
                                    value={settings.stripeTestPublicKey || (settings.stripeEnv === 'test' ? settings.stripeKey : '') || ''}
                                    onChange={(e) => setSettings({ ...settings, stripeTestPublicKey: e.target.value })}
                                    placeholder="pk_test_..."
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-amber-400 outline-none"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-gray-900">Test Secret Key</label>
                                 <input
                                    type="password"
                                    value={settings.stripeTestSecretKey || (settings.stripeEnv === 'test' ? settings.stripeSecret : '') || ''}
                                    onChange={(e) => setSettings({ ...settings, stripeTestSecretKey: e.target.value })}
                                    placeholder="sk_test_..."
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-amber-400 outline-none"
                                 />
                              </div>
                           </div>

                           {/* Live Credentials Block */}
                           <div className={`p-5 rounded-2xl border space-y-4 transition-all ${ (settings.stripeEnv || 'live') === 'live' ? 'bg-indigo-50/70 border-indigo-300 shadow-sm' : 'bg-white border-gray-300' }`}>
                              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                 <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">Live Credentials</span>
                                 {(settings.stripeEnv || 'live') === 'live' ? (
                                    <span className="text-[10px] font-extrabold bg-indigo-700 text-white px-2.5 py-0.5 rounded-full shadow-sm">ACTIVE</span>
                                 ) : (
                                    <span className="text-[10px] font-extrabold bg-gray-200 text-gray-800 px-2.5 py-0.5 rounded-full">INACTIVE</span>
                                 )}
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-gray-900">Live Publishable Key</label>
                                 <input
                                    type="text"
                                    value={settings.stripeKey || settings.stripeLivePublicKey || ''}
                                    onChange={(e) => setSettings({ ...settings, stripeKey: e.target.value, stripeLivePublicKey: e.target.value })}
                                    placeholder="pk_live_..."
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-gray-900">Live Secret Key</label>
                                 <input
                                    type="password"
                                    value={settings.stripeSecret || settings.stripeLiveSecretKey || ''}
                                    onChange={(e) => setSettings({ ...settings, stripeSecret: e.target.value, stripeLiveSecretKey: e.target.value })}
                                    placeholder="sk_live_..."
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                                 />
                              </div>
                           </div>
                         </div>

                         {(errors.stripeKey || errors.stripeSecret) && (
                            <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">{errors.stripeKey || errors.stripeSecret}</p>
                         )}
                     </div>
                  )}
               </div>

               {/* PayPal Card */}
               <div className="bg-blue-50/30 border border-blue-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-6 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 border border-blue-200 shadow-sm shrink-0">
                           <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900">PayPal</h3>
                              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-100 text-blue-900 rounded-md">Braintree/Legacy</span>
                           </div>
                           <p className="text-xs font-semibold text-gray-600 mt-0.5">PayPal Wallet & Express Checkout Integration</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-700 sm:block hidden">{settings.paypalActive ? 'Enabled' : 'Disabled'}</span>
                        <button
                           type="button"
                           onClick={() => setSettings({ ...settings, paypalActive: !settings.paypalActive })}
                           className={`w-12 h-6 rounded-full relative transition-colors inline-block ${settings.paypalActive ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.paypalActive ? 'right-1' : 'left-1'}`}></div>
                        </button>
                     </div>
                  </div>

                  {settings.paypalActive && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-blue-200/60">
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-900 tracking-wide">Client ID</label>
                           <input
                              type="text"
                              value={settings.paypalId || ''}
                              onChange={(e) => setSettings({ ...settings, paypalId: e.target.value })}
                              placeholder="AZ_..."
                              className={`w-full bg-white border rounded-xl px-4 py-3 text-xs font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-300 outline-none transition-all ${errors.paypalId ? 'border-red-500' : 'border-gray-200'}`}
                           />
                           {errors.paypalId && <p className="text-xs font-bold text-red-600 mt-1">{errors.paypalId}</p>}
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-gray-900 tracking-wide">Environment</label>
                           <select
                              value={settings.paypalEnv || 'sandbox'}
                              onChange={(e) => setSettings({ ...settings, paypalEnv: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-300 outline-none transition-all"
                           >
                              <option value="sandbox" className="text-gray-900 bg-white">Sandbox (Testing)</option>
                              <option value="live" className="text-gray-900 bg-white">Live (Production)</option>
                           </select>
                        </div>
                     </div>
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
                        <tr className="bg-gray-100/80 border-b border-gray-200">
                           <th className="px-6 py-4 text-xs font-extrabold text-gray-800 uppercase tracking-widest whitespace-nowrap">Account Type</th>
                           <th className="px-6 py-4 text-xs font-extrabold text-gray-800 uppercase tracking-widest whitespace-nowrap">Plan Name</th>
                           <th className="px-6 py-4 text-xs font-extrabold text-gray-800 uppercase tracking-widest whitespace-nowrap">Charge Rate</th>
                           <th className="px-6 py-4 text-xs font-extrabold text-gray-800 uppercase tracking-widest whitespace-nowrap">Billing Interval</th>
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
                                       className="w-full bg-transparent border-none text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-200 rounded-lg px-3 py-2 transition-all placeholder:text-gray-500"
                                       placeholder="PLAN NAME"
                                    />
                                 </td>
                                 <td className="px-6 py-5 min-w-[180px]">
                                    <div className={`flex items-center gap-2 bg-gray-50 border rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-amber-200 transition-all ${errors[`plan_amount_${role.id}`] ? 'border-red-500' : 'border-gray-300'}`}>
                                       <span className="text-sm font-extrabold text-gray-900 select-none">₦</span>
                                       <input
                                          type="text"
                                          value={plan.amount || '0.00'}
                                          onChange={(e) => updatePlan(role.id, 'amount', e.target.value)}
                                          className="bg-transparent border-none text-sm font-bold text-gray-900 focus:ring-0 p-0 w-full placeholder:text-gray-500"
                                          placeholder="0.00"
                                       />
                                    </div>
                                    {errors[`plan_amount_${role.id}`] && <p className="text-xs font-bold text-red-500 mt-1">{errors[`plan_amount_${role.id}`]}</p>}
                                 </td>
                                 <td className="px-6 py-5 min-w-[180px]">
                                    <select
                                       value={plan.frequency || 'Lifetime Access'}
                                       onChange={(e) => updatePlan(role.id, 'frequency', e.target.value)}
                                       className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 px-4 py-2 focus:ring-2 focus:ring-amber-200 transition-all"
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
                                 <label className="text-xs font-bold text-gray-800">Plan Name</label>
                                 <input
                                    type="text"
                                    value={plan.name || `CenterKick ${role.id.charAt(0).toUpperCase() + role.id.slice(1)}`}
                                    onChange={(e) => updatePlan(role.id, 'name', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 rounded-xl px-3.5 py-2.5 placeholder:text-gray-500"
                                    placeholder="PLAN NAME"
                                 />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                 <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-800">Charge Rate</label>
                                    <div className={`flex items-center gap-2 bg-gray-50 border rounded-xl px-3.5 py-2.5 ${errors[`plan_amount_${role.id}`] ? 'border-red-500' : 'border-gray-200'}`}>
                                       <span className="text-xs font-extrabold text-gray-900 select-none">₦</span>
                                       <input
                                          type="text"
                                          value={plan.amount || '0.00'}
                                          onChange={(e) => updatePlan(role.id, 'amount', e.target.value)}
                                          className="bg-transparent border-none text-xs font-bold text-gray-900 focus:ring-0 p-0 w-full placeholder:text-gray-500"
                                          placeholder="0.00"
                                       />
                                    </div>
                                    {errors[`plan_amount_${role.id}`] && <p className="text-xs font-bold text-red-500 mt-1">{errors[`plan_amount_${role.id}`]}</p>}
                                 </div>

                                 <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-800">Billing Interval</label>
                                    <select
                                       value={plan.frequency || 'Lifetime Access'}
                                       onChange={(e) => updatePlan(role.id, 'frequency', e.target.value)}
                                       className="w-full bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 px-3.5 py-2.5"
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
