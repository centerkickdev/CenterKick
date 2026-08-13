import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { name, email, message, targetType, targetId, targetName } = await req.json();

    if (!name || !email || !message || !targetType || !targetId || !targetName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch target user's email if available
    let targetEmail = null;
    try {
       // Typically, you might want to look up the user's email by targetId. 
       // This assumes `profiles` table might have a contact_email or similar, 
       // or you fetch the Auth user. Since we don't have the exact schema for emails, 
       // we'll attempt to fetch a contact_email from profiles.
       const { data: profile } = await supabase
         .from('profiles')
         .select('contact_email, email')
         .eq('id', targetId)
         .single();
         
       targetEmail = profile?.contact_email || profile?.email;
    } catch (err) {
       console.error("Error fetching target profile:", err);
    }

    // 1. Record inquiry as a support ticket in support_tickets table
    try {
      await supabase.from('support_tickets').insert([{
        name,
        email,
        category: 'general',
        subject: `New ${targetType === 'coach' ? 'Coach' : 'Partner'} Inquiry for ${targetName}`,
        message: `Inquiry for ${targetName} (${targetType} - ID: ${targetId}):\n\n${message}`,
        channel: 'email',
        status: 'open',
        created_at: new Date().toISOString()
      }]);
    } catch (ticketErr) {
      console.error('Failed to record support ticket for inquiry:', ticketErr);
    }

    // 2. Fetch admin user IDs to notify in-app
    try {
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .in('role', ['admin', 'superadmin', 'operations', 'finance']);

      if (adminUsers && adminUsers.length > 0) {
        const adminNotifications = adminUsers.map(admin => ({
          user_id: admin.id,
          title: `New ${targetType === 'coach' ? 'Coach Inquiry' : 'Partner Inquiry'} for ${targetName}`,
          message: `${name} (${email}) sent an inquiry for ${targetName}: "${message.slice(0, 120)}${message.length > 120 ? '...' : ''}"`,
          type: 'info',
          link: '/admin/support'
        }));
        await supabase.from('notifications').insert(adminNotifications);
      }
    } catch (notifErr) {
      console.error('Failed to create in-app admin notifications:', notifErr);
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'support@centerkick.com';

    // 1. Email to Admin
    try {
      await resend.emails.send({
        from: 'CenterKick Contact <noreply@centerkick.com>',
        to: adminEmail,
        subject: `New Inquiry for ${targetType} - ${targetName}`,
        html: `
          <h3>New Contact Request</h3>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Target:</strong> ${targetName} (${targetType} - ${targetId})</p>
          <p><strong>Message:</strong></p>
          <blockquote>${message}</blockquote>
        `
      });
    } catch (e) {
      console.error('Email sending to admin failed:', e);
    }

    // 2. Email to Requester (Confirmation)
    try {
      await resend.emails.send({
        from: 'CenterKick <noreply@centerkick.com>',
        to: email,
        subject: `CenterKick: Inquiry sent to ${targetName}`,
        html: `
          <h3>Hello ${name},</h3>
          <p>Your inquiry for <strong>${targetName}</strong> has been received by our team.</p>
          <p>We are reviewing your request and will connect you shortly if appropriate.</p>
          <p><strong>Your Message:</strong></p>
          <blockquote>${message}</blockquote>
          <br/>
          <p>Best Regards,</p>
          <p>CenterKick Team</p>
        `
      });
    } catch (e) {
      console.error('Email sending to requester failed:', e);
    }

    // 3. Email to Target (if we have their email)
    if (targetEmail) {
      try {
        await resend.emails.send({
          from: 'CenterKick <noreply@centerkick.com>',
          to: targetEmail,
          subject: `CenterKick: New Inquiry from ${name}`,
          html: `
            <h3>Hello ${targetName},</h3>
            <p>You have received a new professional inquiry via CenterKick from <strong>${name}</strong>.</p>
            <p><strong>Message:</strong></p>
            <blockquote>${message}</blockquote>
            <br/>
            <p>You can reply directly to them at: <a href="mailto:${email}">${email}</a></p>
            <br/>
            <p>Best Regards,</p>
            <p>CenterKick Team</p>
          `
        });
      } catch (e) {
        console.error('Email sending to target failed:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: 'Failed to send messages' }, { status: 500 });
  }
}
