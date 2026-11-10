import { createHmac } from 'node:crypto';
import { json } from './session.js';
import { redis } from './store.js';
export function fail(status, message) { throw Object.assign(Error(message), { status }); }
export function endpoint(method, fn) {
  return async (req, res) => {
    try {
      if (req.method !== method) { res.setHeader('Allow', method); fail(405, 'Method not allowed'); }
      if (method === 'POST') {
        if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) fail(415, 'Send application/json');
        const origin = req.headers.origin;
        if (origin && new URL(origin).host !== req.headers.host) fail(403, 'Cross-site request rejected');
        if (req.headers['sec-fetch-site'] === 'cross-site') fail(403, 'Cross-site request rejected');
        if (Number(req.headers['content-length']) > 16384 || Buffer.byteLength(JSON.stringify(req.body ?? null)) > 16384) fail(413, 'Request too large');
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) fail(400, 'Invalid request body');
      }
      await fn(req, res);
    } catch (e) {
      const status = e.status || 503;
      if (status === 429) res.setHeader('Retry-After', '60');
      return json(res, status, { error: e.status ? e.message : 'Service temporarily unavailable. Responses remain saved; please retry.' });
    }
  };
}
export async function rateLimit(req, scope, limit, window = 60) {
  const ip = req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const hash = createHmac('sha256', process.env.ASSESSMENT_SECRET).update(String(ip)).digest('hex');
  const key = `sira:rate:${scope}:${hash}:${Math.floor(Date.now() / (window * 1000))}`;
  const count = await redis(['EVAL', "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n", 1, key, window]);
  if (count > limit) fail(429, 'Too many requests. Please wait a minute and retry.');
}
export function validateResponses(answers, confidence) {
  if (!Array.isArray(answers) || answers.length !== 60 || answers.some(a => a !== null && (!Number.isInteger(a) || a < 0 || a > 3))) fail(400, 'Invalid answer set');
  if (!Array.isArray(confidence) || confidence.length !== 60 || confidence.some(a => a !== null && !['sure', 'unsure', 'guess'].includes(a))) fail(400, 'Invalid confidence values');
}
