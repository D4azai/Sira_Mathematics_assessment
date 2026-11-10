import test from 'node:test';
import assert from 'node:assert/strict';
import { configure, serviceDouble, invoke } from './support.mjs';
import handler from '../api/setup-scheduler.js';
import retry from '../api/retry.js';
import { runtimeReadiness } from '../lib/config.js';
import { CLOUD_HEARTBEAT, SCHEDULE_ID, RETRY_DESTINATION, RETRY_CRON, qstashOrigin } from '../lib/scheduler-config.js';
test('cloud schedule setup is authorised, fixed to SIRA and idempotent by schedule ID', async t => {
  configure(); process.env.QSTASH_TOKEN = 'synthetic-qstash-token';
  t.after(() => delete process.env.QSTASH_TOKEN);
  const double = serviceDouble(), calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (String(url).includes('/v2/schedules/')) { calls.push({ url, options }); return Response.json({ scheduleId: SCHEDULE_ID }); }
    return double.fetch(url, options);
  });
  assert.equal((await invoke(handler, {})).status, 401); assert.equal(calls.length, 0);
  const options = { headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.CRON_SECRET}` } };
  assert.equal((await invoke(handler, { destination: 'https://untrusted.test' }, options)).status, 200);
  assert.equal((await invoke(handler, {}, options)).status, 200);
  assert.equal(calls[0].url, `https://qstash.upstash.io/v2/schedules/${RETRY_DESTINATION}`);
  assert.equal(calls[0].options.headers['Upstash-Cron'], RETRY_CRON);
  assert.equal(calls[0].options.headers['Upstash-Schedule-Id'], calls[1].options.headers['Upstash-Schedule-Id']);
  assert.equal(calls[0].options.headers['Upstash-Method'], 'GET');
  const status = await invoke(handler, { action: 'status' }, options);
  assert.equal(status.data.configured, true); assert.equal(status.data.cloudActive, false);
  assert.ok(!JSON.stringify(status.data).includes(process.env.QSTASH_TOKEN));
});
test('cloud readiness needs an authenticated live cloud heartbeat, not only a token', async t => {
  configure(); process.env.QSTASH_TOKEN = 'synthetic-qstash-token'; delete process.env.RETRY_SCHEDULE_CONFIRMED;
  t.after(() => { delete process.env.QSTASH_TOKEN; configure(); });
  const double = serviceDouble(); t.mock.method(globalThis, 'fetch', double.fetch);
  assert.equal((await runtimeReadiness()).retriesReady, false);
  await invoke(retry, null, { method: 'GET', headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } });
  assert.equal((await runtimeReadiness()).retriesReady, false);
  const now = Date.now();
  await invoke(retry, null, { method: 'GET', headers: { authorization: `Bearer ${process.env.CRON_SECRET}`, 'x-sira-scheduler': SCHEDULE_ID } });
  assert.ok(double.values.has(CLOUD_HEARTBEAT)); assert.equal((await runtimeReadiness()).retriesReady, true);
  assert.equal((await runtimeReadiness(now + 361000)).retriesReady, false);
});
test('QStash region must be an official provider origin', t => {
  const previous = process.env.QSTASH_URL;
  t.after(() => { if (previous === undefined) delete process.env.QSTASH_URL; else process.env.QSTASH_URL = previous; });
  process.env.QSTASH_URL = 'https://untrusted.test'; assert.throws(qstashOrigin);
  process.env.QSTASH_URL = 'https://qstash-eu-central-1.upstash.io'; assert.equal(qstashOrigin(), process.env.QSTASH_URL);
});
