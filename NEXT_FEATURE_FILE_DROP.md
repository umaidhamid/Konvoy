# Next feature: File Drop (one-time/expiring file share)

Same trust model as Secrets ([secret.model.ts](backend/src/models/secret.model.ts)) — expiry, view/download limits, passphrase, revoke, view logging — but the payload is a binary file instead of pasted text. A mini self-destructing file transfer built on infra that's already battle-tested.

Reuse, don't rebuild: the `token` generation, passphrase hashing, `expiresAt`/`maxViews`/`viewLog`/`isRevoked`/`requireAuth` fields and their enforcement logic in [secret.service.ts](backend/src/services/secrets/secret.service.ts) apply almost unchanged — only the stored payload and delivery mechanism differ (stream a file instead of returning decrypted text).

## Backend
- [ ] `backend/src/models/fileDrop.model.ts` — mirror `secret.model.ts` fields (token, createdBy, expiresAt, maxViews→rename `maxDownloads`, viewCount→`downloadCount`, viewLog, isRevoked, requireAuth, hasPassphrase, passphraseHash, failedAttempts) + `originalName`, `mimeType`, `sizeBytes`, `storageKey`
- [ ] Decide storage backend: local disk (dev) vs. S3/blob storage (prod) behind a small adapter — do NOT store file bytes in Mongo
- [ ] Enforce a max upload size (align with existing plan storage limits via `resolvePlanLimitsForUser`)
- [ ] Enforce per-account total File Drop storage against the same plan quota used by project files
- [ ] `backend/src/services/fileDrop/fileDrop.service.ts` — `createDrop()`, `peekDrop()` (metadata only, no auth), `downloadDrop()` (decrements counter, appends viewLog), `revokeDrop()`, `listMyDrops()`
- [ ] `backend/src/services/fileDrop/fileDrop.controller.ts` + `fileDrop.routes.ts`, mirroring `secret.routes.ts`'s public vs. authed split:
  - [ ] `GET /peek/:token` — public, metadata (filename, size, expiry, requiresPassphrase) without consuming a download
  - [ ] `POST /download/:token` — public, passphrase in body if required, streams the file and burns a view
  - [ ] `POST /` — authed, multipart upload
  - [ ] `GET /mine`, `DELETE /:id` (revoke) — authed
- [ ] Malware/type scanning hook point (even if a no-op stub for v1) before a file becomes downloadable
- [ ] Delete underlying blob when a drop expires, is revoked, or exhausts `maxDownloads` (cron/TTL, not just DB record cleanup)
- [ ] Auto-expiry index (same TTL pattern already planned for `activityLog`)

## Frontend
- [ ] `frontend/app/share/file/[token]/page.tsx` — public recipient page, mirrors `app/share/[token]` secret view (passphrase prompt, expired/revoked/exhausted states)
- [ ] Drag-and-drop upload page (new "Files" section, separate from per-project files) with progress bar
- [ ] Create-drop form: expiry, max downloads, passphrase, require-auth — same options as the Secret create form, reuse component if the Secret form is generic enough
- [ ] `frontend/services/fileDrop.service.ts` + `frontend/types/fileDrop.types.ts`
- [ ] "My Drops" list page (mirrors secrets list): filename, size, downloads used/remaining, expiry countdown, revoke action
- [ ] Download progress / large-file handling on the recipient page
- [ ] Copy-link button + share sheet, consistent with existing secret share UX
- [ ] File-type icon based on mimetype (reuse `getFileIcon` pattern from `ide-utils`)
