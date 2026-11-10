# SIRA — Mathematics Readiness Assessment

A one-hour online diagnostic for SIRA's 18-week individual mathematics programme.

## What the student sees
- 60 single-answer mathematics questions, from basic arithmetic to advanced algebra, functions, trigonometry and calculus.
- Persistent 60-minute countdown, responsive navigation, bookmarks and optional confidence ratings.
- Learner reference and private access code; no full name or personal email requested.
- Submission confirmation when the result email is accepted by the email provider.

## What the tutor receives
A detailed email sent to **aymane.chellak@outlook.fr**, including score, per-domain results, advanced items, chosen versus correct responses, explanations and diagnostic teaching priorities.

**This app does not maintain a database.** Answers are held in the student's browser during the attempt and sent to the server when submitted. A failed email submission remains locally available for retry within the server's short grace window.

## Deploy on Vercel
Link the GitHub repository to a Vercel project. Use Node 22 and zero build command (static HTML with Vercel Functions). Add these environment variables in Vercel project settings for **Production** (and Preview for testing):

| Variable | Purpose |
|---|---|
| `ASSESSMENT_SECRET` | Random secret of at least 32 characters for signing timed attempts |
| `ASSESSMENT_ACCESS_CODE` | Private code given to the learner |
| `RESEND_API_KEY` | Transactional email API key from Resend |
| `RESEND_FROM_EMAIL` | Verified sender address, e.g. `SIRA Assessments <assessments@your-verified-domain.com>` |

Email delivery uses **Resend**. Sign up at https://resend.com, verify a sender domain, and issue an API key. The test backend always sends to the tutor's designated Outlook address; the browser cannot choose the email destination.

To check configuration visit `/api/status`. Both flags must be `true` before you give the student the test link. Test the complete flow with a tutor-only reference first.

## Important privacy / safeguarding
Before collecting or emailing any learner response, obtain SIRA's express approval to use the learner reference, the tutor's Outlook mailbox, Vercel and Resend as approved channels and service providers. Do not put a learner's real name, educational record or private contact details into GitHub. Do not send the test link until the email flow works. Do not email results to other recipients without SIRA's approval.

This is a short multiple-choice screening, **not** an official ACCUPLACER or other placement test. The 60 questions in 60 minutes also measure speed; use classroom follow-up, worked solutions and student explanations before assigning learning levels.

## Developer notes
- `index.html`: Student UI (no correct answers bundled).
- `lib/questions.js`: Instructor-written question bank, intended for server-side import only.
- `lib/session.js`: Signed attempt token and time validation.
- `api/questions.js`: Public question prompts, choices and skill tags.
- `api/start.js`: Code verification and timed session token.
- `api/submit.js`: Scoring and emailed report.
- `api/status.js`: Non-sensitive configuration health.

The GitHub repository is currently public, so anyone can read the server's source question bank and answer keys there. For assessment integrity, **make the repository private** (and keep Vercel connected) before sharing the test with a student. The browser itself does not receive answer keys.

Deployment and Resend account configuration are distinct: a functioning website does not imply emails are enabled.
