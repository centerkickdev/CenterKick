import { getEffectiveUserSession } from '@/lib/auth/impersonation';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { 
  Users, TrendingUp, ExternalLink, Star, Target, Eye, 
  Calendar, ChevronRight, Shield, AlertTriangle, ArrowRight,
  CheckCircle, Globe, Award, FileText, Smartphone, Mail, MapPin, Edit
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { FlagIcon } from '@/components/common/FlagIcon';
import { CopyableProfileLink } from '@/components/dashboard/CopyableProfileLink';
import { isProfileComplete } from '@/lib/utils/profile';
import { formatCurrencyAmount } from '@/lib/utils/currency';

export default async function DashboardPage() {
  const session = await getEffectiveUserSession();
  if (!session) {
    redirect('/login');
  }

  const activeUserId = session.effectiveUserId;
  const db = session.isImpersonating ? createAdminClient() : await createClient();

  const { data: userRecord, error: userError } = await db
    .from('users')
    .select('*')
    .eq('id', activeUserId)
    .single();

  const { data: profile } = await db
    .from('profiles')
    .select('*, agent:users!profiles_agent_id_fkey(id, profiles!profiles_user_id_fkey(*))')
    .eq('user_id', activeUserId)
    .single();

  const { data: subscriptions } = await db
    .from('subscriptions')
    .select('*')
    .eq('user_id', activeUserId)
    .eq('status', 'active');

  let publicViews = 0;
  let scoutingViews = 0;

  if (profile?.id) {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminSupabase = createAdminClient();
    const { data: viewsData } = await adminSupabase
      .from('profile_views')
      .select('viewer_role')
      .eq('profile_id', profile.id);
      
    if (viewsData) {
      publicViews = viewsData.length;
      scoutingViews = viewsData.filter(v => ['agent', 'scout', 'organization'].includes(v?.viewer_role)).length;
    }
  }

  const role = userRecord?.role || 'player';

  const isComplete = isProfileComplete(profile);

  const roleLabels: Record<string, string> = {
    player: 'Athlete / Player',
    coach: 'Technical Coach',
    agent: 'Licensed Agent',
    scout: 'Professional Scout',
    organization: 'Organization / Club',
  };

  const getProfileStatusBadge = () => {
    switch (profile?.status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Fully Verified & Active</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100 flex items-center gap-1 animate-pulse"><ClockIcon className="w-3 h-3 animate-spin" /> Pending Review</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Proof Verification Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold border border-gray-200 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Incomplete / Unsubmitted</span>;
    }
  };

  // Player Analytics Calculations
  let totalGoals = 0;
  let totalAssists = 0;
  let totalYellows = 0;
  let totalReds = 0;
  let totalApps = 0;

  const safeParseArray = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const careerStatsArray = safeParseArray(profile?.career_stats);
  const transferHistoryArray = safeParseArray(profile?.transfer_history);
  const achievementsArray = safeParseArray(profile?.achievements);
  const managerialHistoryArray = safeParseArray(profile?.managerial_history);



  if ((role === 'player' || role === 'athlete') && careerStatsArray.length > 0) {
    careerStatsArray.forEach((stat: any) => {
      totalGoals += Number(stat.goals) || 0;
      totalAssists += Number(stat.assists) || 0;
      totalYellows += Number(stat.yellow_cards) || 0;
      totalReds += Number(stat.red_cards) || 0;
      totalApps += Number(stat.apps) || 0;
    });
  }
  
  const careerGoalContributions = totalGoals + totalAssists;
  const disciplineIndex = `${totalYellows} YEL / ${totalReds} RED`;
  
  const transferCount = transferHistoryArray.length;
  const trophyCount = achievementsArray.length;

  // Coach Analytics Calculations
  let coachYearsExp = 0;
  let coachClubsManaged = 0;
  let coachWins = 0;
  let coachDraws = 0;
  let coachLosses = 0;

  if ((role === 'coach' || role === 'manager') && managerialHistoryArray.length > 0) {
    let earliestYear = new Date().getFullYear();
    const uniqueClubs = new Set<string>();

    managerialHistoryArray.forEach((stint: any) => {
      // Form saves as startDate e.g. "2018"
      const fromYear = parseInt(stint.startDate?.split('/')[0] || stint.startDate, 10);
      if (!isNaN(fromYear) && fromYear < earliestYear) earliestYear = fromYear;
      
      if (stint.club && !uniqueClubs.has(stint.club)) uniqueClubs.add(stint.club);
      
      coachWins += Number(stint.wins) || 0;
      coachDraws += Number(stint.draws) || 0;
      coachLosses += Number(stint.losses) || 0;
    });

    coachYearsExp = Math.max(0, new Date().getFullYear() - earliestYear);
    coachClubsManaged = uniqueClubs.size;
  }
  
  const coachTotalMatches = coachWins + coachDraws + coachLosses;
  const coachTotalPoints = (coachWins * 3) + coachDraws;
  const coachWinRatio = coachTotalMatches > 0 ? Math.round((coachWins / coachTotalMatches) * 100) : 0;

  const formatMarketValue = (val: any, currency?: string) => {
    if (!val) return 'Pending';
    return formatCurrencyAmount(val, currency || 'EUR');
  };

  const baseStats = [
    { label: 'Public Profile Views', value: publicViews.toString(), icon: Eye, trend: 'All Time', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Scouting Views', value: scoutingViews.toString(), icon: Target, trend: 'Verified Orgs', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Market Value', value: formatMarketValue(profile?.market_value, profile?.market_value_currency), icon: TrendingUp, trend: 'Current', color: 'text-[#b50a0a]', bg: 'bg-red-50' },
  ];

  const playerStats = (role === 'player' || role === 'athlete') ? [
    { label: 'Goal Contributions', value: careerGoalContributions.toString(), icon: Target, trend: `${totalGoals}G, ${totalAssists}A`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Discipline Index', value: disciplineIndex, icon: AlertTriangle, trend: `${totalApps} Apps`, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Transfers', value: transferCount.toString(), icon: Globe, trend: 'Career Total', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Trophies', value: trophyCount.toString(), icon: Award, trend: 'Achievements', color: 'text-amber-600', bg: 'bg-amber-50' },
  ] : [];

  const coachStats = (role === 'coach' || role === 'manager') ? [
    { label: 'Managerial Points', value: coachTotalPoints.toString(), icon: Award, trend: `${coachWinRatio}% Win Rate`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'W/D/L Record', value: `${coachWins}W / ${coachDraws}D / ${coachLosses}L`, icon: Target, trend: `${coachTotalMatches} Matches`, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Clubs Managed', value: coachClubsManaged.toString(), icon: Globe, trend: `${coachYearsExp} Years Exp.`, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Trophies', value: trophyCount.toString(), icon: Award, trend: 'Achievements', color: 'text-amber-600', bg: 'bg-amber-50' },
  ] : [];

  const displayStats = [...baseStats, ...playerStats, ...coachStats];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          {userError && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-100 rounded-2xl space-y-2 text-yellow-700">
               <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-bold tracking-wide">Warning: Profile Access Issue</span>
               </div>
               <div className="pl-8 text-xs font-bold tracking-wide leading-relaxed">
                  <p>Account Email: <span className="text-gray-900">{(userRecord as any)?.email || session.targetUserEmail}</span></p>
                  <p className="text-red-500 font-bold mt-2">DB Error: {userError.message}</p>
               </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tighter flex flex-col">
              Welcome back,
              <span className="text-[#b50a0a]">{profile?.first_name || (userRecord as any)?.email?.split('@')[0] || session.targetUserEmail?.split('@')[0] || 'User'}</span>
            </h1>
            {profile?.country && <FlagIcon country={profile.country} className="w-5 h-3 rounded-sm shadow-sm shrink-0" />}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {(profile?.slug || profile?.id) && (
            <CopyableProfileLink slugOrId={profile.slug || profile.id} role={role} />
          )}
          {(profile?.slug || profile?.id) && (
            <Link 
              href={`/${role === 'player' ? 'players' : role === 'coach' ? 'coaches' : role === 'agent' ? 'agents' : role === 'scout' ? 'scouts' : role === 'organization' ? 'organizations' : `${role}s`}/${profile?.slug || profile?.id}`} 
              title="View Public Profile"
              className="px-3.5 sm:px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold tracking-wide hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm shrink-0"
            >
               <Eye className="w-4 h-4 shrink-0" />
               <span className="hidden sm:inline">View Profile</span>
            </Link>
          )}
          <Link 
            href="/dashboard/profile" 
            title="Edit Profile"
            className="px-3.5 sm:px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold tracking-wide hover:bg-black transition-all flex items-center gap-2 shadow-lg hover:-translate-y-0.5 shrink-0"
          >
             <Edit className="w-4 h-4 shrink-0" />
             <span className="hidden sm:inline">Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold ${stat.trend.includes('+') || stat.trend.includes('G,') ? 'text-green-600' : 'text-gray-400'} tracking-wide`}>{stat.trend}</span>
            </div>
            <p className="text-xs font-bold text-gray-400 tracking-wide mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-4 md:p-8">
        {/* Main Feed/Content Column */}
        <div className="lg:col-span-2 space-y-8">
        </div>

        {/* Sidebar/Activity Column */}
        <div className="space-y-8">
          {profile?.agent?.profiles && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-8 group">
              <div className="flex items-center gap-3 mb-6">
                 <Shield className="w-4 h-4 text-[#b50a0a]" />
                 <h3 className="text-sm font-bold tracking-wide text-gray-900">Representation</h3>
              </div>
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                    <Image 
                       src={profile.agent.profiles.avatar_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop"} 
                       className="w-full h-full object-cover" 
                       alt={profile.agent.profiles.first_name || 'Agent Avatar'} 
                       width={48}
                       height={48}
                    />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-900 tracking-tight">{profile.agent.profiles.first_name} {profile.agent.profiles.last_name}</p>
                    <p className="text-xs font-bold text-gray-400 tracking-wide">{profile.agent.profiles.agency_name || 'Independent Agent'}</p>
                 </div>
              </div>
              <Link href={`/agents/${profile.agent.id}`}>
                 <button className="w-full py-3 rounded-xl border border-gray-100 text-xs font-bold tracking-wide text-gray-500 hover:text-[#b50a0a] hover:border-[#b50a0a]/20 hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                    View Agency Profile <ArrowRight className="w-3 h-3" />
                 </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Small helper component
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
