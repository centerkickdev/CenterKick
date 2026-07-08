import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminSignupForm } from '@/components/auth/AdminSignupForm';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AdminSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token;

  if (!token) {
    redirect('/login');
  }

  const supabase = await createClient();

  // Verify invitation
  const { data: invitation, error } = await supabase
    .from('admin_invitations')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
           <div className="w-20 h-20 bg-red-50 text-[#b50a0a] rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-red-900/5">
              <AlertCircle className="w-10 h-10" />
           </div>
           <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tighter">Invalid Invitation</h1>
              <p className="text-gray-900 text-xs font-bold tracking-[0.2em] leading-relaxed">
                This invitation link has expired, been already used, or is invalid. 
                Please contact the system administrator for a new invite.
              </p>
           </div>
           <Link 
             href="/login"
             className="inline-block px-4 md:px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-xs tracking-wide hover:bg-black transition-all"
           >
             Return to Login
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-4 md:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center mb-8">
           <div className="w-16 h-16 bg-[#b50a0a] rounded-2xl flex items-center justify-center shadow-2xl shadow-red-900/20 rotate-3">
              <ShieldCheck className="w-8 h-8 text-white -rotate-3" />
           </div>
        </div>
        <h2 className="text-center text-4xl font-bold text-gray-900 tracking-tighter">
          Admin <span className="text-[#b50a0a]">Registration</span>
        </h2>
        <p className="mt-4 text-center text-xs font-bold text-gray-400 tracking-[0.3em]">
          Secure invitation for: <span className="text-gray-900 font-bold">{invitation.role}</span>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-10 px-6 shadow-2xl shadow-gray-200/50 rounded-[3rem] border border-gray-100 sm:px-12 animate-in slide-in-from-bottom-6 duration-700">
          <AdminSignupForm email={invitation.email} role={invitation.role} token={token} />
        </div>
        <p className="mt-10 text-center text-xs font-bold text-gray-400 tracking-[0.2em]">
          Protected by CenterKick IAM &bull; &copy; 2026
        </p>
      </div>
    </div>
  );
}
