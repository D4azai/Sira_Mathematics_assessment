if (!process.env.CRON_SECRET) throw Error('Load private release settings with --env-file=.env.release.local');
const queue = process.argv.includes('--queue');
const response = await fetch('https://sira-mathematics-assessment.vercel.app/api/storage-check', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CRON_SECRET}` },
  body: JSON.stringify({ action: queue ? 'queue-expiry' : 'expiry-status' }), signal: AbortSignal.timeout(30000)
});
const result = await response.json();
console.log(JSON.stringify({ status: response.status, ...result }));
if (!response.ok || !result.queued) process.exitCode = 1;
else if (!queue && (!result.expired || !result.result?.ok || result.result.score !== 0 || result.result.answered !== 0)) process.exitCode = 2;
