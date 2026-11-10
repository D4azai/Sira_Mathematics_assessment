# SIRA Mathematics Readiness Assessment

Instructor-designed 60-question, 60-minute diagnostic for a personalised 18-week programme. This is not an official ACCUPLACER or college placement examination. Instructor report recipient is fixed server-side to **aymane.chellak@outlook.fr**.

## Current release status

Version 2 is deployed and computer-independent. Vercel hosts the application, Upstash Redis stores attempts, and an authenticated QStash schedule processes expiry/retries every two minutes. The instructor computer is not needed and its temporary worker has been stopped. SUPERVISED_WORKER_ENABLED=false. New starts require a fresh cloud heartbeat; no eight-hour local-worker limit applies.

Eighteen automated groups passed. Real Redis persistence/expiry, private-route checks and a complete synthetic live submission passed with local processing disabled. The matching detailed report was confirmed in Outlook. Copy the private, ignored .student-invitation.local.txt for the student invitation; never share .env.release.local. See RELEASE_STATUS.md for evidence.

The instructor explicitly retained the owner-only Resend testing sender. This is not a general production sending identity: onboarding@resend.dev is testing-only and restricted to the account owner. A verified domain is still the normal production path. The original public question bank and historical copies remain exposed; use supervised diagnostic administration or replace the bank privately. No real student records were used in verification.

## Architecture and timing

- `index.html`, `app.css`, `app.js`: existing responsive interface, now with authenticated recovery, autosave, accessible selection states, warnings and frozen submission.
- `scripts/build.mjs`: copies only those three browser files and the two company logos into `dist/`. Vercel serves `dist/`; private modules never enter the public output. Do not override Output Directory to the repository root.
- `lib/questions.js`: server-only bank (21 Foundation, 24 Intermediate, 15 Stretch). All 60 keys reviewed; scientific-notation distractors corrected, repeated absolute-value item replaced with a rational equation, inverse wording clarified.
- `POST /api/start`: checks private access code, configuration and approval; signs a unique timed attempt and persists it.
- `GET /api/questions`: bearer token required; returns prompts/options and a strictly allowlisted attempt snapshot. Never returns keys, explanations or stored email bodies.
- `POST /api/save`: token plus exactly 60 answers/confidence values and a non-negative revision. Atomic Redis Lua checks Redis time, state and revision before accepting edits. Stale tabs receive 409.
- `POST /api/submit`: freezes responses, grades and requests email acceptance. A successful response requires a provider message ID. Concurrent sends use an atomic lock. Duplicates return the saved receipt without another report.
- `GET /api/retry`: authenticated scheduled worker freezes expired attempts and retries saved reports, including when the browser has closed.
- `GET /api/status`: non-secret configuration flags, not a connectivity or deliverability test.

Upstash Redis is required: serverless process memory cannot reliably deduplicate, preserve submissions or enforce concurrent updates. This integration uses its documented REST API with built-in fetch; no runtime dependencies. Attempts have a 30-day fixed TTL, including saved responses and acceptance metadata. Rate-limit IPs are HMAC hashes with short-lived counters; raw IP addresses are not stored by application code. Hosting providers may maintain separate access logs.

**The server deadline is strict.** Only responses received and saved before the deadline are graded. A late submit freezes the last server snapshot; it cannot introduce offline edits after time expires. The UI keeps unsynced answers locally and offers a private JSON backup for instructor review. Offline recovery cannot prove when answers were written: backups are never automatically imported or treated as timed evidence. The countdown uses server time on load/save, while Redis independently enforces the deadline. Use one tab; conflicting server revisions recover the server copy on refresh.

The first submission fixes the exact email payload before calling Resend. Retries reuse the same idempotency key and message. Resend keys expire after 24 hours; automatic sends stop after 23 hours from the first delivery attempt to avoid an ambiguous duplicate. Inspect Vercel errors and `sira:pending` regularly. If the retry window ends, reconcile the attempt UUID in Resend before manually resending. Provider acceptance is not proof of inbox delivery; verify delivery/bounce status and Outlook receipt. No bounce webhook is implemented.

## Required Vercel setup

