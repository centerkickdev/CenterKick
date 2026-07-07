'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function uploadSiteAsset(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get('file') as File;
  const path = formData.get('path') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Verify role
  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userRecord?.role !== 'superadmin') {
    throw new Error('Unauthorized');
  }

  const fileName = `${path}-${Date.now()}.${file.name.split('.').pop()}`;
  
  // Ensure bucket exists (helpful for dev environments if migration wasn't run)
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find(b => b.id === 'site-assets')) {
    await supabase.storage.createBucket('site-assets', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'],
      fileSizeLimit: 2097152 // 2MB
    });
  }

  const { data, error } = await supabase.storage
    .from('site-assets')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('site-assets')
    .getPublicUrl(fileName);

  // Shorten URL to just after /public
  const shortenedUrl = publicUrl.split('/public/')[1] ? `/${publicUrl.split('/public/')[1]}` : publicUrl;

  return { publicUrl: shortenedUrl };
}

export async function updateSystemSettings(settings: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userRecord?.role !== 'superadmin') {
    throw new Error('Permission denied: Superadmin role required');
  }

  const { error } = await supabase
    .from('site_content')
    .upsert({
      page: 'settings',
      section: 'system',
      content: settings,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'page,section'
    });

  if (error) {
    console.error('Database Error (site_content):', error);
    throw new Error(`Failed to update settings: ${error.message}`);
  }

  revalidatePath('/admin/settings');
  revalidatePath('/', 'layout'); // Ensure metadata updates sitewide
  return { success: true };
}

import { Resend } from 'resend';

export async function sendTestEmail(apiKey: string, fromEmail: string, targetEmail: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Verify role
  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userRecord?.role !== 'superadmin') {
    throw new Error('Unauthorized');
  }

  const resend = new Resend(apiKey);
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail || 'CenterKick <onboarding@resend.dev>',
      to: [targetEmail],
      subject: 'CenterKick - Connection Test',
      html: `
        <div style="font-family: sans-serif; padding: 40px; color: #171717; background-color: #f9fafb; border-radius: 20px; border: 1px solid #e5e7eb;">
            <h1 style="color: #B91C1C; margin-bottom: 24px;">Connection Secure!</h1>
            <p>This is a test email from your CenterKick System Settings.</p>
            <p>If you are reading this, your Resend API integration is correctly configured and active.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="font-size: 11px; color: #9ca3af; text-transform: ; font-weight: 700; letter-spacing: 0.05em;">
                Verified at: ${new Date().toLocaleString()}
            </p>
        </div>
      `,
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    throw new Error(`Email failed: ${err.message || 'Unknown error'}`);
  }
}

export async function clearSystemCache() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userRecord?.role !== 'superadmin') {
    throw new Error('Unauthorized');
  }

  // Logic to clear application cache or triggering revalidation
  revalidatePath('/', 'layout');
  
  return { success: true };
}

import { COUNTRIES } from '@/lib/constants/countries';
import { getFlagCode } from '@/lib/utils/flags';

/**
 * Verify role for data management page actions: superadmin, admin, operations
 */
async function verifyDataManagementAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userRecord || !['superadmin', 'admin', 'operations'].includes(userRecord.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
}

// Football Constants Management
export async function getCountries() {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('name');
  
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addCountry(data: any) {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  const { error } = await supabase
    .from('countries')
    .insert([data]);
  
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/data-management');
  return { success: true };
}

export async function updateCountry(id: string, data: any) {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  const { error } = await supabase
    .from('countries')
    .update(data)
    .eq('id', id);
  
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/data-management');
  return { success: true };
}

export async function deleteCountry(id: string) {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  const { error } = await supabase
    .from('countries')
    .delete()
    .eq('id', id);
  
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/data-management');
  return { success: true };
}

export async function getLeagues() {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('leagues')
    .select('*, countries(name, code, flag_url)')
    .order('name');
  
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addLeague(data: any) {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  const { error } = await supabase
    .from('leagues')
    .insert([data]);
  
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/data-management');
  return { success: true };
}

export async function updateLeague(id: string, data: any) {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  const { error } = await supabase
    .from('leagues')
    .update(data)
    .eq('id', id);
  
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/data-management');
  return { success: true };
}

export async function deleteLeague(id: string) {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  const { error } = await supabase
    .from('leagues')
    .delete()
    .eq('id', id);
  
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/data-management');
  return { success: true };
}

export async function getClubs(leagueId?: string) {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  let query = supabase.from('clubs').select('*, leagues(name)');
  
  if (leagueId) {
    query = query.eq('league_id', leagueId);
  }
  
  const { data, error } = await query.order('name');
  
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addClub(data: any) {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  const { error } = await supabase
    .from('clubs')
    .insert([data]);
  
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/data-management');
  return { success: true };
}

export async function updateClub(id: string, data: any) {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  const { error } = await supabase
    .from('clubs')
    .update(data)
    .eq('id', id);
  
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/data-management');
  return { success: true };
}

export async function deleteClub(id: string) {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  const { error } = await supabase
    .from('clubs')
    .delete()
    .eq('id', id);
  
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/data-management');
  return { success: true };
}

export async function getSeasons() {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .order('sort_order', { ascending: false });
  
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addSeason(data: any) {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  const { error } = await supabase
    .from('seasons')
    .insert([data]);
  
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/data-management');
  return { success: true };
}

export async function updateSeason(id: string, data: any) {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  const { error } = await supabase
    .from('seasons')
    .update(data)
    .eq('id', id);
  
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/data-management');
  return { success: true };
}

export async function deleteSeason(id: string) {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  const { error } = await supabase
    .from('seasons')
    .delete()
    .eq('id', id);
  
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/data-management');
  return { success: true };
}

import { FOOTBALL_DATA } from '@/lib/constants/football_data';

export async function seedFootballData() {
  await verifyDataManagementAccess();
  const supabase = await createClient();
  
  // 1. Seed Countries
  for (const countryName of COUNTRIES) {
    const code = getFlagCode(countryName);
    await supabase
      .from('countries')
      .upsert({ 
        name: countryName, 
        code: code || countryName.slice(0, 2).toUpperCase(),
        flag_url: code ? `https://flagcdn.com/w40/${code.toLowerCase()}.png` : null
      }, { onConflict: 'name' });
  }

  // 2. Seed Leagues and Clubs
  for (const leagueData of FOOTBALL_DATA.leagues) {
    // Get country ID
    const { data: country } = await supabase
      .from('countries')
      .select('id')
      .eq('name', leagueData.country)
      .single();

    const { data: league, error: lError } = await supabase
      .from('leagues')
      .upsert({ 
        name: leagueData.name, 
        country_id: country?.id || null 
      }, { onConflict: 'name' })
      .select()
      .single();
    
    if (lError) continue;

    for (const clubName of leagueData.clubs) {
      await supabase
        .from('clubs')
        .upsert({ name: clubName, league_id: league.id }, { onConflict: 'name,league_id' });
    }
  }

  // 3. Seed Seasons
  const currentYear = new Date().getFullYear();
  for (let year = 2000; year <= currentYear; year++) {
    const seasonName = `${year}/${(year + 1).toString().slice(-2)}`;
    await supabase
      .from('seasons')
      .upsert({ 
        name: seasonName, 
        sort_order: year,
        is_current: year === currentYear
      }, { onConflict: 'name' });
  }

  revalidatePath('/admin/data-management');
  return { success: true };
}
