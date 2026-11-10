import { json, verifySession } from '../lib/session.js';
import { updateAttempt, publicAttempt } from '../lib/store.js';
import { endpoint, rateLimit, validateResponses, fail } from '../lib/http.js';
export default endpoint('POST', async (req, res) => {
  const session = verifySession(req.body.token);
  await rateLimit(req, 'save', 120);
  const { answers, confidence, revision } = req.body;
  validateResponses(answers, confidence);
  if (!Number.isSafeInteger(revision) || revision < 0) fail(400, 'Invalid revision');
  const attempt = await updateAttempt(session.id, revision, answers, confidence);
  return json(res, 200, { attempt: publicAttempt(attempt), serverNow: Date.now() });
});
