'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfileStatus(profileId: string, status: 'active' | 'rejected' | 'pending' | 'suspended') {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', profileId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile status:', error);
    return { success: false, error: error.message };
  }

  // Log the action
  await supabase.rpc('log_admin_action', {
    p_action: `Profile status updated to ${status}`,
    p_target_type: 'profile',
    p_target_id: profileId,
    p_details: { status, admin_id: (await supabase.auth.getUser()).data.user?.id }
  });

  revalidatePath('/dashboard/admin/moderation');
  revalidatePath('/players');
  revalidatePath(`/players/${profileId}`);

  return { success: true, data };
}
