// Marketplace prefixes vary. Select a complete URL/token pair from one source.
export function storageConfig() {
  for (const [urlKey, tokenKey] of [
    ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
    ['UPSTASH_REDIS_KV_REST_API_URL', 'UPSTASH_REDIS_KV_REST_API_TOKEN']
  ]) {
    const url = process.env[urlKey], token = process.env[tokenKey];
    if (url && token) return { url, token };
  }
  return { url: undefined, token: undefined };
}
