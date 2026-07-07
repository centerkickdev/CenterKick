'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  History, 
  Check, 
  ChevronRight, 
  Star, 
  Zap, 
  Calendar, 
  Globe, 
  X, 
  Building, 
  FileText, 
  Eye, 
  CreditCard 
} from 'lucide-react';

interface UserProfile {
  role?: string;
  status?: string;
  verification_requested?: boolean;
}

interface CMSPaymentSettings {
  paymentLink: string;
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
        const { getUserTransactions } = await import('./actions');
        const txRes = await getUserTransactions();
        if (txRes && txRes.transactions) {
          setTransactions(txRes.transactions);
        }
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

  const rolePrices: Record<string, number> = {
    player: 15000,
    coach: 20000,
    agent: 30000,
    scout: 25000,
    organization: 50000
  };
  const userRole = profile?.role || 'player';
  const basePrice = rolePrices[userRole] || 15000;
  const usdPrice = basePrice / 1500;

  const plan = {
    name: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Pro`,
    price: `₦${basePrice.toLocaleString()}`,
    usdEquivalent: `$${usdPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    period: "Per Quarter",
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

  if (isLoading) return <div className="pt-20 text-center font-black tracking-wide animate-pulse text-gray-400">Loading Billing Data...</div>;

  return (
    <div className="max-w-full max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Billing & <span className="text-[#b50a0a]">Subscription</span></h1>
          <p className="text-gray-500 text-[10px] font-bold tracking-wide mt-1">Manage your professional tier and payment confirmation.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Navigation Sidebar */}
        <aside className="lg:w-1/4">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
            {[
              { id: 'My Plan', icon: ShieldCheck },
              { id: 'History', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black tracking-wide transition-all whitespace-nowrap lg:w-full ${activeTab === tab.id ? 'bg-gray-900 text-white shadow-lg shadow-black/20' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.id}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {activeTab === 'My Plan' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               {/* Current Status Card */}
               <div className="relative group overflow-hidden bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 md:p-8 md:p-12">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#b50a0a] blur-[150px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:p-8 relative z-10">
                     <div className="space-y-6 flex-1">
                        <div className="bg-[#b50a0a] w-fit px-4 py-1.5 rounded-full text-[9px] font-black tracking-wide text-white shadow-lg flex items-center gap-2">
                           <Star className="w-3 h-3 fill-current" /> Professional Tier
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">{plan.name}</h2>
                         <div className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-2">
                               <span className="text-3xl font-black text-[#b50a0a]">{plan.price}</span>
                               <span className="text-[10px] font-black text-gray-400 tracking-wide">{plan.period}</span>
                            </div>
                            <p className="text-[11px] font-bold text-gray-400 lowercase tracking-wide">
                               ~ {plan.usdEquivalent} usd conversion
                            </p>
                         </div>
                        
                        {plan.status === 'Unverified' && (
                           <div className="pt-6 space-y-6">
                              <p className="text-[10px] font-bold text-gray-500 tracking-wide leading-relaxed">To activate your professional badge and unlock all features, please complete payment using the secure link below.</p>
                              <a 
                                 href={paymentSettings?.paymentLink || '#'} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-2xl text-sm font-black tracking-[0.2em] hover:bg-[#b50a0a] transition-all shadow-xl hover:-translate-y-1"
                              >
                                 Subscribe Now <ChevronRight className="w-5 h-5" />
                              </a>
                           </div>
                        )}
                     </div>

                     <div className="w-full md:w-64 space-y-4">
                        <div className={`${
 plan.status === 'Active' ? 'bg-green-50 border-green-100' : 
 plan.status === 'Pending Approval' ? 'bg-blue-50 border-blue-100' :
 'bg-red-50 border-red-100'
 } border px-6 py-6 rounded-[30px] shadow-sm`}>
                           <p className={`text-[9px] font-black tracking-wide mb-1 ${
 plan.status === 'Active' ? 'text-green-700' : 
 plan.status === 'Pending Approval' ? 'text-blue-700' :
 'text-red-700'
 }`}>Account Status</p>
                           <p className={`text-xl font-black tracking-tighter ${
 plan.status === 'Active' ? 'text-green-800' : 
 plan.status === 'Pending Approval' ? 'text-blue-800' :
 'text-red-800'
 }`}>{plan.status}</p>
                        </div>

                        {plan.status === 'Unverified' && (
                           <form onSubmit={handleClaimVerification} className="space-y-4 bg-gray-50 p-6 rounded-[30px] border border-gray-100">
                              <p className="text-[9px] font-black tracking-wide text-gray-400 mb-2">Claim Payment</p>
                              <input 
                                 name="payment_reference"
                                 type="text" 
                                 placeholder="Transaction Ref/ID" 
                                 required
                                 className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] outline-none transition-all"
                              />
                              <button 
                                 disabled={isSubmitting}
                                 className="w-full bg-white border border-gray-200 text-gray-900 py-3 rounded-xl text-[9px] font-black tracking-wide hover:border-[#b50a0a] hover:text-[#b50a0a] transition-all disabled:opacity-50"
                              >
                                 {isSubmitting ? 'Processing...' : 'Notify Admin'}
                              </button>
                           </form>
                        )}

                        {msg && (
                           <div className={`p-4 rounded-2xl text-[9px] font-bold tracking-wide ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {msg.text}
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="mt-12 pt-12 border-t border-gray-50">
                     <h4 className="text-[10px] font-black text-gray-400 tracking-wide mb-8">Professional Features Included:</h4>
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
                        <h3 className="text-2xl font-black tracking-tighter leading-none mb-4">Maximum <br /><span className="text-[#b50a0a]">Market Visibility</span></h3>
                        <p className="text-[11px] font-medium text-gray-400 leading-relaxed mb-8">Our proprietary algorithm prioritizes verified profiles in scout searches, ensuring you&apos;re seen by the decision-makers that matter most.</p>
                        <div className="flex items-center gap-4">
                           <div className="flex -space-x-3">
                              {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0b] bg-gray-700"></div>)}
                           </div>
                           <span className="text-[9px] font-black tracking-wide text-gray-500">Join 1,200+ Professionals</span>
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
                              <p className="text-[10px] font-black text-white">{item.label}</p>
                              <p className="text-[8px] font-bold text-gray-500 tracking-wide">{item.sub}</p>
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
                   <h3 className="text-base font-black tracking-wide text-gray-900">Transaction History</h3>
                   <span className="text-[10px] font-black text-gray-400 tracking-wide bg-gray-50 px-3 py-1 rounded-full">
                     {transactions.length} records
                   </span>
                </div>
                <div className="divide-y divide-gray-50">
                   {transactions.length === 0 ? (
                      <div className="p-12 text-center">
                         <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <History className="w-6 h-6" />
                         </div>
                         <p className="text-sm font-black tracking-wide text-gray-400 mb-1">No Transactions Found</p>
                         <p className="text-[10px] font-medium text-gray-400 tracking-wide leading-relaxed">Your payment history will appear here once you activate your first professional plan.</p>
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
                                  <span className="text-sm font-black tracking-tight text-gray-900 group-hover:text-[#b50a0a] transition-colors">{tx.reference}</span>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide ${
 tx.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-100' :
 tx.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
 tx.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-100' :
 'bg-gray-50 text-gray-700 border border-gray-100'
 }`}>
                                     {tx.status}
                                  </span>
                               </div>
                               <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold tracking-wide">
                                  <span>{tx.method.replace('_', ' ')}</span>
                                  <span>•</span>
                                  <span>{new Date(tx.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-right justify-between md:justify-end">
                               <div>
                                  <p className="text-lg font-black text-gray-900">
                                     {tx.currency === 'USD' ? '$' : '₦'}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </p>
                                  {(tx.metadata?.rejection_reason || tx.metadata?.reason) && (
                                     <p className="text-[9px] font-bold text-red-500 tracking-wide mt-1 max-w-xs md:ml-auto">
                                        Reason: {tx.metadata.rejection_reason || tx.metadata.reason}
                                     </p>
                                  )}
                                  {(tx.metadata?.approval_comment || tx.metadata?.comment) && (
                                     <p className="text-[9px] font-bold text-green-600 tracking-wide mt-1 max-w-xs md:ml-auto">
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
                 <div className="w-16 h-16 rounded-2xl bg-slate-900 text-[#b50a0a] flex items-center justify-center font-black text-2xl shrink-0">
                   {inspectTransaction.currency === 'USD' ? '$' : '₦'}
                 </div>
                 <div>
                   <h2 className="text-2xl font-black tracking-tighter leading-none mb-2">Transaction Details</h2>
                   <p className="text-[10px] font-black text-[#b50a0a] tracking-[0.2em]">Reference: {inspectTransaction.reference}</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 mb-8 text-left">
                 <div className="space-y-1">
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 tracking-wide"><CreditCard className="w-3.5 h-3.5" /> Amount</div>
                   <p className="text-base font-black text-slate-900">
                      {inspectTransaction.currency === 'USD' ? '$' : '₦'}{Number(inspectTransaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {inspectTransaction.currency}
                   </p>
                 </div>
                 <div className="space-y-1">
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 tracking-wide"><Calendar className="w-3.5 h-3.5" /> Date</div>
                   <p className="text-base font-bold text-slate-800">
                      {new Date(inspectTransaction.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                   </p>
                 </div>
                 <div className="space-y-1">
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 tracking-wide"><Building className="w-3.5 h-3.5" /> Method</div>
                   <p className="text-base font-bold text-slate-800">
                      {inspectTransaction.method.replace('_', ' ')}
                   </p>
                 </div>
                 <div className="space-y-1">
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 tracking-wide font-black"><Globe className="w-3.5 h-3.5" /> Status</div>
                   <div>
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide ${
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
                   <p className="text-[9px] font-black text-red-700 tracking-wide">Rejection Reason</p>
                   <p className="text-red-900 text-sm font-bold leading-relaxed">
                      {inspectTransaction.metadata.rejection_reason || inspectTransaction.metadata.reason}
                   </p>
                 </div>
               )}

               {/* Approval Comment */}
               {inspectTransaction.status === 'confirmed' && (inspectTransaction.metadata?.approval_comment || inspectTransaction.metadata?.comment) && (
                 <div className="bg-green-50 rounded-[2rem] p-6 mb-8 border border-green-100 space-y-2 text-left">
                   <p className="text-[9px] font-black text-green-700 tracking-wide">Admin Note</p>
                   <p className="text-green-900 text-sm font-bold leading-relaxed">
                      {inspectTransaction.metadata.approval_comment || inspectTransaction.metadata.comment}
                   </p>
                 </div>
               )}

               {/* Direct Transfer receipt preview */}
               {inspectTransaction.method === 'direct_transfer' && (
                 <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-4 text-left">
                   <h4 className="text-[10px] font-black text-slate-900 tracking-wide flex items-center gap-2">
                     <Building className="w-4 h-4 text-amber-600" /> Uploaded Proof
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium text-slate-600">
                     <div>
                       <p className="text-[8px] font-black text-slate-400 tracking-wide">Depositor</p>
                       <p className="font-bold text-slate-800">{inspectTransaction.metadata?.proofName || 'N/A'}</p>
                     </div>
                     <div>
                       <p className="text-[8px] font-black text-slate-400 tracking-wide">Depositor Email</p>
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
                             className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl text-[9px] font-black tracking-wide backdrop-blur-sm transition-all shadow-lg"
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
