import { createClient } from '@/lib/supabase/server';
import { 
  Users, TrendingUp, ExternalLink, Star, Target, Eye, 
  Calendar, ChevronRight, Shield, AlertTriangle, ArrowRight,
  CheckCircle, Globe, Award, FileText, Smartphone, Mail, MapPin
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { FlagIcon } from '@/components/common/FlagIcon';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user?.id)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, agent:users!profiles_agent_id_fkey(id, profiles(*))')
    .eq('user_id', user?.id)
    .single();

  const role = userRecord?.role || 'player';
  const name = profile ? `${profile.first_name} ${profile.last_name}` : user?.email?.split('@')[0];

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
        return <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[9px] font-black border border-green-100 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Fully Verified & Active</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[9px] font-black border border-amber-100 flex items-center gap-1 animate-pulse"><ClockIcon className="w-3 h-3 animate-spin" /> Pending Review</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-[9px] font-black border border-red-100 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Proof Verification Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[9px] font-black border border-gray-200 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Incomplete / Unsubmitted</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          {userError && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-100 rounded-2xl space-y-2 text-yellow-700">
               <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-black tracking-wide">Warning: Profile Access Issue</span>
               </div>
               <div className="pl-8 text-[10px] font-bold tracking-wide leading-relaxed">
                  <p>Auth Email: <span className="text-gray-900">{user?.email}</span></p>
                  <p className="text-red-500 font-black mt-2">DB Error: {userError.message}</p>
               </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
              Welcome back, <span className="text-[#b50a0a]">{name}</span>
            </h1>
            {profile?.country && <FlagIcon country={profile.country} className="w-5 h-3 rounded-sm shadow-sm shrink-0" />}
          </div>
          <p className="text-gray-500 text-sm font-bold tracking-wide mt-1">
            Role: <span className="text-gray-900">{roleLabels[role] || role}</span> • Platform Oversight Panel
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/${role === 'player' ? 'athletes' : role + 's'}/${profile?.id}`} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-[10px] font-black tracking-wide hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
             View Public Profile <ExternalLink className="w-3 h-3" />
          </Link>
          <Link href="/dashboard/profile" className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black tracking-wide hover:bg-black transition-all flex items-center gap-2 shadow-lg hover:-translate-y-0.5">
             Edit Profile <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Profile Views', value: '1,284', icon: Eye, trend: '+12%', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Network Reach', value: '452', icon: Users, trend: '+5%', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Appearances', value: '12', icon: Target, trend: 'Last 30d', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Market Value', value: profile?.market_value ? `$${profile.market_value}` : 'PRO', icon: TrendingUp, trend: 'Activate Plan', color: 'text-[#b50a0a]', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-black ${stat.trend.includes('+') ? 'text-green-600' : 'text-gray-400'} tracking-wide`}>{stat.trend}</span>
            </div>
            <p className="text-[10px] font-black text-gray-400 tracking-wide mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-4 md:p-8">
        {/* Main Feed/Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Professional Registry Card (Part 1 Implementation) */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-4 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
               <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-[#b50a0a]" />
                  <div>
                    <h3 className="text-base font-black tracking-wide text-gray-900">
                      My Professional Registry
                    </h3>
                    <p className="text-[8px] font-bold text-gray-400 tracking-wide">Live Athlete/Staff Verification Sync</p>
                  </div>
               </div>
               {getProfileStatusBadge()}
            </div>

            {profile ? (
              <div className="space-y-6">
                {/* Role Specific Parameters Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Athlete/Player Fields */}
                  {(role === 'player' || role === 'athlete') && (
                    <>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <p className="text-[8px] font-black text-gray-400 tracking-wide">Primary Position</p>
                        <p className="text-base font-black text-gray-900 mt-1">{profile.position || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <p className="text-[8px] font-black text-gray-400 tracking-wide">Dominant Foot</p>
                        <p className="text-base font-black text-gray-900 mt-1">{profile.foot || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <p className="text-[8px] font-black text-gray-400 tracking-wide">Jersey Number</p>
                        <p className="text-base font-black text-gray-900 mt-1">{profile.jersey_number ? `#${profile.jersey_number}` : 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <p className="text-[8px] font-black text-gray-400 tracking-wide">Height / Weight</p>
                        <p className="text-base font-black text-gray-900 mt-1">{profile.height_cm ? `${profile.height_cm}cm` : 'N/A'} / {profile.weight_kg ? `${profile.weight_kg}kg` : 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <p className="text-[8px] font-black text-gray-400 tracking-wide">Market Valuation</p>
                        <p className="text-base font-black text-gray-900 mt-1">{profile.market_value ? `$${profile.market_value}` : 'N/A'}</p>
                      </div>
                    </>
                  )}

                  {/* Coach Fields */}
                  {role === 'coach' && (
                    <>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <p className="text-[8px] font-black text-gray-400 tracking-wide">Tactical Formation</p>
                        <p className="text-base font-black text-gray-900 mt-1">{profile.formation || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <p className="text-[8px] font-black text-gray-400 tracking-wide">Technical License</p>
                        <p className="text-base font-black text-gray-900 mt-1">{profile.license || 'N/A'}</p>
                      </div>
                    </>
                  )}

                  {/* Agent / Scout / Organization Fields */}
                  {(role === 'agent' || role === 'scout' || role === 'organization') && (
                    <>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 col-span-2">
                        <p className="text-[8px] font-black text-gray-400 tracking-wide">Agency / Club Affiliation</p>
                        <p className="text-base font-black text-gray-900 mt-1">{profile.agency_name || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <p className="text-[8px] font-black text-gray-400 tracking-wide">FIFA License Code</p>
                        <p className="text-base font-black text-gray-900 mt-1 font-mono">{profile.license_code || 'N/A'}</p>
                      </div>
                    </>
                  )}

                  {/* Shared Info */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                    <p className="text-[8px] font-black text-gray-400 tracking-wide">Nationality / Location</p>
                    <p className="text-base font-black text-gray-900 mt-1 flex items-center gap-1.5">{profile.country || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                    <p className="text-[8px] font-black text-gray-400 tracking-wide">Registered Phone</p>
                    <p className="text-base font-black text-gray-900 mt-1">{profile.phone_number || 'N/A'}</p>
                  </div>
                </div>

                {/* Proof Document Verification Tracking */}
                <div className="p-5 bg-red-50/20 border border-red-100/50 rounded-2xl space-y-3">
                  <p className="text-[9px] font-black text-gray-900 tracking-wide">Verification Credentials Proof Status</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                      <div>
                        <p className="text-[8px] font-black text-gray-400">1. Official ID / Passport</p>
                        <p className="text-[10px] font-bold text-gray-900 mt-0.5">{profile.id_proof_url ? 'Document Submitted' : 'Missing Identity File'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[7px] font-black ${profile.id_proof_url ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                        {profile.id_proof_url ? 'Pending Verification' : 'Required'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                      <div>
                        <p className="text-[8px] font-black text-gray-400">2. License Certificate Proof</p>
                        <p className="text-[10px] font-bold text-gray-900 mt-0.5">{profile.license_proof_url ? 'Document Submitted' : 'Missing Credentials File'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[7px] font-black ${profile.license_proof_url ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                        {profile.license_proof_url ? 'Pending Verification' : 'Required'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Achievements List */}
                {profile.achievements && profile.achievements.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-gray-400 tracking-wide flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-yellow-500" /> Career Highlights & Achievements</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(profile.achievements as Array<{title: string, year: string}>).map((ach, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-3">
                          <Award className="w-4 h-4 text-yellow-500 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-none">{ach.title}</p>
                            <p className="text-[9px] font-bold text-gray-400 mt-1">Conferred: {ach.year || 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {profile.social_links && Object.values(profile.social_links).some(v => !!v) && (
                  <div className="space-y-3 pt-4 border-t border-gray-50">
                    <p className="text-[9px] font-black text-gray-400 tracking-wide">Public Verification Handles</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(profile.social_links).map(([platform, link]) => {
                        if (!link) return null;
                        return (
                          <span key={platform} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 text-[9px] font-black text-gray-900">
                            <Globe className="w-3 h-3 text-gray-400" />
                            {platform}: <span className="text-gray-500 font-bold normal-case">{link as string}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                 <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
                 <p className="text-sm font-black text-gray-900">No profile identity established yet</p>
                 <p className="text-[10px] text-gray-400 max-w-xs mt-2 leading-relaxed">
                   Please complete your professional registration by going to the Profile Editor.
                 </p>
                 <Link href="/dashboard/profile" className="mt-4 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black tracking-wide hover:bg-black transition-all">
                   Create Profile Registry
                 </Link>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 md:p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-[#b50a0a]" />
                <h3 className="text-base font-black tracking-wide text-gray-900">
                  Performance Snapshot
                </h3>
              </div>
              <button className="text-[10px] font-black text-gray-400 tracking-wide hover:text-[#b50a0a]">
                Manage Stats
              </button>
            </div>
            <div className="p-4 md:p-8">
              <div className="h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center p-4 md:p-8">
                <TrendingUp className="w-12 h-12 text-gray-200 mb-4" />
                <p className="text-sm font-black tracking-wide text-gray-400 mb-2">Detailed Analytics Locked</p>
                <p className="text-[10px] font-medium text-gray-400 max-w-full max-w-[200px] leading-relaxed">Upgrade to a Professional Plan to see your performance metrics and heatmaps.</p>
                <Link href="/dashboard/subscription" className="mt-4 text-[10px] font-black text-[#b50a0a] tracking-wide hover:underline">Activate Selection ₦15,000</Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 md:p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#b50a0a]" />
                <h3 className="text-base font-black tracking-wide text-gray-900">Industry News</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group">
                  <span className="text-[9px] font-black text-[#b50a0a] tracking-[0.2em]">Global Market</span>
                  <h4 className="text-base font-bold text-gray-900 mt-1 group-hover:underline underline-offset-4 decoration-[#b50a0a]">Transfer Window: Latest developments in European scout networks.</h4>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium">Scouts from 12 clubs are active in the West African region this weekend...</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar/Activity Column */}
        <div className="space-y-8">
          <div className="bg-gray-900 rounded-3xl p-4 md:p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#b50a0a] blur-[100px] opacity-20 -z-5"></div>
            <h3 className="text-lg font-black tracking-tighter mb-4 leading-none">Complete <br /> Your Profile</h3>
            <p className="text-[10px] font-medium text-gray-400 leading-relaxed mb-6">Profiles with 100% completion receive up to 5x more scouting interest.</p>
            <div className="space-y-4">
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="w-[65%] h-full bg-[#b50a0a]"></div>
              </div>
              <p className="text-[10px] font-black tracking-wide text-[#b50a0a]">65% Complete</p>
            </div>
            <Link href="/dashboard/profile" className="mt-8 block">
              <button className="w-full bg-[#b50a0a] text-white py-4 rounded-xl text-[10px] font-black tracking-wide hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                Continue Setup <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </div>

          {profile?.agent?.profiles && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-8 group">
              <div className="flex items-center gap-3 mb-6">
                 <Shield className="w-4 h-4 text-[#b50a0a]" />
                 <h3 className="text-sm font-black tracking-wide text-gray-900">Representation</h3>
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
                    <p className="text-[11px] font-black text-gray-900 tracking-tight">{profile.agent.profiles.first_name} {profile.agent.profiles.last_name}</p>
                    <p className="text-[9px] font-bold text-gray-400 tracking-wide">{profile.agent.profiles.agency_name || 'Independent Agent'}</p>
                 </div>
              </div>
              <Link href={`/agents/${profile.agent.id}`}>
                 <button className="w-full py-3 rounded-xl border border-gray-100 text-[9px] font-black tracking-wide text-gray-500 hover:text-[#b50a0a] hover:border-[#b50a0a]/20 hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                    View Agency Profile <ArrowRight className="w-3 h-3" />
                 </button>
              </Link>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-8">
            <h3 className="text-sm font-black tracking-wide text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {[
                { type: 'View', txt: 'Scout from RFC Liege viewed your profile', time: '2h ago' },
                { type: 'Update', txt: 'You updated your career statistics', time: '5h ago' },
                { type: 'Alert', txt: 'Your subscription expires in 12 days', time: '1d ago' },
              ].map((act, i) => (
                 <div key={i} className="flex gap-4">
                   <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.type === 'Alert' ? 'bg-[#b50a0a]' : 'bg-green-500'}`}></div>
                   <div>
                     <p className="text-[11px] font-bold text-gray-900 leading-tight">{act.txt}</p>
                     <p className="text-[9px] font-black text-gray-400 tracking-wide mt-1">{act.time}</p>
                   </div>
                 </div>
              ))}
            </div>
          </div>
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
