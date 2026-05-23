const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const roles = ['player', 'coach', 'agent', 'scout', 'organization'];
  for (const role of roles) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, user:users!profiles_user_id_fkey!inner(role)')
      .eq('user.role', role)
      .eq('status', 'active');
    console.log(`${role} active count:`, data ? data.length : 'null', error || 'No error');
  }
}

run();
