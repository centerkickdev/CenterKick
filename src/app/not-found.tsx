import Link from 'next/link';
import { Home, MessageCircle, FlagTriangleRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 max-w-2xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="space-y-4">
          <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-rose-400 animate-pulse">
            404
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-3">
            Offside!
            <FlagTriangleRight className="w-10 h-10 md:w-12 md:h-12 text-[#b50a0a] fill-[#b50a0a] -rotate-12 animate-pulse" />
          </h2>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold tracking-wide border border-slate-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Page Not Found
          </div>
        </div>

        <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto font-medium">
          Looks like you've wandered out of bounds. The page you're looking for might have been transferred, deleted, or never existed in the first place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link 
            href="/"
            className="w-full sm:w-auto px-8 py-4 bg-[#b50a0a] hover:bg-[#8a0808] text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          


          <Link 
            href="/contact"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold transition-all hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5 text-slate-400" />
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
