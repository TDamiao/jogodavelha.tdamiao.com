import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', quiet: true });

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required');
}

const redis = new Redis({ url, token });
const checkedAt = new Date().toISOString();

await redis.set('system:keep-alive', checkedAt, { ex: 30 * 24 * 60 * 60 });
console.log(`Redis keep-alive completed at ${checkedAt}`);
