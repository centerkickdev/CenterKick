const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1431324155629-1a6d0a11f472?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop'
];

async function run() {
  const { data: posts, error } = await supabase
    .from('cms_posts')
    .select('id, title, cover_image_url');
  
  if (error) {
    console.error(error);
    return;
  }

  console.log(`Checking ${posts.length} posts...`);
  let fixCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const img = post.cover_image_url;
    if (!img || img === 'null' || img.trim() === '') {
      const newImg = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
      console.log(`Fixing post: "${post.title}" (ID: ${post.id}) -> setting image to ${newImg}`);
      const { error: updErr } = await supabase
        .from('cms_posts')
        .update({ cover_image_url: newImg })
        .eq('id', post.id);
      if (updErr) {
        console.error(`Failed to update post ${post.id}:`, updErr);
      } else {
        fixCount++;
      }
    }
  }
  console.log(`Done! Fixed ${fixCount} posts.`);
}

run();
