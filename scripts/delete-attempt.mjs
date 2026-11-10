import { redis, key, QUEUE } from '../lib/store.js';
const id = process.argv[2];
if (!/^[a-f0-9-]{36}$/.test(id || '')) throw Error('Usage: node --env-file=.env.local scripts/delete-attempt.mjs ATTEMPT_UUID');
// Do not race an email send: operator must wait for the delivery lock to expire.
const result = await redis(['EVAL', "if redis.call('EXISTS',KEYS[2])==1 then return 'busy' end; redis.call('DEL',KEYS[1]); redis.call('ZREM',KEYS[3],ARGV[1]); return 'deleted'", 3, key(id), `${key(id)}:lock`, QUEUE, id]);
if (result === 'busy') throw Error('Delivery in progress. Retry deletion in two minutes.');
console.log('Attempt deleted from assessment storage. Email copies and provider backups require separate deletion.');
