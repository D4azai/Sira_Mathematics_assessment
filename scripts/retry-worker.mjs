import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
if (!process.env.CRON_SECRET) throw Error('Start with --env-file=.env.release.local');
await mkdir('test-results', { recursive: true });
const file = 'test-results/retry-worker-status.json';
try {
  const previous = JSON.parse(await readFile(file, 'utf8'));
  if (previous.pid && previous.pid !== process.pid && previous.endsAt > Date.now()) {
    try { process.kill(previous.pid, 0); console.log('An instructor retry worker is already running.'); process.exit(0); } catch { /* Stale process. */ }
  }
} catch { /* First launch. */ }
const endsAt = Date.now() + 8 * 3600000;
let stop = false;
process.on('SIGINT', () => stop = true); process.on('SIGTERM', () => stop = true);
console.log('SIRA instructor worker started for 8 hours. Keep this computer awake and online during the assessment.');
while (!stop && Date.now() < endsAt) {
  try {
    const response = await fetch('https://sira-mathematics-assessment.vercel.app/api/retry', {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}`, 'X-Sira-Worker-Until': String(endsAt) }, signal: AbortSignal.timeout(30000)
    });
    const result = await response.json();
    if (!response.ok) throw Error(`Worker endpoint returned ${response.status}`);
    await writeFile(file, JSON.stringify({ pid: process.pid, endsAt, lastSuccess: Date.now(), processed: result.processed, failed: result.failed }));
    console.log(new Date().toISOString(), `Processed: ${result.processed}; failed: ${result.failed}`);
  } catch (error) {
    console.error(new Date().toISOString(), 'Retry worker could not connect:', error.message);
  }
  if (!stop) await delay(30000);
}
console.log('Instructor worker stopped. New starts will be blocked when its heartbeat expires.');
