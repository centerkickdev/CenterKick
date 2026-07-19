'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';

export async function trackProfileView(profileId: string) {
  if (!profileId) return;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let viewerId = null;
    let viewerRole = null;

    if (user) {
      viewerId = user.id;
      // Get the viewer's role from their profile or user record
      const { data: viewerData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (viewerData) {
        viewerRole = viewerData.role;
      }
    }

    // Don't log if the user is viewing their own profile
    if (viewerId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', profileId)
        .single();
        
      if (profile && profile.user_id === viewerId) {
        return;
      }
    }

    // Use the admin client to bypass RLS policies which might block anonymous inserts
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from('profile_views')
      .insert({
        profile_id: profileId,
        viewer_id: viewerId,
        viewer_role: viewerRole
      });

    if (error) {
      console.error('[Tracking Error] Failed to insert profile view:', error);
    }
  } catch (error) {
    console.error('[Tracking Error] Exception while tracking profile view:', error);
  }
}
