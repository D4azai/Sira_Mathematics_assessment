const origin = new URL(process.argv[2] || 'https://sira-mathematics-assessment.vercel.app');
if (origin.protocol !== 'https:' && origin.hostname !== 'localhost') throw Error('Use an HTTPS deployment URL');
for (const path of ['/lib/questions.js', '/lib/session.js', '/package.json', '/README.md', '/tests/core.test.js', '/.env', '/.env.release.local', '/.student-invitation.local.txt', '/.release-check.local.json', '/.git/config']) {
  const response = await fetch(new URL(path, origin), { redirect: 'manual' });
  if (response.status !== 404) throw Error(`${path}: expected 404, received ${response.status}. Inspect deployment protection/output directory.`);
}
const questions = await fetch(new URL('/api/questions', origin));
if (questions.status !== 401) throw Error(`Unauthenticated questions returned ${questions.status}, expected 401`);
for (const path of ['/api/email-test', '/api/storage-check', '/api/setup-scheduler']) {
  const response = await fetch(new URL(path, origin), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (response.status !== 401) throw Error(`Unauthenticated ${path} returned ${response.status}, expected 401`);
}
const response = await fetch(new URL('/api/status', origin));
const status = await response.json();
console.log('Private routes blocked; unauthenticated question access blocked. Configuration:', status);
if (!status.ready) process.exitCode = 1;
