import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicAdminPath = request.nextUrl.pathname === '/admin/signup';

  if (user) {
    const adminRoles = ['superadmin', 'admin', 'blogger', 'operations', 'finance'];

    // 1. PRIMARY: Read role from JWT app_metadata (set by DB trigger after migration)
    let role: string | null = user.app_metadata?.role ?? null;

    // 2. FALLBACK: If JWT has no role, query the DB directly.
    //    This handles accounts created before the sync trigger was applied.
    if (!role) {
      const { data: userRecord } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      role = userRecord?.role ?? null;
    }

    const isStaff = role !== null && adminRoles.includes(role);

    const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard');
    const isAdminPath = request.nextUrl.pathname.startsWith('/admin');

    // 3. Staff bypass — any role-recognized staff member passes immediately.
    //    This is purely role-based, not email-based. Changing an email never breaks access.
    if (isStaff && (isDashboardPath || isAdminPath)) {
      return supabaseResponse;
    }

    // 4. Participant checks (only reached if user is NOT staff)
    let profileStatus: string | null = null;
    let isActive = true;

    const [
      { data: userRecord },
      { data: profile },
      { data: activeSubscriptions }
    ] = await Promise.all([
      supabase
        .from('users')
        .select('is_active')
        .eq('id', user.id)
        .single(),
      supabase
        .from('profiles')
        .select('id, status, is_subscribed, verification_requested')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
    ]);

    isActive = userRecord?.is_active ?? true;
    profileStatus = profile?.status ?? null;
    const verificationRequested = profile?.verification_requested ?? false;
    
    // Check for subscription using subscriptions table, profile flag, or confirmed transactions
    let isSubscribed = (activeSubscriptions && activeSubscriptions.length > 0) || Boolean((profile as any)?.is_subscribed);

    if (!isSubscribed && profile?.id) {
      const { data: confirmedTxs } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', profile.id)
        .eq('status', 'confirmed')
        .limit(1);

      if (confirmedTxs && confirmedTxs.length > 0) {
        isSubscribed = true;
      }
    }

    // 5. Mandatory subscription check for participants in the dashboard
    if (!isPublicAdminPath && isDashboardPath) {
      if (!isSubscribed) {
        const allowedPaths = ['/dashboard', '/dashboard/settings', '/dashboard/subscription', '/dashboard/support'];
        if (!allowedPaths.includes(request.nextUrl.pathname)) {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard/subscription';
          return NextResponse.redirect(url);
        }
      }
    }

    // 6. Block deactivated/banned participants (allow new accounts awaiting approval)
    const isPendingNewAccount = !profileStatus || profileStatus === 'pending';
    if (!isActive && !isPendingNewAccount && !isPublicAdminPath && (isDashboardPath || isAdminPath)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'Your account has been restricted.');
      return NextResponse.redirect(url);
    }
  } else {
    // Protect /admin and /dashboard if not logged in
    if (!isPublicAdminPath && (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/dashboard'))) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
