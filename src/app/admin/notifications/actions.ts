'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.rpc('mark_all_notifications_read', {
    target_user_id: user.id
  });

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function createAdminNotification(data: {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('notifications')
    .insert([{
      user_id: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      link: data.link
    }]);

  if (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

import { Resend } from 'resend';

export async function sendEmailNotification(email: string, subject: string, body: string) {
  const supabase = await createClient();
  
  // 1. Fetch Resend configuration from site_content
  const { data: settingsRecord } = await supabase
    .from('site_content')
    .select('content')
    .eq('page', 'settings')
    .eq('section', 'system')
    .maybeSingle();

  const settings = (settingsRecord?.content as any) || {};
  const apiKey = settings.resendKey || process.env.RESEND_API_KEY;
  const fromEmail = settings.fromEmail || 'CenterKick <onboarding@resend.dev>';

  if (!apiKey) {
    console.error('[Email Error] No Resend API key found in settings or environment.');
    return { success: false, error: 'Email service not configured. Please add a Resend API key in System Settings.' };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; padding: 40px; color: #171717; background-color: #f9fafb; border-bottom: 4px solid #B91C1C;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 24px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="color: #B91C1C; font-weight: 900; font-size: 24px; text-transform: ; letter-spacing: -0.05em; margin-bottom: 32px;">
                    Center<span style="color: #171717;">Kick</span>
                </div>
                <div style="line-height: 1.6; color: #404040; font-size: 15px;">
                    ${body.replace(/\n/g, '<br />')}
                </div>
                <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; text-transform: ; font-weight: 700; letter-spacing: 0.05em;">
                    &copy; ${new Date().getFullYear()} CenterKick Global. Professional Football Network.
                </div>
            </div>
        </div>
      `,
    });

    if (error) {
       console.error('[Resend Error]:', error);
       return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('[Email Exception]:', err);
    return { success: false, error: err.message || 'Unknown email delivery error' };
  }
}
