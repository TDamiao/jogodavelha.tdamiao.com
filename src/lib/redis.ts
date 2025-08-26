let UPSTASH_URL = import.meta.env.VITE_UPSTASH_REDIS_REST_URL as string | undefined;
let UPSTASH_TOKEN = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN as string | undefined;

// Allow the REST URL env to contain the full redis:// connection string
if (UPSTASH_URL?.startsWith('redis://')) {
  try {
    const url = new URL(UPSTASH_URL);
    UPSTASH_URL = `https://${url.hostname}`;
    UPSTASH_TOKEN = url.password;
  } catch (e) {
    console.error('Invalid VITE_UPSTASH_REDIS_REST_URL', e);
  }
}

// Allow using a single Upstash Redis URL like the one used with redis-cli
// e.g. redis://default:token@host:6379
if ((!UPSTASH_URL || !UPSTASH_TOKEN) && import.meta.env.VITE_UPSTASH_REDIS_URL) {
  try {
    const url = new URL(import.meta.env.VITE_UPSTASH_REDIS_URL as string);
    UPSTASH_URL = `https://${url.hostname}`;
    UPSTASH_TOKEN = url.password;
  } catch (e) {
    console.error('Invalid VITE_UPSTASH_REDIS_URL', e);
  }
}

async function request<T>(path: string): Promise<T> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    throw new Error('Upstash Redis credentials are not configured');
  }

  const res = await fetch(`${UPSTASH_URL}/${path}`, {
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstash request failed with ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function redisSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  const ex = ttlSeconds ? `?EX=${ttlSeconds}` : '';
  await request<void>(`set/${key}/${encodeURIComponent(value)}${ex}`);
}

export async function redisGet(key: string): Promise<string | null> {
  const data = await request<{ result?: string }>(`get/${key}`);
  return data.result ?? null;
}

export async function redisDel(key: string): Promise<void> {
  await request<void>(`del/${key}`);
}
