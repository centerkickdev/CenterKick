"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnlinkedAccountPage() {
   const [timeLeft, setTimeLeft] = useState(5);
   const router = useRouter();

   useEffect(() => {
      const interval = setInterval(() => {
         setTimeLeft((prev) => {
            if (prev <= 1) {
               clearInterval(interval);
               router.push('/register');
               return 0;
            }
            return prev - 1;
         });
      }, 1000);

      return () => clearInterval(interval);
   }, [router]);

   return (
      <div className="min-h-screen relative flex items-center justify-center bg-gray-900 py-20 sm:py-12 px-4 sm:px-0">
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
         <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
            <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-bold tracking-wide bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
               <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
         </div>

         <div className="relative z-10 max-w-md w-full px-5 py-8 sm:px-6 sm:py-12 bg-white/95 backdrop-blur-md rounded-[32px] sm:rounded-[40px] shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-700 my-auto text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
               <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tighter leading-tight">
               No Linked Account
            </h1>
            
            <p className="text-sm font-bold text-gray-600">
               Google sign-up is disabled. You must create an account using your email address first. You can link your Google account in your profile dashboard later.
            </p>

            <div className="pt-6">
               <p className="text-xs font-bold tracking-wide text-gray-400">
                  Redirecting to registration in <span className="text-[#a20000]">{timeLeft}</span> seconds...
               </p>
            </div>
         </div>
      </div>
   );
}
