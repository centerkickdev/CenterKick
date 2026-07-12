'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface HybridLinkValue {
  name: string;
  email?: string;
  verifiedProfileId?: string;
  verifiedProfileName?: string;
  verifiedProfileAvatar?: string;
}

interface HybridLinkInputProps {
  value: HybridLinkValue;
  onChange: (value: HybridLinkValue) => void;
  placeholderName?: string;
  placeholderEmail?: string;
}

export function HybridLinkInput({ 
  value, 
  onChange, 
  placeholderName = "Name (e.g. John Doe)", 
  placeholderEmail = "Email (Optional to link profile)" 
}: HybridLinkInputProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'verified' | 'unverified' | 'error'>('idle');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!value.email || value.email.trim() === '') {
        setStatus('idle');
        if (value.verifiedProfileId) {
           onChange({ ...value, verifiedProfileId: undefined, verifiedProfileName: undefined, verifiedProfileAvatar: undefined });
        }
        return;
      }

      // Check if it's a valid email format roughly before querying
      if (!value.email.includes('@')) return;

      setIsVerifying(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('email', value.email.trim())
        .single();

      setIsVerifying(false);

      if (error || !data) {
        setStatus('unverified');
        onChange({ ...value, verifiedProfileId: undefined, verifiedProfileName: undefined, verifiedProfileAvatar: undefined });
      } else {
        setStatus('verified');
        const fullName = `${data.first_name} ${data.last_name}`;
        onChange({ 
          ...value, 
          verifiedProfileId: data.id, 
          verifiedProfileName: fullName, 
          verifiedProfileAvatar: data.avatar_url 
        });
      }
    };

    const debounceTimeout = setTimeout(verifyEmail, 500);
    return () => clearTimeout(debounceTimeout);
  }, [value.email]);

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#b50a0a] focus:ring-1 focus:ring-[#b50a0a]"
            placeholder={placeholderName}
            value={value.name || ''}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email / CenterKick Link</label>
          <div className="relative">
             <input
               type="email"
               className={`w-full px-4 py-2 pl-10 bg-white border rounded-lg text-sm focus:outline-none focus:border-[#b50a0a] focus:ring-1 focus:ring-[#b50a0a] ${
                 status === 'verified' ? 'border-green-300 bg-green-50/30' : 
                 status === 'unverified' ? 'border-amber-200' : 'border-gray-200'
               }`}
               placeholder={placeholderEmail}
               value={value.email || ''}
               onChange={(e) => onChange({ ...value, email: e.target.value })}
             />
             <div className="absolute left-3 top-2.5">
               {isVerifying ? (
                 <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
               ) : status === 'verified' ? (
                 <CheckCircle2 className="w-4 h-4 text-green-500" />
               ) : (
                 <Search className="w-4 h-4 text-gray-400" />
               )}
             </div>
          </div>
        </div>
      </div>
      
      {/* Verification Feedback Badge */}
      {status === 'verified' && value.verifiedProfileId && (
         <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white border border-green-200 relative shrink-0">
               <Image 
                 src={value.verifiedProfileAvatar || "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=100&auto=format&fit=crop"} 
                 alt="Verified" 
                 fill 
                 className="object-cover" 
               />
            </div>
            <p className="text-xs font-semibold text-green-700">
               Linked to verified profile: <span className="font-bold">{value.verifiedProfileName}</span>
            </p>
         </div>
      )}
      
      {status === 'unverified' && value.email && (
         <p className="text-xs text-amber-600 font-medium px-1">
           No CenterKick profile found with this email. They will be listed as an external contact.
         </p>
      )}
    </div>
  );
}
