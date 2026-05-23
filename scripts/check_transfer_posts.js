const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: posts, error } = await supabase
    .from('cms_posts')
    .select('id, title, category_id, excerpt, published_at, cover_image_url')
    .or('category_id.eq.2978eee7-d598-4097-b11a-805a280c7b06,category_id.eq.82ad8313-7dad-451b-86fc-8f22e0d61703');

  if (error) {
    console.error(error);
    return;
  }
  console.log('Transfer posts found:', posts);
}

run();
