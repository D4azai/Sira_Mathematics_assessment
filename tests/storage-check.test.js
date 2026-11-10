import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/storage-check.js';
import { configure, serviceDouble, invoke } from './support.mjs';
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
