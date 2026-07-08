'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTournament } from '../actions';
import { Trophy, ArrowLeft, Loader2, Save, Calendar, Info, Layout, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function NewTournamentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const router = useRouter();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await createTournament(formData);
    
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push('/admin/tournaments');
    }
  };

  return (
    <div className="max-w-full max-w-[1000px] mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link href="/admin/tournaments" className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-gray-400 hover:text-[#b50a0a] transition-colors mb-4">
            <ArrowLeft className="w-3 h-3" /> Back to Tournaments
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 shadow-sm">
              <Trophy className="w-5 h-5 text-[#b50a0a]" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tighter">New Tournament</h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-center gap-4 text-red-600 animate-in fade-in slide-in-from-top-2">
          <Info className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold tracking-wide">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-10 pb-20">
        <div className="lg:col-span-2 space-y-10">
          {/* Core Info */}
          <div className="bg-white border border-gray-100 rounded-[40px] p-10 space-y-8 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                <Layout className="w-4 h-4 text-gray-400" />
              </div>
              <h3 className="text-base font-bold tracking-wide text-gray-900">Tournament Identity</h3>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-400 tracking-wide ml-1">Official Name</label>
              <input 
                name="name"
                required
                type="text" 
                placeholder="e.g. Lagos Elite League 2026" 
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black placeholder:text-gray-300" 
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-400 tracking-wide ml-1">Tournament Logo (Optional)</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0 relative group cursor-pointer hover:border-[#b50a0a] transition-colors">
                  {logoPreview ? (
                    <Image src={logoPreview} alt="Logo Preview" fill className="object-contain p-2" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-[#b50a0a] transition-colors" />
                  )}
                  <input 
                    type="file" 
                    name="logo" 
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleLogoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-900">Upload Identity</p>
                  <p className="text-xs font-bold text-gray-400 tracking-wide">Recommended: 400x400px. Max 4MB.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-400 tracking-wide ml-1">Detailed Description</label>
              <textarea 
                name="description"
                rows={4}
                placeholder="Describe the format, rules, and eligibility..." 
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black placeholder:text-gray-300 resize-none" 
              />
            </div>
          </div>

          {/* Dates & Schedule */}
          <div className="bg-white border border-gray-100 rounded-[40px] p-10 space-y-8 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <h3 className="text-base font-bold tracking-wide text-gray-900">Timeline & Format</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 tracking-wide ml-1">Tournament Type</label>
                <select 
                  name="type"
                  required
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black"
                >
                  <option value="league">League Format</option>
                  <option value="knockout">Knockout Tournament</option>
                  <option value="hybrid">Hybrid (Group + Knockout)</option>
                </select>
              </div>
              
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 tracking-wide ml-1">Kick-off Date</label>
                <input 
                  name="start_date"
                  type="date" 
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-base font-bold focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all outline-none text-black" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
          <div className="bg-gray-900 rounded-[40px] p-10 text-white space-y-8 shadow-2xl">
            <div className="space-y-2">
              <h4 className="text-lg font-bold tracking-tighter">Ready to Launch?</h4>
              <p className="text-xs font-bold text-gray-400 tracking-wide leading-relaxed">
                Confirming will create the tournament core. You can add teams and fixtures in the next step.
              </p>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#b50a0a] text-white py-6 rounded-2xl font-bold tracking-[0.2em] text-xs hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4 shadow-xl transform active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create League <Save className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-[40px] p-4 md:p-8 text-center space-y-4">
            <p className="text-xs font-bold text-gray-400 tracking-wide">Need help with formats?</p>
            <Link href="/admin/docs/tournaments" className="text-xs font-bold text-[#b50a0a] tracking-wide hover:underline">
              Read Management Guide
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
