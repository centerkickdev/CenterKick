import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || searchParams.get('user_id') || searchParams.get('uid');

  if (!userId) {
    return NextResponse.redirect(new URL('/dashboard/settings?tab=Notifications', req.url));
  }

  try {
    const supabaseAdmin = createAdminClient();
    // Disable email reminders for user
    await supabaseAdmin
      .from('profiles')
      .update({
        email_reminders_enabled: false,
        profile_reminders_enabled: false,
        subscription_reminders_enabled: false,
      })
      .eq('user_id', userId);

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed - CenterKick</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #f9fafb; color: #111827; }
          .card { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center; max-width: 400px; border: 1px solid #e5e7eb; }
          h1 { font-size: 20px; font-weight: 800; margin-bottom: 12px; }
          p { font-size: 14px; color: #6b7280; line-height: 1.5; margin-bottom: 24px; }
          a { display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>You have unsubscribed</h1>
          <p>You will no longer receive automated weekly reminder emails from CenterKick. You can re-enable preferences anytime in your account settings.</p>
          <a href="/dashboard/settings">Back to Account Settings</a>
        </div>
      </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return NextResponse.redirect(new URL('/dashboard/settings?tab=Notifications', req.url));
  }
}
