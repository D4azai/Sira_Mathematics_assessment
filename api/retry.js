import { timingSafeEqual } from 'node:crypto';
import { json } from '../lib/session.js';
import { redis, QUEUE } from '../lib/store.js';
import { endpoint, fail } from '../lib/http.js';
import { deliver } from '../lib/delivery.js';
import { WORKER_HEARTBEAT } from '../lib/config.js';
import { CLOUD_HEARTBEAT, SCHEDULE_ID } from '../lib/scheduler-config.js';
export default endpoint('GET', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  const a = Buffer.from(req.headers.authorization || ''), b = Buffer.from(`Bearer ${secret}`);
  if (!secret || a.length !== b.length || !timingSafeEqual(a, b)) fail(401, 'Unauthorized');
  if (process.env.QSTASH_TOKEN && req.headers['x-sira-scheduler'] === SCHEDULE_ID) {
    await redis(['SET', CLOUD_HEARTBEAT, JSON.stringify({ at: Date.now() }), 'EX', 360]);
  }
  if (process.env.SUPERVISED_WORKER_ENABLED === 'true') {
    const until = Number(req.headers['x-sira-worker-until']);
    const now = Date.now();
    if (Number.isSafeInteger(until) && until > now && until <= now + 12 * 3600000) {
      await redis(['SET', WORKER_HEARTBEAT, JSON.stringify({ at: now, until }), 'EX', 150]);
    }
  }
  const ids = await redis(['ZRANGEBYSCORE', QUEUE, '-inf', Date.now(), 'LIMIT', 0, 10]);
  const results = await Promise.allSettled(ids.map(async id => {
    try { return await deliver(id); }
    catch (e) { if (e.status === 410) await redis(['ZREM', QUEUE, id]); throw e; }
  }));
  const failed = results.filter(x => x.status === 'rejected').length;
  if (failed) console.error('Assessment delivery retry failures:', failed);
  return json(res, 200, { processed: ids.length, failed });
});
