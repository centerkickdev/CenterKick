const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function run() {
  console.log('Flushing all Redis cache keys...');
  const res = await redis.flushall();
  console.log(`Flushall result: ${res}`);
  console.log('Done!');
}

run();
