import { redis, key, QUEUE, getAttempt } from './store.js';
const normalise = name => name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
export const CANCEL_SCRIPT = `
if redis.call('EXISTS',KEYS[2])==1 then return 'busy' end
local raw=redis.call('GET',KEYS[1]); if not raw then redis.call('ZREM',KEYS[3],ARGV[2]); return 'missing' end
local r=cjson.decode(raw)
if r.learnerCode~=ARGV[1] then return 'mismatch' end
if r.state~='active' then return 'not-active' end
redis.call('DEL',KEYS[1]); redis.call('ZREM',KEYS[3],ARGV[2]); return 'cancelled'`;
export async function listActiveAttempts(name) {
  const ids = await redis(['ZRANGE', QUEUE, 0, 99]);
  const attempts = await Promise.all(ids.map(async id => {
    try { return await getAttempt(id); } catch (error) { if (error.status === 410) return null; throw error; }
  }));
  return attempts.filter(record => record?.state === 'active' && normalise(record.learnerCode) === normalise(name))
    .sort((a, b) => b.startedAt - a.startedAt)
    .map(({ id, learnerCode, startedAt, deadline, answers }) => ({ id, studentName: learnerCode, startedAt, deadline, answered: answers.filter(value => value !== null).length }));
}
export async function cancelAttempt(id, name) {
  const record = await getAttempt(id);
  if (normalise(record.learnerCode) !== normalise(name)) throw Object.assign(Error('Student name does not match this attempt'), { status: 409 });
  const result = await redis(['EVAL', CANCEL_SCRIPT, 3, key(id), `${key(id)}:lock`, QUEUE, record.learnerCode, id]);
  if (result === 'busy') throw Object.assign(Error('A submission is being processed. The attempt was not changed.'), { status: 409 });
  if (!['cancelled', 'missing'].includes(result)) throw Object.assign(Error('Only an active, unsubmitted attempt can be reset'), { status: 409 });
  return { cancelled: true, attemptId: id };
}
