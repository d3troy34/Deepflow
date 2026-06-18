# Production Readiness Runbook

## Rate Limiting And WAF

- Application endpoints now have in-process IP buckets:
  - publication writes: 60 requests/minute per client IP
  - publication reads: 240 requests/minute per client IP
  - live prices: 120 requests/minute per client IP
- This is defense in depth, not a full WAF. Because Vercel functions can run in multiple regions/instances, distributed abuse still needs a Vercel Firewall/WAF rule at the project or domain edge.
- Required Vercel dashboard control: add firewall rules for obvious abusive traffic, country/IP blocks if needed, and bot/challenge rules for unauthenticated API bursts.

## Publication Index Idempotency

- Publication blobs and metadata are written with stable paths and overwrite enabled, so retrying the same publish does not fail on existing objects.
- The publication feed is reconstructed from per-publication `metadata.json` blobs before falling back to `publications/index.json`.
- `publications/index.json` remains a cache for compatibility. The per-publication metadata files are the source of truth for recovery and reduce lost updates when concurrent publish jobs race on the central index.

## Supabase Advisor Controls

- RLS admin checks should use `private.is_admin((select auth.uid()))`, not direct `auth.uid()` calls, to avoid repeated function evaluation in policies.
- Public-read and admin-read policies should be combined into one SELECT policy where possible. Keep write policies separate by command.
- Private schema tables intentionally expose no client data. They have explicit deny-all client policies so RLS posture is visible to advisors while grants remain private.
- Required Supabase dashboard control: enable Auth leaked password protection. This setting is not controlled by SQL migrations in this repo.

## Disaster Recovery

- Target RTO:
  - Vercel/static app restore: 30 minutes after a known-good commit is selected.
  - Supabase database restore: 4 hours, assuming backups/PITR are enabled on the project plan.
  - Blob publication feed restore: 4 hours, by rebuilding from per-publication metadata.
- Target RPO:
  - Git/repo state: last pushed commit.
  - Supabase data: last available backup/PITR point for the project plan.
  - Vercel Blob publications: last successfully written publication metadata blob.
- Restore sequence:
  1. Freeze publish/write operations.
  2. Pick the last known-good Git commit and redeploy on Vercel.
  3. Restore Supabase from backup/PITR if database data is corrupted.
  4. Rebuild the publication feed by listing `publications/**/metadata.json` and writing `publications/index.json`.
  5. Run `npm run check`, `npm run audit:prod`, Supabase advisors, and smoke-test login plus publication read paths.
  6. Unfreeze writes only after the smoke tests pass.
