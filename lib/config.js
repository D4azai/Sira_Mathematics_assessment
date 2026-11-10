import { storageConfig } from './storage-config.js';
import { emailConfig } from './email-config.js';
import { redis } from './store.js';
import { CLOUD_HEARTBEAT } from './scheduler-config.js';
export const WORKER_HEARTBEAT = 'sira:instructor-worker';
export function readiness() {
  const storage = storageConfig();
  const email = emailConfig();
  return {
    assessmentReady: (process.env.ASSESSMENT_SECRET?.length || 0) >= 32 && (process.env.ASSESSMENT_ACCESS_CODE?.length || 0) >= 4 && process.env.ASSESSMENT_ACCESS_CODE.length <= 100,
    emailReady: Boolean(email.apiKey && email.from),
    storageReady: Boolean(storage.url?.startsWith('https://') && storage.token),
    servicesApproved: process.env.SIRA_SERVICES_APPROVED === 'true',
    retriesReady: (process.env.CRON_SECRET?.length || 0) >= 32 && (process.env.RETRY_SCHEDULE_CONFIRMED === 'true' || process.env.SUPERVISED_WORKER_ENABLED === 'true' || Boolean(process.env.QSTASH_TOKEN))
  };
}
export async function runtimeReadiness(now = Date.now()) {
  const flags = readiness();
  if (process.env.QSTASH_TOKEN) {
    try {
      const heartbeat = JSON.parse(await redis(['GET', CLOUD_HEARTBEAT]) || 'null');
      if (flags.retriesReady && heartbeat && now >= heartbeat.at - 30000 && now - heartbeat.at < 360000) return flags;
    } catch { /* Keep the existing instructor worker during cloud migration. */ }
    if (process.env.SUPERVISED_WORKER_ENABLED !== 'true' && process.env.RETRY_SCHEDULE_CONFIRMED !== 'true') flags.retriesReady = false;
  }
  if (process.env.SUPERVISED_WORKER_ENABLED === 'true' && process.env.RETRY_SCHEDULE_CONFIRMED !== 'true') {
    try {
      const heartbeat = JSON.parse(await redis(['GET', WORKER_HEARTBEAT]) || 'null');
      flags.retriesReady = flags.retriesReady && Boolean(heartbeat && now >= heartbeat.at - 30000 && now - heartbeat.at < 150000 && heartbeat.until >= now + 70 * 60000);
    } catch { flags.retriesReady = false; }
  }
  return flags;
}
export async function requireReady() {
  if (Object.values(await runtimeReadiness()).some(value => !value)) throw Object.assign(Error('Your assessment is not available yet. Please contact your teacher before starting.'), { status: 503 });
}
