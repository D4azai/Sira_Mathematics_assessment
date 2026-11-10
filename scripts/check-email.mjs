const base = process.argv[2] || 'https://sira-mathematics-assessment.vercel.app';
if (!process.env.CRON_SECRET) throw Error('Load the private release settings with --env-file=.env.release.local');
if (new URL(base).origin !== 'https://sira-mathematics-assessment.vercel.app') throw Error('This check is restricted to the SIRA production origin');
const response = await fetch(new URL('/api/email-test', base), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CRON_SECRET}` }, body: '{}', signal: AbortSignal.timeout(30000) });
const result = await response.json();
console.log(JSON.stringify({ status: response.status, ...result }));
if (!response.ok || !result.accepted) process.exitCode = 1;
