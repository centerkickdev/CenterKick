import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { resolveIsSubscribed } from '@/lib/subscription';

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const isDashboardPath = pathname.startsWith('/dashboard');
  const isAdminPath = pathname.startsWith('/admin');
  const isPublicAdminPath = pathname === '/admin/signup';

  // Fast check: look for Supabase auth cookies
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  );

  // 1. If unauthenticated (no auth cookie present)
  if (!hasAuthCookie) {
    // If attempting to access protected dashboard or admin routes, bounce immediately (0 DB queries)
    if (!isPublicAdminPath && (isDashboardPath || isAdminPath)) {
      const url = request.nextUrl.clone();
      url.pathname = isAdminPath ? '/admin/login' : '/login';
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }
    // Public route: return immediately in <1ms without any Supabase network or database calls
    return supabaseResponse;
  }

  // 2. Auth cookie is present — initialize client and refresh session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If token is invalid or expired
  if (!user) {
    if (!isPublicAdminPath && (isDashboardPath || isAdminPath)) {
      const url = request.nextUrl.clone();
      url.pathname = isAdminPath ? '/admin/login' : '/login';
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 3. User is authenticated.
  // Optimization: When browsing public routes (/, /players, /news, /about, /api),
  // DO NOT execute heavy participant / subscription database queries.
  if (!isDashboardPath && !isAdminPath) {
    return supabaseResponse;
  }

  // 4. Protected Routes (/admin & /dashboard)
  const adminRoles = ['superadmin', 'admin', 'blogger', 'operations', 'finance'];

  // Read role from JWT app_metadata (set by DB trigger)
  let role: string | null = user.app_metadata?.role ?? null;

  // Fallback: If JWT has no role, query DB once
  if (!role) {
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    role = userRecord?.role ?? null;
  }

  const isStaff = role !== null && adminRoles.includes(role);

  // Staff bypass — staff member passes immediately to admin or dashboard
  if (isStaff) {
    return supabaseResponse;
  }

  // Non-staff trying to access /admin -> bounce immediately
  if (isAdminPath && !isPublicAdminPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('error', 'Unauthorized access.');
    return NextResponse.redirect(url);
  }

  // 5. Participant checks on /dashboard
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
      .select('id, status, is_subscribed, subscription_status, verification_requested')
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

  // Check for subscription across entitlement sources
  const isSubscribedFromProfileOrSub = resolveIsSubscribed({
    isSubscribedFlag: (profile as any)?.is_subscribed,
    subscriptionStatus: (profile as any)?.subscription_status,
    hasActiveSubscriptionRow: Boolean(activeSubscriptions && activeSubscriptions.length > 0),
  });

  let hasConfirmedTransaction = false;
  let hasCouponRedemption = false;

  // Short-circuit: only query fallback tables if primary profile signals are not active
  if (profile?.id && !isSubscribedFromProfileOrSub) {
    const [{ data: confirmedTxs }, { data: redemptions }] = await Promise.all([
      supabase
        .from('transactions')
        .select('id')
        .eq('user_id', profile.id)
        .eq('status', 'confirmed')
        .limit(1),
      supabase
        .from('coupon_redemptions')
        .select('id')
        .or(`redeemer_id.eq.${user.id},redeemer_id.eq.${profile.id}`)
        .limit(1),
    ]);

    hasConfirmedTransaction = Boolean(confirmedTxs && confirmedTxs.length > 0);
    hasCouponRedemption = Boolean(redemptions && redemptions.length > 0);
  }

  const isSubscribed = isSubscribedFromProfileOrSub || hasConfirmedTransaction || hasCouponRedemption;

  // Mandatory subscription check for participants in the dashboard
  if (isDashboardPath) {
    if (!isSubscribed) {
      const allowedPaths = ['/dashboard', '/dashboard/settings', '/dashboard/subscription', '/dashboard/support'];
      if (!allowedPaths.includes(pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard/subscription';
        return NextResponse.redirect(url);
      }
    }
  }

  // Block deactivated/banned participants
  const isPendingNewAccount = !profileStatus || profileStatus === 'pending';
  if (!isActive && !isPendingNewAccount && isDashboardPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('error', 'Your account has been restricted.');
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