1. Obtain SIRA approval for Vercel hosting, Upstash storage, Resend and the instructor's Outlook mailbox, including retention/access policy. Until approval is documented, leave `SIRA_SERVICES_APPROVED=false`; starts fail closed. Use synthetic references for testing.
2. Connect the existing GitHub repository to its existing Vercel project. Keep Framework Preset **Other**, Node.js **22.x**, Build Command **npm run build**, Output Directory **dist**. `vercel.json` defines headers and functions. A verified external retry schedule is required on the current Hobby account. Configure Preview separately with test services; never run integration tests against real student records.
3. Connect a durable Upstash Redis database through Vercel Marketplace, preferably in the function region. Disable eviction and maintain an appropriate backup policy. The installed UPSTASH_REDIS prefix generates UPSTASH_REDIS_KV_REST_API_URL and UPSTASH_REDIS_KV_REST_API_TOKEN; the app accepts this pair directly, as well as the shorter names below. Read-only tokens are not suitable for saving attempts. No public database reads or credentials in browser code.
4. Configure Resend, verify a sender domain and its DNS, and create a send-only API key. Use a verified sender allowed to email the instructor's Outlook address; a testing sender restricted to the account owner's mailbox may not suffice.
5. Add these variables in Vercel Project Settings → Environment Variables, then redeploy. Do not paste secrets into chat or commit `.env.local`.

| Variable | Required value/purpose |
| --- | --- |
| `ASSESSMENT_SECRET` | Independently generated random signing secret, at least 32 characters |
| `ASSESSMENT_ACCESS_CODE` | Private learner access code, 4–100 characters; share privately |
| `RESEND_API_KEY` | Resend send-only API key |
| `RESEND_FROM_EMAIL` | Verified sender, for example `SIRA Assessments <assessments@your-domain>` |
| `UPSTASH_REDIS_REST_URL` | HTTPS REST endpoint of the approved Upstash database |
| `UPSTASH_REDIS_REST_TOKEN` | Server-side read/write REST token |
| `CRON_SECRET` | Separate random secret, at least 32 characters; Vercel supplies it as bearer authorization for cron |
| `RETRY_SCHEDULE_CONFIRMED` | Literal `true` only after the scheduler has successfully called the deployed retry endpoint |
| `SIRA_SERVICES_APPROVED` | Literal `true` only once SIRA approves all named services |

The current Hobby account does not support frequent Vercel cron. An Upstash QStash schedule is now configured to call GET /api/retry every two minutes with its bearer secret in a forwarded header. The token stays in server-side Production configuration. The application validates actual callback freshness before new starts. See CLOUD_SCHEDULER_SETUP.md for setup/recovery. No paid plan was activated.

6. Retain platform request limits and add Vercel WAF rate limits for `/api/start` before broad public distribution. Application limits are six start attempts/minute/IP, 120 saves/reads and 20 submissions. Application JSON payload limit is 16 KiB (Vercel parses the request before the handler). Failures of the rate-limit store fail closed. Valid code holders can create multiple distinct attempts; this is not a roster or one-attempt-per-person identity system.
7. Make the repository private, review historical preview/production URLs, and protect/delete old deployments that served keys. Changing the current deployment does not remove old immutable URLs or Git history. Changing `ASSESSMENT_SECRET` invalidates all current browser sessions; do not rotate it during an active assessment.

## Release verification

Run with Node 22:

```sh
npm test
npm run test:browser
npm run test:redis
npm run check:live -- https://your-deployment-url
```

For an authorised final production check, use synthetic data only:

```sh
node --env-file=.env.release.local scripts/check-assessment-live.mjs --fresh
node --env-file=.env.release.local scripts/check-expiry-live.mjs --queue
# After the next scheduled QStash invocation (normally within two minutes):
node --env-file=.env.release.local scripts/check-expiry-live.mjs
```

The fresh submission answers 40 questions correctly and leaves 20 unanswered, verifies recovery and stale-revision rejection, and checks duplicate receipts. The expiry check queues a fixed synthetic expired attempt for the actual cloud worker; its separate report should score 0/60. Both send only to the instructor. The expiry fixture reuses its pointer for one hour to prevent accidental repeated reports. These administrative actions require the private cron secret; they cannot create or inspect an arbitrary student's record.

`test:browser` requires Chrome/Chromium; set `CHROME_PATH` outside Windows. It launches headless Chrome with a disposable profile under ignored `test-results/`. Screenshots: `test-results/desktop.png`, `test-results/mobile.png`. Core and browser tests use synthetic service doubles, not a real Redis server or an actual email provider. They verify handler behavior, not Redis Lua execution on Upstash or inbox delivery. `test:redis` separately requires approved test Redis credentials in `.env.local`; it executes the real Lua script on isolated temporary keys, checks TTL/revisions/expiry, cleans up, and never queues or emails a result. It has not been run without those credentials. The live check expects private paths 404, unauthenticated questions 401 and `ready: true`; deployment protection login redirects are a separate failure to investigate.

