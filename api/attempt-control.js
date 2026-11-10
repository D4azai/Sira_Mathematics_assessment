import { timingSafeEqual } from 'node:crypto';
import { endpoint, fail, rateLimit } from '../lib/http.js';
import { json, validLearnerName } from '../lib/session.js';
import { listActiveAttempts, cancelAttempt } from '../lib/attempt-admin.js';
export default endpoint('POST', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  const supplied = Buffer.from(req.headers.authorization || ''), expected = Buffer.from(`Bearer ${secret}`);
  if (!secret || secret.length < 32 || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) fail(401, 'Unauthorized');
  await rateLimit(req, 'attempt-control', 10);
  const { action, studentName, attemptId } = req.body;
  if (!validLearnerName(studentName)) fail(400, 'Enter the student name');
  if (action === 'list') return json(res, 200, { attempts: await listActiveAttempts(studentName) });
  if (action !== 'cancel' || !/^[a-f0-9-]{36}$/.test(attemptId || '')) fail(400, 'Provide an active attempt ID to reset');
  return json(res, 200, await cancelAttempt(attemptId, studentName));
});
