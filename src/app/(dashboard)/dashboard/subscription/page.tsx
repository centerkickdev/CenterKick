'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  History, 
  Check, 
  ChevronRight, 
  Zap, 
  Calendar, 
  Globe, 
  X, 
  Building, 
  FileText, 
  Eye, 
  CreditCard,
  Copy,
  Hand
} from 'lucide-react';

interface UserProfile {
  role?: string;
  status?: string;
  verification_requested?: boolean;
}

interface CMSPaymentSettings {
  paymentLink: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

interface UserTransaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  method: string;
  created_at: string;
  metadata?: {
    reason?: string;
    comment?: string;
    rejection_reason?: string;
    approval_comment?: string;
    proofName?: string;
    proofEmail?: string;
    proofFileName?: string;
    proofFileUrl?: string;
  };
}

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState('My Plan');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<CMSPaymentSettings | null>(null);
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [inspectTransaction, setInspectTransaction] = useState<UserTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{type: 'success'|'error', text: string}|null>(null);
  const [pricingPlan, setPricingPlan] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch profile for verification status
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Fetch payment settings from CMS
        const { data: settings } = await supabase
          .from('site_content')
          .select('content')
          .eq('page', 'settings')
          .eq('section', 'payment')
          .single();
        
        setProfile(profData);
        setPaymentSettings(settings?.content || { paymentLink: 'https://paystack.com/pay/centerkick-pro' });

        // Fetch user transaction history securely
        const { getUserTransactions, getPricingPlan } = await import('./actions');
        const txRes = await getUserTransactions();
        if (txRes && txRes.transactions) {
          setTransactions(txRes.transactions);
        }

        const planData = await getPricingPlan(profData?.role || 'player');
        setPricingPlan(planData);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleClaimVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);
    
    const formData = new FormData(e.currentTarget);
    const { requestVerification } = await import('./actions');
    const res = await requestVerification(formData);

    if (res.error) {
      setMsg({ type: 'error', text: res.error });
    } else {
      setMsg({ type: 'success', text: 'Verification request submitted! Admin will review your payment shortly.' });
      // Update local state
      setProfile({ ...profile, verification_requested: true });
    }
    setIsSubmitting(false);
  };

  const userRole = profile?.role || 'player';
  const basePrice = pricingPlan?.amount || 15000;
  const durationMonths = pricingPlan?.duration_months || 12;
  const planName = pricingPlan?.plan_name || `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`;
  const usdPrice = basePrice / 1500;

  const plan = {
    name: planName,
    price: `â‚¦${basePrice.toLocaleString()}`,
    usdEquivalent: `$${usdPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    period: `Per ${durationMonths === 1 ? 'Month' : durationMonths === 3 ? 'Quarter' : durationMonths === 6 ? 'Half-Year' : durationMonths === 12 ? 'Year' : durationMonths + ' Months'}`,
    status: profile?.status === 'active' ? 'Active' : (profile?.verification_requested ? 'Pending Approval' : 'Unverified'),
    features: [
      "Verified Professional Badge",
      "Priority Search & Discovery Listing",
      "Premium Multi-tab Public Profile",
      "Performance & Tactical Dashboards",
      "Unlimited News & Highlight Integration",
      "Direct Agency & Scout Networking",
      "Scouting ROI Analytics",
    ]
  };

  const latestConfirmedTx = transactions.find(t => t.status === 'confirmed');
  
  let subscriptionEndDate: Date | null = null;
  let daysUntilExpiry: number | null = null;

  if (latestConfirmedTx && durationMonths) {
    const startDate = new Date(latestConfirmedTx.created_at);
    subscriptionEndDate = new Date(startDate);
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + durationMonths);

    const now = new Date();
    const timeDiff = subscriptionEndDate.getTime() - now.getTime();
    daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  const recurringTypeStr = durationMonths === 1 ? 'monthly' : durationMonths === 12 ? 'annual' : `${durationMonths}-month`;

  if (isLoading) return <div className="pt-20 text-center font-bold tracking-wide animate-pulse text-gray-400">Loading Billing Data...</div>;

  return (
    <div className="max-w-full max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tighter">Billing & <span className="text-[#b50a0a]">Subscription</span></h1>
          <p className="text-gray-500 text-xs font-bold tracking-wide mt-1">Manage your professional tier and payment confirmation.</p>
        </div>
        
        {/* Global Account Status & Pricing */}
        <div className={`${
          plan.status === 'Active' ? 'bg-green-50 border-green-100' : 
          plan.status === 'Pending Approval' ? 'bg-blue-50 border-blue-100' :
          'bg-red-50 border-red-100'
        } border px-6 py-4 rounded-[20px] shadow-sm flex items-center justify-between md:justify-start gap-6 w-full md:w-auto`}>
           <div className="text-left">
              <p className="text-xs font-bold tracking-wide mb-1 text-gray-900">Account Status</p>
              <p className={`text-xl font-bold tracking-tighter ${
                 plan.status === 'Active' ? 'text-green-600' : 
                 plan.status === 'Pending Approval' ? 'text-blue-600' :
                 'text-[#b50a0a]'
              }`}>
                 {plan.status === 'Active' ? 'Paid' : plan.status === 'Unverified' ? 'Unpaid' : plan.status}
              </p>
           </div>
           
           <div className={`border-l pl-6 ${
              plan.status === 'Active' ? 'border-green-200' : 
              plan.status === 'Pending Approval' ? 'border-blue-200' :
              'border-red-200'
           }`}>
              <div className="flex flex-col gap-0.5">
                 <span className={`text-lg font-bold ${
                    plan.status === 'Active' ? 'text-gray-900' : 'text-[#b50a0a]'
                 }`}>{plan.price}</span>
                 <div className="flex items-baseline gap-1">
                    <p className="text-xs font-bold text-gray-900">~ {plan.usdEquivalent}</p>
                    <span className="text-xs font-bold text-gray-900">{plan.period}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Top Navigation Tabs */}
        <nav className="flex gap-2 overflow-x-auto pb-4 border-b border-gray-100 hide-scrollbar">
          {[
            { id: 'My Plan', icon: ShieldCheck },
            { id: 'History', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-gray-900 text-white shadow-lg shadow-black/20' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.id}
            </button>
          ))}
        </nav>

        {/* Main Content Area */}
        <div className="w-full">
          {activeTab === 'My Plan' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               {/* Current Status Card */}
               <div className="relative group overflow-hidden bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 md:p-8 md:p-12">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#b50a0a] blur-[150px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="flex flex-col gap-10 md:p-8 relative z-10">
                     {/* Payment Routes (Visible only if Unverified) */}
                     {plan.status === 'Unverified' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                           
                           {/* Route 1: Online Payment */}
                           <div className="space-y-6 bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex flex-col items-start">
                              <div>
                                <span className="inline-block px-3 py-1 bg-gray-900 text-white text-xs font-bold tracking-widest rounded-full mb-3 uppercase">Route 1: Automated</span>
                                <h3 className="text-lg font-bold text-gray-900">Instant Online Activation</h3>
                                <p className="text-xs font-bold text-gray-500 tracking-wide mt-2">Pay securely online to activate your professional badge and unlock all features instantly.</p>
                              </div>
                              <div className="pt-2 w-full">
                                <a 
                                   href={paymentSettings?.paymentLink || '#'} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="flex items-center justify-center gap-3 w-full bg-gray-900 text-white px-8 py-4 rounded-2xl text-xs font-bold tracking-[0.2em] hover:bg-[#b50a0a] transition-all shadow-xl hover:-translate-y-1 uppercase"
                                >
                                   Subscribe Now <ChevronRight className="w-4 h-4" />
                                </a>
                              </div>
                           </div>

                           {/* Route 2: Manual Payment */}
                           {paymentSettings?.bankName && (
                              <div className="space-y-6 bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex flex-col h-full">
                                 <div>
                                   <span className="inline-block px-3 py-1 bg-gray-900 text-white text-xs font-bold tracking-widest rounded-full mb-3 uppercase">Route 2: Manual</span>
                                   <h3 className="text-lg font-bold text-gray-900">Direct Bank Transfer</h3>
                                   <p className="text-xs font-bold text-gray-500 tracking-wide mt-2">Transfer to our account, then upload your receipt below to notify the admin.</p>
                                 </div>

                                 <div className="bg-gray-50 p-5 rounded-[20px] border border-gray-100">
                                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                         <div>
                                             <p className="text-xs font-bold text-gray-400 tracking-wide uppercase">Bank</p>
                                             <p className="text-xs font-bold text-gray-900">{paymentSettings.bankName}</p>
                                         </div>
                                         <div>
                                             <p className="text-xs font-bold text-gray-400 tracking-wide uppercase">Name</p>
                                             <p className="text-xs font-bold text-gray-900">{paymentSettings.accountName}</p>
                                         </div>
                                         <div className="lg:col-span-2">
                                             <p className="text-xs font-bold text-gray-400 tracking-wide uppercase">Account Number</p>
                                             <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-base font-bold tracking-widest text-[#b50a0a]">{paymentSettings.accountNumber}</p>
                                                <button 
                                                   type="button"
                                                   onClick={() => {
                                                      navigator.clipboard.writeText(paymentSettings.accountNumber || '');
                                                      setMsg({ type: 'success', text: 'Account number copied!' });
                                                   }}
                                                   className="p-1.5 bg-[#b50a0a]/10 text-[#b50a0a] hover:bg-[#b50a0a] hover:text-white rounded-md transition-colors"
                                                   title="Copy Account Number"
                                                >
                                                   <Copy className="w-3.5 h-3.5" />
                                                </button>
                                             </div>
                                         </div>
                                     </div>
                                 </div>

                                 <div className="mt-auto border-t border-gray-100 pt-6">
                                    <form onSubmit={handleClaimVerification} className="space-y-3">
                                       <p className="text-xs font-bold tracking-wide text-gray-900 mb-1">Claim Payment</p>
                                       <input 
                                          name="payment_reference"
                                          type="text" 
                                          placeholder="Transaction Ref/ID" 
                                          required
                                          className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#b50a0a] outline-none transition-all"
                                       />
                                       <input 
                                          name="payment_receipt"
                                          type="file" 
                                          accept="image/*,.pdf"
                                          className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-500 focus:ring-2 focus:ring-[#b50a0a] outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                                       />
                                       <button 
                                          disabled={isSubmitting}
                                          className="w-full bg-white border border-gray-200 text-gray-900 py-3 rounded-xl text-xs font-bold tracking-wide hover:border-[#b50a0a] hover:text-[#b50a0a] transition-all disabled:opacity-50 mt-2"
                                       >
                                          {isSubmitting ? 'Processing...' : 'Notify Admin'}
                                       </button>
                                       {msg && (
                                          <div className={`mt-2 p-3 rounded-xl text-xs font-bold tracking-wide ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                             {msg.text}
                                          </div>
                                       )}
                                    </form>
                                 </div>
                              </div>
                           )}
                        </div>
                     )}

                     {/* Usage Metrics Section */}
                     {plan.status !== 'Unverified' && (
                        <div className={`p-6 rounded-3xl border ${
                           plan.status === 'Pending Approval' ? 'bg-blue-50 border-blue-100' :
                           (daysUntilExpiry !== null && daysUntilExpiry < 7 && daysUntilExpiry >= 0) ? 'bg-amber-50 border-amber-100' :
                           'bg-green-50 border-green-100'
                        }`}>
                           <p className="text-sm font-bold text-gray-800 leading-relaxed">
                              Cello <Hand className="inline-block w-4 h-4 text-amber-500 mb-1" />!, your <span className="font-bold text-[#b50a0a]">{plan.name}</span> account is <span className="font-bold">{plan.status === 'Active' ? 'Paid' : 'Pending Approval'}</span>
                              
                              {plan.status === 'Pending Approval' ? (
                                 <span>. We are currently verifying your payment of {plan.price}. Once confirmed, your subscription will be activated for a {recurringTypeStr} period.</span>
                              ) : (daysUntilExpiry !== null && daysUntilExpiry < 7 && daysUntilExpiry >= 0) ? (
                                 <span>, but it will expire in <span className="text-amber-600 font-bold">{daysUntilExpiry} days</span>, and this is a {recurringTypeStr} subscription. Your next payment of {plan.price} will be on {subscriptionEndDate ? new Date(subscriptionEndDate.getTime() + 86400000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}.</span>
                              ) : (
                                 <span>, and this is a {recurringTypeStr} subscription. Your next payment of {plan.price} will be on {subscriptionEndDate ? new Date(subscriptionEndDate.getTime() + 86400000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}.</span>
                              )}
                           </p>
                        </div>
                     )}
                  </div>

                  <div className="mt-12 pt-12 border-t border-gray-50">
                     <h4 className="text-xs font-bold text-gray-400 tracking-wide mb-8">Professional Features Included:</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-3">
                             <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                                <Check className="w-3 h-3 text-green-600" />
                             </div>
                             <span className="text-sm font-bold text-gray-700">{feature}</span>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Why Go Pro Section */}
               <div className="bg-[#0a0a0b] rounded-[40px] p-4 md:p-8 md:p-12 text-white relative overflow-hidden">
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                     <div>
                        <h3 className="text-2xl font-bold tracking-tighter leading-none mb-4">Maximum <br /><span className="text-[#b50a0a]">Market Visibility</span></h3>
                        <p className="text-xs font-medium text-gray-400 leading-relaxed mb-8">Our proprietary algorithm prioritizes verified profiles in scout searches, ensuring you&apos;re seen by the decision-makers that matter most.</p>
                        <div className="flex items-center gap-4">
                           <div className="flex -space-x-3">
                              {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0b] bg-gray-700"></div>)}
                           </div>
                           <span className="text-xs font-bold tracking-wide text-gray-500">Join 1,200+ Professionals</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                           { icon: Zap, label: 'Instant', sub: 'Verification' },
                           { icon: Globe, label: 'Global', sub: 'Reach' },
                           { icon: ShieldCheck, label: 'Official', sub: 'Status' },
                           { icon: Calendar, label: 'Flexible', sub: 'Billing' },
                        ].map((item, i) => (
                           <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                              <item.icon className="w-5 h-5 text-[#b50a0a] mb-2" />
                              <p className="text-xs font-bold text-white">{item.label}</p>
                              <p className="text-xs font-bold text-gray-500 tracking-wide">{item.sub}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

           {activeTab === 'History' && (
             <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
                <div className="p-4 md:p-8 border-b border-gray-100 flex items-center justify-between">
                   <h3 className="text-base font-bold tracking-wide text-gray-900">Transaction History</h3>
                   <span className="text-xs font-bold text-gray-400 tracking-wide bg-gray-50 px-3 py-1 rounded-full">
                     {transactions.length} records
                   </span>
                </div>
                <div className="divide-y divide-gray-50">
                   {transactions.length === 0 ? (
                      <div className="p-12 text-center">
                         <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <History className="w-6 h-6" />
                         </div>
                         <p className="text-sm font-bold tracking-wide text-gray-400 mb-1">No Transactions Found</p>
                         <p className="text-xs font-medium text-gray-400 tracking-wide leading-relaxed">Your payment history will appear here once you activate your first professional plan.</p>
                      </div>
                   ) : (
                      transactions.map((tx) => (
                         <div 
                            key={tx.id} 
                            onClick={() => setInspectTransaction(tx)}
                            className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-all cursor-pointer group"
                         >
                            <div className="space-y-1">
                               <div className="flex items-center gap-3">
                                  <span className="text-sm font-bold tracking-tight text-gray-900 group-hover:text-[#b50a0a] transition-colors">{tx.reference}</span>
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${
 tx.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-100' :
 tx.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
 tx.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-100' :
 'bg-gray-50 text-gray-700 border border-gray-100'
 }`}>
                                     {tx.status}
                                  </span>
                               </div>
                               <div className="flex items-center gap-2 text-xs text-gray-400 font-bold tracking-wide">
                                  <span>{tx.method.replace('_', ' ')}</span>
                                  <span>â€¢</span>
                                  <span>{new Date(tx.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-right justify-between md:justify-end">
                               <div>
                                  <p className="text-lg font-bold text-gray-900">
                                     {tx.currency === 'USD' ? '$' : 'â‚¦'}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </p>
                                  {(tx.metadata?.rejection_reason || tx.metadata?.reason) && (
                                     <p className="text-xs font-bold text-red-500 tracking-wide mt-1 max-w-xs md:ml-auto">
                                        Reason: {tx.metadata.rejection_reason || tx.metadata.reason}
                                     </p>
                                  )}
                                  {(tx.metadata?.approval_comment || tx.metadata?.comment) && (
                                     <p className="text-xs font-bold text-green-600 tracking-wide mt-1 max-w-xs md:ml-auto">
                                        Note: {tx.metadata.approval_comment || tx.metadata.comment}
                                     </p>
                                  )}
                               </div>
                               <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 group-hover:bg-red-50 group-hover:text-[#b50a0a] transition-all">
                                  <Eye className="w-4 h-4" />
                               </div>
                            </div>
                         </div>
                      ))
                   )}
                </div>
             </div>
           )}
        </div>
      </div>

      {/* User Transaction Details Modal */}
      {inspectTransaction && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setInspectTransaction(null)}>
           <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
             <button onClick={() => setInspectTransaction(null)} className="absolute top-4 md:p-8 right-8 w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-all z-10 cursor-pointer">
               <X className="w-5 h-5 text-gray-400" />
             </button>
             <div className="p-10 pb-10">
               <div className="flex items-center gap-6 mb-10">
                 <div className="w-16 h-16 rounded-2xl bg-slate-900 text-[#b50a0a] flex items-center justify-center font-bold text-2xl shrink-0">
                   {inspectTransaction.currency === 'USD' ? '$' : 'â‚¦'}
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold tracking-tighter leading-none mb-2">Transaction Details</h2>
                   <p className="text-xs font-bold text-[#b50a0a] tracking-[0.2em]">Reference: {inspectTransaction.reference}</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 mb-8 text-left">
                 <div className="space-y-1">
                   <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 tracking-wide"><CreditCard className="w-3.5 h-3.5" /> Amount</div>
                   <p className="text-base font-bold text-slate-900">
                      {inspectTransaction.currency === 'USD' ? '$' : 'â‚¦'}{Number(inspectTransaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {inspectTransaction.currency}
                   </p>
                 </div>
                 <div className="space-y-1">
                   <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 tracking-wide"><Calendar className="w-3.5 h-3.5" /> Date</div>
                   <p className="text-base font-bold text-slate-800">
                      {new Date(inspectTransaction.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                   </p>
                 </div>
                 <div className="space-y-1">
                   <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 tracking-wide"><Building className="w-3.5 h-3.5" /> Method</div>
                   <p className="text-base font-bold text-slate-800">
                      {inspectTransaction.method.replace('_', ' ')}
                   </p>
                 </div>
                 <div className="space-y-1">
                   <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 tracking-wide font-bold"><Globe className="w-3.5 h-3.5" /> Status</div>
                   <div>
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${
 inspectTransaction.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-100' :
 inspectTransaction.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
 inspectTransaction.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-100' :
 'bg-gray-50 text-gray-700 border border-gray-100'
 }`}>
                       {inspectTransaction.status}
                     </span>
                   </div>
                 </div>
               </div>

               {/* Rejection comment */}
               {inspectTransaction.status === 'failed' && (inspectTransaction.metadata?.rejection_reason || inspectTransaction.metadata?.reason) && (
                 <div className="bg-red-50 rounded-[2rem] p-6 mb-8 border border-red-100 space-y-2 text-left">
                   <p className="text-xs font-bold text-red-700 tracking-wide">Rejection Reason</p>
                   <p className="text-red-900 text-sm font-bold leading-relaxed">
                      {inspectTransaction.metadata.rejection_reason || inspectTransaction.metadata.reason}
                   </p>
                 </div>
               )}

               {/* Approval Comment */}
               {inspectTransaction.status === 'confirmed' && (inspectTransaction.metadata?.approval_comment || inspectTransaction.metadata?.comment) && (
                 <div className="bg-green-50 rounded-[2rem] p-6 mb-8 border border-green-100 space-y-2 text-left">
                   <p className="text-xs font-bold text-green-700 tracking-wide">Admin Note</p>
                   <p className="text-green-900 text-sm font-bold leading-relaxed">
                      {inspectTransaction.metadata.approval_comment || inspectTransaction.metadata.comment}
                   </p>
                 </div>
               )}

               {/* Direct Transfer receipt preview */}
               {inspectTransaction.method === 'direct_transfer' && (
                 <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-4 text-left">
                   <h4 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-2">
                     <Building className="w-4 h-4 text-amber-600" /> Uploaded Proof
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium text-slate-600">
                     <div>
                       <p className="text-xs font-bold text-slate-400 tracking-wide">Depositor</p>
                       <p className="font-bold text-slate-800">{inspectTransaction.metadata?.proofName || 'N/A'}</p>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 tracking-wide">Depositor Email</p>
                       <p className="font-bold text-slate-800 break-all">{inspectTransaction.metadata?.proofEmail || 'N/A'}</p>
                     </div>
                   </div>
                   
                   {inspectTransaction.metadata?.proofFileUrl ? (
                     <div className="space-y-2 pt-2 border-t border-slate-200/60">
                       {inspectTransaction.metadata.proofFileUrl.toLowerCase().endsWith('.pdf') ? (
                         <a
                           href={inspectTransaction.metadata.proofFileUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-[#b50a0a] hover:bg-slate-50 transition-all shadow-sm"
                         >
                           <FileText className="w-4 h-4 text-[#b50a0a]" /> Open PDF Receipt
                         </a>
                       ) : (
                         <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white max-h-48 flex items-center justify-center shadow-inner group">
                           <img
                             src={inspectTransaction.metadata.proofFileUrl}
                             alt="Payment Receipt"
                             className="max-h-48 w-full object-contain p-2"
                           />
                           <a
                             href={inspectTransaction.metadata.proofFileUrl}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide backdrop-blur-sm transition-all shadow-lg"
                           >
                             Open Full Image
                           </a>
                         </div>
                       )}
                     </div>
                   ) : inspectTransaction.metadata?.proofFileName ? (
                     <div className="pt-2 border-t border-slate-200/60 text-sm font-bold text-slate-500">
                       Receipt File: {inspectTransaction.metadata.proofFileName}
                     </div>
                   ) : null}
                 </div>
               )}
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
