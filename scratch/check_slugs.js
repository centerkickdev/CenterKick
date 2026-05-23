const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: profiles, error } = await supabase.from('profiles').select('id, first_name, last_name, role, status, slug');
  if (error) {
    console.error(error);
    return;
  }
  console.log('Total profiles:', profiles.length);
  console.log(profiles.map(p => ({
    id: p.id,
    name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
    role: p.role,
    status: p.status,
    slug: p.slug
  })));
}

run();
