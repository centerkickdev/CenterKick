'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface NetworkStatusBadgeProps {
  inline?: boolean;
}

export function NetworkStatusBadge({ inline = false }: NetworkStatusBadgeProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);

    let onlineTimer: NodeJS.Timeout;

    const handleOnline = () => {
      setIsOnline(true);
      setShowOnline(true);
      
      // Hide the "ONLINE" badge after 3 seconds
      onlineTimer = setTimeout(() => {
        setShowOnline(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(onlineTimer);
    };
  }, []);

  return (
    <div className={`${inline ? 'relative' : 'fixed z-[9999] sm:top-4 sm:left-1/2 sm:-translate-x-1/2 sm:bottom-auto bottom-8 left-1/2 -translate-x-1/2 shadow-xl'} transition-all duration-500 flex items-center backdrop-blur-md border 
      ${isOnline 
        ? (showOnline ? 'bg-green-500/10 text-green-600 border-green-500/20 px-4 py-2 gap-2 rounded-full' : 'bg-transparent border-transparent px-2 py-2 rounded-full shadow-none') 
        : 'bg-red-500/10 text-red-600 border-red-500/20 px-4 py-2 gap-2 rounded-full'
      }`}
    >
      {isOnline ? (
        <>
          <div className="relative flex h-2 w-2 items-center justify-center">
            {showOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600 shadow-sm shadow-green-500/50"></span>
          </div>
          {showOnline && (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">ONLINE</span>
            </>
          )}
        </>
      ) : (
        <>
          <div className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </div>
          <WifiOff className="w-3.5 h-3.5" />
          <span>OFFLINE</span>
        </>
      )}
    </div>
  );
}
