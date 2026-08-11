'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmailNotification } from '../admin/notifications/actions';

export type SupportCategory = 'billing' | 'report_issue' | 'feedback' | 'general';
export type SupportChannel = 'email' | 'whatsapp';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export async function submitSupportTicket(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const name = (formData.get('name') as string || '').trim();
  const email = (formData.get('email') as string || '').trim();
  const category = (formData.get('category') as SupportCategory || 'general');
  const subject = (formData.get('subject') as string || '').trim();
  const message = (formData.get('message') as string || '').trim();
  const channel = (formData.get('channel') as SupportChannel || 'email');
  const whatsappNumber = (formData.get('whatsapp_number') as string || '').trim();

  if (!name || !email || !subject || !message) {
    return { success: false, error: 'Please fill in all required fields.' };
  }

  if (channel === 'whatsapp' && !whatsappNumber) {
    return { success: false, error: 'Please provide your WhatsApp phone number.' };
  }

  // Handle files
  const rawFiles = formData.getAll('attachments') as File[];
  const validFiles = rawFiles.filter(f => f && f.size > 0);

  if (validFiles.length > MAX_FILES) {
    return { success: false, error: `You can attach a maximum of ${MAX_FILES} files.` };
  }

  for (const file of validFiles) {
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: `File "${file.name}" exceeds the 5MB size limit.` };
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: `File "${file.name}" is not a supported type. Only Images (JPEG/PNG/WEBP) and PDFs are allowed.` };
    }
  }

  const adminClient = createAdminClient();
  const attachmentUrls: string[] = [];

  // Upload files to Supabase Storage if attachments present
  if (validFiles.length > 0) {
    for (const file of validFiles) {
      const ext = file.name.split('.').pop() || 'file';
      const fileName = `support_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const fileBuffer = await file.arrayBuffer();

      const { data: uploadData, error: uploadError } = await adminClient.storage
        .from('support-attachments')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: true
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = adminClient.storage
          .from('support-attachments')
          .getPublicUrl(uploadData.path);
        if (urlData?.publicUrl) {
          attachmentUrls.push(urlData.publicUrl);
        }
      }
    }
  }

  // Category Title formatting
  const categoryLabels: Record<SupportCategory, string> = {
    billing: 'Billing Issue',
    report_issue: 'Report an Issue',
    feedback: 'Feedback / Feature Request',
    general: 'General Query'
  };

  const categoryLabel = categoryLabels[category] || 'Support Request';

  // Record ticket in database if table exists
  try {
    const { error: dbInsertError } = await adminClient.from('support_tickets').insert([{
      user_id: user?.id || null,
      name,
      email,
      category,
      subject,
      message,
      channel,
      attachment_urls: attachmentUrls,
      status: 'open',
      created_at: new Date().toISOString()
    }]);
    if (dbInsertError) {
      console.warn('Support ticket DB insert note (run migration if table missing):', dbInsertError.message);
    }
  } catch (dbErr) {
    console.error('Support ticket DB insert fallback error:', dbErr);
  }

  // Dispatch Email Notification to info.centerkick@gmail.com
  const officialSupportEmail = 'info.centerkick@gmail.com';
  const emailSubject = `[CenterKick Support - ${categoryLabel}] ${subject}`;

  let attachmentHtml = '';
  if (attachmentUrls.length > 0) {
    attachmentHtml = `
      <div style="margin-top: 20px; padding: 16px; background-color: #f3f4f6; border-radius: 12px;">
        <strong>Attachments (${attachmentUrls.length}):</strong><br />
        ${attachmentUrls.map((url, i) => `<a href="${url}" target="_blank" style="color: #b50a0a; text-decoration: underline;">Attachment ${i + 1}</a>`).join('<br />')}
      </div>
    `;
  }

  const emailBody = `
    <strong>Support Request Received</strong><br /><br />
    <strong>Channel:</strong> ${channel.toUpperCase()}<br />
    ${whatsappNumber ? `<strong>WhatsApp Number:</strong> ${whatsappNumber}<br />` : ''}
    <strong>Category:</strong> ${categoryLabel}<br />
    <strong>Submitted By:</strong> ${name} (${email})<br />
    <strong>Subject:</strong> ${subject}<br /><br />
    <strong>Message:</strong><br />
    ${message.replace(/\n/g, '<br />')}
    ${attachmentHtml}
  `;

  await sendEmailNotification(officialSupportEmail, emailSubject, emailBody);

  // If WhatsApp channel selected, return pre-filled WhatsApp link
  if (channel === 'whatsapp') {
    const waText = encodeURIComponent(`Support [${categoryLabel}]: ${subject}\n\nFrom: ${name} (${email})\nWhatsApp: ${whatsappNumber}\n\nMessage: ${message}`);
    const waUrl = `https://wa.me/2349112600300?text=${waText}`;
    return { success: true, channel: 'whatsapp', whatsappUrl: waUrl };
  }

  return { success: true, channel: 'email' };
}

export async function getUserSupportTickets() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user support tickets:', error);
    return [];
  }

  return data || [];
}
