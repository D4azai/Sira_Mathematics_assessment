import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/storage-check.js';
import { configure, serviceDouble, invoke } from './support.mjs';
import retry from '../api/retry.js';
test('storage preflight requires administrator authentication and cleans isolated records', async t => {
  configure(); const double = serviceDouble(); t.mock.method(globalThis, 'fetch', double.fetch);
  assert.equal((await invoke(handler, {})).status, 401);
  assert.equal(double.values.size, 0);
  const response = await invoke(handler, {}, { headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.CRON_SECRET}` } });
  assert.equal(response.status, 200); assert.equal(response.data.verified, true);
  assert.ok(Object.values(response.data.checks).every(Boolean));
  assert.ok([...double.values.keys()].every(key => !key.startsWith('sira:integration:')));
  assert.equal(double.sends.length, 0);
});
test('queued synthetic expiry is graded and delivered by the same worker as real attempts', async t => {
  configure(); const double = serviceDouble(); t.mock.method(globalThis, 'fetch', double.fetch);
  const options = { headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.CRON_SECRET}` } };
  const queued = await invoke(handler, { action: 'queue-expiry' }, options);
  assert.equal(queued.data.state, 'active'); assert.equal(double.sends.length, 0);
  assert.equal((await invoke(handler, { action: 'queue-expiry' }, options)).data.attemptId, queued.data.attemptId);
  const processed = await invoke(retry, null, { method: 'GET', headers: options.headers });
  assert.equal(processed.data.processed, 1); assert.equal(processed.data.failed, 0);
  const status = await invoke(handler, { action: 'expiry-status' }, options);
  assert.equal(status.data.state, 'accepted'); assert.equal(status.data.expired, true);
  assert.equal(status.data.result.score, 0); assert.equal(status.data.result.answered, 0);
  assert.equal(double.sends.length, 1);
});
