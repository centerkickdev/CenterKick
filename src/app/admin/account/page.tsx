import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminAccountClient } from '@/components/admin/account/AdminAccountClient';

export default async function AdminAccountPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle();

  const adminRoles = ['superadmin', 'admin', 'blogger', 'operations', 'finance'];
  if (!userRecord || !adminRoles.includes(userRecord.role)) {
    redirect('/dashboard');
  }

  return (
    <AdminAccountClient 
      user={{ id: user.id, email: user.email || '', created_at: user.created_at }} 
      role={userRecord.role}
      profile={profile || null} 
    />
  );
}
