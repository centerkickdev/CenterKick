import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'recovery' | 'signup' | 'invite' | 'magiclink' | null
  const next = searchParams.get('next') ?? '/'

  const error_param = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  if (error_param) {
    return NextResponse.redirect(`${origin}/login?error=${error_description || error_param}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Auth callback error (code):', error)
      return NextResponse.redirect(`${origin}/login?error=Auth code exchange failed: ${error.message}`)
    }
  } else if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })
    if (error) {
      console.error('Auth callback error (otp):', error)
      return NextResponse.redirect(`${origin}/login?error=OTP verification failed: ${error.message}`)
    }
  } else {
    // Debug info: what params were actually present?
    const params = Array.from(searchParams.keys()).join(', ')
    return NextResponse.redirect(`${origin}/login?error=No authentication code or token found. Available params: ${params || 'none'}`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let finalNext = next
  if (user) {
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('user_id', user.id)
      .single()

    const role = userRecord?.role || 'player'
    const adminRoles = ['superadmin', 'admin', 'blogger', 'operations', 'finance']

    if (adminRoles.includes(role)) {
      finalNext = '/admin'
    } else if (userRecord && profile) {
      if (profile.status === 'active') {
        finalNext = '/dashboard'
      } else {
        finalNext = '/dashboard/subscription'
      }
    } else {
      finalNext = '/register/google-onboarding'
    }
  }

  const forwardedHost = request.headers.get('x-forwarded-host') // i.e. localhost:3000
  const isLocalEnv = process.env.NODE_ENV === 'development'
  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${finalNext}`)
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${finalNext}`)
  } else {
    return NextResponse.redirect(`${origin}${finalNext}`)
  }
}
