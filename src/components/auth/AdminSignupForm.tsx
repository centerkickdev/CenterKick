'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, CheckCircle, MapPin, Calendar } from 'lucide-react';
import { adminSignupAction } from '@/app/admin/signup/actions';

export function AdminSignupForm({ email, role, token }: { email: string, role: string, token: string }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('location', location);
      formData.append('dob', dob);
      formData.append('password', password);

      const result = await adminSignupAction(formData, email, token);

      if (result.error) throw new Error(result.error);

      setSuccess(true);
      setTimeout(() => {
        router.push('/login?message=Administrative account created successfully. Please log in to complete verification.');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-900/10">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tighter mb-4">Registration Complete</h2>
        <p className="text-gray-900 text-sm font-bold tracking-[0.2em] max-w-sm mx-auto leading-relaxed">Your administrative account has been created. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignup} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">First Name</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-[#b50a0a] focus:ring-4 focus:ring-red-900/5 outline-none transition-all font-bold text-base text-black"
            placeholder="First Name"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Last Name</label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-[#b50a0a] focus:ring-4 focus:ring-red-900/5 outline-none transition-all font-bold text-base text-black"
            placeholder="Last Name"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Email Address (Invited)</label>
        <input
          type="email"
          disabled
          value={email}
          className="w-full px-5 py-4 rounded-2xl bg-gray-100 border border-gray-100 text-gray-400 cursor-not-allowed font-bold text-base"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-1 ml-1">
             <MapPin className="w-3 h-3 text-[#b50a0a]" />
             <label className="text-xs font-bold text-gray-900 tracking-wide">Location</label>
          </div>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-[#b50a0a] focus:ring-4 focus:ring-red-900/5 outline-none transition-all font-bold text-base text-black"
            placeholder="City, Country"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-1 ml-1">
             <Calendar className="w-3 h-3 text-[#b50a0a]" />
             <label className="text-xs font-bold text-gray-900 tracking-wide">Date of Birth</label>
          </div>
          <input
            type="date"
            required
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-[#b50a0a] focus:ring-4 focus:ring-red-900/5 outline-none transition-all font-bold text-base text-black"
          />
        </div>
      </div>

      <div className="space-y-1.5 relative">
        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">Create Secure Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-[#b50a0a] focus:ring-4 focus:ring-red-900/5 outline-none transition-all font-bold text-base text-black"
            placeholder="••••••••"
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors p-2"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold tracking-[0.2em] animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 bg-[#b50a0a] hover:bg-black text-white rounded-2xl font-bold text-sm tracking-[0.3em] transition-all shadow-xl shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Complete Admin Setup'
        )}
      </button>
    </form>
  );
}

