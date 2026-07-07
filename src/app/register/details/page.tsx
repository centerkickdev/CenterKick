"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChevronRight, Camera, MapPin, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { getRegistrationData, saveRegistrationData } from '@/lib/registrationStore';

import { completeRegistration, getTournaments, getTournamentTeams } from '../actions';
import { checkAccountStatus, AccountStatus } from '@/app/actions/auth';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PasswordField } from '@/components/common/PasswordField';

function RegisterDetailsContent() {
   const searchParams = useSearchParams();
   const roleFromUrl = searchParams.get('role');
   const [role, setRole] = useState(roleFromUrl || 'athlete');
   const [formData, setFormData] = useState<any>({});
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [emailStatus, setEmailStatus] = useState<AccountStatus>('NONE');
   const [isCheckingEmail, setIsCheckingEmail] = useState(false);

   const [tournaments, setTournaments] = useState<any[]>([]);
   const [teams, setTeams] = useState<any[]>([]);
   const [selectedTournament, setSelectedTournament] = useState('');
   const [selectedTeam, setSelectedTeam] = useState('');

   useEffect(() => {
      const data = getRegistrationData();
      if (data.role && !roleFromUrl) {
         setRole(data.role);
      }
      if (data.details) {
         setFormData(data.details);
      }
   }, [roleFromUrl]);

   useEffect(() => {
      async function loadTournaments() {
         const data = await getTournaments();
         setTournaments(data);
      }
      loadTournaments();
   }, []);

   useEffect(() => {
      async function loadTeams() {
         if (selectedTournament) {
            const data = await getTournamentTeams(selectedTournament);
            setTeams(data);
         } else {
            setTeams([]);
         }
         setSelectedTeam('');
      }
      loadTeams();
   }, [selectedTournament]);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const updatedData = { ...formData, [name]: value };
      setFormData(updatedData);
      saveRegistrationData({ details: updatedData, step: 2 });
   };

   useEffect(() => {
      const email = formData.email;
      if (!email || !email.includes('@')) {
         setEmailStatus('NONE');
         return;
      }

      const timer = setTimeout(async () => {
         setIsCheckingEmail(true);
         const res = await checkAccountStatus(email);
         setEmailStatus(res.status);
         setIsCheckingEmail(false);
      }, 500);

      return () => clearTimeout(timer);
   }, [formData.email]);

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      
      // Add email status verification
      if (emailStatus === 'REGISTERED') {
         setError("This email is already registered. Please use a different email or log in.");
         setIsLoading(false);
         return;
      }

      const form = new FormData(e.currentTarget);
      const result = await completeRegistration(form);
      
      if (result?.error) {
         setError(result.error);
         setIsLoading(false);
      }
   };

   return (
      <main className="pt-32 pb-24">
         <div className="max-w-[800px] mx-auto px-4 lg:px-0">
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-16">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-green-500 text-green-500 flex items-center justify-center font-black">✓</div>
                  <div className="w-16 h-1 bg-green-500 rounded-full"></div>
                  <div className="w-12 h-12 rounded-full bg-[#a20000] text-white flex items-center justify-center font-black animate-pulse">2</div>
               </div>
            </div>

            <div className="text-center mb-16 px-4">
               <span className="text-[#a20000] font-black text-sm tracking-[0.4em] mb-4 block underline underline-offset-4">{role} Profile</span>
               <h1 className="text-4xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-6">
                  Final <br />
                  <span className="text-[#a20000]">Onboarding</span>
               </h1>
            </div>

            {error && (
               <div className="max-w-[800px] mx-auto mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-black tracking-wide animate-in fade-in slide-in-from-top-2">
                  {error}
               </div>
            )}

            <div className="bg-white border border-gray-100 rounded-[40px] p-8 md:p-16 shadow-[0_60px_100px_rgba(0,0,0,0.06)] relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#a20000] to-black opacity-20"></div>
               
               <form onSubmit={handleSubmit} className="space-y-10">
                  <input type="hidden" name="role" value={role} />
                  
                  {/* Photo Upload Placeholder */}
                  <div className="flex flex-col items-center">
                     <div className="w-32 h-32 rounded-[40px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-900 group cursor-pointer hover:border-[#a20000] hover:bg-red-50 transition-all shadow-sm">
                        <Camera className="w-8 h-8 mb-1 group-hover:text-[#a20000] transition-colors" />
                        <span className="text-[10px] font-black tracking-wide">Upload Photo</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Full Name</label>
                        <input 
                           name="fullName"
                           required
                           value={formData.fullName || ''}
                           onChange={handleInputChange}
                           type="text" 
                           placeholder="John Doe" 
                           className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none text-black placeholder:text-gray-900" 
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Date of Birth</label>
                        <input 
                           name="dob"
                           required
                           value={formData.dob || ''}
                           onChange={handleInputChange}
                           type="date" 
                           className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none text-black" 
                        />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Country</label>
                     <div className="relative">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-black w-4 h-4" />
                        <input 
                           name="country"
                           required
                           value={formData.country || ''}
                           onChange={handleInputChange}
                           type="text" 
                           placeholder="Nigeria" 
                           className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none text-black placeholder:text-gray-900" 
                        />
                     </div>
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1 flex justify-between">
                            <span>Email Address</span>
                            {isCheckingEmail && <span className="text-[7px] text-[#a20000] animate-pulse">Checking...</span>}
                         </label>
                         <input 
                            name="email"
                            required
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            type="email" 
                            placeholder="john@example.com" 
                            className={`w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none text-black placeholder:text-gray-900 ${emailStatus === 'REGISTERED' ? 'ring-2 ring-red-500 bg-red-50/10' : ''}`} 
                         />
                         {emailStatus === 'REGISTERED' && (
                           <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-red-50 rounded-xl border border-red-100">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                              <p className="text-[9px] font-black text-red-600 tracking-wide">Email already registered. Please login.</p>
                           </div>
                         )}
                         {emailStatus === 'PROSPECT' && (
                           <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-green-50 rounded-xl border border-green-100 animate-in fade-in zoom-in">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                              <p className="text-[9px] font-black text-green-600 tracking-wide">Welcome back! We found your profile.</p>
                           </div>
                         )}
                      </div>
                      <PasswordField 
                        name="password"
                        label="Account Password"
                      />
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Phone Number</label>
                     <input 
                        name="phone"
                        required
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        type="tel" 
                        placeholder="+234..." 
                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none text-black placeholder:text-gray-900" 
                     />
                  </div>

                  {(role === 'athlete' || role === 'coach') && (
                     <div className="pt-12 border-t border-gray-100 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-4 mb-2">
                           <div className="h-0.5 w-8 bg-[#a20000]"></div>
                           <h3 className="text-sm font-black tracking-wide text-gray-900">League & Team Selection</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Tournament League</label>
                              <select 
                                 name="tournament_id"
                                 value={selectedTournament}
                                 onChange={(e) => setSelectedTournament(e.target.value)}
                                 className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none appearance-none text-black"
                              >
                                 <option value="">Select Tournament League</option>
                                 {tournaments.map((t: any) => (
                                    <option key={t.id} value={t.id} className="text-black">{t.name}</option>
                                 ))}
                              </select>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Team</label>
                              <select 
                                 name="tournament_team_id"
                                 value={selectedTeam}
                                 onChange={(e) => setSelectedTeam(e.target.value)}
                                 disabled={!selectedTournament}
                                 className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none appearance-none text-black disabled:opacity-50"
                              >
                                 <option value="">Select Team</option>
                                 {teams.map((t: any) => (
                                    <option key={t.id} value={t.id} className="text-black">{t.team_name}</option>
                                 ))}
                              </select>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Role Specific Fields (Minimizing for Basic Step) */}
                  {role === 'athlete' && (
                     <div className="pt-12 border-t border-gray-100 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-4 mb-2">
                           <div className="h-0.5 w-8 bg-[#a20000]"></div>
                           <h3 className="text-sm font-black tracking-wide text-gray-900">Career Stats</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-4">
                               <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Position</label>
                               <select 
                                  name="position"
                                  required
                                  value={formData.position || ''}
                                  onChange={handleInputChange}
                                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none appearance-none text-black"
                               >
                                  <option value="" className="text-black">Select Position</option>
                                  <option className="text-black">Forward</option>
                                  <option className="text-black">Midfielder</option>
                                  <option className="text-black">Defender</option>
                                  <option className="text-black">Goalkeeper</option>
                               </select>
                           </div>
                           <div className="space-y-4">
                               <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Preferred Foot</label>
                               <select 
                                  name="preferredFoot"
                                  value={formData.preferredFoot || ''}
                                  onChange={handleInputChange}
                                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none appearance-none text-black"
                               >
                                  <option value="" className="text-black">Select Foot</option>
                                  <option className="text-black">Right</option>
                                  <option className="text-black">Left</option>
                                  <option className="text-black">Both</option>
                               </select>
                           </div>
                        </div>
                     </div>
                  )}

                  {role === 'agent' && (
                     <div className="pt-12 border-t border-gray-100 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-4 mb-2">
                           <div className="h-0.5 w-8 bg-[#a20000]"></div>
                           <h3 className="text-sm font-black tracking-wide text-gray-900">Agency Data</h3>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">Agency Name</label>
                            <input 
                               name="agencyName"
                               required
                               value={formData.agencyName || ''}
                               onChange={handleInputChange}
                               type="text" 
                               placeholder="Apex Sports Management" 
                               className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none text-black placeholder:text-gray-900" 
                            />
                        </div>
                     </div>
                  )}

                  <div className="pt-10 flex gap-6">
                     <Link href="/register" className="flex-1">
                        <button type="button" className="w-full bg-gray-100 text-gray-900 py-6 rounded-2xl font-black tracking-wide text-[11px] hover:bg-gray-200 transition-all transform active:scale-95">
                           Back
                        </button>
                     </Link>
                     <button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex-[2] bg-black text-white py-6 rounded-2xl font-black tracking-wide text-[11px] hover:bg-gray-900 transition-all flex items-center justify-center gap-4 shadow-[0_30px_60px_rgba(0,0,0,0.1)] transform active:scale-95 disabled:opacity-50"
                     >
                        {isLoading ? (
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                           <>Complete Registration & Access Dashboard <ArrowRight className="w-5 h-5" /></>
                        )}
                     </button>
                  </div>

               </form>
            </div>
         </div>
      </main>
   );
}

export default function RegisterDetailsPage() {
   return (
      <div className="min-h-screen bg-white">
         <Navbar />
         <Suspense fallback={<div className="pt-32 text-center font-black tracking-wide animate-pulse">Loading Profile...</div>}>
            <RegisterDetailsContent />
         </Suspense>
         <Footer />
      </div>
   );
}
