'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendEmailNotification } from '../notifications/actions';
import { generateBaseSlug, generateRandomSuffix } from '@/lib/utils/slug';
import sharp from 'sharp';

async function getUniqueSlug(supabase: any, role: string, firstName: string, lastName: string) {
  const baseSlug = generateBaseSlug(role, firstName, lastName);
  
  // Check if slug exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('slug')
    .eq('slug', baseSlug)
    .maybeSingle();

  if (!existing) return baseSlug;

  // If exists, add random suffix
  return `${baseSlug}-${generateRandomSuffix()}`;
}

export async function addPlayer(formData: FormData) {
  const supabase = await createClient();
  
  const email = formData.get('email') as string;
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const position = formData.get('position') as string;
  const country = formData.get('country') as string;
  const dob = formData.get('date_of_birth') as string; // YYYY-MM-DD
  const gender = formData.get('gender') as string;
  const foot = formData.get('foot') as string;
  const agentId = formData.get('agent_id') as string || null;

  // 1. Check if user already exists in auth (via users table)
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  // 2. Check if a prospect profile already exists for this email
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, user_id')
    .eq('email', email)
    .maybeSingle();

  if (existingProfile) {
    if (existingProfile.user_id) {
       return { success: false, error: "This email is already registered as a member." };
    } else {
       return { success: false, error: "This athlete is already enrolled as a prospect." };
    }
  }

  // Generate unique slug
  const slug = await getUniqueSlug(supabase, 'player', firstName, lastName);
  
  const finalAgentId = agentId === '' ? null : agentId;

  // 3. Profile Creation (Unlinked enrollment)
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{
      user_id: existingUser?.id || null,
      email: email,
      role: 'player',
      first_name: firstName,
      last_name: lastName,
      slug,
      position,
      country,
      date_of_birth: dob,
      gender,
      foot,
      agent_id: finalAgentId,
      agent_status: finalAgentId ? 'pending' : 'accepted',
      status: 'active'
    }]);

  if (profileError) return { success: false, error: profileError.message };

  // 4. Send Registration Email
  await sendEmailNotification(
    email, 
    "Welcome to CenterKick - Your Profile is Ready", 
    `Hello ${firstName}, an admin has enrolled you in CenterKick. Click here to complete your registration and access your dashboard: ${process.env.NEXT_PUBLIC_SITE_URL}/register?email=${encodeURIComponent(email)}&role=player`
  );

  revalidatePath('/admin/players');
  return { success: true };
}

export async function updatePlayer(id: string, data: any) {
  const supabase = await createClient();
  
  // If first_name or last_name is updated, recalculate slug if it's missing or if names changed
  if (data.first_name || data.last_name) {
    const { data: current } = await supabase
      .from('profiles')
      .select('first_name, last_name, role, slug')
      .eq('id', id)
      .single();

    if (current && (data.first_name !== current.first_name || data.last_name !== current.last_name)) {
      const newBase = generateBaseSlug(current.role || 'player', data.first_name || current.first_name, data.last_name || current.last_name);
      // Only update if it doesn't already start with the new base
      if (!current.slug || !current.slug.startsWith(newBase)) {
         data.slug = await getUniqueSlug(supabase, current.role || 'player', data.first_name || current.first_name, data.last_name || current.last_name);
      }
    }
  }

  if (data.agent_id === '') {
    data.agent_id = null;
  }

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/players');
  return { success: true };
}

