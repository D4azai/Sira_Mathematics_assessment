# Student release status — 10 November 2026

Production URL: https://sira-mathematics-assessment.vercel.app
Deployment: dpl_CFbSVHKJy7ptbuvutEXb8RMMX28Y — READY, production, Node 22.x.

## Computer-independent operation

The assessment, database, report delivery, expiry processing and submission retries run in the cloud. The instructor computer can sleep or be switched off. SUPERVISED_WORKER_ENABLED=false in production. The verified local worker was stopped at 15:15 UTC on 10 November 2026; it is no longer part of normal operation.

Upstash QStash schedule sira-math-Dv5dqShMxgRK5LP5HYQRz9XLygJt calls the authenticated retry endpoint every two minutes. Its actual cloud callback at 2026-11-10T15:16:00Z was verified after the local worker stopped. All live readiness flags were true with local processing disabled. The six-minute cloud heartbeat check blocks new starts if scheduling is not healthy. No manually asserted schedule-confirmed flag is needed.

## Verification evidence

- Eighteen automated test groups passed, including schedule creation, fixed destination, stable schedule identity and cloud heartbeat readiness. The administrative status route was also checked to ensure that schedule configuration alone does not imply a successful callback and that credentials are not exposed.
- Real Chrome desktop/mobile scenarios passed for the assessment interface, navigation, refresh, confidence, offline recovery, submission confirmation, email failure/retry and expiry. Those browser scenarios use simulated external services.
- Real Upstash checks passed save, stale revision protection, server deadline, immutable submission and retained TTL using isolated temporary records that were deleted afterward.
- A live Lua/JSON bug dropping trailing unanswered responses was fixed. Answer/confidence arrays are stored as JSON strings and preserve all 60 positions.
- Complete synthetic live assessment with the PC worker stopped passed start, authenticated questions, save, recovery, grading, email acceptance and duplicate receipt checks. Score 2/60 with two answered questions as expected. Provider ID: 01a1c608-bc38-7366-b9a0-fd53e7b5c4a6.
- Its matching report, SIRA assessment · SYNTHETIC_CLOUD_CHECK · 2/60, was confirmed in aymane.chellak@outlook.fr at 2026-11-10T15:17:07Z.
- Unauthenticated live checks passed: private source routes 404, questions 401, all readiness flags true.

## Student invitation

Copy .student-invitation.local.txt for the link, student name instructions and the instructor-selected private access code. That file is gitignored and not deployed. Never share .env.release.local, which also contains signing and administrative retry secrets. The student must use their own device and internet connection; the instructor computer is not required.

Start-assessment-worker.cmd is a legacy troubleshooting option only. It must not be used as a normal prerequisite or substitute for checking the cloud schedule.

## Continuing limits

- The instructor explicitly retained onboarding@resend.dev, an owner-only testing sender. Reports are fixed to the instructor mailbox. This does not establish a general production sending identity; a verified domain remains necessary for the normal production email setup.
- Credentials disclosed in an earlier screenshot were left unchanged at the instructor's explicit request.
- The original bank was publicly exposed. Current public static routes are blocked, but historical copies cannot be recalled. Use this as an instructor-supervised learning diagnostic; replace questions privately for an unsupervised high-integrity exam.
- The reviewed release source is maintained in this repository and linked to the existing Vercel project. The repository remains public; source question keys are therefore visible on GitHub. Make it private before adding a confidential replacement bank. Credentials and private student/session files are gitignored.
- QStash runs 720 initial deliveries/day. Retries and other QStash activity also count towards account quotas. No paid plan upgrade or domain purchase was made.
- Existing attempts remain recoverable if the scheduler is temporarily unavailable; delayed expiry/retries resume when scheduling returns, subject to retention and provider idempotency windows.

Full-name entry and a four-character private code were explicitly requested by the instructor and deployed. The actual student's name is retained only in the ignored private invitation, not hardcoded into browser assets. Twenty automated tests and the desktop/mobile browser checks passed. Live name validation was checked with a synthetic name and incorrect code so that no real student attempt was started.
