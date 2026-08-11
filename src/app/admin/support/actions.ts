'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function getSupportTickets(filterStatus?: string, filterCategory?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized', tickets: [] };

  const adminClient = createAdminClient();
  let query = adminClient
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (filterStatus && filterStatus !== 'all') {
    query = query.eq('status', filterStatus);
  }

  if (filterCategory && filterCategory !== 'all') {
    query = query.eq('category', filterCategory);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching admin support tickets:', error);
    return { error: error.message, tickets: [] };
  }

  return { tickets: data || [] };
}

export async function updateSupportTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'resolved') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('support_tickets')
    .update({ status })
    .eq('id', ticketId);

  if (error) {
    console.error('Error updating ticket status:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/support');
  revalidatePath('/dashboard/support');
  return { success: true };
}
