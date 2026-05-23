const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error(error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Columns in profiles table:', Object.keys(data[0]));
    console.log('Sample profile record:', data[0]);
  } else {
    console.log('No profiles found');
  }
}

run();
