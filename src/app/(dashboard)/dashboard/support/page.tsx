'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, Send, Paperclip, CheckCircle2, MessageSquare, Mail, 
  AlertCircle, FileText, Image as ImageIcon, X, Clock, ShieldCheck 
} from 'lucide-react';
import { submitSupportTicket, getUserSupportTickets, SupportCategory, SupportChannel } from '@/app/actions/support';
import { useToast } from '@/context/ToastContext';

export default function DashboardSupportPage() {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<SupportCategory>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<SupportChannel>('email');
  const [files, setFiles] = useState<File[]>([]);

  // Tickets History
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadTickets() {
      const tickets = await getUserSupportTickets();
      setMyTickets(tickets);
      setIsLoadingHistory(false);
    }
    loadTickets();
  }, [isSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    if (files.length + selectedFiles.length > 5) {
      setErrorMessage('Maximum 5 files allowed.');
      return;
    }

    const invalidSize = selectedFiles.some(f => f.size > 5 * 1024 * 1024);
    if (invalidSize) {
      setErrorMessage('File size must not exceed 5MB per file.');
      return;
    }

    const invalidType = selectedFiles.some(f => 
      !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(f.type)
    );
    if (invalidType) {
      setErrorMessage('Only images (JPEG, PNG, WEBP) and PDF files are allowed.');
      return;
    }

    setErrorMessage(null);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('name', name || 'Dashboard User');
    formData.append('email', email || 'user@centerkick.com');
    formData.append('category', category);
    formData.append('subject', subject);
    formData.append('message', message);
    formData.append('channel', channel);

    files.forEach(file => {
      formData.append('attachments', file);
    });

    try {
      const res = await submitSupportTicket(formData);
      if (res.success) {
        setIsSuccess(true);
        showToast('Support ticket submitted successfully!', 'success');
        if (res.channel === 'whatsapp' && res.whatsappUrl) {
          window.open(res.whatsappUrl, '_blank');
        }
        setSubject('');
        setMessage('');
        setFiles([]);
        setTimeout(() => setIsSuccess(false), 4000);
      } else {
        setErrorMessage(res.error || 'Failed to submit request.');
        showToast(res.error || 'Failed to submit request.', 'error');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      showToast(err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-[#b50a0a] rounded-[32px] p-6 lg:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-red-200 backdrop-blur-sm border border-white/10">
            <Headphones className="w-3.5 h-3.5" />
            24/7 Dedicated Help & Support
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">Help & Support Center</h1>
          <p className="text-xs text-gray-300 font-medium leading-relaxed">
            Need help with billing, profile updates, or account verification? Submit your request below or connect directly via WhatsApp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Support Ticket Form (Replicating Widget Layout) */}
        <div className="lg:col-span-7 bg-white rounded-[32px] border border-gray-100 p-6 lg:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Submit a Support Ticket</h2>
              <p className="text-xs text-gray-400 font-medium">We typically reply within minutes</p>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <Mail className="w-3.5 h-3.5 text-[#b50a0a]" />
              <span className="text-[11px] font-bold text-gray-700">info.centerkick@gmail.com</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-2 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isSuccess && (
              <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-center gap-3 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Ticket submitted successfully! Our support team will get back to you shortly.</span>
              </div>
            )}

            {/* Preferred Channel */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Send via Channel</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border ${
                    channel === 'email' 
                      ? 'bg-red-50 border-[#b50a0a] text-[#b50a0a] shadow-sm' 
                      : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Email Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border ${
                    channel === 'whatsapp' 
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-700 shadow-sm' 
                      : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp Direct
                </button>
              </div>
            </div>

            {/* Sender Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Your Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Category Dropdown (Inside Form) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Topic Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as SupportCategory)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all cursor-pointer"
              >
                <option value="general">General Query</option>
                <option value="billing">Billing Issues</option>
                <option value="report_issue">Report an Issue</option>
                <option value="feedback">Feedback / Feature Request</option>
              </select>
            </div>

            {/* Subject / Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Support Title / Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Brief summary of your query"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Message Description</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe how we can help you..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all resize-none"
              ></textarea>
            </div>

            {/* Attachments */}
            <div className="space-y-2 pt-1 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                  Attachments ({files.length}/5)
                </label>
                <span className="text-[10px] text-gray-500 font-semibold">Max 5MB each (Img / PDF)</span>
              </div>

              {files.length > 0 && (
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-xs border border-gray-100">
                      <div className="flex items-center gap-2 truncate pr-2">
                        {file.type.includes('pdf') ? (
                          <FileText className="w-4 h-4 text-red-600 shrink-0" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                        <span className="truncate text-gray-800 font-semibold">{file.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">({(file.size / (1024 * 1024)).toFixed(1)}MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {files.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-gray-200 hover:border-[#b50a0a] rounded-xl p-3 text-center text-xs font-bold text-gray-500 hover:text-[#b50a0a] transition-all flex items-center justify-center gap-2 bg-gray-50/50 hover:bg-red-50/30 cursor-pointer"
                >
                  <Paperclip className="w-4 h-4" />
                  Attach Image or PDF
                </button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#b50a0a] hover:bg-[#8f0808] text-white py-3.5 rounded-2xl text-xs font-bold tracking-wide transition-all shadow-md shadow-red-900/10 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Submitting Query...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Query
                </>
              )}
            </button>
          </form>
        </div>

        {/* Support Request History */}
        <div className="lg:col-span-5 bg-white rounded-[32px] border border-gray-100 p-6 lg:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#b50a0a]" />
              My Ticket History
            </h3>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{myTickets.length} Total</span>
          </div>

          {isLoadingHistory ? (
            <div className="py-12 text-center text-xs font-bold text-gray-400 animate-pulse">Loading history...</div>
          ) : myTickets.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-500">No support tickets submitted yet.</p>
              <p className="text-[11px] text-gray-400">Your submitted support tickets and their live statuses will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {myTickets.map(t => (
                <div key={t.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-900 truncate pr-2">{t.subject}</span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      t.status === 'resolved' 
                        ? 'bg-green-100 text-green-700' 
                        : t.status === 'in_progress' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {t.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{t.message}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] font-semibold text-gray-400">
                    <span>{t.category?.replace('_', ' ')} ({t.channel?.toUpperCase()})</span>
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
