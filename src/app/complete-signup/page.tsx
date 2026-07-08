import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SignupForm } from '@/components/auth/SignupForm';
import { Shield } from 'lucide-react';

export default async function CompleteSignupPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams;
  if (!token) {
    redirect('/login');
  }

  const supabase = await createClient();
  
  // Verify token
  const { data: invitation, error } = await supabase
    .from('admin_invitations')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
          <div className="w-16 h-16 bg-red-50 text-[#b50a0a] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tighter mb-2">Invalid or Expired Invitation</h1>
          <p className="text-gray-900 text-base font-medium mb-8">This invitation link is no longer valid or has already been used. Please contact your administrator for a new one.</p>
          <a href="/login" className="inline-block w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm tracking-wide transition-all">
            Return to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#b50a0a] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-900/20">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tighter leading-none">Complete <span className="text-[#b50a0a]">Signup</span></h1>
          <p className="text-gray-900 text-xs font-bold tracking-[0.2em] mt-3">Finish setting up your administrative account</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-gray-200 border border-gray-100">
           <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs font-bold text-gray-900 tracking-wide mb-1">Invited Role</p>
              <p className="text-base font-bold text-gray-900">{invitation.role}</p>
              <p className="text-xs text-gray-900 font-medium mt-1">{invitation.email}</p>
           </div>
           
           <SignupForm email={invitation.email} role={invitation.role} />
        </div>
      </div>
    </div>
  );
}
