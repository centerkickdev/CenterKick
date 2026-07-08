import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, Clock, Mail, LayoutDashboard, ArrowRight, Share2, ChevronRight } from "lucide-react";
import Link from 'next/link';

export default function RegisterSuccessPage() {
   return (
      <div className="min-h-screen bg-white">
         <Navbar />

         <main className="pt-32 pb-24">
            <div className="max-w-[800px] mx-auto px-4 lg:px-0 text-center">
               
               {/* Confetti / Celebration Icon */}
               <div className="relative inline-block mb-12">
                  <div className="absolute inset-0 bg-[#a20000] blur-[100px] opacity-20 rounded-full animate-pulse"></div>
                  <div className="w-24 h-24 bg-green-50 rounded-[40px] flex items-center justify-center text-green-500 relative z-10 border border-green-100 shadow-xl scale-110 animate-in zoom-in duration-700">
                     <CheckCircle2 className="w-12 h-12" />
                  </div>
               </div>

               <div className="space-y-6 mb-16">
                  <span className="text-[#a20000] font-bold text-sm tracking-[0.4em] block">Registration Successful</span>
                  <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none">
                     Welcome to the <br />
                     <span className="text-[#a20000]">Inner Circle</span>
                  </h1>
                  <p className="text-gray-500 text-lg font-medium max-w-xl mx-auto leading-relaxed pt-4">
                     Your professional profile has been submitted and your payment is confirmed. Our scouting department is now reviewing your information for accuracy.
                  </p>
               </div>

               {/* Status Timeline */}
               <div className="bg-gray-50 rounded-[48px] p-10 md:p-16 border border-gray-100 mb-16 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#a20000] blur-[150px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
                  
                  <h3 className="text-sm font-bold text-gray-400 tracking-[0.2em] mb-12 relative z-10">Application Status</h3>
                  
                  <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                     <div className="flex-1 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center mb-4 shadow-lg">
                           <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-900 tracking-wide">Submitted</span>
                     </div>
                     <div className="hidden md:block w-20 h-0.5 bg-gray-200"></div>
                     <div className="flex-1 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-[#a20000] text-white flex items-center justify-center mb-4 shadow-lg animate-pulse">
                           <Clock className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-[#a20000] tracking-wide">Under Review</span>
                     </div>
                     <div className="hidden md:block w-20 h-0.5 bg-gray-200"></div>
                     <div className="flex-1 flex flex-col items-center opacity-40">
                        <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mb-4">
                           <LayoutDashboard className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-400 tracking-wide">Public Live</span>
                     </div>
                  </div>
               </div>

               {/* Next Steps Card */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                  <div className="bg-white border border-gray-100 p-10 rounded-[40px] shadow-sm flex flex-col items-start text-left group hover:border-[#a20000] transition-colors">
                     <Mail className="w-8 h-8 text-[#a20000] mb-6" />
                     <h4 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Check Your Email</h4>
                     <p className="text-base font-medium text-gray-400 leading-relaxed mb-6">We&apos;ve sent a detailed welcome packet to your inbox with your login credentials and temporary dashboard access.</p>
                     <button className="text-xs font-bold tracking-wide text-[#a20000] flex items-center gap-2 group-hover:gap-4 transition-all">Resend Email <ChevronRight className="w-4 h-4" /></button>
                  </div>
                  <div className="bg-white border border-gray-100 p-10 rounded-[40px] shadow-sm flex flex-col items-start text-left group hover:border-[#a20000] transition-colors">
                     <Share2 className="w-8 h-8 text-[#a20000] mb-6" />
                     <h4 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Share the News</h4>
                     <p className="text-base font-medium text-gray-400 leading-relaxed mb-6">Let the world know you&apos;ve joined CenterKick. Sharing your status helps build early momentum for your profile.</p>
                     <div className="flex gap-4">
                        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#a20000] hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"><Share2 className="w-4 h-4" /></button>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <Link href="/">
                     <button className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-bold tracking-wide text-sm hover:bg-[#a20000] transition-all shadow-xl flex items-center gap-4">
                        Return to Homepage <ArrowRight className="w-4 h-4" />
                     </button>
                  </Link>
                  <p className="text-gray-400 font-bold text-sm tracking-wide">Wait time: <span className="text-gray-900">24-72 Hours For Approval</span></p>
               </div>

            </div>
         </main>

         <Footer />
      </div>
   );
}
