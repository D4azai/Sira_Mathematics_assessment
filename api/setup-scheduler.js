import { timingSafeEqual } from 'node:crypto';
import { endpoint, fail, rateLimit } from '../lib/http.js';
import { json } from '../lib/session.js';
import { redis } from '../lib/store.js';
import { CLOUD_SCHEDULE, CLOUD_HEARTBEAT, SCHEDULE_ID, RETRY_DESTINATION, RETRY_CRON, qstashOrigin } from '../lib/scheduler-config.js';

export default endpoint('POST', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  const supplied = Buffer.from(req.headers.authorization || ''), expected = Buffer.from(`Bearer ${secret}`);
  if (!secret || secret.length < 32 || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) fail(401, 'Unauthorized');
  if (req.body.action === 'status') {
    const schedule = JSON.parse(await redis(['GET', CLOUD_SCHEDULE]) || 'null');
    const heartbeat = JSON.parse(await redis(['GET', CLOUD_HEARTBEAT]) || 'null');
    const age = heartbeat ? Date.now() - heartbeat.at : null;
    return json(res, 200, { configured: Boolean(schedule), scheduleId: schedule?.scheduleId, lastCloudInvocation: heartbeat?.at || null, cloudActive: Boolean(process.env.QSTASH_TOKEN && age !== null && age >= -30000 && age < 360000) });
  }
  if (!process.env.QSTASH_TOKEN) fail(503, 'Save QSTASH_TOKEN in the production environment, then redeploy.');
  await rateLimit(req, 'scheduler-setup', 3);
  // Reusing a stable ID updates the same schedule instead of creating duplicates.
  const response = await fetch(`${qstashOrigin()}/v2/schedules/${RETRY_DESTINATION}`, {
    method: 'POST', signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      'Upstash-Cron': RETRY_CRON,
      'Upstash-Schedule-Id': SCHEDULE_ID,
      'Upstash-Method': 'GET',
      'Upstash-Timeout': '55s',
      'Upstash-Retries': '2',
      'Upstash-Forward-Authorization': `Bearer ${secret}`,
      'Upstash-Forward-X-Sira-Scheduler': SCHEDULE_ID
    }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.scheduleId) fail(502, `QStash did not confirm schedule creation (status ${response.status}). Check the QStash token and account region.`);
  await redis(['SET', CLOUD_SCHEDULE, JSON.stringify({ scheduleId: result.scheduleId, cron: RETRY_CRON, configuredAt: Date.now() })]);
  return json(res, 200, { configured: true, scheduleId: result.scheduleId, intervalMinutes: 2, awaitingFirstInvocation: true });
});
