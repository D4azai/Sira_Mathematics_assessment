export const CLOUD_HEARTBEAT = 'sira:cloud-scheduler-heartbeat';
export const CLOUD_SCHEDULE = 'sira:cloud-scheduler';
export const SCHEDULE_ID = 'sira-math-Dv5dqShMxgRK5LP5HYQRz9XLygJt';
export const RETRY_DESTINATION = 'https://sira-mathematics-assessment.vercel.app/api/retry';
export const RETRY_CRON = '*/2 * * * *';
export function qstashOrigin() {
  const origin = process.env.QSTASH_URL || 'https://qstash.upstash.io';
  if (!/^https:\/\/qstash(?:-[a-z0-9-]+)?\.upstash\.io$/.test(origin)) throw Error('QSTASH_URL must be an official Upstash QStash origin');
  return origin;
}
