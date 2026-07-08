"use client";

import { useState } from 'react';
import { AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { updatePassword } from './actions';
import { PasswordField } from '@/components/common/PasswordField';

export default function ResetPasswordPage() {
   const [isLoading, setIsLoading] = useState(false);
   const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');

   const validatePassword = (pass: string) => {
      return (
         pass.length >= 8 &&
         /[A-Z]/.test(pass) &&
         /[0-9]/.test(pass) &&
         /[!@#$%^&*(),.?":{}|<>]/.test(pass)
      );
   };

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
      setStatus(null);

      const formData = new FormData(e.currentTarget);

      if (!validatePassword(password)) {
         setStatus({ type: 'error', message: 'Password does not meet the requirements.' });
         setIsLoading(false);
         return;
      }

      if (password !== confirmPassword) {
         setStatus({ type: 'error', message: 'Passwords do not match.' });
         setIsLoading(false);
         return;
      }

      try {
         const result = await updatePassword(formData);

         if (result.error) {
            setStatus({ type: 'error', message: result.error });
         } else if (result.success) {
            setStatus({ type: 'success', message: result.message || 'Password updated successfully.' });
         }
      } catch (err: any) {
         setStatus({ type: 'error', message: 'An unexpected error occurred.' });
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
            <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-bold tracking-wide bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
               <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
         </div>

         <div className="relative z-10 max-w-md w-full px-6 py-12 bg-white/95 backdrop-blur-md rounded-[40px] shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-700">
            <div className="text-center mb-10">
               <h1 className="text-3xl font-bold text-gray-900 tracking-tighter leading-none mb-3">
                  New <span className="text-[#a20000]">Security</span>
               </h1>
            </div>

            {status && (
               <div className={`mb-8 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500 ${status.type === 'success' ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <p className="text-xs font-bold tracking-wide leading-relaxed">{status.message}</p>
               </div>
            )}

            {status?.type !== 'success' && (
               <form onSubmit={handleSubmit} className="space-y-4">
                  <PasswordField
                     name="password"
                     label="New Password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     showRequirements={true}
                  />

                  <PasswordField
                     name="confirmPassword"
                     label="Confirm New Password"
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     confirmFor={password}
                  />

                  <button
                     type="submit"
                     disabled={isLoading}
                     className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold tracking-[0.2em] text-sm hover:bg-[#a20000] transition-all flex items-center justify-center gap-3 shadow-xl transform active:scale-95 disabled:opacity-50"
                  >
                     {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     ) : (
                        <>Update Password <ArrowRight className="w-4 h-4" /></>
                     )}
                  </button>
               </form>
            )}

            <div className="mt-12 text-center">
               <p className="text-xs font-bold text-gray-400 tracking-wide">
                  Process completed?
                  <Link href="/login" className="text-[#a20000] ml-2 hover:underline font-bold">Proceed to Login</Link>
               </p>
            </div>
         </div>
      </div>
   );
}
