'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sendOtpEmail } from '@/lib/resend';
import { createAdminClient } from '@/lib/supabase/admin';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Fetch user role and status to determine redirect and access
  const { data: userRecord } = await supabase
    .from('users')
    .select('role, is_active')
    .eq('id', data.user.id)
    .single();

  // Retrieve profile status to identify if this is a new pending account awaiting payment confirmation
  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('user_id', data.user.id)
    .maybeSingle();

  const isPendingNewAccount = !profile || profile.status === 'pending';

  if (userRecord && !userRecord.is_active && !isPendingNewAccount) {
    await supabase.auth.signOut();
    return { error: 'Your account is currently inactive. Please contact an administrator.' };
  }

  const role = userRecord?.role || 'player';
  
  // Custom redirects based on role
  let redirectPath = '/dashboard';
  if (role === 'superadmin' || role === 'admin') {
    redirectPath = '/admin';
  } else if (['blogger', 'operations', 'finance'].includes(role)) {
    redirectPath = '/admin'; // Staff roles also go to admin overview
  }

  revalidatePath('/', 'layout');
  redirect(redirectPath);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string || 'player';
  const firstName = formData.get('firstName') as string || '';
  const lastName = formData.get('lastName') as string || '';

  const validatePassword = (pass: string) => {
    return (
       pass.length >= 8 &&
       /[A-Z]/.test(pass) &&
       /[0-9]/.test(pass) &&
       /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    );
  };

  if (!validatePassword(password)) {
    return { error: 'Password does not meet complexity requirements.' };
  }

  // Check if account already exists in public.users
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingUser) {
    return { error: 'An account with this email already exists.' };
  }

  // Generate 6-digit OTP code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save registration data to Database with a 5-minute expiry for code (link is 60m but we only send code here)
  const adminClient = createAdminClient();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error: dbError } = await adminClient
    .from('otp_verifications')
    .upsert({ email, otp, password, role, first_name: firstName, last_name: lastName, expires_at: expiresAt });

  if (dbError) {
    console.error('[DB Error] Failed to save OTP registration data:', dbError);
    return { error: 'Temporary storage error. Please try again.' };
  }

  // Send the OTP via Resend
  try {
    await sendOtpEmail(email, otp);
  } catch (emailError: any) {
    console.error('[Email Error] Failed to send OTP code via Resend:', emailError);
    return { error: 'Failed to send verification email. Please double check your email address.' };
  }

  return { success: true, message: 'Verification code sent.' };
}

export async function verifyOtp(email: string, token: string) {
  const supabase = await createClient();

  const adminClient = createAdminClient();

  const { data: pendingData, error: dbError } = await adminClient
    .from('otp_verifications')
    .select('*')
    .eq('email', email)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (dbError) {
    console.error('[DB Error] Failed to get OTP registration data:', dbError);
    return { error: 'Verification system error. Please try again.' };
  }

  if (!pendingData) {
    return { error: 'Verification code has expired or was not requested. Please sign up again.' };
  }

  if (pendingData.otp !== token.trim()) {
    return { error: 'Invalid verification code.' };
  }

  // OTP verified successfully! Let's register and confirm the user in Supabase Auth.
  let authUser;

  const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: pendingData.password,
    email_confirm: true,
  });

  if (createError) {
    // If user already exists in auth.users but not in public.users, they are a dangling unconfirmed user.
    if (createError.message.includes('already exists') || createError.status === 422) {
      // Find the dangling auth user ID by listing users
      const { data: listData } = await adminClient.auth.admin.listUsers();
      const danglingUser = listData?.users?.find(u => u.email === email);
      
      if (danglingUser) {
        // Delete the dangling auth user and try creating again
        await adminClient.auth.admin.deleteUser(danglingUser.id);
        const { data: retryData, error: retryError } = await adminClient.auth.admin.createUser({
          email,
          password: pendingData.password,
          email_confirm: true,
        });

        if (retryError) {
          return { error: retryError.message };
        }
        authUser = retryData.user;
      } else {
        return { error: 'This email is already registered.' };
      }
    } else {
      return { error: createError.message };
    }
  } else {
    authUser = authData.user;
  }

  // Update user role and profile slug instantly
  if (authUser) {
    const role = pendingData.role || 'player';
    const firstName = pendingData.first_name || '';
    const lastName = pendingData.last_name || '';
    
    // Update user role
    await adminClient.from('users').update({ role }).eq('id', authUser.id);
    
    // Generate slug using the actual first and last name
    const { generateBaseSlug, generateRandomSuffix } = await import('@/lib/utils/slug');
    const baseSlug = generateBaseSlug(role, firstName || email.split('@')[0], lastName);
    
    let finalSlug = baseSlug;
    const { data: existing } = await adminClient.from('profiles').select('slug').eq('slug', baseSlug).maybeSingle();
    if (existing) {
       finalSlug = `${baseSlug}-${generateRandomSuffix()}`;
    }

    await adminClient.from('profiles').update({ 
      slug: finalSlug,
      first_name: firstName,
      last_name: lastName,
      status: 'active'
    }).eq('user_id', authUser.id);
  }

  // Now sign the user in to establish their session cookie
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: pendingData.password,
  });

  if (signInError) {
    console.error('[SignIn Error] Failed to authenticate user after registration:', signInError);
    return { error: 'Failed to sign in. Please try logging in manually.' };
  }

  // Clean up OTP key
  await adminClient.from('otp_verifications').delete().eq('email', email);

  // After verification, ensure the user is logged in and redirect to onboarding
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function resendOtp(email: string) {
  const adminClient = createAdminClient();

  try {
    const { data: pendingData, error: dbError } = await adminClient
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (dbError || !pendingData) {
      return { error: 'Your signup session has expired. Please sign up again.' };
    }

    // 1. Rate limiting check (60s cooldown)
    const createdTime = new Date(pendingData.created_at).getTime();
    const nowTime = Date.now();
    if (nowTime - createdTime < 60000) {
      return { error: 'Please wait at least 60 seconds before requesting a new code.' };
    }

    // 3. Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // 4. Save with fresh 5-minute expiry and update created_at for rate limiting
    await adminClient
      .from('otp_verifications')
      .update({ otp, expires_at: expiresAt, created_at: new Date().toISOString() })
      .eq('email', email);

    // 6. Resend email
    await sendOtpEmail(email, otp);

    return { success: true, message: 'A new verification code has been sent.' };
  } catch (error: any) {
    console.error('[Resend Error] Failed to resend OTP:', error);
    return { error: 'Failed to resend verification email. Please try again.' };
  }
}
