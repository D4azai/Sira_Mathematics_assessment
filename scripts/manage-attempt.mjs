if (!process.env.CRON_SECRET) throw Error('Load private release settings with --env-file=.env.release.local');
const [action, studentName, attemptId] = process.argv.slice(2);
if (!['list', 'cancel'].includes(action) || !studentName) throw Error('Usage: manage-attempt.mjs list|cancel "Student Name" [ATTEMPT_UUID]');
const response = await fetch('https://sira-mathematics-assessment.vercel.app/api/attempt-control', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CRON_SECRET}` },
  body: JSON.stringify({ action, studentName, attemptId }), signal: AbortSignal.timeout(30000)
});
console.log(JSON.stringify({ status: response.status, ...await response.json() }));
if (!response.ok) process.exitCode = 1;
