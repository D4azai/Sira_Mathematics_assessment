import { makeSession, DURATION } from './session.js';
import { redis, createAttempt, getAttempt } from './store.js';
const POINTER = 'sira:synthetic-expiry-check';
export async function expiryCheck(queue = false) {
  let id = await redis(['GET', POINTER]);
  if (!id && queue) {
    const session = makeSession('SYNTHETIC_EXPIRY_CHECK', Date.now() - DURATION - 1000);
    await createAttempt(session);
    id = session.id;
    await redis(['SET', POINTER, id, 'EX', 3600]);
  }
  if (!id) return { queued: false, synthetic: true };
  const attempt = await getAttempt(id);
  // Administrative check returns only a synthetic receipt, never student data.
  return { queued: true, synthetic: true, attemptId: id, state: attempt.state, expired: Boolean(attempt.expired), result: attempt.result || null };
}
