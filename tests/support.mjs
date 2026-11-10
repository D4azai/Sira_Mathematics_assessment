import { UPDATE_SCRIPT } from '../lib/store.js';
// Transport double for deterministic failures; does not claim to execute Redis Lua.
export function serviceDouble() {
  const values = new Map(), queue = new Map(), counts = new Map();
  let emailStatus = 200, emailId = 'test-provider-id', sends = [];
  function command(c) {
    const [op, k, ...args] = c;
    if (op === 'GET') return values.get(k) ?? null;
    if (op === 'SET') { if (args.includes('NX') && values.has(k)) return null; values.set(k, args[0]); return 'OK'; }
    if (op === 'DEL') return [k, ...args].reduce((count, name) => count + Number(values.delete(name) || queue.delete(name)), 0);
    if (op === 'TIME') return [String(Math.floor(Date.now() / 1000)), String((Date.now() % 1000) * 1000)];
    if (op === 'TTL') return values.has(k) ? 60 : -2;
    if (op === 'ZADD') { queue.set(args[1], Number(args[0])); return 1; }
    if (op === 'ZREM') return Number(queue.delete(args[0]));
    if (op === 'ZRANGEBYSCORE') return [...queue].filter(([, due]) => due <= Number(args[1])).slice(0, 10).map(([id]) => id);
    if (op === 'EVAL') {
      const n = Number(args[0]), keys = args.slice(1, n + 1), argv = args.slice(n + 1);
      if (k.includes("redis.call('INCR'")) { const count = (counts.get(keys[0]) || 0) + 1; counts.set(keys[0], count); return count; }
      if (k === UPDATE_SCRIPT) {
        const raw = values.get(keys[0]); if (!raw) return 'missing';
        const r = JSON.parse(raw), now = Date.now();
        if (r.state !== 'active') return raw;
        if (now < r.deadline) {
          if (Number(argv[0]) !== r.revision) return 'conflict';
          r.answersJson = argv[1]; r.confidenceJson = argv[2]; delete r.answers; delete r.confidence; r.revision++; r.savedAt = now;
        }
        if (argv[3] === 'submit' || now >= r.deadline) { r.state = 'frozen'; r.submittedAt = Math.min(now, r.deadline); r.expired = now >= r.deadline; queue.set(r.id, now); }
        const out = JSON.stringify(r); values.set(keys[0], out); return out;
      }
      if (k.includes("redis.call('GET'")) { if (values.get(keys[0]) === argv[0]) return Number(values.delete(keys[0])); return 0; }
      values.set(keys[0], argv[0]); queue.set(argv[3], Number(argv[2])); return 1;
    }
    throw Error(`Unsupported test command: ${op}`);
  }
  return {
    values, queue, sends,
    setEmail(status, id = 'test-provider-id') { emailStatus = status; emailId = id; },
    fetch: async (url, options) => {
      if (String(url).includes('redis.test')) return Response.json({ result: command(JSON.parse(options.body)) });
      if (String(url) === 'https://api.resend.com/emails') { sends.push({ body: JSON.parse(options.body), headers: options.headers }); return Response.json(emailId ? { id: emailId } : {}, { status: emailStatus }); }
      throw Error(`Unexpected outbound request: ${url}`);
    }
  };
}
export function configure() {
  Object.assign(process.env, { ASSESSMENT_SECRET: 'test-only-signing-secret-32-characters-long', ASSESSMENT_ACCESS_CODE: 'test-private-code', RESEND_API_KEY: 'test-only', RESEND_FROM_EMAIL: 'test@example.test', UPSTASH_REDIS_REST_URL: 'https://redis.test', UPSTASH_REDIS_REST_TOKEN: 'test-only', CRON_SECRET: 'test-only-cron-secret-32-characters-long', RETRY_SCHEDULE_CONFIRMED: 'true', SIRA_SERVICES_APPROVED: 'true' });
}
export async function invoke(handler, body, options = {}) {
  let status, data; const headers = {};
  const req = { method: 'POST', headers: { 'content-type': 'application/json', host: 'localhost', ...options.headers }, body, ...options };
  const res = { setHeader(k, v) { headers[k] = v; }, status(value) { status = value; return this; }, json(value) { data = value; return this; } };
  await handler(req, res); return { status, data, headers };
}
