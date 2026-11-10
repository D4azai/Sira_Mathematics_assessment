const statusOnly = process.argv.includes('--status');
if (!process.env.CRON_SECRET) throw Error('Start with --env-file=.env.release.local');
const response = await fetch('https://sira-mathematics-assessment.vercel.app/api/setup-scheduler', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CRON_SECRET}` }, body: JSON.stringify(statusOnly ? { action: 'status' } : {}), signal: AbortSignal.timeout(30000)
});
const result = await response.json();
console.log(JSON.stringify({ status: response.status, ...result }));
if (!response.ok || !result.configured) process.exit(1);
if (statusOnly) process.exit(result.cloudActive ? 0 : 2);
console.log('Schedule configured. Actual cloud invocation must be verified before stopping the local worker.');
