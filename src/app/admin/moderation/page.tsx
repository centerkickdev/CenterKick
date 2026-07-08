import { createClient } from '@/lib/supabase/server';
import { Shield, CheckCircle, XCircle, AlertTriangle, User, Search, Filter } from 'lucide-react';
import { ModerationActions } from './ModerationActions';

export default async function ModerationPage() {
  const supabase = await createClient();

  // Fetch profiles joined with users
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      *,
      users:user_id (
        email,
        role
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-4 md:p-8 text-red-500 bg-red-50 border border-red-100 rounded-2xl font-bold tracking-wide">Error loading profiles: {error.message}</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tighter">
            Profile <span className="text-[#b50a0a]">Moderation</span>
          </h1>
          <p className="text-gray-500 text-xs font-bold tracking-wide mt-1">Review and manage user profiles visibility and status.</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full pb-4 custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 md:px-8 py-5 text-xs font-bold text-gray-400 tracking-[0.2em]">User / Profile</th>
                <th className="px-4 md:px-8 py-5 text-xs font-bold text-gray-400 tracking-[0.2em]">Role</th>
                <th className="px-4 md:px-8 py-5 text-xs font-bold text-gray-400 tracking-[0.2em]">Status</th>
                <th className="px-4 md:px-8 py-5 text-xs font-bold text-gray-400 tracking-[0.2em]">Joined</th>
                <th className="px-4 md:px-8 py-5 text-xs font-bold text-gray-400 tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {profiles?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 md:px-8 py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-300">
                      <User className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-gray-400 tracking-wide">No profiles to moderate.</p>
                  </td>
                </tr>
              ) : (
                profiles?.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 md:px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                           {profile.avatar_url ? (
                              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                           ) : (
                              <User className="w-4 h-4 text-gray-400" />
                           )}
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900 leading-tight line-clamp-1">{profile.first_name} {profile.last_name}</p>
                          <p className="text-xs font-bold text-gray-400 tracking-wide mt-0.5">{profile.users?.email}</p>
                          {profile.verification_requested && (
                             <div className="mt-2 flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold tracking-wide border border-blue-100 flex items-center gap-1">
                                   <Shield className="w-2.5 h-2.5" /> Reference: {profile.payment_reference || 'N/A'}
                                </span>
                             </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-6">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold tracking-wide">
                        {profile.users?.role || 'player'}
                      </span>
                    </td>
                    <td className="px-4 md:px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
 profile.status === 'active' ? 'bg-green-500' : 
 profile.status === 'rejected' ? 'bg-red-500' : 
 profile.status === 'suspended' ? 'bg-orange-500' :
 'bg-blue-500'
 }`}></div>
                        <span className={`text-xs font-bold tracking-wide ${
 profile.status === 'active' ? 'text-green-600' : 
 profile.status === 'rejected' ? 'text-red-600' : 
 profile.status === 'suspended' ? 'text-orange-600' :
 'text-blue-600'
 }`}>
                          {profile.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-6">
                      <span className="text-xs font-bold text-gray-500 tracking-wide">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 md:px-8 py-6 text-right">
                       <ModerationActions profile={profile} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
