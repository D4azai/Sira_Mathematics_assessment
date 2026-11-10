import { RETENTION } from './session.js';
import { storageConfig } from './storage-config.js';
export async function redis(command) {
  const { url, token } = storageConfig();
  const response = await fetch(url, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command), signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) throw Error('Storage unavailable');
  const data = await response.json();
  if (data.error) {
    console.error('Storage rejected command:', command[0]);
    throw Object.assign(Error('Storage command failed'), { storageCommand: command[0] });
  }
  return data.result;
}
export const key = id => `sira:attempt:${id}`;
export const QUEUE = 'sira:pending';
export function encodeAttempt(record) {
  const { answers, confidence, ...rest } = record;
  return JSON.stringify({ ...rest, answersJson: JSON.stringify(answers), confidenceJson: JSON.stringify(confidence) });
}
export function decodeAttempt(raw) {
  const record = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const { answersJson, confidenceJson, ...rest } = record;
  // Keep null-filled arrays outside Lua's cjson array conversion. Older snapshots
  // are padded for compatibility; new records preserve all 60 positions exactly.
  const answers = answersJson ? JSON.parse(answersJson) : record.answers || [];
  const confidence = confidenceJson ? JSON.parse(confidenceJson) : record.confidence || [];
  return { ...rest, answers: Array.from({ length: 60 }, (_, i) => answers[i] ?? null), confidence: Array.from({ length: 60 }, (_, i) => confidence[i] ?? null) };
}
export function publicAttempt(record) {
  const { id, learnerCode, startedAt, deadline, answers, confidence, revision, state, savedAt, result } = record;
  return { id, learnerCode, startedAt, deadline, answers, confidence, revision, state, savedAt, result };
}
export async function createAttempt(session) {
  const { token, ...record } = session;
  Object.assign(record, { answers: Array(60).fill(null), confidence: Array(60).fill(null), revision: 0, state: 'active' });
  await redis(['EVAL', "redis.call('SET',KEYS[1],ARGV[1],'EX',ARGV[2]); redis.call('ZADD',KEYS[2],ARGV[3],ARGV[4]); return 1", 2, key(session.id), QUEUE, encodeAttempt(record), RETENTION, session.deadline, session.id]);
  return record;
}
export async function getAttempt(id) {
  const raw = await redis(['GET', key(id)]);
  if (!raw) throw Object.assign(Error('Attempt not found or retention period ended'), { status: 410 });
  return decodeAttempt(raw);
}
export const UPDATE_SCRIPT = `
local raw=redis.call('GET',KEYS[1]); if not raw then return 'missing' end
local r=cjson.decode(raw); local t=redis.call('TIME'); local now=tonumber(t[1])*1000+math.floor(tonumber(t[2])/1000)
if r.state~='active' then return raw end
if now<r.deadline then
 if tonumber(ARGV[1])~=r.revision then return 'conflict' end
 r.answersJson=ARGV[2]; r.confidenceJson=ARGV[3]; r.answers=nil; r.confidence=nil; r.revision=r.revision+1; r.savedAt=now
end
if ARGV[4]=='submit' or now>=r.deadline then
 r.state='frozen'; r.submittedAt=math.min(now,r.deadline); r.expired=now>=r.deadline
 redis.call('ZADD',KEYS[2],now,r.id)
end
local out=cjson.encode(r); redis.call('SET',KEYS[1],out,'KEEPTTL'); return out`;
export async function updateAttempt(id, revision, answers, confidence, submit = false) {
  const raw = await redis(['EVAL', UPDATE_SCRIPT, 2, key(id), QUEUE, revision, JSON.stringify(answers), JSON.stringify(confidence), submit ? 'submit' : 'save']);
  if (raw === 'missing') throw Object.assign(Error('Attempt not found'), { status: 410 });
  if (raw === 'conflict') throw Object.assign(Error('This attempt changed in another tab. Refresh to recover the latest saved answers.'), { status: 409 });
  return decodeAttempt(raw);
}
