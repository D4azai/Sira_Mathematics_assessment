# Cloud scheduler migration

Status: ACTIVE AND VERIFIED on 10 November 2026. QStash invoked production after the local worker was stopped; SUPERVISED_WORKER_ENABLED=false; the live site reports ready=true. The instructor computer can be off. The steps below are retained for recovery/reconfiguration. Eighteen automated tests pass and a fresh live synthetic report was received in Outlook with local processing disabled.

1. In https://console.upstash.com select QStash and copy QSTASH_TOKEN. Use the free plan if suitable; no upgrade is required by this implementation.
2. Add QSTASH_TOKEN as a Sensitive Production variable in the SIRA Vercel project. Do not paste its value in chat. If the console supplies a regional QSTASH_URL, add that non-secret origin too.
3. Deploy the prepared source, including lib/scheduler-config.js and api/setup-scheduler.js.
4. Run node --env-file=.env.release.local scripts/setup-cloud-scheduler.mjs. This administrative call creates/updates exactly one stable QStash schedule, directed only to the SIRA retry endpoint. The QStash token remains server-side; the cron secret is forwarded in a request header, not a URL.
5. The schedule runs every two minutes: 720 initial deliveries/day, below the currently documented QStash free quota of 1,000 messages/day. Retries and any other account usage also count. No billing plan is changed by the script.
6. Verify an actual authenticated cloud callback writes the separate cloud heartbeat. A configured token or successful schedule-create response alone is insufficient. Wait up to one schedule interval plus delivery delay.
7. Disable SUPERVISED_WORKER_ENABLED in Production, redeploy, stop the temporary local worker, and confirm ready=true remains true through cloud callbacks. Run real persistence and end-to-end submission checks again.

The application checks cloud heartbeats for freshness (six minutes) before new starts. A scheduler outage blocks new starts; existing attempts preserve their responses and can submit directly. Expired attempts and failed report sends are processed when the scheduler returns, subject to the documented idempotency window.

QStash is Upstash's scheduler service; its token is separate from the Redis token. Redis credentials cannot be used in QSTASH_TOKEN. The current Resend owner-only testing sender and fixed instructor recipient remain unchanged at the instructor's request.

References:
- https://upstash.com/docs/qstash/api-reference/schedules/create-a-schedule
- https://upstash.com/docs/qstash/howto/publishing
- https://upstash.com/pricing/qstash
