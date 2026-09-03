import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
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

  const role = userRecord?.role;

  switch (role) {
    case 'blogger':
      redirect('/admin/blog');
    case 'finance':
      redirect('/admin/payments/transactions');
    case 'operations':
    case 'admin':
    case 'superadmin':
    default:
      redirect('/admin/approvals');
  }
}

