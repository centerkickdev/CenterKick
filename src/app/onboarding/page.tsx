'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Trophy, Users, Briefcase, ChevronRight, 
  MapPin, Phone, Calendar, ArrowRight, User, AlertCircle,
  Search, Building, ShieldCheck, CreditCard, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { saveOnboarding } from './actions';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userEmail, setUserEmail] = useState('');
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

  const [paymentSettings, setPaymentSettings] = useState<{ paymentLink: string }>({ paymentLink: 'https://paystack.com/pay/centerkick-pro' });

  // Persistence logic
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.step) setStep(data.step);
        if (data.role) setRole(data.role);
        if (data.fullName) setFullName(data.fullName);
        if (data.phone) setPhone(data.phone);
        if (data.dob) setDob(data.dob);
        if (data.country) setCountry(data.country);
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
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserEmail(user.email || '');
      
      // Fetch payment settings from CMS
      const { data: settings } = await supabase
        .from('site_content')
        .select('content')
        .eq('page', 'settings')
        .eq('section', 'payment')
        .single();
      
      if (settings?.content) {
        setPaymentSettings(settings.content);
      }

      // Check if they already have a profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('user_id', user.id)
        .single();

      if (profile && profile.status === 'active') {
        router.push('/dashboard');
      } else if (profile && profile.status === 'pending') {
        setIsInitializing(false);
      } else {
        setIsInitializing(false);
      }
    }
    checkAuth();
  }, [router]);

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
      const res = await saveOnboarding({
        role,
        fullName,
        phone,
        dob,
        country,
        paymentReference: paymentRef
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
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Portal...</p>
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
         <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
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
          <h1 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-3">
            {step === 1 && <>Select Your <span className="text-[#a20000]">Identity</span></>}
            {step === 2 && <>Profile <span className="text-[#a20000]">Specifications</span></>}
            {step === 3 && <>Verification <span className="text-[#a20000]">Pending</span></>}
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
            {step === 1 && "Choose how you will engage with the platform"}
            {step === 2 && "Tell us more about your professional background"}
            {step === 3 && "We are reviewing your payment reference"}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in shake duration-500">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white/95 backdrop-blur-md rounded-[40px] p-8 md:p-12 shadow-2xl border border-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#a20000] to-slate-900 opacity-20"></div>

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                      <h4 className="font-black text-[10px] uppercase tracking-tight text-slate-900">{item.label}</h4>
                      <p className="text-[9px] text-slate-400 mt-1 font-bold leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#a20000] transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                Continue to Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#a20000] outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#a20000] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#a20000] outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Nigeria"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#a20000] outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Mandatory Payment Section */}
              <div className="pt-8 border-t border-slate-50">
                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden mb-8">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#a20000] blur-[80px] opacity-20"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="w-5 h-5 text-[#a20000]" />
                      <h3 className="text-sm font-black uppercase tracking-widest">Mandatory Subscription</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mb-6">
                      To activate your professional profile, a quarterly subscription fee of <span className="text-white font-bold">₦15,000</span> is required. 
                      Please pay via Paystack and provide your reference below.
                    </p>
                    <a 
                      href={paymentSettings.paymentLink} 
                      target="_blank" 
                      className="inline-flex items-center gap-2 bg-[#a20000] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg"
                    >
                      Pay via Payment Gateway <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Reference / Transaction ID</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a20000]" />
                    <input
                      type="text"
                      required
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="e.g. T234567890"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#a20000] outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-8 py-5 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#a20000] transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
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
            <div className="text-center py-12 space-y-6 animate-in zoom-in duration-700">
              <div className="w-20 h-20 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto shadow-xl shadow-green-100/50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Registration Submitted!</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  Your profile and payment are under review. <br />
                  You will be redirected to the dashboard shortly.
                </p>
              </div>
              <div className="flex justify-center pt-6">
                <div className="w-1.5 h-1.5 rounded-full bg-[#a20000] animate-bounce mx-1"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#a20000] animate-bounce delay-75 mx-1"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#a20000] animate-bounce delay-150 mx-1"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
