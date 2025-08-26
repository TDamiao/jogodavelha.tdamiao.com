const UPSTASH_URL = import.meta.env.VITE_UPSTASH_REDIS_REST_URL as string;
const UPSTASH_TOKEN = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN as string;

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${UPSTASH_URL}/${path}`, {
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`
    }
  });
  return res.json();
}

export async function redisSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  const ex = ttlSeconds ? `?EX=${ttlSeconds}` : '';
  await request(`set/${key}/${encodeURIComponent(value)}${ex}`);
}

export async function redisGet(key: string): Promise<string | null> {
  const data = await request<{ result?: string }>(`get/${key}`);
  return data.result ?? null;
}

export async function redisDel(key: string): Promise<void> {
  await request(`del/${key}`);
}
