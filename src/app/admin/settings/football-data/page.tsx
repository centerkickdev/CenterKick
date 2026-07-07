import FootballDataManagement from '@/components/admin/settings/FootballDataManagement';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function FootballDataPage() {
  return (
    <div className="p-4 md:p-8 max-w-full max-w-[1600px] mx-auto min-h-screen bg-slate-50/30">
      <div className="mb-8 flex items-center justify-between">
        <Link 
          href="/admin/settings"
          className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold text-sm tracking-wide"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to System Settings
        </Link>
      </div>

      <FootballDataManagement />
    </div>
  );
}
