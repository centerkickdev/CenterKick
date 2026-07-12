'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, LayoutDashboard, ArrowLeft, FlagTriangleRight } from 'lucide-react';

export default function DashboardNotFound() {
  const router = useRouter();

  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-8 min-h-[80vh]">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 text-center animate-in fade-in zoom-in-95 duration-500">
        
        <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100 relative">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20" />
          <AlertCircle className="w-10 h-10 text-red-500 relative z-10" />
        </div>

        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center justify-center gap-2">
          Offside!
          <FlagTriangleRight className="w-8 h-8 text-red-500 fill-red-500 -rotate-12 animate-pulse" />
        </h2>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold tracking-wide mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Data Not Found
        </div>

        <p className="text-sm text-slate-500 leading-relaxed mb-8 font-medium px-4">
          We couldn't locate the dashboard view or specific data you requested. It might have been moved or you might not have access.
        </p>

        <div className="flex flex-col gap-3">
          <Link 
            href="/dashboard"
            className="w-full px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard Home
          </Link>
          
          <button 
            onClick={() => router.back()}
            className="w-full px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl font-bold transition-all hover:text-slate-900 hover:border-slate-300 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
}
