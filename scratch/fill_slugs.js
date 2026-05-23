const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function slugify(text) {
  if (!text) return 'profile';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

async function run() {
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log(`Checking ${profiles.length} profiles...`);
  const usedSlugs = new Set();

  for (const profile of profiles) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profile.slug || '');
    let needUpdate = !profile.slug || isUuid;

    let baseSlug = profile.slug;
    if (needUpdate) {
      const rolePrefixMap = {
        player: 'CKPlayer',
        coach: 'CKCoach',
        agent: 'CKAgent',
        scout: 'CKScout',
        organization: 'CKOrg'
      };
      const prefix = rolePrefixMap[profile.role] || 'CKProfile';
      
      const rawName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.agency_name || 'anonymous';
      baseSlug = `${prefix}-${slugify(rawName)}`;
    }

    // Ensure slug uniqueness
    let finalSlug = baseSlug;
    let counter = 1;
    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    usedSlugs.add(finalSlug);

    if (needUpdate || finalSlug !== profile.slug) {
      console.log(`Updating profile ${profile.id} (${profile.first_name || ''} ${profile.last_name || ''}): ${profile.slug} -> ${finalSlug}`);
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ slug: finalSlug })
        .eq('id', profile.id);
      
      if (updateErr) {
        console.error(`Failed to update ${profile.id}:`, updateErr.message);
      }
    } else {
      usedSlugs.add(profile.slug);
    }
  }

  console.log('All slugs generated and updated successfully!');
}

run();
