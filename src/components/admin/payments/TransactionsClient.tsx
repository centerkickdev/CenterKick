'use client';

import { useState, useTransition, useEffect } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, 
  CreditCard, DollarSign, Clock, TrendingUp,
  Globe, CheckCircle, XCircle,
  UserCheck, UserX, Activity,
  Ban, ShieldCheck, RefreshCcw, X, Eye,
  Building, FileText
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DateDisplay } from '@/components/common/DateDisplay';
import { useToast } from '@/context/ToastContext';
import { approvePaymentTransaction, rejectPaymentTransaction } from '@/app/admin/approvals/actions';

interface Transaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  method: 'direct_transfer' | 'paystack_integration' | 'paystack_link' | 'other';
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  metadata?: {
    proofName?: string;
    proofEmail?: string;
    proofFileName?: string;
    proofFileUrl?: string;
    rejection_reason?: string;
    approval_comment?: string;
    reason?: string;
    comment?: string;
  };
}

interface StatItem {
  icon: string;
  label: string;
  trend: string;
  color: string;
  value: number | string;
  isCurrency?: boolean;
}

export function TransactionsClient({
  transactions,
  totalCount,
  currentPage,
  pageSize,
  stats,
  dailyData,
  monthlyData,
  yearlyData,
  currentProjection,
  growthRate
}: {
  transactions: Transaction[],
  totalCount: number,
  currentPage: number,
  pageSize: number,
  stats: StatItem[],
  dailyData: { name: string, value: number }[],
  monthlyData: { name: string, value: number }[],
  yearlyData: { name: string, value: number }[],
  currentProjection: number,
  growthRate: number
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [timeframe, setTimeframe] = useState('Monthly');
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('NGN');
  const exchangeRate = 1500; // 1 USD = 1500 NGN standard conversion

  const totalPages = Math.ceil(totalCount / pageSize);
  
  const { showToast } = useToast();
  const [_isPending, startTransition] = useTransition();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [decisionAction, setDecisionAction] = useState<{
    id: string;
    type: 'approve' | 'reject';
    title: string;
    subtitle: string;
    targetName: string;
    targetEmail: string;
  } | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [inspectPayment, setInspectPayment] = useState<Transaction | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (inspectPayment?.metadata?.proofFileUrl) {
      fetch(inspectPayment.metadata.proofFileUrl)
        .then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
        })
        .catch(err => console.error('Failed to create blob from receipt:', err));
    } else {
      setBlobUrl(null);
    }
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [inspectPayment?.id]);

  const runApprovalAction = async (id: string, actionFn: () => Promise<{ success: boolean; error?: string }>) => {
    setActionLoadingId(id);
    try {
      const res = await actionFn();
      if (res.success) {
        showToast("Request processed successfully and user notified via email.", "success");
        startTransition(() => {
          router.refresh();
        });
      } else {
        showToast(res.error || "Failed to process request.", "error");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      showToast(errorMsg, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Dynamic currency and formatting helper
  const formatVal = (val: number, decimals = 2) => {
    if (currency === 'NGN') {
      return `â‚¦${val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    }
    return `$${(val / exchangeRate).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  };

  const getGrowthData = () => {
    switch (timeframe) {
      case 'Daily':
        return dailyData;
      case 'Monthly':
        return monthlyData;
      case 'Yearly':
        return yearlyData;
      default:
        return monthlyData;
    }
  };

  const currentGrowthData = getGrowthData();
  const maxGrowthValue = Math.max(...currentGrowthData.map(d => d.value), 1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) params.set('q', searchQuery);
    else params.delete('q');
    params.set('page', '1');
    router.push(`/admin/payments/transactions?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    router.push(`/admin/payments/transactions?${params.toString()}`);
  };

  const handleDateChange = (year?: string, month?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (year) params.set('year', year);
    if (month) params.set('month', month);
    params.set('page', '1');
    router.push(`/admin/payments/transactions?${params.toString()}`);
  };

  const navigateToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/payments/transactions?${params.toString()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-50 text-green-600 border-green-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'failed': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'direct_transfer': return 'Direct Transfer';
      case 'paystack_integration': return 'Paystack App';
      case 'paystack_link': return 'Paystack Link';
      default: return 'Other';
    }
  };

  const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    DollarSign,
    UserCheck,
    UserX,
    TrendingUp,
    Activity
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Full-Width Growth Monitor */}
      <div className="bg-gray-950 p-4 md:p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
         <div className="absolute inset-0 bg-gradient-to-br from-[#b50a0a]/20 via-transparent to-transparent"></div>
         <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#b50a0a]/10 blur-[100px] rounded-full"></div>
         
         <div className="relative z-10 flex flex-col gap-4 md:p-8">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#b50a0a] flex items-center justify-center shadow-2xl shadow-red-900/40">
                     <Activity className="w-7 h-7 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">Financial Growth <span className="text-[#b50a0a]">Monitor</span></h3>
                    <p className="text-sm font-bold text-gray-400 tracking-wide mt-1">Real-time performance metrics & projections</p>
                  </div>
               </div>

               <div className="flex flex-wrap gap-4 items-center justify-end xl:ml-auto">
                  {/* Currency Selector */}
                  <div className="flex bg-white/5 p-1.5 rounded-2xl gap-2 border border-white/5">
                     {['USD', 'NGN'].map((curr) => (
                       <button
                         key={curr}
                         onClick={() => setCurrency(curr as 'USD' | 'NGN')}
                         className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${currency === curr ? 'bg-[#b50a0a] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                       >
                         {curr === 'USD' ? '$ USD' : 'â‚¦ NGN'}
                       </button>
                     ))}
                  </div>

                  {/* Timeframe Selector */}
                  <div className="flex bg-white/5 p-1.5 rounded-2xl gap-2 border border-white/5">
                     {['Daily', 'Monthly', 'Yearly'].map((t) => (
                       <button
                         key={t}
                         onClick={() => setTimeframe(t)}
                         className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${timeframe === t ? 'bg-white text-gray-950 shadow-lg' : 'text-gray-400 hover:text-white'}`}
                       >
                         {t}
                       </button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:p-8">
               <div className="lg:col-span-3 h-56 flex items-end justify-between gap-4 px-4 relative">
                  {/* Background Horizontal Gridlines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 pr-4 pb-8">
                     <div className="border-b border-dashed border-white/10 w-full h-0"></div>
                     <div className="border-b border-dashed border-white/10 w-full h-0"></div>
                     <div className="border-b border-dashed border-white/10 w-full h-0"></div>
                     <div className="w-full h-0"></div>
                  </div>

                  {currentGrowthData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar h-full justify-end relative z-10">
                       <div className="relative w-full h-40 flex flex-col justify-end items-center">
                          {/* Pill Track */}
                          <div className="absolute inset-y-0 w-3 bg-white/[0.04] rounded-full left-1/2 -translate-x-1/2"></div>
                          {/* Filled Neon Bar */}
                          <div 
                            className="w-3 bg-gradient-to-t from-[#b50a0a] to-[#ff2b2b] rounded-full transition-all duration-1000 relative z-10 shadow-[0_0_12px_rgba(181,10,10,0.35)] group-hover/bar:shadow-[0_0_20px_rgba(255,43,43,0.65)] group-hover/bar:from-[#c90c0c] group-hover/bar:to-[#ff5555]" 
                            style={{ height: `${(d.value / maxGrowthValue) * 100}%` }}
                          ></div>
                          {/* Value Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all text-xs font-bold text-[#b50a0a] whitespace-nowrap bg-white px-2.5 py-1.5 rounded-lg shadow-xl border border-gray-100 z-20">
                             {formatVal(d.value)}
                          </div>
                       </div>
                       <span className="text-xs font-bold text-gray-400 tracking-wide">{d.name}</span>
                    </div>
                  ))}
               </div>

               <div className="bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-6 flex flex-col justify-center space-y-6 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-400 tracking-[0.15em] mb-1">Current Projection</p>
                    <div className="flex items-baseline gap-0.5 text-[#ff3a3a] text-lg sm:text-xl xl:text-[22px] font-bold tracking-tighter whitespace-nowrap overflow-visible">
                       <span>+</span>
                       <span>{formatVal(currentProjection, 0)}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold tracking-wide">
                       <span className="text-gray-400">Growth Rate</span>
                       <span className="text-green-400">+{growthRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                       <div className="w-[72%] h-full bg-[#b50a0a] rounded-full shadow-[0_0_10px_rgba(181,10,10,0.5)]"></div>
                    </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = IconMap[stat.icon] || CreditCard;
          return (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${stat.label === 'Total Revenue' ? 'bg-[#b50a0a] shadow-red-900/20' : 'bg-gray-900 shadow-gray-200'}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-bold ${stat.color} bg-white px-3 py-1.5 rounded-full border border-gray-50 shadow-sm`}>
                        {stat.trend} <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-500 tracking-wide mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-gray-900 tracking-tight">
                      {stat.isCurrency ? formatVal(Number(stat.value)) : stat.value}
                    </p>
                    {stat.isCurrency && <span className="text-sm font-bold text-gray-400 tracking-wide">{currency}</span>}
                  </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Filterable Transaction Ledger */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 md:p-8 border-b border-gray-50 space-y-6">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                 <h2 className="text-base font-bold text-gray-800 tracking-wide underline decoration-[#b50a0a] decoration-4 underline-offset-8">Transaction Archives</h2>
              </div>
              <div className="flex gap-4">
                 <select 
                   onChange={(e) => handleDateChange(e.target.value, searchParams.get('month') || undefined)}
                   value={searchParams.get('year') || new Date().getFullYear().toString()}
                   className="bg-gray-50 border-none rounded-xl text-sm font-bold tracking-wide px-4 py-2.5 text-gray-800"
                 >
                    {[2024, 2025, 2026].map(year => (
                       <option key={year} value={year}>{year}</option>
                    ))}
                 </select>
                 <select 
                   onChange={(e) => handleDateChange(searchParams.get('year') || undefined, e.target.value)}
                   value={searchParams.get('month') || ''}
                   className="bg-gray-50 border-none rounded-xl text-sm font-bold tracking-wide px-4 py-2.5 text-gray-800"
                 >
                    <option value="">Full Year</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                       <option key={m} value={i + 1}>{m}</option>
                    ))}
                 </select>
              </div>
           </div>
           
           <div className="flex flex-wrap gap-3">
              <form onSubmit={handleSearch} className="relative flex-1 min-w-0 md:min-w-full max-w-[300px]">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                   type="text"
                   placeholder="Search by Reference or Payer Name..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all text-gray-800 placeholder:text-gray-300"
                 />
              </form>
              <select 
                onChange={(e) => handleFilterChange('status', e.target.value)}
                value={searchParams.get('status') || ''}
                className="bg-gray-50 border-none rounded-xl text-sm font-bold tracking-wide px-4 py-3 focus:ring-2 focus:ring-[#b50a0a] text-gray-800 appearance-none pr-10 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%20stroke%3D%22%23b50a0a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat"
              >
                 <option value="">All Statuses</option>
                 <option value="confirmed">Confirmed</option>
                 <option value="pending">Pending</option>
                 <option value="failed">Failed</option>
              </select>
              <select 
                onChange={(e) => handleFilterChange('method', e.target.value)}
                value={searchParams.get('method') || ''}
                className="bg-gray-50 border-none rounded-xl text-sm font-bold tracking-wide px-4 py-3 focus:ring-2 focus:ring-[#b50a0a] text-gray-800 appearance-none pr-10 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%20stroke%3D%22%23b50a0a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat"
              >
                 <option value="">All Methods</option>
                 <option value="direct_transfer">Direct Transfer</option>
                 <option value="paystack_integration">Paystack Integration</option>
                 <option value="paystack_link">Paystack Link</option>
              </select>
           </div>
        </div>

        <div className="overflow-x-auto w-full pb-4 custom-scrollbar">
          <table className="w-full text-left text-base text-gray-600 table-auto whitespace-nowrap">
            <thead className="bg-[#f8f9fa] border-b border-gray-100">
              <tr>
                 <th className="px-3 py-3 text-xs font-extrabold tracking-wide text-[#b50a0a]">Reference / ID</th>
                 <th className="px-3 py-3 text-xs font-extrabold tracking-wide text-[#b50a0a]">Payer Details</th>
                 <th className="px-3 py-3 text-xs font-extrabold tracking-wide text-[#b50a0a]">Amount</th>
                 <th className="px-3 py-3 text-xs font-extrabold tracking-wide text-[#b50a0a]">Gateway</th>
                 <th className="px-3 py-3 text-xs font-extrabold tracking-wide text-[#b50a0a]">Status</th>
                 <th className="px-3 py-3 text-xs font-extrabold tracking-wide text-[#b50a0a]">Date</th>
                 <th className="px-3 py-3 text-xs font-extrabold tracking-wide text-[#b50a0a] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {transactions.length === 0 ? (
                 <tr>
                    <td colSpan={7} className="px-3 py-12 text-center">
                       <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                       <p className="text-sm font-bold tracking-wide text-gray-400">No transactions recorded yet.</p>
                    </td>
                 </tr>
               ) : (
                 transactions.map((tx) => (
                   <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-3 py-2.5">
                         <div className="flex flex-col">
                            <span className="font-extrabold text-gray-900 text-xs tracking-tight">{tx.reference}</span>
                            <span className="text-xs font-semibold text-gray-400 mt-0.5">ID: {tx.id.slice(0, 8)}</span>
                         </div>
                      </td>
                      <td className="px-3 py-2.5">
                         <div className="flex flex-col">
                            <p className="font-bold text-gray-900 leading-none text-xs">{tx.profiles?.first_name} {tx.profiles?.last_name}</p>
                            <p className="text-xs font-medium text-gray-400 mt-0.5 truncate max-w-full max-w-[160px]">{tx.profiles?.email}</p>
                         </div>
                      </td>
                      <td className="px-3 py-2.5">
                         <div className="flex flex-col">
                            <span className="font-extrabold text-gray-900 text-sm tracking-tight">{formatVal(Number(tx.amount))}</span>
                            <span className="text-xs font-bold text-gray-400 tracking-wide mt-0.5">{currency}</span>
                         </div>
                      </td>
                      <td className="px-3 py-2.5">
                         <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-black shrink-0" />
                            <span className="text-xs font-bold text-gray-700 tracking-wide">{getMethodLabel(tx.method)}</span>
                         </div>
                      </td>
                      <td className="px-3 py-2.5">
                         <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-bold tracking-wide ${getStatusColor(tx.status)}`}>
                            {tx.status === 'confirmed' ? <CheckCircle className="w-3 h-3" /> : tx.status === 'failed' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {tx.status}
                         </div>
                      </td>
                      <td className="px-3 py-2.5">
                         <div className="flex flex-col">
                            <DateDisplay date={tx.created_at} className="text-xs font-bold text-gray-800" />
                            <span className="text-xs font-medium text-gray-400 mt-0.5">
                               {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                         <div className="flex items-center justify-end gap-1.5">
                            {/* Preview Action - Available for all transactions */}
                            <button
                              onClick={() => setInspectPayment(tx)}
                              className="w-8.5 h-8.5 rounded-full bg-gray-50 hover:bg-gray-950 hover:text-white flex items-center justify-center text-gray-600 transition-all border border-gray-100 shadow-sm cursor-pointer"
                              title="Preview Transaction Details"
                            >
                               <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Approve/Reject Actions - Awaiting verification status */}
                            {tx.status === 'pending' && tx.method === 'direct_transfer' && (
                               <>
                                  <button 
                                    onClick={() => setDecisionAction({
                                      id: tx.id,
                                      type: 'approve',
                                      title: 'Approve Payment',
                                      subtitle: 'Confirm bank settlement receipt & activate subscription',
                                      targetName: tx.profiles ? `${tx.profiles.first_name} ${tx.profiles.last_name}` : 'N/A',
                                      targetEmail: tx.profiles?.email || 'N/A'
                                    })}
                                    className="w-7 h-7 rounded-full bg-green-50 hover:bg-green-600 hover:text-white flex items-center justify-center text-green-600 transition-all border border-green-100 shadow-sm cursor-pointer"
                                    title="Approve Transaction"
                                  >
                                     <CheckCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => setDecisionAction({
                                      id: tx.id,
                                      type: 'reject',
                                      title: 'Reject Payment',
                                      subtitle: 'Decline transfer proof & mark transaction as failed',
                                      targetName: tx.profiles ? `${tx.profiles.first_name} ${tx.profiles.last_name}` : 'N/A',
                                      targetEmail: tx.profiles?.email || 'N/A'
                                    })}
                                    className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-600 hover:text-white flex items-center justify-center text-red-650 transition-all border border-red-100 shadow-sm cursor-pointer"
                                    title="Reject Transaction"
                                  >
                                     <X className="w-3.5 h-3.5" />
                                  </button>
                               </>
                            )}
                         </div>
                      </td>
                   </tr>
                 ))
               )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-[#f8f9fa] border-t border-gray-100 flex items-center justify-between">
           <p className="text-sm font-bold text-gray-600 tracking-wide">
              Viewing <span className="text-[#b50a0a] font-extrabold">{transactions.length}</span> of <span className="text-[#b50a0a] font-extrabold">{totalCount}</span> Transactions
           </p>
           <div className="flex items-center gap-1.5">
              <button 
                onClick={() => navigateToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-black hover:border-black transition-all disabled:opacity-30 disabled:hover:border-gray-200 bg-white"
              >
                 <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                 {Array.from({ length: totalPages }).map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => navigateToPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-[#b50a0a] text-white shadow-lg shadow-red-900/20' : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                    >
                       {i + 1}
                    </button>
                 ))}
              </div>
              <button 
                onClick={() => navigateToPage(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-black hover:border-black transition-all disabled:opacity-30 bg-white"
              >
                 <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      {/* Transaction Details Inspector Modal */}
      {inspectPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setInspectPayment(null)}>
          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl relative animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setInspectPayment(null)} className="absolute top-4 right-4 w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-all z-10 cursor-pointer">
              <X className="w-5 h-5 text-gray-400" />
            </button>
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100 font-bold text-2xl shrink-0">
                  â‚¦
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tighter leading-none mb-1">Transaction Details</h2>
                  <p className="text-xs font-bold text-[#b50a0a] tracking-[0.2em]">Reference: {inspectPayment.reference}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 mb-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 tracking-wide font-bold"><UserCheck className="w-3.5 h-3.5" /> Payer Name</div>
                  <p className="text-sm font-bold text-gray-900 truncate pr-4">
                    {inspectPayment.profiles ? `${inspectPayment.profiles.first_name} ${inspectPayment.profiles.last_name}` : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 tracking-wide font-bold"><Globe className="w-3.5 h-3.5" /> Email Address</div>
                  <p className="text-sm font-bold text-gray-900 truncate pr-4">{inspectPayment.profiles?.email || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 tracking-wide font-bold"><CreditCard className="w-3.5 h-3.5" /> Transaction Amount</div>
                  <p className="text-sm font-bold text-green-600 font-bold">{formatVal(Number(inspectPayment.amount))} {inspectPayment.currency}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 tracking-wide font-bold"><Clock className="w-3.5 h-3.5" /> Payment Method / Gateway</div>
                  <p className="text-sm font-bold text-gray-900 font-bold">{getMethodLabel(inspectPayment.method)}</p>
                </div>
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 tracking-wide font-bold"><Activity className="w-3.5 h-3.5" /> Transaction Status</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-bold tracking-wide ${getStatusColor(inspectPayment.status)}`}>
                      {inspectPayment.status}
                    </span>
                  </div>
                </div>
              </div>

              {inspectPayment.method === 'direct_transfer' && (
                <div className="bg-slate-50 rounded-[1.5rem] p-5 mb-8 border border-slate-100 space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <h4 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-2">
                      <Building className="w-4 h-4 text-amber-600" /> Direct Transfer Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 tracking-wide">Depositor Name</p>
                      <p className="text-sm font-bold text-slate-800">{inspectPayment.metadata?.proofName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 tracking-wide">Depositor Email</p>
                      <p className="text-sm font-bold text-slate-800 break-all">{inspectPayment.metadata?.proofEmail || 'N/A'}</p>
                    </div>
                  </div>
                  {inspectPayment.metadata?.proofFileUrl ? (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60">
                      <p className="text-xs font-bold text-slate-400 tracking-wide">Uploaded Proof Receipt</p>
                      {inspectPayment.metadata.proofFileUrl.toLowerCase().endsWith('.pdf') ? (
                        <a
                          href={blobUrl || inspectPayment.metadata.proofFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-[#b50a0a] hover:bg-slate-50 transition-all shadow-sm"
                        >
                          <FileText className="w-4 h-4 text-[#b50a0a]" /> Open PDF Receipt
                        </a>
                      ) : (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white max-h-56 flex items-center justify-center shadow-inner group">
                          {blobUrl ? (
                            <img
                              src={blobUrl}
                              alt="Payment Receipt"
                              className="max-h-56 w-full object-contain p-2"
                            />
                          ) : (
                            <div className="p-4 text-xs font-bold text-gray-400 animate-pulse">Loading receipt image securely...</div>
                          )}
                          <a
                            href={blobUrl || inspectPayment.metadata.proofFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide backdrop-blur-sm transition-all shadow-lg"
                          >
                            Open Full Image
                          </a>
                        </div>
                      )}
                    </div>
                  ) : inspectPayment.metadata?.proofFileName ? (
                    <div className="pt-2 border-t border-slate-200/60">
                      <p className="text-xs font-bold text-slate-400 tracking-wide">Uploaded File Name</p>
                      <p className="text-sm font-bold text-slate-600">{inspectPayment.metadata.proofFileName}</p>
                    </div>
                  ) : null}
                </div>
              )}

              {inspectPayment.status === 'failed' && (inspectPayment.metadata?.rejection_reason || inspectPayment.metadata?.reason) && (
                <div className="bg-red-50 rounded-[1.5rem] p-5 mb-6 border border-red-100 space-y-2 text-left">
                  <p className="text-xs font-bold text-red-700 tracking-wide">Rejection Reason</p>
                  <p className="text-red-900 text-sm font-bold leading-relaxed">{inspectPayment.metadata.rejection_reason || inspectPayment.metadata.reason}</p>
                </div>
              )}

              {inspectPayment.status === 'confirmed' && (inspectPayment.metadata?.approval_comment || inspectPayment.metadata?.comment) && (
                <div className="bg-green-50 rounded-[1.5rem] p-5 mb-6 border border-green-100 space-y-2 text-left">
                  <p className="text-xs font-bold text-green-700 tracking-wide">Approval Comment</p>
                  <p className="text-green-900 text-sm font-bold leading-relaxed">{inspectPayment.metadata.approval_comment || inspectPayment.metadata.comment}</p>
                </div>
              )}

              {inspectPayment.status === 'pending' && inspectPayment.method === 'direct_transfer' ? (
                <div className="bg-gray-50 rounded-[1.5rem] p-5 mb-6 border border-gray-100 flex items-center justify-between animate-pulse">
                  <div>
                    <p className="text-xs font-bold text-gray-900 tracking-wide">Verify Settlement Funds</p>
                    <p className="text-gray-400 text-xs leading-relaxed mt-1">Please confirm that funds matching reference <strong>{inspectPayment.reference}</strong> are fully cleared in the corporate bank account.</p>
                  </div>
                </div>
              ) : null}

              {inspectPayment.status === 'pending' && inspectPayment.method === 'direct_transfer' ? (
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setInspectPayment(null);
                      setDecisionAction({
                        id: inspectPayment.id,
                        type: 'approve',
                        title: 'Approve Payment',
                        subtitle: 'Confirm bank settlement receipt & activate subscription',
                        targetName: inspectPayment.profiles ? `${inspectPayment.profiles.first_name} ${inspectPayment.profiles.last_name}` : 'N/A',
                        targetEmail: inspectPayment.profiles?.email || 'N/A'
                      });
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-5 rounded-[2rem] font-bold tracking-[0.2em] text-xs transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-green-900/10 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" /> Confirm & Activate
                  </button>
                  <button 
                    onClick={() => {
                      setInspectPayment(null);
                      setDecisionAction({
                        id: inspectPayment.id,
                        type: 'reject',
                        title: 'Reject Payment',
                        subtitle: 'Decline transfer proof & mark transaction as failed',
                        targetName: inspectPayment.profiles ? `${inspectPayment.profiles.first_name} ${inspectPayment.profiles.last_name}` : 'N/A',
                        targetEmail: inspectPayment.profiles?.email || 'N/A'
                      });
                    }}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-650 border border-red-100 py-5 rounded-[2rem] font-bold tracking-[0.2em] text-xs transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" /> Reject Payment
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setInspectPayment(null)}
                  className="w-full bg-gray-900 hover:bg-gray-950 text-white py-5 rounded-[2rem] font-bold tracking-[0.25em] text-xs transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generic Reason Decision Modal */}
      {decisionAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => { setDecisionAction(null); setDecisionReason(''); }}>
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setDecisionAction(null); setDecisionReason(''); }} className="absolute top-4 right-4 w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-all z-10 cursor-pointer">
              <X className="w-4 h-4 text-gray-400" />
            </button>
            <div className="p-6 md:p-8 pb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${decisionAction.type.startsWith('approve') ? 'bg-green-600' : 'bg-red-600'}`}>
                  {decisionAction.type.startsWith('approve') ? <ShieldCheck className="w-6 h-6" /> : <Ban className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-gray-900 leading-none mb-1">{decisionAction.title}</h3>
                  <p className="text-xs font-bold text-gray-400 tracking-wide">{decisionAction.subtitle}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-100 rounded-[1.5rem] p-5 mb-5 space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400">Target Name</span>
                  <span className="text-gray-900 font-bold">{decisionAction.targetName}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400">Email Address</span>
                  <span className="text-gray-900 font-bold truncate max-w-[180px] text-right">{decisionAction.targetEmail}</span>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold text-gray-900 tracking-wide block ml-1">
                  Reason / Email Note (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    decisionAction.type.startsWith('approve')
                      ? "Add welcoming remarks or verification details..."
                      : "Provide a detailed reason for the rejection..."
                  }
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all text-gray-950 placeholder:text-gray-400 resize-none animate-in fade-in"
                />
              </div>

              <div className="flex gap-3">
                <button
                  disabled={actionLoadingId !== null}
                  onClick={async () => {
                    const actId = decisionAction.id;
                    const actType = decisionAction.type;
                    const r = decisionReason;
                    
                    setDecisionAction(null);
                    setDecisionReason('');

                    await runApprovalAction(actId, () => {
                      if (actType === 'approve') {
                        return approvePaymentTransaction(actId, r);
                      } else {
                        return rejectPaymentTransaction(actId, r);
                      }
                    });
                  }}
                  className={`flex-1 py-4 rounded-2xl text-xs font-bold tracking-[0.2em] text-white transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer ${
 decisionAction.type.startsWith('approve')
 ? 'bg-green-600 hover:bg-green-700 shadow-green-900/10'
 : 'bg-red-600 hover:bg-red-700 shadow-red-900/10'
 }`}
                >
                  {actionLoadingId !== null ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirm & Notify
                </button>
                <button
                  onClick={() => { setDecisionAction(null); setDecisionReason(''); }}
                  className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-bold tracking-wide transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
