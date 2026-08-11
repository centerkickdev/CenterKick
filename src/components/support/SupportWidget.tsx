'use client';

import React, { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Headphones, X, Send, Paperclip, CheckCircle2, MessageSquare, Mail, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';
import { submitSupportTicket, SupportCategory, SupportChannel } from '@/app/actions/support';

export function SupportWidget() {
  const pathname = usePathname();

  // Hide widget completely on user dashboard and admin panel routes
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
    return null;
  }

  return <SupportWidgetContent />;
}

function SupportWidgetContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [category, setCategory] = useState<SupportCategory>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<SupportChannel>('email');
  const [files, setFiles] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (channel === 'whatsapp' && !whatsappNumber.trim()) {
      setErrorMessage('Please enter your WhatsApp phone number.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('whatsapp_number', whatsappNumber);
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
        if (res.channel === 'whatsapp' && res.whatsappUrl) {
          window.open(res.whatsappUrl, '_blank');
        }
        setTimeout(() => {
          setIsSuccess(false);
          setIsOpen(false);
          // Reset form
          setSubject('');
          setMessage('');
          setFiles([]);
        }, 3000);
      } else {
        setErrorMessage(res.error || 'Failed to submit support request.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Widget Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-0 group-hover:gap-2.5 bg-[#b50a0a] hover:bg-[#8f0808] text-white p-3.5 group-hover:px-5 group-hover:py-3.5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer border border-red-500/30"
          aria-label="Support & Feedback"
        >
          <div className="relative shrink-0">
            <Headphones className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-xs font-bold tracking-wide">
            Help & Support
          </span>
        </button>
      )}

      {/* Popup Modal Widget */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-[92vw] sm:w-[420px] max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Widget Header */}
          <div className="bg-gradient-to-r from-gray-900 to-[#111111] p-5 text-white flex items-center justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#b50a0a]/20 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-[#b50a0a] flex items-center justify-center text-white shadow-md">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wide text-white">CenterKick Support</h3>
                <p className="text-[11px] font-medium text-gray-400">We typically reply within minutes</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
            {isSuccess ? (
              <div className="py-12 text-center space-y-4 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-100 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gray-900">Request Submitted!</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  {channel === 'whatsapp' 
                    ? 'Opening WhatsApp to complete your message to our official support line.'
                    : 'Thank you for reaching out. Our support team at info.centerkick@gmail.com has received your request.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Preferred Channel */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Send via Channel</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setChannel('email')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                        channel === 'email' 
                          ? 'bg-red-50 border-[#b50a0a] text-[#b50a0a]' 
                          : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      Email Ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('whatsapp')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                        channel === 'whatsapp' 
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-700' 
                          : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp Direct
                    </button>
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all"
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
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* WhatsApp Phone Number Field (Only when WhatsApp channel is selected) */}
                {channel === 'whatsapp' && (
                  <div className="space-y-1 animate-in fade-in duration-200">
                    <label className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                      WhatsApp Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={whatsappNumber}
                      onChange={e => setWhatsappNumber(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                    />
                  </div>
                )}

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Topic Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as SupportCategory)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="general">General Query</option>
                    <option value="billing">Billing Issues</option>
                    <option value="report_issue">Report an Issue</option>
                    <option value="feedback">Feedback / Feature Request</option>
                  </select>
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Support Title / Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Brief summary of your query"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a] focus:bg-white transition-all"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Message Description</label>
                  <textarea
                    required
                    rows={3}
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
                    <span className="text-[10px] text-gray-600 font-semibold">Max 5MB each (Img / PDF)</span>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-xl text-xs border border-gray-100">
                          <div className="flex items-center gap-2 truncate pr-2">
                            {file.type.includes('pdf') ? (
                              <FileText className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            ) : (
                              <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            )}
                            <span className="truncate text-gray-800 font-semibold">{file.name}</span>
                            <span className="text-[10px] text-gray-600 font-medium">({(file.size / (1024 * 1024)).toFixed(1)}MB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {files.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border border-dashed border-gray-200 hover:border-[#b50a0a] rounded-xl p-2.5 text-center text-xs font-bold text-gray-600 hover:text-[#b50a0a] transition-all flex items-center justify-center gap-2 bg-gray-50/50 hover:bg-red-50/30"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
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

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#b50a0a] hover:bg-[#8f0808] text-white py-3 rounded-2xl text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Query
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
