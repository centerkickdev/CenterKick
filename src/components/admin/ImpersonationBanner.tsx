'use client';

import { useTransition } from 'react';
import { Eye, LogOut, ShieldAlert, RefreshCw } from 'lucide-react';
import { stopImpersonation } from '@/app/admin/users/impersonate-actions';

interface ImpersonationBannerProps {
  targetEmail?: string;
  targetId: string;
  targetRole?: string;
}

export function ImpersonationBanner({ targetEmail, targetId, targetRole }: ImpersonationBannerProps) {
  const [isPending, startTransition] = useTransition();

  const handleExit = () => {
    startTransition(async () => {
      await stopImpersonation();
    });
  };

  return (
    <>
      {/* Full-screen Loading Overlay when Exiting */}
      {isPending && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex flex-col items-center justify-center text-white animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-600/90 border border-amber-400/50 flex items-center justify-center mb-4 shadow-2xl animate-bounce">
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Exiting Preview Mode...</h3>
          <p className="text-xs text-amber-200 mt-1 font-medium">Restoring SuperAdmin Session</p>
        </div>
      )}

      {/* Sticky Impersonation Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-4 py-2.5 shadow-lg flex items-center justify-between sticky top-0 z-50 text-xs sm:text-sm font-semibold border-b border-amber-500/30 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-amber-900/50 flex items-center justify-center shrink-0 border border-amber-400/30">
            <ShieldAlert className="w-4 h-4 text-amber-200 animate-pulse" />
          </div>
          <div className="truncate">
            <span className="bg-amber-900/80 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider mr-2 text-amber-200 border border-amber-500/30">
              SuperAdmin Preview
            </span>
            <span className="hidden sm:inline">Viewing Dashboard as </span>
            <span className="underline font-bold text-amber-100">{targetEmail || targetId}</span>
            {targetRole && (
              <span className="ml-1.5 opacity-90 text-[11px] font-medium uppercase bg-amber-950/60 px-1.5 py-0.5 rounded">
                ({targetRole})
              </span>
            )}
            <span className="ml-2 text-amber-200 text-xs hidden md:inline font-normal">
              — Read-Only Preview Mode
            </span>
          </div>
        </div>

        <button
          onClick={handleExit}
          disabled={isPending}
          className="flex items-center gap-1.5 bg-white hover:bg-amber-50 text-amber-950 px-3.5 py-1.5 rounded-xl transition-all font-bold text-xs shadow-md shrink-0 disabled:opacity-50 border border-amber-200/50 hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isPending ? (
            <RefreshCw className="w-3.5 h-3.5 text-amber-700 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5 text-amber-700" />
          )}
          {isPending ? 'Exiting...' : 'Exit Preview Mode'}
        </button>
      </div>
    </>
  );
}
