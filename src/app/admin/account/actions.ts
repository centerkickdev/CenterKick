'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';

export async function uploadAdminAvatar(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'No file provided' };

    const buffer = Buffer.from(await file.arrayBuffer());
    const optimizedBuffer = await sharp(buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 85 })
      .toBuffer();

    const fileName = `admin-${user.id}-${Date.now()}.webp`;
    const path = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(path, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: { publicUrl } } = supabase.storage
      .from('site-assets')
      .getPublicUrl(path);

    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error('Avatar upload error:', err);
    return { success: false, error: err.message || 'Failed to upload avatar image' };
  }
}

export async function updateAdminProfile(data: { firstName: string; lastName: string; avatarUrl?: string }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const updatePayload: any = {
      first_name: data.firstName,
      last_name: data.lastName,
    };

    if (data.avatarUrl !== undefined) {
      updatePayload.avatar_url = data.avatarUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/account');
    revalidatePath('/admin', 'layout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update profile' };
  }
}

export async function updateAdminEmail(newEmail: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) return { success: false, error: error.message };

    // Update email in profiles table as well
    await supabase
      .from('profiles')
      .update({ email: newEmail })
      .eq('user_id', user.id);

    await supabase
      .from('users')
      .update({ email: newEmail })
      .eq('id', user.id);

    revalidatePath('/admin/account');
    return { 
      success: true, 
      message: 'Confirmation email sent! Please check both your current and new email address to complete the change.' 
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update email address' };
  }
}

export async function updateAdminPassword(password: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { success: false, error: error.message };

    return { success: true, message: 'Password updated successfully!' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update password' };
  }
}
