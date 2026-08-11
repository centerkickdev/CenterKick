import { createClient } from '@/lib/supabase/server';
import { TransactionsClient } from '@/components/admin/payments/TransactionsClient';
import { redirect } from 'next/navigation';

export default async function AdminTransactionsPage(props: {
  searchParams: Promise<{ 
    page?: string; 
    q?: string; 
    status?: string; 
    method?: string;
    year?: string;
    month?: string;
    day?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!['superadmin', 'admin', 'finance'].includes(userRecord?.role)) {
    redirect('/admin');
  }



  const page = parseInt(searchParams.page || '1');
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('transactions')
    .select('*, profiles(first_name, last_name, email)', { count: 'exact' });

  if (searchParams.q) {
    query = query.or(`reference.ilike.%${searchParams.q}%,profiles.first_name.ilike.%${searchParams.q}%,profiles.last_name.ilike.%${searchParams.q}%`);
  }

  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }

  if (searchParams.method) {
    query = query.eq('method', searchParams.method);
  }

  if (searchParams.year) {
    const year = parseInt(searchParams.year);
    const startDate = `${year}-01-01T00:00:00Z`;
    const endDate = `${year}-12-31T23:59:59Z`;
    query = query.gte('created_at', startDate).lte('created_at', endDate);
  }

  if (searchParams.month && searchParams.year) {
    const year = parseInt(searchParams.year);
    const month = parseInt(searchParams.month);
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
    query = query.gte('created_at', startDate).lte('created_at', endDate);
  }

  const { data: transactions, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  // Fetch real stats
  const { data: revenueData } = await supabase
    .from('transactions')
    .select('amount, currency, created_at')
    .eq('status', 'confirmed');
  
  const totalRevenue = revenueData?.reduce((sum, tx) => {
    const amount = Number(tx.amount);
    return sum + (tx.currency === 'USD' ? amount * 1500 : amount);
  }, 0) || 0;

  const ADMIN_ROLES = ['superadmin', 'admin', 'blogger', 'operations', 'finance'];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, user_id, is_subscribed')
    .not('role', 'in', `(${ADMIN_ROLES.join(',')})`);

  const { data: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('user_id, status')
    .eq('status', 'active');

  const { data: confirmedTxs } = await supabase
    .from('transactions')
    .select('user_id, status, created_at')
    .eq('status', 'confirmed');

  let activeSubsCount = 0;
  let expiredSubsCount = 0;

  profiles?.forEach(profile => {
    const hasActiveSubTable = activeSubscriptions?.some(s => s.user_id === profile.user_id || s.user_id === profile.id);
    const hasProfileFlag = profile.is_subscribed === true;
    const hasConfirmedTx = confirmedTxs?.some(tx => tx.user_id === profile.id || tx.user_id === profile.user_id);

    const isSubscribed = hasActiveSubTable || hasProfileFlag || hasConfirmedTx;

    if (isSubscribed) {
      activeSubsCount++;
    } else {
      const hasPastTx = confirmedTxs?.some(tx => tx.user_id === profile.id || tx.user_id === profile.user_id);
      if (hasPastTx) {
        expiredSubsCount++;
      }
    }
  });

  // Dynamic Growth calculation for Growth Monitor & Metric Trends
  const dailyData = [
    { name: 'MON', value: 0 },
    { name: 'TUE', value: 0 },
    { name: 'WED', value: 0 },
    { name: 'THU', value: 0 },
    { name: 'FRI', value: 0 },
    { name: 'SAT', value: 0 },
    { name: 'SUN', value: 0 }
  ];
  
  const monthlyData = [
    { name: 'WEEK 1', value: 0 },
    { name: 'WEEK 2', value: 0 },
    { name: 'WEEK 3', value: 0 },
    { name: 'WEEK 4', value: 0 }
  ];

  const yearlyData = [
    { name: 'JAN', value: 0 }, { name: 'FEB', value: 0 }, { name: 'MAR', value: 0 },
    { name: 'APR', value: 0 }, { name: 'MAY', value: 0 }, { name: 'JUN', value: 0 },
    { name: 'JUL', value: 0 }, { name: 'AUG', value: 0 }, { name: 'SEP', value: 0 },
    { name: 'OCT', value: 0 }, { name: 'NOV', value: 0 }, { name: 'DEC', value: 0 }
  ];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let lastMonthRevenue = 0;
  let currentMonthRevenue = 0;
  let currentMonthNewSubs = 0;
  let lastMonthNewSubs = 0;

  const lastMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  revenueData?.forEach(tx => {
    const date = new Date(tx.created_at);
    const amount = tx.currency === 'USD' ? Number(tx.amount) * 1500 : Number(tx.amount);

    // 1. Daily calculation (if within the last 7 days)
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      const dayIndex = (date.getDay() + 6) % 7; // Mon is 0, Sun is 6
      dailyData[dayIndex].value += amount;
    }

    // 2. Monthly calculation (current month weeks)
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      currentMonthRevenue += amount;
      currentMonthNewSubs++;
      const day = date.getDate();
      if (day <= 7) monthlyData[0].value += amount;
      else if (day <= 14) monthlyData[1].value += amount;
      else if (day <= 21) monthlyData[2].value += amount;
      else monthlyData[3].value += amount;
    }

    // 3. Last month revenue for growth rate calculation
    if (date.getMonth() === lastMonthIndex && date.getFullYear() === lastMonthYear) {
      lastMonthRevenue += amount;
      lastMonthNewSubs++;
    }

    // 4. Yearly calculation (current year)
    if (date.getFullYear() === currentYear) {
      const monthIndex = date.getMonth();
      yearlyData[monthIndex].value += amount;
    }
  });

  // Dynamic MoM Trends Calculation
  const revGrowth = lastMonthRevenue > 0
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : currentMonthRevenue > 0 ? 100 : 0;
  const revTrendStr = `${revGrowth >= 0 ? '+' : ''}${revGrowth.toFixed(1)}%`;

  const activeSubGrowth = lastMonthNewSubs > 0
    ? ((currentMonthNewSubs - lastMonthNewSubs) / lastMonthNewSubs) * 100
    : currentMonthNewSubs > 0 ? 100 : 0;
  const activeSubTrendStr = `${activeSubGrowth >= 0 ? '+' : ''}${activeSubGrowth.toFixed(1)}%`;

  const expiredSubTrendStr = '0.0%';

  const stats = [
    { label: 'Total Revenue', value: totalRevenue, icon: 'DollarSign', trend: revTrendStr, color: 'text-green-600', isCurrency: true },
    { label: 'Active Subs', value: activeSubsCount.toString(), icon: 'UserCheck', trend: activeSubTrendStr, color: 'text-blue-600' },
    { label: 'Expired Subs', value: expiredSubsCount.toString(), icon: 'UserX', trend: expiredSubTrendStr, color: 'text-red-600' },
  ];

  // Calculate dynamic growth rate and projection
  const growthRate = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : revGrowth;

  const currentProjection = currentMonthRevenue > 0 
    ? currentMonthRevenue * 1.25 
    : totalRevenue * 0.15 || 4250.00;

  return (
    <TransactionsClient 
      transactions={transactions || []} 
      totalCount={count || 0}
      currentPage={page}
      pageSize={pageSize}
      stats={stats}
      dailyData={dailyData}
      monthlyData={monthlyData}
      yearlyData={yearlyData}
      currentProjection={currentProjection}
      growthRate={growthRate}
    />
  );
}
