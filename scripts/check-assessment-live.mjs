import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
if (!process.env.ASSESSMENT_ACCESS_CODE) throw Error('Load private release settings with --env-file=.env.release.local');
const origin = 'https://sira-mathematics-assessment.vercel.app';
const cloudCheck = process.argv.includes('--cloud');
const file = cloudCheck ? '.release-check-cloud.local.json' : '.release-check.local.json';
async function request(path, body, token) {
  const response = await fetch(origin + path, { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { method: 'POST', body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000) });
  const data = await response.json();
  if (!response.ok) throw Error(`${path}: ${response.status} ${data.error}`);
  return data;
}
let state;
try { state = JSON.parse(await readFile(file, 'utf8')); } catch { /* New synthetic attempt. */ }
if (!state) {
  state = await request('/api/start', { learnerCode: cloudCheck ? 'SYNTHETIC_CLOUD_CHECK' : 'SYNTHETIC_RELEASE_CHECK', accessCode: process.env.ASSESSMENT_ACCESS_CODE });
  await writeFile(file, JSON.stringify(state));
}
let data = await request('/api/questions', null, state.token);
assert.equal(data.questions.length, 60);
assert.ok(data.questions.every(q => !('correct' in q) && !('explanation' in q)));
assert.ok(!('mail' in data.attempt));
if (data.attempt.state === 'active') {
  const answers = Array(60).fill(null), confidence = Array(60).fill(null);
  answers[0] = 1; answers[1] = 3; confidence[0] = 'sure';
  const saved = await request('/api/save', { token: state.token, revision: data.attempt.revision, answers, confidence });
  assert.equal(saved.attempt.answers.length, 60); assert.equal(saved.attempt.answers[59], null);
  data = await request('/api/questions', null, state.token);
  assert.deepEqual(data.attempt.answers, answers); assert.deepEqual(data.attempt.confidence, confidence);
}
const payload = { token: state.token, revision: data.attempt.revision, answers: data.attempt.answers, confidence: data.attempt.confidence };
let result;
for (let i = 0; i < 5; i++) { result = await request('/api/submit', payload); if (!result.pending) break; await delay(2000); }
assert.equal(result.ok, true); assert.equal(result.score, 2); assert.equal(result.answered, 2);
const duplicate = await request('/api/submit', payload);
assert.equal(duplicate.providerId, result.providerId);
console.log(JSON.stringify({ verified: true, synthetic: true, checks: ['start', 'authenticated questions', 'save', 'refresh recovery', 'grading', 'email acceptance', 'duplicate receipt'], score: result.score, providerId: result.providerId }));
