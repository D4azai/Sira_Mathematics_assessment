import { timingSafeEqual } from 'node:crypto';
import { makeSession, json, validLearnerName } from '../lib/session.js';
import { requireReady } from '../lib/config.js';
import { endpoint, fail, rateLimit } from '../lib/http.js';
import { createAttempt } from '../lib/store.js';
export default endpoint('POST', async (req, res) => {
  await requireReady();
  await rateLimit(req, 'start', 6);
  const { accessCode, learnerCode: enteredName } = req.body;
  const learnerCode = typeof enteredName === 'string' ? enteredName.trim() : enteredName;
  if (typeof accessCode !== 'string' || accessCode.length > 100 || !validLearnerName(learnerCode)) fail(400, 'Enter your full name and assessment access code');
  const a = Buffer.from(accessCode), b = Buffer.from(process.env.ASSESSMENT_ACCESS_CODE);
  if (a.length !== b.length || !timingSafeEqual(a, b)) fail(403, 'Incorrect assessment access code');
  const session = makeSession(learnerCode);
  await createAttempt(session);
  return json(res, 200, { ...session, serverNow: Date.now(), revision: 0 });
});
