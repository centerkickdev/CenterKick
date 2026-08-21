'use client';

import { useState, useEffect } from 'react';
import { Copy, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface CopyableProfileLinkProps {
  slugOrId: string;
  role: string;
}

export function CopyableProfileLink({ slugOrId, role }: CopyableProfileLinkProps) {
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const rolePath = role === 'player' ? 'players' : role === 'coach' ? 'coaches' : role === 'agent' ? 'agents' : role === 'scout' ? 'scouts' : role === 'organization' ? 'organizations' : `${role}s`;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    // ensure no double slashes if NEXT_PUBLIC_SITE_URL has trailing slash
    const formattedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    setFullUrl(`${formattedBase}/${rolePath}/${slugOrId}`);
  }, [slugOrId, role]);

  const handleCopy = async () => {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      showToast('Profile link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast('Failed to copy link', 'error');
    }
  };

  if (!fullUrl) return null;

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Link Copied" : "Copy Profile Link"}
      className={`shrink-0 flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm ${
        copied 
          ? 'bg-green-50 text-green-700 border border-green-200 shadow-green-900/5' 
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
      }`}
    >
      {copied ? (
        <>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Copy Link</span>
        </>
      )}
    </button>
  );
}
