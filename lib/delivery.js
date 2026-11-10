import { randomUUID } from 'node:crypto';
import { redis, key, QUEUE, getAttempt, updateAttempt, encodeAttempt } from './store.js';
import { makeMail } from './analysis.js';
import { emailConfig } from './email-config.js';
const RETRY_WINDOW = 23 * 3600000; // Resend idempotency keys last 24 hours.
export async function deliver(id) {
  const email = emailConfig();
  const lock = randomUUID();
  if (!await redis(['SET', `${key(id)}:lock`, lock, 'NX', 'EX', 120])) return { pending: true };
  try {
    let record = await getAttempt(id);
    if (record.result) { await redis(['ZREM', QUEUE, id]); return record.result; }
    if (record.state === 'active') {
      if (Date.now() < record.deadline) return { pending: true };
      record = await updateAttempt(id, record.revision, record.answers, record.confidence, true);
    }
    if (record.firstDeliveryAt && Date.now() - record.firstDeliveryAt >= RETRY_WINDOW) {
      await redis(['ZREM', QUEUE, id]);
      throw Object.assign(Error('Automatic retry window ended. Ask your teacher to reconcile this attempt with the email provider before any further send.'), { status: 502 });
    }
    if (!record.mail) {
      const report = makeMail(record);
      record.mail = { from: email.from, to: ['aymane.chellak@outlook.fr'], subject: `SIRA assessment · ${record.learnerCode} · ${report.score.correct}/60`, text: report.text, html: report.html };
      record.summary = { score: report.score.correct, total: 60, percent: report.score.percent, answered: report.score.answered };
      record.firstDeliveryAt = Date.now();
      // Freeze the exact message before the first external send, so all retries are identical.
      if (!await redis(['SET', key(id), encodeAttempt(record), 'XX', 'KEEPTTL'])) throw Error('Attempt no longer exists');
    }
    await redis(['ZADD', QUEUE, Date.now() + 60000, id]);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${email.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `sira-${id}` },
      body: JSON.stringify(record.mail), signal: AbortSignal.timeout(10000)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || typeof data.id !== 'string' || !data.id) throw Object.assign(Error('Email acceptance has not been confirmed. Your submission is saved on the server and queued for retry.'), { status: 502 });
    record.result = { ok: true, ...record.summary, submittedAt: new Date(record.submittedAt).toISOString(), providerId: data.id, expired: Boolean(record.expired) };
    record.state = 'accepted';
    record.acceptedAt = Date.now();
    delete record.mail;
    if (!await redis(['SET', key(id), encodeAttempt(record), 'XX', 'KEEPTTL'])) throw Error('Attempt no longer exists');
    await redis(['ZREM', QUEUE, id]);
    return record.result;
  } finally {
    await redis(['EVAL', "if redis.call('GET',KEYS[1])==ARGV[1] then return redis.call('DEL',KEYS[1]) end return 0", 1, `${key(id)}:lock`, lock]);
  }
}
