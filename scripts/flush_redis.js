const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function run() {
  const keys = [
    'home_site_content',
    'home_latest_news_10',
    'home_players_list',
    'home_coaches_list',
    'home_agents_scouts_list',
    'home_organizations_list',
    'home_highlight_posts_5'
  ];
  for (const key of keys) {
    try {
      await redis.del(key);
      console.log(`Deleted key: ${key}`);
    } catch (e) {
      console.error(`Error deleting key ${key}:`, e);
    }
  }
}

run();
