'use client';

import { CheckCircle2, Circle, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { useState } from 'react';

interface ProfileCompletenessWidgetProps {
  role?: string;
  formData: {
    avatar_url?: string;
    cover_url?: string;
    first_name?: string;
    last_name?: string;
    gallery_urls?: string[];
    video_links?: string[];
  };
}

export function ProfileCompletenessWidget({ role, formData }: ProfileCompletenessWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const isPlayer = role === 'player' || role === 'athlete';

  const checks = [
    { id: 'avatar', label: 'Profile Picture', completed: Boolean(formData.avatar_url) },
    { id: 'cover', label: 'Cover Image', completed: Boolean(formData.cover_url) },
    { id: 'first_name', label: 'First Name', completed: Boolean(formData.first_name) },
    { id: 'last_name', label: 'Last Name', completed: Boolean(formData.last_name) },
    ...(isPlayer ? [
      { id: 'gallery', label: 'Portfolio Images (2+)', completed: Boolean(formData.gallery_urls && formData.gallery_urls.length >= 2) },
      { id: 'video', label: 'Portfolio Videos (1+)', completed: Boolean(formData.video_links && formData.video_links.length >= 1) },
    ] : []),
  ];

  const completedCount = checks.filter(c => c.completed).length;
  const isAllComplete = completedCount === checks.length;
  const percentage = Math.round((completedCount / checks.length) * 100);

  if (isDismissed || isAllComplete) {
    return null;
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
        <button 
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-3 bg-white border border-gray-100 shadow-xl px-5 py-3 rounded-full hover:bg-gray-50 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 group"
        >
          <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
               <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f3f4f6" strokeWidth="4"></circle>
               <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#b50a0a" strokeWidth="4" strokeDasharray={`${percentage}, 100`} strokeLinecap="round" className="transition-all duration-1000 ease-out"></circle>
             </svg>
             <Target className="absolute w-3 h-3 text-[#b50a0a] inset-0 m-auto" />
          </div>
          <span className="text-sm font-bold tracking-wide text-gray-900 group-hover:text-[#b50a0a] transition-colors">{percentage}% Complete</span>
          <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-[#b50a0a]" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[calc(100vw-48px)] sm:w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 tracking-wide">Profile Completion</h3>
          <p className="text-xs font-bold text-gray-500 mt-0.5">{percentage}% Completed</p>
        </div>
        <button onClick={() => setIsExpanded(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors" aria-label="Minimize">
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      <div className="relative w-full h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-[#b50a0a] rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="space-y-3">
        {checks.map((check) => (
          <div key={check.id} className="flex items-center gap-3">
            {check.completed ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 animate-in zoom-in duration-300" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300 shrink-0" />
            )}
            <span className={`text-xs font-bold tracking-wide transition-colors duration-300 ${check.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
