import test from 'node:test';
import assert from 'node:assert/strict';
import { makeSession, verifySession, validLearnerName } from '../lib/session.js';
import start from '../api/start.js';
import { configure, serviceDouble, invoke } from './support.mjs';
test('full student names survive signing and verification', () => {
  configure();
  for (const name of ['Sample Student', 'Élise O’Connor', 'SIRA-MATH-01']) {
    assert.ok(validLearnerName(name)); assert.equal(verifySession(makeSession(name).token).learnerCode, name);
  }
  for (const name of ['', {}, 'A', '<script>alert(1)</script>', 'A'.repeat(81)]) assert.equal(validLearnerName(name), false);
});
test('four-character private code and full name can start an assessment', async t => {
  configure(); process.env.ASSESSMENT_ACCESS_CODE = '4321';
  t.after(configure);
  const double = serviceDouble(); t.mock.method(globalThis, 'fetch', double.fetch);
  const response = await invoke(start, { learnerCode: '  Sample Student  ', accessCode: '4321' });
  assert.equal(response.status, 200); assert.equal(response.data.learnerCode, 'Sample Student');
  assert.equal((await invoke(start, { learnerCode: 'Sample Student', accessCode: 'wrong' })).status, 403);
});
