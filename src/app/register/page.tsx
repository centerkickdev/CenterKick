"use client";

import { useState, useEffect } from 'react';
import { Mail, AlertCircle, CheckCircle2, ArrowRight, Chrome, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { signup, verifyOtp, resendOtp } from '@/app/login/actions';
import { PasswordField } from '@/components/common/PasswordField';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
   const [showOtp, setShowOtp] = useState(false);
   const [email, setEmail] = useState('');
   const [otp, setOtp] = useState('');
   const [timeLeft, setTimeLeft] = useState(600);
   const [resendCooldown, setResendCooldown] = useState(60);
   const [isResending, setIsResending] = useState(false);

   useEffect(() => {
      if (!showOtp) return;

      const interval = setInterval(() => {
         setTimeLeft((prev) => {
            if (prev <= 1) {
               clearInterval(interval);
               return 0;
            }
            return prev - 1;
         });

         setResendCooldown((prev) => {
            if (prev <= 0) return 0;
            return prev - 1;
         });
      }, 1000);

      return () => clearInterval(interval);
   }, [showOtp]);

   const handleResend = async () => {
      if (resendCooldown > 0 || isResending) return;
      setIsResending(true);
      setStatus(null);

      try {
         const result = await resendOtp(email);
         if (result.error) {
            setStatus({ type: 'error', message: result.error });
         } else if (result.success) {
            setTimeLeft(600);
            setResendCooldown(60);
            setStatus({ type: 'success', message: result.message });
         }
      } catch (err) {
         setStatus({ type: 'error', message: 'Failed to resend code.' });
      } finally {
         setIsResending(false);
      }
   };

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
      setStatus(null);

      const formData = new FormData(e.currentTarget);
      const emailInput = formData.get('email') as string;
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (password !== confirmPassword) {
         setStatus({ type: 'error', message: 'Passwords do not match.' });
         setIsLoading(false);
         return;
      }
      
      try {
         setEmail(emailInput);
         const result = await signup(formData);

         if (result.error) {
            setStatus({ type: 'error', message: result.error });
         } else if (result.success) {
            setShowOtp(true);
            setStatus({ type: 'success', message: 'Enter the 6-digit code sent to your email.' });
         }
      } catch (err: any) {
         setStatus({ type: 'error', message: 'An unexpected error occurred.' });
      } finally {
         setIsLoading(false);
      }
   };

   const handleVerifyOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setStatus(null);

      try {
         const result = await verifyOtp(email, otp);
         if (result.error) {
            setStatus({ type: 'error', message: result.error });
         } else if (result.success) {
            router.push('/onboarding');
         }
      } catch (err) {
         setStatus({ type: 'error', message: 'Failed to verify code.' });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen relative flex items-center justify-center bg-gray-900 py-12">
         {/* Background Image with Overlay */}
         <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/70 z-10"></div>
            <img
               src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80"
               alt="Stadium Background"
               className="w-full h-full object-cover"
            />
         </div>

         {/* Navigation */}
         <div className="absolute top-8 left-8 z-20">
            <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[10px] font-black tracking-wide bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
               <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
         </div>

         <div className="relative z-10 max-w-md w-full px-6 py-12 bg-white/95 backdrop-blur-md rounded-[40px] shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-700">
            <div className="text-center mb-10">
               <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-3">
                  Create <span className="text-[#a20000]">Account</span>
               </h1>
            </div>

            {status && (
               <div className={`mb-8 p-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500 ${status.type === 'success' ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <p className="text-[10px] font-black tracking-wide">{status.message}</p>
               </div>
            )}

            <div className="space-y-6">
               {!showOtp ? (
                  <>
                     <button
                        type="button"
                        onClick={async () => {
                           setIsLoading(true);
                           const { createClient } = await import('@/lib/supabase/client');
                           const supabase = createClient();
                           await supabase.auth.signInWithOAuth({
                              provider: 'google',
                              options: {
                                 redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`
                              }
                           });
                        }}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all text-[10px] font-black tracking-wide text-gray-600 shadow-sm"
                     >
                        <Chrome className="w-4 h-4 text-red-600" /> Continue with Google
                     </button>

                     <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 tracking-wide ml-1">Professional Email</label>
                           <div className="relative">
                              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                 name="email"
                                 type="email"
                                 required
                                 placeholder="name@agency.com"
                                 className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-6 py-4 text-base font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none text-gray-900 placeholder:text-gray-300"
                              />
                           </div>
                        </div>

                        <PasswordField
                           name="password"
                           label="Create Password"
                        />

                        <PasswordField
                           name="confirmPassword"
                           label="Confirm Password"
                        />

                        <button
                           type="submit"
                           disabled={isLoading}
                           className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black tracking-[0.2em] text-sm hover:bg-[#a20000] transition-all flex items-center justify-center gap-3 shadow-xl transform active:scale-95 disabled:opacity-50"
                        >
                           {isLoading ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           ) : (
                              <>Create Account <ArrowRight className="w-4 h-4" /></>
                           )}
                        </button>
                     </form>
                  </>
               ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 tracking-wide ml-1">Verification Code</label>
                        <input
                           type="text"
                           required
                           value={otp}
                           onChange={(e) => setOtp(e.target.value)}
                           placeholder="000000"
                           className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-5 text-2xl font-black tracking-[0.5em] text-center focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none text-gray-900 placeholder:text-gray-200"
                           maxLength={6}
                        />
                        <div className="flex flex-col items-center gap-2 mt-4">
                           <p className="text-[9px] text-center text-gray-400 font-bold tracking-wide">
                              Enter the 6-digit code sent to <span className="text-gray-900">{email}</span>
                           </p>
                           {timeLeft > 0 ? (
                              <p className="text-[9px] font-black text-slate-500 tracking-wide">
                                 Code expires in <span className="text-[#a20000]">{Math.floor(timeLeft / 60)}:${('0' + (timeLeft % 60)).slice(-2)}</span>
                              </p>
                           ) : (
                              <p className="text-[9px] font-black text-red-600 tracking-wide">
                                 Code expired. Please request a new one.
                              </p>
                           )}
                        </div>
                     </div>

                     <button
                        type="submit"
                        disabled={isLoading || timeLeft === 0}
                        className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black tracking-[0.2em] text-sm hover:bg-[#a20000] transition-all flex items-center justify-center gap-3 shadow-xl transform active:scale-95 disabled:opacity-50"
                     >
                        {isLoading ? (
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                           <>Verify & Continue <ArrowRight className="w-4 h-4" /></>
                        )}
                     </button>

                     <div className="flex flex-col items-center gap-3 pt-2">
                        {resendCooldown > 0 ? (
                           <span className="text-[9px] font-black text-gray-400 tracking-wide">
                              Resend code in {resendCooldown}s
                           </span>
                        ) : (
                           <button
                              type="button"
                              onClick={handleResend}
                              disabled={isResending}
                              className="text-[9px] font-black text-[#a20000] tracking-wide hover:underline disabled:opacity-50"
                           >
                              {isResending ? 'Sending...' : 'Resend Verification Code'}
                           </button>
                        )}
                        
                        <button 
                           type="button"
                           onClick={() => setShowOtp(false)}
                           className="text-center text-[9px] font-black text-gray-400 tracking-wide hover:text-gray-900 transition-colors"
                        >
                           Change Email Address
                        </button>
                     </div>
                  </form>
               )}
            </div>

            <div className="mt-12 text-center">
               <p className="text-[10px] font-black text-gray-400 tracking-wide">
                  Already have an account?
                  <Link href="/login" className="text-[#a20000] ml-2 hover:underline font-black">Login Now</Link>
               </p>
            </div>
         </div>
      </div>
   );
}