export async function deletePlayer(id: string) {
  const supabase = await createClient();
  
  // Get profile to check for linked user
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', id)
    .single();

  // Delete transaction records linked to this profile ID or user ID
  await supabase.from('transactions').delete().eq('user_id', id);
  if (profile?.user_id) {
    await supabase.from('transactions').delete().eq('user_id', profile.user_id);
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', profile.user_id);
    if (error) return { success: false, error: error.message };
  } else {
    // Just delete the unlinked profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/admin/players');
  return { success: true };
}

export async function getPendingEdits(profileId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profile_edits')
    .select('*')
    .eq('profile_id', profileId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function processProfileEdit(editId: string, action: 'approve' | 'reject') {
  const supabase = await createClient();
  
  if (action === 'reject') {
    const { error } = await supabase
      .from('profile_edits')
      .update({ status: 'rejected' })
      .eq('id', editId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  // Approve: Get edit details and apply to profile
  const { data: edit } = await supabase
    .from('profile_edits')
    .select('*')
    .eq('id', editId)
    .single();

  if (!edit) return { success: false, error: "Edit not found" };

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ [edit.field_name]: edit.new_value })
    .eq('id', edit.profile_id);

  if (profileError) return { success: false, error: profileError.message };

  // Mark edit as approved
  const { error: editError } = await supabase
    .from('profile_edits')
    .update({ status: 'approved' })
    .eq('id', editId);

  if (editError) return { success: false, error: editError.message };

  revalidatePath('/admin/players');
  return { success: true };
}

export async function getPlayerTransactions(profileId: string) {
  const supabase = await createClient();
  
  // First get user_id from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('id', profileId)
    .single();

  if (!profile?.user_id) return { success: true, data: [] };

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', profile.user_id)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getPlayerStats(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('career_stats')
    .select('*')
    .eq('player_id', playerId)
    .order('season', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addPlayerStat(playerId: string, data: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('career_stats')
    .insert([{ ...data, player_id: playerId }]);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/players/[id]', 'page');
  return { success: true };
}

export async function updatePlayerStat(statId: string, data: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('career_stats')
    .update(data)
    .eq('id', statId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deletePlayerStat(statId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('career_stats')
    .delete()
    .eq('id', statId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Achievements
export async function getPlayerAchievements(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('player_id', playerId)
    .order('year', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addPlayerAchievement(playerId: string, data: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('achievements')
    .insert([{ ...data, player_id: playerId }]);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updatePlayerAchievement(achievementId: string, data: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('achievements')
    .update(data)
    .eq('id', achievementId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deletePlayerAchievement(achievementId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('achievements')
    .delete()
    .eq('id', achievementId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Transfers
export async function getPlayerTransfers(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('player_transfers')
    .select('*')
    .eq('player_id', playerId)
    .order('transfer_date', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addPlayerTransfer(playerId: string, data: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('player_transfers')
    .insert([{ ...data, player_id: playerId }]);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updatePlayerTransfer(transferId: string, data: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('player_transfers')
    .update(data)
    .eq('id', transferId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deletePlayerTransfer(transferId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('player_transfers')
    .delete()
    .eq('id', transferId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateProfileAvatar(profileId: string, avatarUrl: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', profileId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/players/[id]', 'page');
  return { success: true };
}

export async function updateProfileTags(profileId: string, tags: string[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ tags })
    .eq('id', profileId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/players/[id]', 'page');
  return { success: true };
}

export async function getPlayerNews(tags: string[]) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, excerpt, cover_image, slug, created_at')
    .eq('status', 'published')
    .overlaps('tags', tags)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function uploadPlayerImage(formData: FormData) {
  try {
    const supabase = await createClient();
    const file = formData.get('file') as File;
    if (!file) return { error: 'No file provided' };

    const buffer = Buffer.from(await file.arrayBuffer());
    const optimizedBuffer = await sharp(buffer)
      .resize(800, 800, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
    const path = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(path, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('site-assets')
      .getPublicUrl(path);

    return { url: publicUrl };
  } catch (error: any) {
    console.error('Image upload error:', error);
    return { error: 'Failed to process image' };
  }
}

export async function migrateAllProfileSlugs() {
  const supabase = await createClient();
  
  // Fetch all profiles
  const { data: profiles, error: fetchError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, role, slug');

  if (fetchError) return { success: false, error: fetchError.message };
  if (!profiles) return { success: true, count: 0 };

  let updatedCount = 0;
  for (const profile of profiles) {
    const targetBase = generateBaseSlug(profile.role || 'player', profile.first_name || '', profile.last_name || '');
    
    // Check if current slug starts with targetBase (and follows it with possibly a random suffix)
    if (!profile.slug || !profile.slug.startsWith(targetBase)) {
      const newSlug = await getUniqueSlug(supabase, profile.role || 'player', profile.first_name || '', profile.last_name || '');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ slug: newSlug })
        .eq('id', profile.id);
      
      if (!updateError) updatedCount++;
    }
  }

  revalidatePath('/admin/players');
  revalidatePath('/admin/coaches');
  return { success: true, count: updatedCount };
}
