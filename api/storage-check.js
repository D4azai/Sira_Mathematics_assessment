import { timingSafeEqual } from 'node:crypto';
import { endpoint, fail, rateLimit } from '../lib/http.js';
import { json } from '../lib/session.js';
import { checkStorage } from '../lib/storage-check.js';
export default endpoint('POST', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  const supplied = Buffer.from(req.headers.authorization || ''), expected = Buffer.from(`Bearer ${secret}`);
  if (!secret || secret.length < 32 || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) fail(401, 'Unauthorized');
  await rateLimit(req, 'storage-check', 4);
  return json(res, 200, { verified: true, synthetic: true, checks: await checkStorage() });
});
