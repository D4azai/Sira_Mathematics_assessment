import { timingSafeEqual } from 'node:crypto';
import { endpoint, fail, rateLimit } from '../lib/http.js';
import { json } from '../lib/session.js';
import { makeMail } from '../lib/analysis.js';
import { emailConfig } from '../lib/email-config.js';

// Administrative self-test only. No caller-controlled recipient or student record.
export default endpoint('POST', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  const supplied = Buffer.from(req.headers.authorization || ''), expected = Buffer.from(`Bearer ${secret}`);
  if (!secret || secret.length < 32 || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) fail(401, 'Unauthorized');
  const email = emailConfig();
  if (!email.apiKey || !email.from) fail(503, 'Email configuration is incomplete');
  await rateLimit(req, 'email-test', 4);
  // Stable daily message and key make retries safe after a response is lost.
  const day = new Date().toISOString().slice(0, 10), submittedAt = Date.parse(`${day}T12:00:00Z`);
  const report = makeMail({ id: `synthetic-email-check-${day}`, learnerCode: 'SYNTHETIC_TEST_ONLY', startedAt: submittedAt - 60000, submittedAt, answers: Array.from({ length: 60 }, (_, i) => i % 4), confidence: Array(60).fill('unsure'), expired: false });
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${email.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `sira-email-self-test-${day}` },
    body: JSON.stringify({ from: email.from, to: ['aymane.chellak@outlook.fr'], subject: '[SIRA TEST] Assessment report delivery check', text: `SYNTHETIC TEST ONLY — this is not a student result.\n\n${report.text}`, html: `<p><strong>SYNTHETIC TEST ONLY — this is not a student result.</strong></p>${report.html}` })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.id) {
    if (response.status === 403) fail(502, 'Resend rejected the sender or recipient. The testing sender requires the Resend account email to be aymane.chellak@outlook.fr. Otherwise configure a verified sender domain.');
    if (response.status === 401) fail(502, 'Resend rejected the API key. Check that Vercel contains the actual key value, not its name.');
    fail(502, `Email acceptance not confirmed (provider status ${response.status}).`);
  }
  return json(res, 200, { accepted: true, providerId: result.id, recipient: 'aymane.chellak@outlook.fr', synthetic: true });
});
