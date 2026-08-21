import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { isProfileComplete } from '@/lib/utils/profile';
import { getIncompleteProfileEmailTemplate, getSubscriptionReminderEmailTemplate } from '@/lib/email-templates';

// Helper function to execute email send with 3x exponential backoff retry loop
async function sendWithRetry(
  payload: { to: string; subject: string; html: string },
  retries = 3,
  delayMs = 1000
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await sendEmail(payload);
      if (result.success) return result;
      if (attempt === retries) return result;
    } catch (err) {
      if (attempt === retries) return { success: false, error: err };
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
  }
  return { success: false, error: 'Max retries exceeded' };
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(req.url);
  const supabaseAdmin = createAdminClient();

  // Validate Secret Header or Search Param
  const authHeader = req.headers.get('authorization');
  const querySecret = searchParams.get('secret');
  const expectedSecret = process.env.CRON_SECRET || 'centerkick_cron_secret';

  const isAuthorized =
    (authHeader && authHeader === `Bearer ${expectedSecret}`) ||
    querySecret === expectedSecret ||
    process.env.NODE_ENV === 'development';

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
  }

  let processedCount = 0;
  let sentCount = 0;
  let failedCount = 0;
  const logs: any[] = [];

  try {
    // 1. Fetch eligible profiles with user email & role details
    const { data: profiles, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, first_name, last_name, role, avatar_url, cover_url, gallery_urls, video_links, email_reminders_enabled, profile_reminders_enabled, subscription_reminders_enabled, last_profile_reminder_at, last_subscription_reminder_at, users!inner(email, created_at)');

    if (profileErr) {
      // Fallback query if join alias varies
      const { data: rawProfiles } = await supabaseAdmin
        .from('profiles')
        .select('*');
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch profiles for cron dispatch',
        details: profileErr.message,
      }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No profiles found to process',
        processedCount: 0,
        sentCount: 0,
        durationMs: Date.now() - startTime,
      });
    }

    // 2. Fetch all active subscriptions to filter out subscribed accounts
    const { data: activeSubs } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, status')
      .in('status', ['active', 'trialing']);

    const subscribedUserIds = new Set(
      (activeSubs || []).map((s: any) => s.user_id)
    );

    const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();

    // Filter profiles into target categories
    const targetReminders: Array<{
      type: 'profile' | 'subscription';
      profile: any;
      email: string;
      name: string;
    }> = [];

    for (const p of profiles) {
      // Check master opt-out
      if (p.email_reminders_enabled === false) continue;

      const userEmail = (p.users as any)?.email;
      if (!userEmail) continue;

      const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'CenterKick Member';
      const role = p.role || 'player';

      // Ignore Admins / Superadmins from reminder emails
      if (role === 'admin' || role === 'superadmin' || role === 'ops') continue;

      // Category 1: Incomplete Profile Reminder
      const isComplete = isProfileComplete(p);
      const isProfileOptedIn = p.profile_reminders_enabled !== false;
      const lastProfileReminder = p.last_profile_reminder_at;
      const profileNeedsReminder = !isComplete && isProfileOptedIn && (!lastProfileReminder || lastProfileReminder < sixDaysAgo);

      if (profileNeedsReminder) {
        targetReminders.push({ type: 'profile', profile: p, email: userEmail, name });
        continue; // Prioritize profile reminder if incomplete
      }

      // Category 2: Subscription Reminder
      const isSubscribed = subscribedUserIds.has(p.user_id);
      const isSubOptedIn = p.subscription_reminders_enabled !== false;
      const lastSubReminder = p.last_subscription_reminder_at;
      const subNeedsReminder = !isSubscribed && isSubOptedIn && (!lastSubReminder || lastSubReminder < sixDaysAgo);

      if (subNeedsReminder) {
        targetReminders.push({ type: 'subscription', profile: p, email: userEmail, name });
      }
    }

    processedCount = targetReminders.length;

    // 3. Batch process reminders in chunks of 25 to prevent serverless function timeouts
    const BATCH_SIZE = 25;
    const origin = req.nextUrl.origin || 'https://centerkick.com';

    for (let i = 0; i < targetReminders.length; i += BATCH_SIZE) {
      const batch = targetReminders.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async (item) => {
          const { type, profile, email, name } = item;
          const unsubscribeUrl = `${origin}/api/unsubscribe?userId=${profile.user_id}`;
          const dashboardUrl = `${origin}/dashboard/profile`;
          const subscriptionUrl = `${origin}/dashboard/subscription`;

          let html = '';
          let subject = '';

          if (type === 'profile') {
            subject = '📌 Weekly Reminder: Complete your CenterKick profile to get scouted';
            html = getIncompleteProfileEmailTemplate({
              name,
              role: profile.role || 'player',
              dashboardUrl,
              unsubscribeUrl,
            });
          } else {
            subject = '⭐ Weekly Reminder: Activate your CenterKick membership';
            html = getSubscriptionReminderEmailTemplate({
              name,
              role: profile.role || 'player',
              subscriptionUrl,
              unsubscribeUrl,
            });
          }

          const result = await sendWithRetry({ to: email, subject, html });

          if (result.success) {
            sentCount++;
            // Update last reminder sent timestamp in DB to enforce 6-day windowing
            const updateField = type === 'profile'
              ? { last_profile_reminder_at: new Date().toISOString() }
              : { last_subscription_reminder_at: new Date().toISOString() };

            await supabaseAdmin.from('profiles').update(updateField).eq('id', profile.id);
            logs.push({ email, type, status: 'sent' });
          } else {
            failedCount++;
            logs.push({ email, type, status: 'failed', error: result.error });
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      schedule: 'Weekly — Mondays 9:00 AM UTC',
      processedCount,
      sentCount,
      failedCount,
      durationMs: Date.now() - startTime,
      logs,
    });

  } catch (err: any) {
    console.error('CRON reminder execution error:', err);
    return NextResponse.json({
      success: false,
      error: 'CRON reminder execution error',
      details: err?.message || String(err),
      durationMs: Date.now() - startTime,
    }, { status: 500 });
  }
}
