import { createClient } from '@/lib/supabase/server';
import { RolesClient } from '@/components/admin/RolesClient';
import { redirect } from 'next/navigation';

export default async function AdminRolesPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  // Fetch all administrative users (excluding unassigned for the main list)
  const adminRoles = ['superadmin', 'admin', 'blogger', 'operations', 'finance'];
  const { data: adminUsers } = await supabase
    .from('users')
    .select('*, profiles(*)')
    .in('role', adminRoles)
    .order('created_at', { ascending: false });

  // Fetch users in verification queue
  const { data: verificationQueue } = await supabase
    .from('users')
    .select('*, profiles(*)')
    .eq('is_verification_requested', true)
    .order('created_at', { ascending: false });

  // Fetch pending invitations
  const { data: invitations } = await supabase
    .from('admin_invitations')
    .select('*')
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  // Fetch current user's role
  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  return (
    <div className="animate-in fade-in duration-500">
      <RolesClient 
        adminUsers={adminUsers || []} 
        verificationQueue={verificationQueue || []}
        invitations={invitations || []}
        currentUserId={user.id}
        currentUserRole={currentUser?.role || 'admin'}
      />
    </div>
  );
}
