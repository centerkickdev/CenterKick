const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Use ANON key, not service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('--- Testing query WITH users inner join ---');
  const { data: withJoin, error: err1 } = await supabase
    .from('profiles')
    .select('*, user:users!profiles_user_id_fkey!inner(role)')
    .eq('user.role', 'player')
    .eq('status', 'active');
  
  if (err1) console.error('Join Error:', err1.message);
  else console.log('Join Results Count:', withJoin.length);

  console.log('--- Testing query WITHOUT users join (direct profiles.role) ---');
  const { data: withoutJoin, error: err2 } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'player')
    .eq('status', 'active');

  if (err2) console.error('Direct Error:', err2.message);
  else console.log('Direct Results Count:', withoutJoin.length);
}

run();
