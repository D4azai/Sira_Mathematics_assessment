import test from 'node:test';
import assert from 'node:assert/strict';
import { emailConfig } from '../lib/email-config.js';
import handler from '../api/email-test.js';
import { configure, serviceDouble, invoke } from './support.mjs';
test('administrator email check is protected, synthetic and fixed to the instructor', async t => {
  configure(); const double = serviceDouble(); t.mock.method(globalThis, 'fetch', double.fetch);
  assert.equal((await invoke(handler, {})).status, 401); assert.equal(double.sends.length, 0);
  const options = { headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.CRON_SECRET}` } };
  double.setEmail(403, null); assert.equal((await invoke(handler, {}, options)).status, 502);
  double.setEmail(200, null); assert.equal((await invoke(handler, {}, options)).status, 502);
  double.setEmail(200); const response = await invoke(handler, { to: 'untrusted@example.test' }, options);
  assert.equal(response.data.accepted, true); assert.equal(response.data.synthetic, true);
  assert.deepEqual(double.sends.at(-1).body.to, ['aymane.chellak@outlook.fr']);
  assert.ok(double.sends.at(-1).body.html.includes('SYNTHETIC TEST ONLY'));
  assert.deepEqual(double.sends[0].body, double.sends.at(-1).body);
});
test('email configuration accepts the installed key spelling and prefers the canonical name', t => {
  const original = process.env.RESEND_API_KEY, alias = process.env.RESEND_API_kEY;
  t.after(() => { if (original === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = original; if (alias === undefined) delete process.env.RESEND_API_kEY; else process.env.RESEND_API_kEY = alias; });
  delete process.env.RESEND_API_KEY; process.env.RESEND_API_kEY = 'alias-test';
  assert.equal(emailConfig().apiKey, 'alias-test');
  process.env.RESEND_API_KEY = 'canonical-test'; assert.equal(emailConfig().apiKey, 'canonical-test');
});
