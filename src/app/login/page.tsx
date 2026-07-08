"use client";

import { useState, Suspense } from 'react';
import { Mail, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { login } from './actions';
import { PasswordField } from '@/components/common/PasswordField';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

function LoginContent() {
   const [isLoading, setIsLoading] = useState(false);
   const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
   const searchParams = useSearchParams();

   useEffect(() => {
      const error = searchParams.get('error');
      if (error) {
         setStatus({ type: 'error', message: error });
      }
      const message = searchParams.get('message');
      if (message) {
         setStatus({ type: 'success', message: message });
      }
   }, [searchParams]);

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
      setStatus(null);

      const formData = new FormData(e.currentTarget);

      try {
         const result = await login(formData);

         if (result && 'error' in result) {
            setStatus({ type: 'error', message: result.error });
         }
      } catch (err: any) {
         setStatus({ type: 'error', message: 'An unexpected error occurred.' });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="relative z-10 max-w-md w-full px-5 py-8 sm:px-6 sm:py-12 bg-white/95 backdrop-blur-md rounded-[32px] sm:rounded-[40px] shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-700 my-auto">
         <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tighter leading-none mb-3">
               Welcome <span className="text-[#a20000]">Back</span>
            </h1>
         </div>

         {status && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500 ${status.type === 'success' ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
               {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
               <p className="text-xs font-bold tracking-wide">{status.message}</p>
            </div>
         )}

         <div className="space-y-4">
            <button
               type="button"
               onClick={async () => {
                  setIsLoading(true);
                  const { createClient } = await import('@/lib/supabase/client');
                  const supabase = createClient();
                  await supabase.auth.signInWithOAuth({
                     provider: 'google',
                     options: {
                        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
                     }
                  });
               }}
               className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all text-xs font-bold tracking-wide text-gray-600 shadow-sm"
            >
               <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
               </svg> Continue with Google
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 tracking-wide ml-1">Professional Email</label>
                  <div className="relative">
                     <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input
                        name="email"
                        type="email"
                        required
                        placeholder="name@agency.com"
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none text-gray-900 placeholder:text-gray-300"
                     />
                  </div>
               </div>

               <PasswordField
                  name="password"
                  label="Password"
                  rightElement={
                     <Link href="/forgot-password" className="text-xs font-bold text-[#a20000] tracking-wide hover:underline">Forgot Password?</Link>
                  }
               />

               <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold tracking-[0.2em] text-sm hover:bg-[#a20000] transition-all flex items-center justify-center gap-3 shadow-xl transform active:scale-95 disabled:opacity-50"
               >
                  {isLoading ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                     <>Login <ArrowRight className="w-4 h-4" /></>
                  )}
               </button>
            </form>
         </div>

         <div className="mt-8 text-center">
            <p className="text-xs font-bold text-gray-500 tracking-wide">
               No account yet?
               <Link href="/register" className="text-[#a20000] ml-2 hover:underline font-bold">Register</Link>
            </p>
         </div>
      </div>
   );
}

export default function LoginPage() {
   return (
      <div className="min-h-screen relative flex items-center justify-center bg-gray-900 py-20 sm:py-12 px-4 sm:px-0">
         {/* Background Image with Overlay */}
         <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/60 z-10"></div>
            <img
               src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80"
               alt="Stadium Background"
               className="w-full h-full object-cover"
            />
         </div>

         {/* Navigation */}
         <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
            <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-bold tracking-wide bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
               <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
         </div>

         <Suspense fallback={<div className="text-center font-bold tracking-wide animate-pulse text-[#a20000] text-sm z-10">Accessing Dashboard...</div>}>
            <LoginContent />
         </Suspense>
      </div>
   );
}

