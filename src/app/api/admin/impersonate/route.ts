import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { IMPERSONATION_COOKIE } from '@/lib/auth/impersonation';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get('targetUserId');

  if (!targetUserId) {
    return NextResponse.json({ error: 'Missing targetUserId parameter' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify caller is SuperAdmin
  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isSuperAdmin = userRecord?.role === 'superadmin' || user.app_metadata?.role === 'superadmin';

  if (!isSuperAdmin) {
    return NextResponse.json({ error: 'Forbidden: SuperAdmin access required' }, { status: 403 });
  }

  try {
    const headerStore = await headers();
    const ip = headerStore.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = headerStore.get('user-agent') || '';

    // Log impersonation event
    const adminDb = createAdminClient();
    await adminDb.from('superadmin_impersonation_logs').insert({
      superadmin_id: user.id,
      target_user_id: targetUserId,
      reason: 'SuperAdmin New Tab View-As Preview Mode',
      action: 'START',
      ip_address: ip,
      user_agent: userAgent,
    });

    // Set signed HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(IMPERSONATION_COOKIE, targetUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour TTL
      path: '/',
    });
  } catch (err) {
    console.error('Error starting impersonation in GET route:', err);
  }

  // Redirect to dashboard in the new tab
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
