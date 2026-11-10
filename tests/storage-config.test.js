import test from 'node:test';
import assert from 'node:assert/strict';
import { storageConfig } from '../lib/storage-config.js';
import { readiness } from '../lib/config.js';
import { encodeAttempt, decodeAttempt } from '../lib/store.js';
test('storage wire format preserves sixty trailing nulls without Lua array conversion', () => {
  const record = { id: 'test', answers: Array(60).fill(null), confidence: Array(60).fill(null) };
  record.answers[0] = 2;
  const wire = JSON.parse(encodeAttempt(record));
  assert.equal(typeof wire.answersJson, 'string'); assert.equal(wire.answers, undefined);
  assert.deepEqual(decodeAttempt(JSON.stringify(wire)), record);
  assert.deepEqual(decodeAttempt(JSON.stringify({ answers: [2], confidence: [] })).answers, record.answers);
});
test('storage recognises the installed Marketplace prefix without mixing credentials or using read-only tokens', t => {
  for (const key of ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'UPSTASH_REDIS_KV_REST_API_URL', 'UPSTASH_REDIS_KV_REST_API_TOKEN', 'UPSTASH_REDIS_KV_REST_API_READ_ONLY_TOKEN']) {
    const previous = process.env[key]; delete process.env[key];
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
  process.env.UPSTASH_REDIS_KV_REST_API_URL = 'https://redis.test';
  process.env.UPSTASH_REDIS_KV_REST_API_READ_ONLY_TOKEN = 'read-only-test';
  assert.equal(readiness().storageReady, false);
  process.env.UPSTASH_REDIS_REST_TOKEN = 'unrelated-test';
  assert.equal(readiness().storageReady, false);
  process.env.UPSTASH_REDIS_KV_REST_API_TOKEN = 'marketplace-test';
  assert.deepEqual(storageConfig(), { url: 'https://redis.test', token: 'marketplace-test' });
  assert.equal(readiness().storageReady, true);
  process.env.UPSTASH_REDIS_REST_URL = 'https://preferred.test';
  assert.deepEqual(storageConfig(), { url: 'https://preferred.test', token: 'unrelated-test' });
});
