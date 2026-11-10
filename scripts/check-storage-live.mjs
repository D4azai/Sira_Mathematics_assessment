if (!process.env.CRON_SECRET) throw Error('Load the private release settings with --env-file=.env.release.local');
const response = await fetch('https://sira-mathematics-assessment.vercel.app/api/storage-check', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CRON_SECRET}` }, body: '{}', signal: AbortSignal.timeout(60000) });
const result = await response.json();
console.log(JSON.stringify({ status: response.status, ...result }));
if (!response.ok || !result.verified) process.exitCode = 1;
