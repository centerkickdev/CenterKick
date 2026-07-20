'use client';

import { useState, useEffect } from 'react';

interface DateDisplayProps {
  date: string | Date;
  showTime?: boolean;
  className?: string;
}

/**
 * A hydration-safe date display component.
 * Ensures the date is rendered consistently between server and client.
 */
export function DateDisplay({ date, showTime = false, className = "" }: DateDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
     
    setMounted(true);
  }, []);

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return <span className={className}>-</span>;
  }
  
  // Before mounting, we render a stable, locale-independent format using UTC
  // to avoid timezone-based hydration mismatches between the server and the client.
  if (!mounted) {
    const y = dateObj.getUTCFullYear();
    const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getUTCDate()).padStart(2, '0');
    return <span className={className}>{`${y}-${m}-${d}`}</span>;
  }

  // After mounting on the client, we can safely use locale-dependent formatting
  return (
    <span className={className}>
      {dateObj.toLocaleDateString('en-US', showTime ? { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      } : {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })}
    </span>
  );
}
