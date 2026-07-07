'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Trophy, Users, Briefcase, ChevronRight, 
  Phone, Calendar, ArrowRight, User, AlertCircle,
  Search, Building, ShieldCheck, CreditCard, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { saveOnboarding, saveDraftOnboarding, uploadPaymentProof } from './actions';
import { createClient } from '@/lib/supabase/client';
import { CountrySelect } from '@/components/common/CountrySelect';

interface PaymentSettings {
  paymentLink: string;
  plans: Record<string, { amount: string; frequency?: string }>;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [role, setRole] = useState<string>('player');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'gateway' | 'bank'>('gateway');
  const [proofName, setProofName] = useState('');
  const [proofEmail, setProofEmail] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({ 
    paymentLink: 'https://paystack.com/pay/centerkick-pro',
    plans: {
      player: { amount: '15000' },
      coach: { amount: '20000' },
      agent: { amount: '30000' },
      scout: { amount: '25000' },
      organization: { amount: '50000' }
    }
  });

  // Persistence logic
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTimeout(() => {
          if (data.step) setStep(data.step);
          if (data.role) setRole(data.role);
          if (data.fullName) setFullName(data.fullName);
          if (data.phone) setPhone(data.phone);
          if (data.dob) setDob(data.dob);
          if (data.country) setCountry(data.country);
        }, 0);
      } catch (e) {
        console.error('Failed to load onboarding progress', e);
      }
    }
  }, []);

  useEffect(() => {
    if (step < 3) { // Don't save if completed
      localStorage.setItem('onboarding_progress', JSON.stringify({
        step, role, fullName, phone, dob, country
      }));
    } else {
      localStorage.removeItem('onboarding_progress');
    }
  }, [step, role, fullName, phone, dob, country]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        let user = session?.user;
        
        if (!user) {
          const { data: { user: fetchedUser } } = await supabase.auth.getUser();
          user = fetchedUser || undefined;
        }

        if (!user) {
          router.push('/login');
          return;
        }
        
        // Fetch payment settings from CMS (optional, don't crash on fail)
        try {
          const { data: settings } = await supabase
            .from('site_content')
            .select('content')
            .eq('page', 'settings')
            .eq('section', 'payment')
            .single();
          
          if (settings?.content) {
            setPaymentSettings(settings.content);
          }
        } catch (settingsError) {
          console.error('[Onboarding] Failed to load payment settings:', settingsError);
        }

        // Fetch any existing profile data to pre-fill (optional, don't crash on fail)
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (profile) {
            if (profile.first_name) setFullName(`${profile.first_name} ${profile.last_name || ''}`.trim());
            if (profile.phone_number) setPhone(profile.phone_number);
            if (profile.date_of_birth) setDob(profile.date_of_birth);
            if (profile.country) setCountry(profile.country);
            
            if (profile.status === 'active' || (profile.status === 'pending' && profile.verification_requested)) {
              router.push('/dashboard');
              return;
            }
          }
        } catch (profileError) {
          console.error('[Onboarding] Failed to load profile:', profileError);
        }

        // Also check role from users table (optional, don't crash on fail)
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (userData?.role) setRole(userData.role);
        } catch (userError) {
          console.error('[Onboarding] Failed to load user role:', userError);
        }
      } catch (err) {
        console.error('[Onboarding] Critical auth initialization failure:', err);
      } finally {
        setIsInitializing(false);
      }
    }
    checkAuth();
  }, [router]);

  // Redirect to dashboard after onboarding success
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step, router]);

  const handleNextStep = async (nextStep: 1 | 2 | 3) => {
    // Validate Step 1 before moving to payment
    if (nextStep === 2) {
      if (!fullName || !dob || !phone || !country) {
        setError('All profile details are required before proceeding to payment.');
        return;
      }
    }
    
    setIsLoading(true);
    // Save draft to DB so they can continue on another device
    await saveDraftOnboarding({
      role,
      fullName,
      phone,
      dob,
      country,
      step: nextStep
    });
    setStep(nextStep);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!paymentRef) {
      setError('Payment reference is mandatory to complete onboarding.');
      setIsLoading(false);
      return;
    }

    try {
      let uploadedUrl = undefined;
      if (paymentMethod === 'bank' && proofFile) {
        const uploadData = new FormData();
        uploadData.append('file', proofFile);
        const uploadRes = await uploadPaymentProof(uploadData);
        if (uploadRes.error) {
          setError(`Failed to upload payment proof: ${uploadRes.error}`);
          setIsLoading(false);
          return;
        }
        uploadedUrl = uploadRes.publicUrl;
      }

      const res = await saveOnboarding({
        role,
        fullName,
        phone,
        dob,
        country,
        paymentReference: paymentRef,
        paymentMethod,
        proofName,
        proofEmail,
        proofFileName: proofFile?.name,
        proofFileUrl: uploadedUrl
      });

      if (res.success) {
        setStep(3); // Show success step or redirect
        setTimeout(() => router.push('/dashboard'), 3000);
      } else {
        setError(res.error || 'Failed to save profile.');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-[#a20000] animate-spin mb-4"></div>
        <p className="text-[10px] font-black text-slate-400 tracking-wide animate-pulse">Initializing Portal...</p>
      </div>
    );
  }

  const roles = [
    { id: 'player', label: 'Athlete / Player', icon: Trophy, desc: 'Showcase your career stats and highlights.' },
    { id: 'coach', label: 'Technical Coach', icon: Users, desc: 'Manage teams and tactical data.' },
    { id: 'agent', label: 'Licensed Agent', icon: Briefcase, desc: 'Represent talent and manage agency.' },
    { id: 'scout', label: 'Professional Scout', icon: Search, desc: 'Find and evaluate top talent.' },
    { id: 'organization', label: 'Organization / Club', icon: Building, desc: 'Manage official club operations.' },
  ];

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center py-12 px-6 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-slate-950/80 z-10 backdrop-blur-sm"></div>
         <Image 
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80" 
            alt="Stadium Background" 
            fill
            priority
            className="object-cover"
         />
      </div>

      {/* Navigation */}
      <div className="absolute top-8 left-8 z-20">
         <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[10px] font-black tracking-wide bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <ArrowLeft className="w-4 h-4" /> Back to Home
         </Link>
      </div>

      <div className="max-w-[800px] w-full relative z-10">
        
        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${step >= 1 ? 'bg-[#a20000] text-white shadow-lg shadow-red-900/40' : 'bg-slate-800 text-slate-400'}`}>1</div>
            <div className={`w-16 h-1 rounded-full ${step >= 2 ? 'bg-[#a20000]' : 'bg-slate-800'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${step >= 2 ? 'bg-[#a20000] text-white shadow-lg shadow-red-900/40' : 'bg-slate-800 text-slate-400'}`}>2</div>
            <div className={`w-16 h-1 rounded-full ${step >= 3 ? 'bg-[#a20000]' : 'bg-slate-800'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${step >= 3 ? 'bg-[#a20000] text-white shadow-lg shadow-red-900/40' : 'bg-slate-800 text-slate-400'}`}>3</div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter leading-none mb-3">
            {step === 1 && <>Select Your <span className="text-[#a20000]">Identity</span></>}
            {step === 2 && <>Profile <span className="text-[#a20000]">Specifications</span></>}
            {step === 3 && <>Verification <span className="text-[#a20000]">Pending</span></>}
          </h1>
          <p className="text-white/40 text-[10px] font-black tracking-[0.2em]">
            {step === 1 && "Choose how you will engage with the platform"}
            {step === 2 && "Tell us more about your professional background"}
            {step === 3 && "We are reviewing your payment reference"}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black tracking-wide flex items-center gap-3 animate-in shake duration-500">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white/95 backdrop-blur-md rounded-[40px] p-8 md:p-12 shadow-2xl border border-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#a20000] to-slate-900 opacity-20"></div>

          {step === 1 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Role Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 tracking-wide ml-1">Account Identity</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roles.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setRole(item.id)}
                      className={`p-6 rounded-3xl border-2 text-left transition-all flex flex-col gap-3 ${
 role === item.id 
 ? 'border-[#a20000] bg-red-50/20 shadow-lg shadow-red-100/30' 
 : 'border-slate-50 hover:border-slate-200 bg-white'
 }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === item.id ? 'bg-[#a20000] text-white' : 'bg-slate-50 text-slate-400'}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-[10px] tracking-tight text-slate-900">{item.label}</h4>
                        <p className="text-[9px] text-slate-400 mt-1 font-bold leading-relaxed">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-6 pt-8 border-t border-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 tracking-wide ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#a20000] outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 tracking-wide ml-1">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#a20000] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 tracking-wide ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#a20000] outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 tracking-wide ml-1">Country</label>
                    <CountrySelect
                      value={country}
                      onChange={setCountry}
                      required
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleNextStep(2)}
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black tracking-[0.2em] text-sm hover:bg-[#a20000] transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Continue to Payment <ChevronRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Pricing Highlight */}
              <div className="text-center mb-6">
                <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mb-1">Total Activation Fee</p>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                  ₦{Number(paymentSettings.plans?.[role]?.amount || 15000).toLocaleString()}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 lowercase tracking-wide mt-0.5">
                  ~ ${(Number(paymentSettings.plans?.[role]?.amount || 15000) / 1500).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} usd conversion
                </p>
                <p className="text-[9px] font-bold text-slate-400 tracking-wide mt-1">
                  {paymentSettings.plans?.[role]?.frequency || 'One-time Payment'} for {role} Profile
                </p>
              </div>

              {/* Payment Method Toggle */}
              <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                <button
                  onClick={() => setPaymentMethod('gateway')}
                  className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[10px] font-black tracking-wide transition-all ${paymentMethod === 'gateway' ? 'bg-white text-slate-900 shadow-md border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <CreditCard className="w-4 h-4" /> Payment Gateway
                </button>
                <button
                  onClick={() => setPaymentMethod('bank')}
                  className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[10px] font-black tracking-wide transition-all ${paymentMethod === 'bank' ? 'bg-white text-slate-900 shadow-md border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Building className="w-4 h-4" /> Bank Settlement
                </button>
              </div>

              {paymentMethod === 'gateway' ? (
                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#a20000] blur-[80px] opacity-20"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="w-5 h-5 text-[#a20000]" />
                      <h3 className="text-base font-black tracking-wide">Gateway Payment</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mb-6 leading-relaxed">
                      Pay instantly using Paystack/Stripe. Your account will be flagged for priority verification once the transaction is logged.
                    </p>
                    <a 
                      href={paymentSettings.paymentLink || 'https://paystack.com/pay/centerkick-pro'} 
                      target="_blank" 
                      className="inline-flex items-center gap-2 bg-[#a20000] text-white px-6 py-3 rounded-xl text-[10px] font-black tracking-wide hover:bg-red-700 transition-all shadow-lg"
                    >
                      Open Payment Portal <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 blur-[80px] opacity-10"></div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <Building className="w-5 h-5 text-amber-600" />
                        <h3 className="text-base font-black tracking-wide text-slate-900">Local Bank Transfer</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 tracking-wide">Institution</span>
                          <span className="text-sm font-black text-slate-900 tracking-tight">{paymentSettings.bankName || 'OPAY'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 tracking-wide">Acc. Name</span>
                            <span className="text-[11px] font-bold text-slate-900">{paymentSettings.accountName || 'CENTERKICK'}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 tracking-wide">Number</span>
                            <span className="text-[11px] font-bold text-slate-900 tracking-wide">{paymentSettings.accountNumber || '0123456789'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl md:w-48">
                      <p className="text-[10px] font-bold text-slate-500 leading-relaxed text-center">
                        &quot;After transfer, please provide proof details for manual confirmation.&quot;
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Settlement Proof Module */}
              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-wide ml-1">
                    {paymentMethod === 'bank' ? 'Transfer Reference / Name' : 'Payment Reference / Transaction ID'}
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a20000]" />
                    <input
                      type="text"
                      required
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder={paymentMethod === 'bank' ? "Enter your bank transfer name" : "e.g. T234567890"}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#a20000] outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {paymentMethod === 'bank' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 tracking-wide ml-1">Depositor Name</label>
                      <input
                        type="text"
                        required
                        value={proofName}
                        onChange={(e) => setProofName(e.target.value)}
                        placeholder="Name on transfer"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#a20000] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 tracking-wide ml-1">Depositor Email</label>
                      <input
                        type="email"
                        required
                        value={proofEmail}
                        onChange={(e) => setProofEmail(e.target.value)}
                        placeholder="Your email address"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#a20000] outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 tracking-wide ml-1">Proof of Payment (Image/PDF)</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="proof-upload"
                        />
                        {!proofFile ? (
                          <label 
                            htmlFor="proof-upload"
                            className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-[#a20000] hover:bg-red-50/20 transition-all cursor-pointer group"
                          >
                            <CreditCard className="w-8 h-8 text-slate-300 group-hover:text-[#a20000] mb-3" />
                            <span className="text-sm font-black text-slate-900 tracking-wide">
                              Choose File to Upload
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1">PNG, JPG or PDF up to 5MB</span>
                          </label>
                        ) : (
                          <div className="relative w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                              {proofFile.type.startsWith('image/') ? (
                                <img 
                                  src={URL.createObjectURL(proofFile)} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ShieldCheck className="w-8 h-8 text-[#a20000]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black text-slate-900 truncate tracking-tight">{proofFile.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 tracking-wide">{(proofFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setProofFile(null)}
                              className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-lg"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-8 py-5 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black tracking-wide hover:bg-slate-100 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black tracking-[0.2em] text-sm hover:bg-[#a20000] transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Complete Setup <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-12 space-y-8 animate-in zoom-in duration-700">
              <div className="w-24 h-24 rounded-[40px] bg-green-50 text-green-500 flex items-center justify-center mx-auto shadow-xl shadow-green-100/50 border border-green-100 relative">
                <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                <CheckCircle2 className="w-12 h-12 relative z-10" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Registration Submitted!</h2>
                <p className="text-[11px] text-slate-500 font-bold tracking-[0.2em] leading-relaxed max-w-sm mx-auto">
                  Your profile and payment are under review. <br />
                  You will be redirected to the dashboard shortly.
                </p>
              </div>

              <div className="flex flex-col items-center gap-6 pt-4">
                <Link href="/dashboard" className="w-full max-w-[280px]">
                  <button className="w-full bg-[#a20000] text-white py-5 rounded-2xl font-black tracking-[0.2em] text-[10px] hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 flex items-center justify-center gap-3 group">
                    Enter Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                
                <div className="flex justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#a20000] animate-bounce mx-1"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#a20000] animate-bounce delay-75 mx-1"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#a20000] animate-bounce delay-150 mx-1"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
