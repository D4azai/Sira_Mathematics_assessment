import { json, verifySession } from '../lib/session.js';
import { updateAttempt } from '../lib/store.js';
import { endpoint, rateLimit, validateResponses, fail } from '../lib/http.js';
import { deliver } from '../lib/delivery.js';
export default endpoint('POST', async (req, res) => {
  const session = verifySession(req.body.token);
  await rateLimit(req, 'submit', 20);
  const { answers, confidence, revision } = req.body;
  validateResponses(answers, confidence);
  if (!Number.isSafeInteger(revision) || revision < 0) fail(400, 'Invalid revision');
  await updateAttempt(session.id, revision, answers, confidence, true);
  const result = await deliver(session.id);
  return json(res, result.pending ? 202 : 200, result);
});
