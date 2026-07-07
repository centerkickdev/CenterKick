'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/client';
import { 
  Trophy, Users, Briefcase, ChevronRight, 
  MapPin, Phone, Calendar, ArrowRight, User, AlertCircle 
} from 'lucide-react';
import { saveGoogleOnboarding } from './actions';

export default function GoogleOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [role, setRole] = useState<'athlete' | 'coach' | 'agent'>('athlete');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    async function checkExistingUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserEmail(user.email || '');
      setFullName(user.user_metadata?.full_name || user.user_metadata?.name || '');

      // Check if profile and user record already exist
      const { data: userRecord } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If they already completed setup, redirect to dashboard
      if (userRecord && profile) {
        if (profile.status === 'active') {
          router.push('/dashboard');
        } else {
          router.push('/dashboard/subscription');
        }
      } else {
        setIsInitializing(false);
      }
    }
    checkExistingUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!fullName || !phone || !dob || !country) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await saveGoogleOnboarding({
        role,
        fullName,
        phone,
        dob,
        country
      });

      if (res.success) {
        // Redirect to first subscription payment to complete setup
        router.push('/dashboard/subscription');
      } else {
        setError(res.error || 'Failed to complete onboarding.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError('An unexpected error occurred during profile setup.');
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-[#a20000] animate-spin mb-4"></div>
        <p className="text-[10px] font-black text-slate-400 tracking-wide animate-pulse">Initializing Setup Wizard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-[800px] mx-auto px-4 lg:px-0">
          
          {/* Custom Wizard Progress Bar */}
          <div className="flex items-center justify-center mb-16">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${step === 1 ? 'bg-[#a20000] text-white animate-pulse' : 'bg-green-500 text-white'}`}>
                {step === 1 ? '1' : '✓'}
              </div>
              <div className={`w-24 h-1 rounded-full ${step === 2 ? 'bg-green-500' : 'bg-slate-100'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${step === 2 ? 'bg-[#a20000] text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                2
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <span className="text-[#a20000] font-black text-sm tracking-[0.4em] mb-4 block">Google Partner Portal</span>
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
              Complete Your <br />
              <span className="text-[#a20000]">E-Profile Setup</span>
            </h1>
            <p className="text-slate-500 text-base font-medium max-w-md mx-auto">
              You are signed in as <span className="text-slate-900 font-bold">{userEmail}</span>. Let's build your professional football identity.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-3xl text-red-700 text-sm font-black tracking-wide flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-14 shadow-[0_40px_80px_rgba(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#a20000] to-slate-900 opacity-20"></div>

            {step === 1 ? (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="text-center">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Step 1: Choose Your Role</h2>
                  <p className="text-sm text-slate-400 tracking-wide mt-1">This defines your visibility and access metrics across the platform</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'athlete', label: 'Athlete / Player', icon: Trophy, desc: 'Showcase your career stats, highlights, and get signed.' },
                    { id: 'coach', label: 'Technical Coach', icon: Users, desc: 'Manage teams, tactically analyze data, and build programs.' },
                    { id: 'agent', label: 'Licensed Agent', icon: Briefcase, desc: 'Scout top talents globally and build your official agency.' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id as any)}
                      className={`p-8 rounded-3xl border-2 text-left transition-all flex flex-col items-start gap-4 ${
 role === item.id 
 ? 'border-[#a20000] bg-red-50/20 shadow-lg shadow-red-100/30' 
 : 'border-slate-100 hover:border-slate-200 bg-white'
 }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${role === item.id ? 'bg-[#a20000] text-white' : 'bg-slate-50 text-slate-400'}`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm tracking-tight text-slate-900">{item.label}</h4>
                        <p className="text-[10px] text-slate-400 mt-2 leading-relaxed font-bold">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black tracking-[0.2em] text-sm hover:bg-[#a20000] transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  Continue to Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
                <div className="text-center">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Step 2: Profile Specifications</h2>
                  <p className="text-sm text-slate-400 tracking-wide mt-1">Please provide accurate personal records for verification</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 tracking-wide pl-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-5 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#a20000] outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 tracking-wide pl-1">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-5 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#a20000] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 tracking-wide pl-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234..."
                        className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-5 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#a20000] outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 tracking-wide pl-1">Country Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Nigeria"
                        className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-5 text-base font-bold text-slate-900 focus:ring-2 focus:ring-[#a20000] outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-8 py-5 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black tracking-wide hover:bg-slate-200 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black tracking-[0.2em] text-sm hover:bg-[#a20000] transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Commit and Pay <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
