import test from 'node:test';
import assert from 'node:assert/strict';
import { configure, serviceDouble, invoke } from './support.mjs';
import { runtimeReadiness, WORKER_HEARTBEAT } from '../lib/config.js';
import retry from '../api/retry.js';
test('temporary worker must be alive with enough time remaining for a new assessment', async t => {
  configure(); const double = serviceDouble(); t.mock.method(globalThis, 'fetch', double.fetch);
  process.env.SUPERVISED_WORKER_ENABLED = 'true'; delete process.env.RETRY_SCHEDULE_CONFIRMED;
  t.after(() => { delete process.env.SUPERVISED_WORKER_ENABLED; configure(); });
  assert.equal((await runtimeReadiness()).retriesReady, false);
  const now = Date.now();
  const response = await invoke(retry, null, { method: 'GET', headers: { authorization: `Bearer ${process.env.CRON_SECRET}`, 'x-sira-worker-until': String(now + 8 * 3600000) } });
  assert.equal(response.status, 200); assert.equal((await runtimeReadiness()).retriesReady, true);
  assert.equal((await runtimeReadiness(now + 151000)).retriesReady, false);
  double.values.set(WORKER_HEARTBEAT, JSON.stringify({ at: now, until: now + 60 * 60000 }));
  assert.equal((await runtimeReadiness(now)).retriesReady, false);
});
