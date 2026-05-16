'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => string;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (type !== 'loading') {
      setTimeout(() => {
        hideToast(id);
      }, 5000);
    }
    return id;
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.8, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)', transition: { duration: 0.3 } }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-4 px-6 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border backdrop-blur-3xl
                ${toast.type === 'success' ? 'bg-white/95 border-emerald-50 text-emerald-600' : ''}
                ${toast.type === 'error' ? 'bg-white/95 border-red-50 text-[#b50a0a]' : ''}
                ${toast.type === 'info' ? 'bg-white/95 border-blue-50 text-blue-600' : ''}
                ${toast.type === 'loading' ? 'bg-black/90 border-white/10 text-white' : ''}
              `}>
                <div className={`
                  w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg
                  ${toast.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-200' : ''}
                  ${toast.type === 'error' ? 'bg-[#b50a0a] text-white shadow-red-200' : ''}
                  ${toast.type === 'info' ? 'bg-blue-500 text-white shadow-blue-200' : ''}
                  ${toast.type === 'loading' ? 'bg-white/10 text-white' : ''}
                `}>
                  {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                  {toast.type === 'info' && <Info className="w-5 h-5" />}
                  {toast.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
                </div>
                <div className="min-w-0 pr-4">
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                    {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Attention Required' : toast.type === 'loading' ? 'Processing' : 'Information'}
                  </p>
                  <p className="text-[11px] font-bold text-gray-500 mt-1 line-clamp-2">{toast.message}</p>
                </div>
                <button 
                  onClick={() => hideToast(toast.id)}
                  className="p-2 hover:bg-gray-100 rounded-2xl transition-all"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
