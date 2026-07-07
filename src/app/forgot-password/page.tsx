"use client";

import { useState } from 'react';
import { Mail, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { resetPassword } from './actions';

export default function ForgotPasswordPage() {
   const [isLoading, setIsLoading] = useState(false);
   const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
   const [email, setEmail] = useState('');
   const [countdown, setCountdown] = useState(0);

   const startCountdown = () => {
      setCountdown(60);
      const timer = setInterval(() => {
         setCountdown((prev) => {
            if (prev <= 1) {
               clearInterval(timer);
               return 0;
            }
            return prev - 1;
         });
      }, 1000);
   };

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
      setStatus(null);

      const formData = new FormData(e.currentTarget);
      const emailValue = formData.get('email') as string;
      setEmail(emailValue);

      try {
         const result = await resetPassword(formData);

         if (result.error) {
            setStatus({ type: 'error', message: result.error });
         } else if (result.success) {
            setStatus({ type: 'success', message: result.message || 'Reset link sent.' });
            startCountdown();
         }
      } catch (err: any) {
         setStatus({ type: 'error', message: 'An unexpected error occurred.' });
      } finally {
         setIsLoading(false);
      }
   };

   const handleResend = async () => {
      if (countdown > 0 || !email) return;

      setIsLoading(true);
      setStatus(null);

      const formData = new FormData();
      formData.append('email', email);

      try {
         const result = await resetPassword(formData);
         if (result.error) {
            setStatus({ type: 'error', message: result.error });
         } else {
            setStatus({ type: 'success', message: 'A new link has been sent to your email.' });
            startCountdown();
         }
      } catch (err: any) {
         setStatus({ type: 'error', message: 'Failed to resend link.' });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen relative flex items-center justify-center bg-gray-900 py-12 px-6 overflow-hidden">
         {/* Background Image with Overlay */}
         <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/80 z-10 backdrop-blur-sm"></div>
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
                  Recover <span className="text-[#a20000]">Access</span>
               </h1>
            </div>

            {status && (
               <div className={`mb-8 p-5 rounded-2xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-500 ${status.type === 'success' ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
                  <div className="flex items-center gap-4">
                     {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                     <p className="text-[10px] font-black tracking-wide leading-relaxed">{status.message}</p>
                  </div>

                  {status.type === 'success' && (
                     <button
                        onClick={handleResend}
                        disabled={isLoading || countdown > 0}
                        className="text-[9px] font-black tracking-wide text-green-800 underline underline-offset-4 hover:text-green-900 disabled:opacity-50 disabled:no-underline flex items-center gap-2"
                     >
                        {countdown > 0 ? `Resend link in ${countdown}s` : 'Resend Recovery Link'}
                        {isLoading && <div className="w-3 h-3 border-2 border-green-800/30 border-t-green-800 rounded-full animate-spin"></div>}
                     </button>
                  )}
               </div>
            )}

            {status?.type !== 'success' && (
               <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 tracking-wide ml-1">Account Email</label>
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

                  <button
                     type="submit"
                     disabled={isLoading}
                     className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black tracking-[0.2em] text-sm hover:bg-[#a20000] transition-all flex items-center justify-center gap-3 shadow-xl transform active:scale-95 disabled:opacity-50"
                  >
                     {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     ) : (
                        <>Send Recovery Link <ArrowRight className="w-4 h-4" /></>
                     )}
                  </button>
               </form>
            )}

            <div className="mt-12 text-center">
               <p className="text-[10px] font-black text-gray-400 tracking-wide">
                  Remembered your password?
                  <Link href="/login" className="text-[#a20000] ml-2 hover:underline font-black">Back to Login</Link>
               </p>
            </div>
         </div>
      </div>
   );
}
