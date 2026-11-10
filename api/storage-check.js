import { timingSafeEqual } from 'node:crypto';
import { endpoint, fail, rateLimit } from '../lib/http.js';
import { json } from '../lib/session.js';
import { checkStorage } from '../lib/storage-check.js';
import { expiryCheck } from '../lib/expiry-check.js';
export default endpoint('POST', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  const supplied = Buffer.from(req.headers.authorization || ''), expected = Buffer.from(`Bearer ${secret}`);
  if (!secret || secret.length < 32 || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) fail(401, 'Unauthorized');
  await rateLimit(req, 'storage-check', 4);
  if (req.body.action === 'queue-expiry') return json(res, 200, await expiryCheck(true));
  if (req.body.action === 'expiry-status') return json(res, 200, await expiryCheck());
  return json(res, 200, { verified: true, synthetic: true, checks: await checkStorage() });
});
