import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const HOUR_MS = 60 * 60 * 1000;
const GRACE_MS = 5 * 60 * 1000;
const secret = () => process.env.ASSESSMENT_SECRET;

export function makeSession(learnerCode) {
  if (!secret() || secret().length < 32) throw new Error('Assessment signing secret not configured');
  const payload = { v: 1, learnerCode, startedAt: Date.now(), nonce: randomBytes(12).toString('hex') };
  const raw = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret()).update(raw).digest('base64url');
  return { token: raw + '.' + sig, startedAt: payload.startedAt, durationSeconds: 3600 };
}

export function verifySession(token) {
  if (!secret() || secret().length < 32 || typeof token !== 'string' || token.length > 900) throw new Error('Invalid assessment session');
  const parts = token.split('.');
  if (parts.length !== 2) throw new Error('Invalid assessment session');
  const expected = createHmac('sha256', secret()).update(parts[0]).digest('base64url');
  const a = Buffer.from(parts[1]), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a,b)) throw new Error('Invalid assessment session');
  let payload;
  try { payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')); }
  catch { throw new Error('Invalid assessment session'); }
  if (payload.v !== 1 || !/^[A-Za-z0-9_-]{2,32}$/.test(payload.learnerCode) || !Number.isFinite(payload.startedAt)) throw new Error('Invalid assessment session');
  const elapsed = Date.now() - payload.startedAt;
  if (elapsed < -30000 || elapsed > HOUR_MS + GRACE_MS) throw new Error('Assessment session has expired');
  return { ...payload, elapsedSeconds: Math.min(3600, Math.max(0, Math.floor(elapsed/1000))) };
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function json(res, status, body) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  return res.status(status).json(body);
}
