const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: users, error: uErr } = await supabase.from('users').select('*');
  console.log('--- Users ---');
  if (uErr) console.error(uErr);
  else console.log(users.map(u => ({ id: u.id, email: u.email, role: u.role })));

  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log('--- Profiles ---');
  if (pErr) console.error(pErr);
  else console.log(profiles.map(p => ({ user_id: p.user_id, first_name: p.first_name, last_name: p.last_name, role: p.role, status: p.status })));
}

run();
