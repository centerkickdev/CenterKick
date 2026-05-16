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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Before mounting, we render a stable, locale-independent format or nothing
  // to avoid hydration mismatch with the server's locale.
  if (!mounted) {
    // ISO-like format is stable
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
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
