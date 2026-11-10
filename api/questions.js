import { QUESTIONS } from '../lib/questions.js';
import { json, verifySession, VERSION } from '../lib/session.js';
import { getAttempt, publicAttempt } from '../lib/store.js';
import { endpoint, rateLimit } from '../lib/http.js';
export default endpoint('GET', async (req, res) => {
  const session = verifySession(req.headers.authorization?.replace(/^Bearer /, ''));
  await rateLimit(req, 'read', 120);
  const attempt = await getAttempt(session.id);
  const questions = QUESTIONS.map(({ id, topic, skill, level, prompt, options }) => ({ id, topic, skill, level, prompt, options }));
  return json(res, 200, { questions, version: VERSION, serverNow: Date.now(), attempt: publicAttempt(attempt) });
});
