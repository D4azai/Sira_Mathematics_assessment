import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { redis, UPDATE_SCRIPT, encodeAttempt, decodeAttempt } from './store.js';

// Exercises the production Lua on isolated, expiring synthetic keys. No mail queue.
export async function checkStorage() {
  const id = randomUUID(), key = `sira:integration:${id}`, queue = `${key}:queue`;
  const empty = Array(60).fill(null);
  let stage = 'clock';
  const update = (revision, answers, submit = false) => redis(['EVAL', UPDATE_SCRIPT, 2, key, queue, revision, JSON.stringify(answers), JSON.stringify(empty), submit ? 'submit' : 'save']);
  try {
    const [seconds, micros] = await redis(['TIME']);
    const now = Number(seconds) * 1000 + Math.floor(Number(micros) / 1000);
    stage = 'create';
    const record = { id, learnerCode: 'SYNTHETIC_CHECK', startedAt: now, deadline: now + 60000, state: 'active', revision: 0, answers: empty, confidence: empty };
    await redis(['SET', key, encodeAttempt(record), 'EX', 60]);
    const answers = [...empty]; answers[0] = 1;
    stage = 'save';
    const saved = decodeAttempt(await update(0, answers));
    assert.equal(saved.answers[0], 1); assert.equal(saved.answers.length, 60);
    assert.equal(saved.answers[59], null); assert.equal(saved.confidence.length, 60);
    assert.equal(saved.confidence[59], null);
    stage = 'revision';
    assert.equal(await update(0, answers), 'conflict');
    stage = 'expire-fixture';
    const snapshot = decodeAttempt(await redis(['GET', key])); snapshot.deadline = now - 1;
    await redis(['SET', key, encodeAttempt(snapshot), 'KEEPTTL']);
    answers[1] = 3;
    stage = 'expiry';
    const frozen = decodeAttempt(await update(1, answers, true));
    assert.equal(frozen.answers[1], null); assert.equal(frozen.state, 'frozen'); assert.equal(frozen.expired, true);
    stage = 'immutability';
    assert.deepEqual(decodeAttempt(await update(99, Array(60).fill(0), true)).answers, frozen.answers);
    stage = 'retention';
    assert.ok(await redis(['TTL', key]) > 0);
    return { save: true, revisionProtection: true, serverDeadline: true, submissionImmutable: true, retention: true };
  } catch (error) {
    console.error('Synthetic storage verification failed:', stage, error.name);
    throw Object.assign(Error(`Storage check failed at ${stage}: ${error.message}`), { status: 502 });
  } finally { await redis(['DEL', key, queue]); }
}
