import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Mail, Calendar, MapPin, Phone, Shield,
  ShieldCheck, CheckCircle, Clock, XCircle, User, UserCheck,
  CreditCard, Briefcase, Trophy, Search, Users,
  AlertTriangle, Globe, Award, Eye, FileText, ArrowRight, Flag, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { UserDetailActions } from '@/components/admin/users/UserDetailActions';
import { FlagIcon } from '@/components/common/FlagIcon';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  // Fetch user, profile, and subscription in parallel
  const [
    { data: user },
    { data: profile },
    { data: subscription },
  ] = await Promise.all([
    admin.from('users').select('*').eq('id', id).single(),
    admin.from('profiles').select('*').eq('user_id', id).single(),
    admin.from('subscriptions').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  if (!user) notFound();

  const isActive = user.is_active !== false;
  const profileStatus = profile?.status;

  const roleIcons: Record<string, React.ReactNode> = {
    player: <Trophy className="w-5 h-5 text-[#b50a0a]" />,
    coach: <UserCheck className="w-5 h-5 text-blue-600" />,
    agent: <Briefcase className="w-5 h-5 text-purple-600" />,
    scout: <Search className="w-5 h-5 text-amber-600" />,
    organization: <Users className="w-5 h-5 text-emerald-600" />,
    superadmin: <ShieldCheck className="w-5 h-5 text-red-600" />,
    admin: <Shield className="w-5 h-5 text-gray-700" />,
  };

  const roleLabels: Record<string, string> = {
    player: 'Athlete / Player',
    coach: 'Technical Coach',
    agent: 'Licensed Agent',
    scout: 'Professional Scout',
    organization: 'Organization / Club',
    superadmin: 'Super Administrator',
    admin: 'Administrator',
  };

  const StatusBadge = () => {
    if (!isActive) return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-[9px] font-black rounded-xl border border-red-100">
        <XCircle className="w-3 h-3" /> Deactivated
      </span>
    );
    switch (profileStatus) {
      case 'active': return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-[9px] font-black rounded-xl border border-green-100">
          <CheckCircle className="w-3 h-3" /> Active
        </span>
      );
      case 'pending': return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-[9px] font-black rounded-xl border border-amber-100 animate-pulse">
          <Clock className="w-3 h-3" /> Pending Approval
        </span>
      );
      case 'rejected': return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-[9px] font-black rounded-xl border border-red-100">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
      default: return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-400 text-[9px] font-black rounded-xl border border-gray-100">
          <AlertTriangle className="w-3 h-3" /> Incomplete
        </span>
      );
    }
  };

  // Helper to format date safely
  const formatDateSafe = (dateString: string | null | undefined, formatStr: string = 'MMMM dd, yyyy') => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), formatStr);
    } catch {
      return 'N/A';
    }
  };

  // Resolve storage links or URLs
  const resolveDocUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://devunomieta-centerkick.supabase.co';
    return `${baseUrl}/storage/v1/object/public${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      {/* Back */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 tracking-wide hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to All Accounts
      </Link>

      {/* Header Card */}
      <div className="bg-gray-900 rounded-[2.5rem] p-4 md:p-8 text-white relative overflow-hidden shadow-xl shadow-gray-900/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#b50a0a] rounded-full blur-[100px] opacity-10 -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-3xl text-white shrink-0 overflow-hidden shadow-inner">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter leading-none flex items-center gap-3">
                {profile?.first_name
                  ? `${profile.first_name} ${profile.last_name || ''}`.trim()
                  : user.email?.split('@')[0]}
                {profile?.country && <FlagIcon country={profile.country} className="w-5 h-3 shrink-0 rounded-sm" />}
              </h1>
              <p className="text-white/50 text-[10px] font-black tracking-wide mt-1.5">{user.email}</p>
              <div className="flex items-center gap-3 mt-4">
                <StatusBadge />
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/70 text-[9px] font-black rounded-xl border border-white/5">
                  {roleIcons[user.role] || <Shield className="w-3 h-3" />}
                  {roleLabels[user.role] || user.role || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 md:p-8 shrink-0 bg-white/5 border border-white/10 p-6 rounded-[1.8rem] backdrop-blur-sm">
            <div className="text-center px-2">
              <p className="text-2xl font-black">{profile ? '100%' : '0%'}</p>
              <p className="text-[8px] text-white/40 font-black tracking-wide mt-1">Completion</p>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <p className="text-2xl font-black">{subscription ? 'Active' : 'None'}</p>
              <p className="text-[8px] text-white/40 font-black tracking-wide mt-1">Plan State</p>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <p className="text-2xl font-black">{formatDateSafe(user.created_at, 'MMM yy')}</p>
              <p className="text-[8px] text-white/40 font-black tracking-wide mt-1">Enrolled</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-4 md:p-8">
        
        {/* Left Columns (Profile Information Panels) */}
        <div className="lg:col-span-2 space-y-8">

          {/* 1. Basic Info Section */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 md:p-8 space-y-6">
            <h2 className="text-sm font-black text-gray-900 tracking-wide flex items-center gap-2 border-b border-gray-50 pb-4">
              <User className="w-4 h-4 text-[#b50a0a]" /> Personal Identity & Basic Info
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'First Name', value: profile?.first_name || 'N/A' },
                { label: 'Last Name', value: profile?.last_name || 'N/A' },
                { label: 'Date of Birth', value: formatDateSafe(profile?.date_of_birth) },
                { label: 'Nationality / Country', value: profile?.country || 'N/A', icon: profile?.country ? <FlagIcon country={profile.country} className="w-3.5 h-2 inline-block rounded-xs" /> : null },
                { label: 'Public Phone', value: profile?.phone_number || 'N/A', icon: <Phone className="w-3 h-3 text-gray-400" /> },
                { label: 'Public Email', value: profile?.contact_email || 'N/A', icon: <Mail className="w-3 h-3 text-gray-400" /> },
                { label: 'Gender', value: profile?.gender || 'N/A' },
                { label: 'Verified Athlete Status', value: profile?.verification_requested ? 'Requested Verification' : 'Standard' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 tracking-wide">{item.label}</p>
                  <p className="text-base font-bold text-gray-900 flex items-center gap-2 capitalize">
                    {item.icon} {item.value}
                  </p>
                </div>
              ))}
            </div>

            {profile?.bio && (
              <div className="pt-6 border-t border-gray-50">
                <p className="text-[9px] font-black text-gray-400 tracking-wide mb-2">Professional Bio</p>
                <p className="text-base text-gray-600 font-medium leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </div>

          {/* 2. Category / Role-Specific Specifications */}
          {profile && (user.role === 'player' || user.role === 'coach' || user.role === 'agent' || user.role === 'scout' || user.role === 'organization') && (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 md:p-8 space-y-6">
              <h2 className="text-sm font-black text-gray-900 tracking-wide flex items-center gap-2 border-b border-gray-50 pb-4">
                <ShieldCheck className="w-4 h-4 text-[#b50a0a]" /> 
                {roleLabels[user.role]} Professional Specifications
              </h2>

              {/* Athletes/Players Specifics */}
              {(user.role === 'player' || user.role === 'athlete') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Primary Position', value: profile.position || 'N/A' },
                    { label: 'Dominant Foot', value: profile.foot || 'N/A' },
                    { label: 'Jersey Number', value: profile.jersey_number ? `#${profile.jersey_number}` : 'N/A' },
                    { label: 'Height (cm)', value: profile.height_cm ? `${profile.height_cm} cm` : 'N/A' },
                    { label: 'Weight (kg)', value: profile.weight_kg ? `${profile.weight_kg} kg` : 'N/A' },
                    { label: 'Est. Market Value ($)', value: profile.market_value ? `$${profile.market_value}` : 'N/A' }
                  ].map((field, idx) => (
                    <div key={idx} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                      <p className="text-[8px] font-black text-gray-400 tracking-wide">{field.label}</p>
                      <p className="text-base font-black text-gray-900 mt-1">{field.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Coaches Specifics */}
              {user.role === 'coach' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Preferred Formation', value: profile.formation || 'N/A' },
                    { label: 'Technical Coaching License', value: profile.license || 'N/A' }
                  ].map((field, idx) => (
                    <div key={idx} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                      <p className="text-[8px] font-black text-gray-400 tracking-wide">{field.label}</p>
                      <p className="text-base font-black text-gray-900 mt-1">{field.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Agents / Scouts / Organizations Specifics */}
              {(user.role === 'agent' || user.role === 'scout' || user.role === 'organization') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Agency / Club Name', value: profile.agency_name || 'N/A' },
                    { label: 'FIFA Registered License Code', value: profile.license_code || 'N/A' }
                  ].map((field, idx) => (
                    <div key={idx} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                      <p className="text-[8px] font-black text-gray-400 tracking-wide">{field.label}</p>
                      <p className="text-base font-black text-gray-900 mt-1">{field.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Credentials & Official Document Proofs */}
          {profile && (profile.id_proof_url || profile.license_proof_url) && (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 md:p-8 space-y-6">
              <h2 className="text-sm font-black text-gray-900 tracking-wide flex items-center gap-2 border-b border-gray-50 pb-4">
                <FileText className="w-4 h-4 text-[#b50a0a]" /> Uploaded Identity & Credentials Documents
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 3.1 ID Nationality Proof */}
                {profile.id_proof_url && (
                  <div className="p-5 bg-gray-50 border border-gray-100 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black text-gray-900 tracking-wide">Passport / ID Document</p>
                      <span className="px-2.5 py-0.5 rounded-full text-[7px] font-black bg-yellow-100 text-yellow-800 tracking-wide">Verification Pending</span>
                    </div>
                    {profile.id_proof_url.match(/\.(jpeg|jpg|gif|png)/i) || profile.id_proof_url.startsWith('blob:') ? (
                      <div className="h-44 w-full rounded-2xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center relative group">
                        <img src={resolveDocUrl(profile.id_proof_url)} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" alt="Passport ID" />
                      </div>
                    ) : (
                      <div className="h-44 w-full rounded-2xl bg-white border border-gray-200 flex flex-col items-center justify-center text-center p-4">
                        <FileText className="w-10 h-10 text-gray-300 mb-2" />
                        <p className="text-[10px] font-black text-gray-900">PDF / Verification File</p>
                      </div>
                    )}
                    <a 
                      href={resolveDocUrl(profile.id_proof_url)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-[9px] font-black tracking-wide text-center border border-gray-200 flex items-center justify-center gap-1.5 transition-all"
                    >
                      Open Document <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* 3.2 License/Coaching/FIFA Certificate Proof */}
                {profile.license_proof_url && (
                  <div className="p-5 bg-gray-50 border border-gray-100 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black text-gray-900 tracking-wide">Credentials / License Certificate</p>
                      <span className="px-2.5 py-0.5 rounded-full text-[7px] font-black bg-yellow-100 text-yellow-800 tracking-wide">Verification Pending</span>
                    </div>
                    {profile.license_proof_url.match(/\.(jpeg|jpg|gif|png)/i) || profile.license_proof_url.startsWith('blob:') ? (
                      <div className="h-44 w-full rounded-2xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center relative group">
                        <img src={resolveDocUrl(profile.license_proof_url)} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" alt="License Proof" />
                      </div>
                    ) : (
                      <div className="h-44 w-full rounded-2xl bg-white border border-gray-200 flex flex-col items-center justify-center text-center p-4">
                        <FileText className="w-10 h-10 text-gray-300 mb-2" />
                        <p className="text-[10px] font-black text-gray-900">PDF / Verification File</p>
                      </div>
                    )}
                    <a 
                      href={resolveDocUrl(profile.license_proof_url)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-xl text-[9px] font-black tracking-wide text-center border border-gray-200 flex items-center justify-center gap-1.5 transition-all"
                    >
                      Open Document <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Social Links & Digital Handles */}
          {profile && profile.social_links && Object.values(profile.social_links).some(v => !!v) && (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 md:p-8 space-y-6">
              <h2 className="text-sm font-black text-gray-900 tracking-wide flex items-center gap-2 border-b border-gray-50 pb-4">
                <Globe className="w-4 h-4 text-[#b50a0a]" /> Social Verification & Networks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(profile.social_links).map(([platform, link]) => {
                  if (!link) return null;
                  const targetUrl = (link as string).startsWith('http') ? (link as string) : `https://${link}`;
                  return (
                    <a 
                      key={platform}
                      href={targetUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-4 bg-gray-50 hover:bg-red-50 hover:text-[#b50a0a] rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center transition-all group"
                    >
                      <Globe className="w-5 h-5 text-gray-400 group-hover:text-[#b50a0a] mb-2" />
                      <p className="text-[9px] font-black text-gray-900 tracking-wide">{platform}</p>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Career Achievements & Awards */}
          {profile && profile.achievements && profile.achievements.length > 0 && (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 md:p-8 space-y-6">
              <h2 className="text-sm font-black text-gray-900 tracking-wide flex items-center gap-2 border-b border-gray-50 pb-4">
                <Award className="w-4 h-4 text-[#b50a0a]" /> Career Timeline & Achievements
              </h2>
              <div className="space-y-4">
                {(profile.achievements as Array<{title: string, year: string}>).map((ach, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Award className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-base font-black text-gray-900 tracking-tight">{ach.title}</p>
                      <p className="text-[9px] font-bold text-gray-400 tracking-wide mt-1">Conferred in {ach.year || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. User Account Subscription Specs */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 md:p-8 space-y-6">
            <h2 className="text-sm font-black text-gray-900 tracking-wide flex items-center gap-2 border-b border-gray-50 pb-4">
              <CreditCard className="w-4 h-4 text-[#b50a0a]" /> Subscription Plan Status
            </h2>
            {subscription ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Pricing Plan', value: subscription.plan_name },
                  { label: 'Settlement Status', value: subscription.status },
                  { label: 'Payment Gateway', value: subscription.gateway || 'Manual Bank Settlement' },
                  { label: 'External Ref Code', value: subscription.external_id || 'N/A' },
                  { label: 'Validity Period End', value: formatDateSafe(subscription.current_period_end) },
                  { label: 'Created At', value: formatDateSafe(subscription.created_at) },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 tracking-wide">{item.label}</p>
                    <p className="text-base font-bold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-sm font-black text-gray-400 tracking-wide">No active plan recorded</p>
                <p className="text-[10px] text-gray-400 max-w-xs mt-1">This participant has not activated a platform subscription tier yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Controller Column */}
        <div className="space-y-6">
          <UserDetailActions
            userId={id}
            currentRole={user.role}
            isActive={isActive}
            profileStatus={profileStatus}
          />
        </div>
      </div>
    </div>
  );
}
