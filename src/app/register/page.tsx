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
   const [emailIsValid, setEmailIsValid] = useState<boolean | null>(null);
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [role, setRole] = useState('player');
   const [otp, setOtp] = useState('');
   const [timeLeft, setTimeLeft] = useState(300);
   const [resendCooldown, setResendCooldown] = useState(60);
   const [isResending, setIsResending] = useState(false);

   const validatePassword = (pass: string) => {
      return (
         pass.length >= 8 &&
         /[A-Z]/.test(pass) &&
         /[0-9]/.test(pass) &&
         /[!@#$%^&*(),.?":{}|<>]/.test(pass)
      );
   };

   const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setEmail(val);
      if (val.length === 0) {
         setEmailIsValid(null);
      } else {
         setEmailIsValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
      }
   };

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
            setTimeLeft(300);
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

      if (!emailIsValid) {
         setStatus({ type: 'error', message: 'Please enter a valid email address.' });
         setIsLoading(false);
         return;
      }

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
         setEmail(emailInput);
         setRole(formData.get('role') as string);
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
            router.push('/dashboard');
         }
      } catch (err) {
         setStatus({ type: 'error', message: 'Failed to verify code.' });
      } finally {
         setIsLoading(false);
      }
   };

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

         <div className="relative z-10 max-w-md w-full px-5 py-8 sm:px-6 sm:py-12 bg-white/95 backdrop-blur-md rounded-[32px] sm:rounded-[40px] shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-700 my-auto">
            <div className="text-center mb-8 sm:mb-10">
               <h1 className="text-3xl font-bold text-gray-900 tracking-tighter leading-none mb-3">
                  Create <span className="text-[#a20000]">Account</span>
               </h1>
            </div>

            {status && (
               <div className={`mb-8 p-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500 ${status.type === 'success' ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <p className="text-xs font-bold tracking-wide">{status.message}</p>
               </div>
            )}

            <div className="space-y-6">
               {!showOtp ? (
                  <>
                     <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-500 tracking-wide ml-1">Account Type</label>
                           <div className="relative">
                              <select
                                 name="role"
                                 required
                                 className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none text-gray-900 appearance-none"
                              >
                                 <option value="player">Player</option>
                                 <option value="coach">Coach</option>
                                 <option value="agent">Agent</option>
                                 <option value="scout">Scout</option>
                                 <option value="organization">Organization</option>
                              </select>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 tracking-wide ml-1">First Name</label>
                              <div className="relative">
                                 <input
                                    name="firstName"
                                    type="text"
                                    required
                                    placeholder="John"
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none text-gray-900 placeholder:text-gray-300"
                                 />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 tracking-wide ml-1">Last Name</label>
                              <div className="relative">
                                 <input
                                    name="lastName"
                                    type="text"
                                    required
                                    placeholder="Doe"
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none text-gray-900 placeholder:text-gray-300"
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-500 tracking-wide ml-1">Professional Email</label>
                           <div className="relative">
                              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                 name="email"
                                 type="email"
                                 required
                                 value={email}
                                 onChange={handleEmailChange}
                                 placeholder="name@agency.com"
                                 className={`w-full bg-gray-50/50 border rounded-2xl pl-12 pr-6 py-3 text-sm font-bold focus:ring-2 focus:bg-white transition-all outline-none text-gray-900 placeholder:text-gray-300 ${
                                    emailIsValid === false ? 'border-red-500 focus:ring-red-500' : 'border-gray-100 focus:ring-[#a20000]'
                                 }`}
                              />
                           </div>
                           {email.length > 0 && (
                              <p className={`text-xs font-bold tracking-wide ml-2 ${emailIsValid ? 'text-green-600' : 'text-red-500'}`}>
                                 {emailIsValid ? 'Valid email format' : 'Invalid format. Use name@domain.com'}
                              </p>
                           )}
                        </div>

                        <PasswordField
                           name="password"
                           label="Create Password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           showRequirements={true}
                        />

                        <PasswordField
                           name="confirmPassword"
                           label="Confirm Password"
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           confirmFor={password}
                        />

                        <button
                           type="submit"
                           disabled={isLoading}
                           className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold tracking-[0.2em] text-sm hover:bg-[#a20000] transition-all flex items-center justify-center gap-3 shadow-xl transform active:scale-95 disabled:opacity-50"
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
                     <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 tracking-wide ml-1">Verification Code</label>
                        <input
                           type="text"
                           required
                           value={otp}
                           onChange={(e) => setOtp(e.target.value)}
                           placeholder="000000"
                           className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 text-xl font-bold tracking-[0.5em] text-center focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none text-gray-900 placeholder:text-gray-200"
                           maxLength={6}
                        />
                        <div className="flex flex-col items-center gap-2 mt-4">
                           <p className="text-xs text-center text-gray-400 font-bold tracking-wide">
                              Enter the 6-digit code sent to <span className="text-gray-900">{email}</span>
                           </p>
                           {timeLeft > 0 ? (
                              <p className="text-xs font-bold text-slate-500 tracking-wide">
                                 Code expires in <span className="text-[#a20000]">{Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</span>
                              </p>
                           ) : (
                              <p className="text-xs font-bold text-red-600 tracking-wide">
                                 Code expired. Please request a new one.
                              </p>
                           )}
                        </div>
                     </div>

                     <button
                        type="submit"
                        disabled={isLoading || timeLeft === 0}
                        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold tracking-[0.2em] text-sm hover:bg-[#a20000] transition-all flex items-center justify-center gap-3 shadow-xl transform active:scale-95 disabled:opacity-50"
                     >
                        {isLoading ? (
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                           <>Verify & Continue <ArrowRight className="w-4 h-4" /></>
                        )}
                     </button>

                     <div className="flex flex-col items-center gap-3 pt-2">
                        {resendCooldown > 0 ? (
                           <span className="text-xs font-bold text-gray-400 tracking-wide">
                              Resend code in {resendCooldown}s
                           </span>
                        ) : (
                           <button
                              type="button"
                              onClick={handleResend}
                              disabled={isResending}
                              className="text-xs font-bold text-[#a20000] tracking-wide hover:underline disabled:opacity-50"
                           >
                              {isResending ? 'Sending...' : 'Resend Verification Code'}
                           </button>
                        )}
                        
                        <button 
                           type="button"
                           onClick={() => setShowOtp(false)}
                           className="text-center text-xs font-bold text-gray-400 tracking-wide hover:text-gray-900 transition-colors"
                        >
                           Change Email Address
                        </button>
                     </div>
                  </form>
               )}
            </div>

            <div className="mt-8 text-center">
               <p className="text-xs font-bold text-gray-500 tracking-wide">
                  Already have an account?
                  <Link href="/login" className="text-[#a20000] ml-2 hover:underline font-bold">Login Now</Link>
               </p>
            </div>
         </div>
      </div>
   );
}

