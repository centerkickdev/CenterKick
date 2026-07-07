import { Lock } from 'lucide-react';

export function RestrictedAccess({ message = "Restricted Access", description = "You do not have permission to view this specific information." }: { message?: string, description?: string }) {
  return (
    <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
        <Lock className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-[10px] font-black text-gray-900 tracking-wide">{message}</p>
      <p className="text-[9px] font-bold text-gray-600 tracking-wide mt-1">{description}</p>
    </div>
  );
}

export function RestrictedAccessInline({ message = "Restricted" }: { message?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 text-gray-700 text-[9px] font-black tracking-wide rounded-lg border border-gray-200">
      <Lock className="w-3 h-3" />
      {message}
    </span>
  );
}
