'use client';

import React, { useState, useEffect } from 'react';
import { 
  Headphones, Search, Filter, Mail, MessageSquare, Clock, 
  CheckCircle2, AlertCircle, Eye, ExternalLink, FileText, 
  Image as ImageIcon, RefreshCw, X, ChevronDown, User, ShieldCheck
} from 'lucide-react';
import { getSupportTickets, updateSupportTicketStatus } from './actions';
import { useToast } from '@/context/ToastContext';

export default function AdminSupportPage() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Ticket for Detail Modal
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const res = await getSupportTickets(statusFilter, categoryFilter);
    if (res.error) {
      showToast(res.error, 'error');
    } else {
      setTickets(res.tickets || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter]);

  const handleStatusChange = async (ticketId: string, newStatus: 'open' | 'in_progress' | 'resolved') => {
    setIsUpdatingStatus(ticketId);
    const res = await updateSupportTicketStatus(ticketId, newStatus);
    if (res.success) {
      showToast(`Ticket status updated to ${newStatus.replace('_', ' ')}`, 'success');
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev: any) => ({ ...prev, status: newStatus }));
      }
    } else {
      showToast(res.error || 'Failed to update status', 'error');
    }
    setIsUpdatingStatus(null);
  };

  // Filtered tickets client-side search
  const filteredTickets = tickets.filter(t => {
    const q = searchQuery.toLowerCase();
    return (
      t.subject?.toLowerCase().includes(q) ||
      t.name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.message?.toLowerCase().includes(q)
    );
  });

  // Metrics
  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;
  const totalCount = tickets.length;

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-black to-[#b50a0a] p-6 lg:p-8 rounded-[32px] text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-red-200 border border-white/10">
            <Headphones className="w-3.5 h-3.5" />
            Support Management Hub
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">Support Tickets & Feedback</h1>
          <p className="text-xs text-gray-300 font-medium">Track, manage, and resolve inquiries from users and site visitors.</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all border border-white/10 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Tickets
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Open Tickets</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">{openCount}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">In Progress</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600">{inProgressCount}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Resolved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{resolvedCount}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Total Requests</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{totalCount}</p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or subject..."
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <span className="text-xs font-bold text-gray-400 hidden lg:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <span className="text-xs font-bold text-gray-400 hidden lg:inline">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a] cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="billing">Billing Issues</option>
              <option value="report_issue">Report an Issue</option>
              <option value="feedback">Feedback / Feature Request</option>
              <option value="general">General Query</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs font-bold text-gray-400 animate-pulse">Loading support tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-500">No support tickets found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-black uppercase text-gray-400 tracking-wider">
                  <th className="p-4 pl-6">Sender Details</th>
                  <th className="p-4">Topic / Subject</th>
                  <th className="p-4">Channel</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900">{ticket.name}</p>
                        <p className="text-[11px] text-gray-500 font-medium">{ticket.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 max-w-xs">
                        <span className="text-[10px] font-black uppercase text-[#b50a0a] bg-red-50 px-2 py-0.5 rounded-md">
                          {ticket.category?.replace('_', ' ')}
                        </span>
                        <p className="font-bold text-gray-900 truncate">{ticket.subject}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        ticket.channel === 'whatsapp' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {ticket.channel === 'whatsapp' ? <MessageSquare className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                        {ticket.channel?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={ticket.status || 'open'}
                        disabled={isUpdatingStatus === ticket.id}
                        onChange={e => handleStatusChange(ticket.id, e.target.value as any)}
                        className={`text-[11px] font-black uppercase px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none ${
                          ticket.status === 'resolved' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : ticket.status === 'in_progress' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="p-4 text-gray-500 font-medium">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-[#b50a0a] text-gray-700 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-gray-900 to-black text-white flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-950/80 px-2.5 py-1 rounded-md border border-red-800">
                  {selectedTicket.category?.replace('_', ' ')}
                </span>
                <h3 className="text-lg font-black text-white pt-1">{selectedTicket.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {/* Sender Details Box */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Sender Name</span>
                  <span className="font-bold text-gray-900 text-sm">{selectedTicket.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</span>
                  <a href={`mailto:${selectedTicket.email}`} className="font-bold text-[#b50a0a] hover:underline text-sm">{selectedTicket.email}</a>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Channel Used</span>
                  <span className="font-bold text-gray-900 uppercase">{selectedTicket.channel}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Submission Date</span>
                  <span className="font-bold text-gray-900">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Message Description</h4>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.message}
                </div>
              </div>

              {/* Attachments */}
              {selectedTicket.attachment_urls && selectedTicket.attachment_urls.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Attachments ({selectedTicket.attachment_urls.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTicket.attachment_urls.map((url: string, idx: number) => {
                      const isPdf = url.toLowerCase().includes('.pdf');
                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-2xl border border-gray-200 hover:border-[#b50a0a] bg-gray-50 hover:bg-red-50/20 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {isPdf ? <FileText className="w-5 h-5 text-red-600 shrink-0" /> : <ImageIcon className="w-5 h-5 text-blue-600 shrink-0" />}
                            <span className="text-xs font-bold text-gray-800 truncate group-hover:text-[#b50a0a]">Attachment {idx + 1}</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#b50a0a] shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-gray-500">Update Status:</span>
                <select
                  value={selectedTicket.status}
                  onChange={e => handleStatusChange(selectedTicket.id, e.target.value as any)}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b50a0a]"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={`mailto:${selectedTicket.email}?subject=Re: ${encodeURIComponent(selectedTicket.subject)}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all"
                >
                  <Mail className="w-4 h-4" />
                  Reply via Email
                </a>
                <a
                  href={`https://wa.me/2349112600300?text=Support%20Ticket%20${selectedTicket.id}:%20Regarding%20${encodeURIComponent(selectedTicket.subject)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
