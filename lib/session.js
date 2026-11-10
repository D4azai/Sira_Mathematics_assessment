import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
export const DURATION = 3600000;
export const RETENTION = 30 * 86400;
export const VERSION = 2;
export function validLearnerName(value) {
  return typeof value === 'string' && /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} ._'’\-]{1,79}$/u.test(value);
}
export function makeSession(learnerCode, now = Date.now()) {
  if ((process.env.ASSESSMENT_SECRET?.length || 0) < 32) throw Error('Signing secret not configured');
  if (!validLearnerName(learnerCode)) throw Error('Invalid student name');
  const payload = { v: VERSION, id: randomUUID(), learnerCode, startedAt: now };
  const raw = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', process.env.ASSESSMENT_SECRET).update(raw).digest('base64url');
  return { ...payload, token: `${raw}.${sig}`, deadline: now + DURATION, durationSeconds: 3600 };
}
export function verifySession(token, now = Date.now()) {
  const invalid = () => { throw Object.assign(Error('Invalid or expired assessment session'), { status: 401 }); };
  if ((process.env.ASSESSMENT_SECRET?.length || 0) < 32 || typeof token !== 'string' || token.length > 900) invalid();
  const parts = token.split('.');
  if (parts.length !== 2) invalid();
  const a = Buffer.from(parts[1]);
  const b = Buffer.from(createHmac('sha256', process.env.ASSESSMENT_SECRET).update(parts[0]).digest('base64url'));
  if (a.length !== b.length || !timingSafeEqual(a, b)) invalid();
  let p;
  try { p = JSON.parse(Buffer.from(parts[0], 'base64url').toString()); } catch { invalid(); }
  if (p.v !== VERSION || !/^[a-f0-9-]{36}$/.test(p.id) || !validLearnerName(p.learnerCode) || !Number.isSafeInteger(p.startedAt) || p.startedAt > now + 30000 || now - p.startedAt > RETENTION * 1000) invalid();
  return { ...p, deadline: p.startedAt + DURATION };
}
export function escapeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
export function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json(body);
}
