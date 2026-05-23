const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Env vars!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('profiles').select('id, role, first_name, last_name, agency_name, current_club').limit(50);
  if (error) {
    console.error("Error:", error);
  } else {
    const roles = {};
    data.forEach(p => {
      if (!roles[p.role]) roles[p.role] = [];
      roles[p.role].push(p);
    });
    console.log("Profiles by role:", JSON.stringify(roles, null, 2));
  }
}

check();
