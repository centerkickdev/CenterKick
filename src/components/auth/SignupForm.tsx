'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';

export function SignupForm({ email, role }: { email: string, role: string }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role,
          },
        },
      });

      if (signupError) throw signupError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/login?message=Account created successfully. Please log in.');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8 animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-gray-900 tracking-tighter mb-2">Account Created!</h2>
        <p className="text-gray-900 text-base font-bold tracking-wide">Your administrative account is ready. Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignup} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">First Name</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#b50a0a] focus:ring-4 focus:ring-red-900/5 outline-none transition-all font-bold text-base text-black"
            placeholder="John"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Last Name</label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#b50a0a] focus:ring-4 focus:ring-red-900/5 outline-none transition-all font-bold text-base text-black"
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Email Address</label>
        <input
          type="email"
          disabled
          value={email}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-100 text-gray-900 cursor-not-allowed font-bold text-base"
        />
      </div>

      <div className="space-y-1.5 relative">
        <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Create Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#b50a0a] focus:ring-4 focus:ring-red-900/5 outline-none transition-all font-bold text-base text-black"
            placeholder="••••••••"
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-gray-900 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold tracking-wide animate-shake">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-[#b50a0a] hover:bg-black text-white rounded-xl font-black text-sm tracking-wide transition-all shadow-xl shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          'Complete Registration'
        )}
      </button>
    </form>
  );
}
