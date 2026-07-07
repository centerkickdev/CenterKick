import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
   return (
      <div className="min-h-screen bg-white">
         <Navbar />

         <main className="pt-32">
            {/* Split Hero Section */}
            <div className="bg-gray-50 py-16">
               <div className="max-w-[1200px] mx-auto px-4 lg:px-0 flex flex-col lg:flex-row items-center justify-between gap-12">
                  <div className="w-full lg:w-2/3">
                     <span className="text-[#a20000] font-bold text-sm tracking-[0.2em] mb-4 block flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Legal & Compliance
                     </span>
                     <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
                        Privacy <br />
                        <span className="text-[#a20000]">Policy</span>
                     </h1>
                     <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                        Learn how CenterKick handles, processes, and protects your personal profile and billing data securely.
                     </p>
                  </div>
                  <div className="w-full lg:w-1/3 flex justify-end">
                     <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 tracking-wide">Last updated</p>
                        <p className="text-base font-bold text-gray-900 mt-1">May 6, 2026</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Document Body */}
            <div className="max-w-[800px] mx-auto px-4 py-24 space-y-12">
               
               <section className="space-y-4">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                     <span className="text-[#a20000]">1.</span> Information We Collect
                  </h2>
                  <p className="text-gray-600 text-base leading-[1.8] font-light">
                     We collect information that you provide directly to us when creating a profile, submitting verified football details, subscribing to a premium plan, or initiating communications with scouts, coaches, and agency personnel. This includes your name, email address, physical location, date of birth, sports statistics, and media assets.
                  </p>
               </section>

               <section className="space-y-4">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                     <span className="text-[#a20000]">2.</span> How We Use Your Data
                  </h2>
                  <p className="text-gray-600 text-base leading-[1.8] font-light font-sans">
                     Your profiles, statistical charts, and media assets are used specifically to represent your career status to verified scouts and technical directors on the CenterKick platform. Payment and settlement details are processed via encrypted gateways to maintain the billing cycle of your account without storing credential details on our local databases.
                  </p>
               </section>

               <section className="space-y-4">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                     <span className="text-[#a20000]">3.</span> Sharing and Exposure
                  </h2>
                  <p className="text-gray-600 text-base leading-[1.8] font-light">
                     By registering as an Athlete or Coach, you acknowledge that certain parts of your profile (such as position, name, and general metrics) are public-facing to enable maximum exposure to sports agencies. You can suspend or deactivate public visibility of your registry node at any time via your central Dashboard.
                  </p>
               </section>

               <section className="space-y-4">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                     <span className="text-[#a20000]">4.</span> Hardened Security
                  </h2>
                  <p className="text-gray-600 text-base leading-[1.8] font-light">
                     We enforce industry-standard security protocols to prevent unauthorized access or modification of your profile. Access tokens are encrypted, and database operations are managed under strict security policies.
                  </p>
               </section>

               <section className="space-y-4">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                     <span className="text-[#a20000]">5.</span> Your Privacy Rights
                  </h2>
                  <p className="text-gray-600 text-base leading-[1.8] font-light">
                     You retain full rights over your personal information. You can request a complete export of your registry data, edit your profile details, or request the permanent deletion of your account and files by contacting our governance team at <span className="text-[#a20000] font-bold">centrekick123@gmail.com</span>.
                  </p>
               </section>

            </div>

            {/* Bottom CTA Section */}
            <div className="bg-[#a20000] py-20 mb-10 overflow-hidden relative">
               <div className="max-w-[900px] mx-auto px-4 text-center relative z-10">
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tighter leading-tight">
                     Have questions about your data security?
                  </h2>
                  <Link href="/contact">
                     <button className="bg-white text-gray-900 px-10 py-4 rounded-xl font-black tracking-wide text-sm hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-3">
                        Contact Support <ArrowRight className="w-5 h-5 text-[#a20000]" />
                     </button>
                  </Link>
               </div>
            </div>
         </main>

         <Footer />
      </div>
   );
}
