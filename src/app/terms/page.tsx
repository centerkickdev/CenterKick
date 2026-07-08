import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
   return (
      <div className="min-h-screen bg-white">
         <Navbar />

         <main className="pt-32">
            {/* Split Hero Section */}
            <div className="bg-gray-50 py-16">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0 flex flex-col lg:flex-row items-center justify-between gap-12">
                  <div className="w-full lg:w-2/3">
                     <span className="text-[#a20000] font-bold text-sm tracking-[0.2em] mb-4 block flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Legal & Terms
                     </span>
                     <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
                        Terms of <br />
                        <span className="text-[#a20000]">Service</span>
                     </h1>
                     <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                        Read the terms, guidelines, and conditions that govern your use of the CenterKick exposure platform.
                     </p>
                  </div>
                  <div className="w-full lg:w-1/3 flex justify-end">
                     <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 tracking-wide">Last updated</p>
                        <p className="text-base font-bold text-gray-900 mt-1">May 6, 2026</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Document Body */}
            <div className="max-w-[800px] mx-auto px-4 py-24 space-y-12">
               
               <section className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                     <span className="text-[#a20000]">1.</span> Acceptance of Terms
                  </h2>
                  <p className="text-gray-600 text-base leading-[1.8] font-light">
                     By accessing or using the CenterKick sports profile management platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must immediately terminate use of the services.
                  </p>
               </section>

               <section className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                     <span className="text-[#a20000]">2.</span> Profile Eligibility and Integrity
                  </h2>
                  <p className="text-gray-600 text-base leading-[1.8] font-light">
                     Athletes, Coaches, and Agents registering on CenterKick must supply authentic, accurate, and verified information regarding their sporting stats, professional certifications, and identity. Creating duplicate or misleading profiles is strictly prohibited and constitutes grounds for immediate account suspension.
                  </p>
               </section>

               <section className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                     <span className="text-[#a20000]">3.</span> Subscription Fees and Renewals
                  </h2>
                  <p className="text-gray-600 text-base leading-[1.8] font-light">
                     Subscription plan fees (for Athletes, Coaches, or Agents) are billed in advance on a recurring frequency chosen during registration (Monthly, Quarterly, Yearly, or Lifetime). All financial transactions are final. Suspended accounts due to integrity breaches are not eligible for refunds.
                  </p>
               </section>

               <section className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                     <span className="text-[#a20000]">4.</span> Permitted Platform Use
                  </h2>
                  <p className="text-gray-600 text-base leading-[1.8] font-light">
                     You agree not to use the platform to transmit spam, execute malicious scripts, or harvest profile datasets without authorization. Technical directors and scouts agree to use profile details strictly for recruiting purposes.
                  </p>
               </section>

               <section className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                     <span className="text-[#a20000]">5.</span> Limitation of Liability
                  </h2>
                  <p className="text-gray-600 text-base leading-[1.8] font-light">
                     CenterKick acts solely as a career exposure and media aggregation platform. We do not guarantee employment, tryout placement, representation agreements, or specific agency signings as a result of using the platform.
                  </p>
               </section>

            </div>

            {/* Bottom CTA Section */}
            <div className="bg-[#a20000] py-20 mb-10 overflow-hidden relative">
               <div className="max-w-[900px] mx-auto px-4 text-center relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tighter leading-tight">
                     Ready to showcase your talent to the world?
                  </h2>
                  <Link href="/register">
                     <button className="bg-white text-gray-900 px-10 py-4 rounded-xl font-bold tracking-wide text-sm hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-3">
                        Register Now <ArrowRight className="w-5 h-5 text-[#a20000]" />
                     </button>
                  </Link>
               </div>
            </div>
         </main>

         <Footer />
      </div>
   );
}