Before student release, perform a tutor-only attempt on the deployed version:

- Confirm private paths `/lib/questions.js`, `/lib/session.js`, `/package.json`, `/.env` and `/.git/config` return 404; browser/network responses must contain no `correct`, `explanation` or stored mail content.
- Confirm invalid codes are denied, refresh restores answers/confidence, a second tab cannot overwrite a stale revision, and mobile keyboard/selection/navigation work.
- Check actual Upstash records, TTL and atomic Lua writes. Test a stale revision, simultaneous submission, and an expired **synthetic** record in the test database; late correct answers must not replace its saved snapshot.
- Submit once. Check the Resend message ID and accepted status, then verify the detailed HTML report arrives at **aymane.chellak@outlook.fr** with all 60 explanations, domain/level scores, confidence, omissions and Weeks 2–7 objectives. Inspect junk mail and provider bounce status as needed.
- On an isolated test deployment, simulate an email outage, verify frozen server answers survive, restore the provider, and verify the scheduled retry sends one report. Refresh/retry the accepted attempt and confirm no second email is created.
- Close a synthetic attempt before expiry, confirm the scheduled worker processes it after the deadline, and inspect Vercel logs. Readiness flags alone are insufficient.

These deployment/live-service checks remain mandatory. The production deployment is verified separately from local tests; actual Redis operation and email delivery are still unverified.

## Diagnostic interpretation

Each domain has a provisional category. Secure requires at least 80%, no confidently incorrect response, at most one third of correct responses marked unsure/guess, and at least 80% foundation performance where foundation items exist. Fragile means at least 40% without secure evidence; otherwise Not yet acquired. Missing confidence is neutral. Reports show level counts, confident errors and uncertain correct responses; confidence is self-report, not an objective measure of mastery. Sparse per-skill evidence and speed must be discussed verbally. The strongest three areas are relative strengths, not necessarily mastered areas. Weeks 2–7 focus on the lowest domains while preserving secure arithmetic; tutors should revise the plan after observing worked solutions.

## Retention, deletion and operations

The student now enters their full name, at the instructor's request. The name is included in the signed session, saved attempt and instructor report. Existing reference-style identifiers remain compatible. Browser state includes the bearer token and answers; use a private device, protect exported JSON and clear the site's local storage after instructor receipt. Server attempts expire 30 days after start. Outlook/Resend retention, backups and hosting logs are separate and must follow SIRA's approved policy. Restrict dashboard access to authorised staff.

For early deletion, use an approved local environment file with Redis credentials:

```sh
node --env-file=.env.local scripts/delete-attempt.mjs ATTEMPT_UUID
```

The utility deletes the attempt and queue entry, refuses an in-flight delivery, and never prints credentials. Delete provider/Outlook copies separately; storage deletion cannot recall sent mail. No public results listing, instructor dashboard or public delete endpoint exists. Inspect `sira:pending` and Vercel retry failure logs to detect service outages or stalled attempts. A bearer token is a credential: never log or share it.

For an instructor-authorised accidental-start reset, use `node --env-file=.env.release.local scripts/manage-attempt.mjs list "Student Name"`, review the matching active attempt, then run `scripts/manage-attempt.mjs cancel "Student Name" ATTEMPT_UUID` with the same Node/env-file prefix. The protected administrative endpoint requires the cron secret, checks the student name and exact attempt ID, refuses a submission in progress, and removes only the selected active attempt plus its queued report. Refreshing the affected browser clears its obsolete local session and returns to the start screen; it does not start a new timer automatically.

## Provider references

- [Upstash Redis REST API](https://upstash.com/docs/redis/features/restapi)
- [Resend idempotency and its 24-hour window](https://resend.com/docs/dashboard/emails/idempotency-keys)
- [Vercel project configuration](https://vercel.com/docs/project-configuration)
- [Vercel cron scheduling limits](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [Vercel platform request headers](https://vercel.com/docs/headers/request-headers)

## Administrator email check

On 10 November 2026 a synthetic report was accepted by Resend and confirmed in aymane.chellak@outlook.fr through the connected Outlook mailbox. This verifies the owner-only testing sender, not normal production sending or the entire timed-attempt flow. Cloud retry scheduling is now verified and student starts are enabled while the cloud heartbeat is healthy. RESEND_API_kEY is recognised as an alias for the installed sensitive variable; RESEND_API_KEY remains preferred.

Run: node --env-file=.env.release.local scripts/check-email.mjs. The private cron secret is required and must never be exposed to the browser. The protected endpoint sends only synthetic data to the fixed instructor recipient, with one idempotent message per UTC day.
