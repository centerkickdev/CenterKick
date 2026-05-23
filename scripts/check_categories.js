const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: cats, error: err1 } = await supabase.from('blog_categories').select('*');
  console.log('Categories:', cats);

  const { data: tags, error: err2 } = await supabase.from('blog_tags').select('*');
  console.log('Tags:', tags);

  const { data: posts, error: err3 } = await supabase
    .from('cms_posts')
    .select('id, title, category_id, excerpt, published_at, cover_image_url')
    .limit(5);
  console.log('Sample posts:', posts);
}

run();
