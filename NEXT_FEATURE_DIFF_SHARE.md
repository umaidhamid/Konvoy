# Next feature: Diff Share

Paste two blocks of text/code, get a shareable read-only diff link. Nearly free to build: the `IDEDiffModal` component (added in [ide-components.tsx](frontend/components/admin/projects/ide-components.tsx)) already wraps Monaco's `DiffEditor` with side-by-side/inline toggle and syntax highlighting — this feature is mostly a new route plus a "paste two blobs" form and a small backend record, not new diffing logic.

Lighter-weight than Secrets/File Drop: no passphrase/view-limit complexity needed for v1 (diffs are meant to be shared openly, e.g. in a PR comment or Slack), though expiry is still worth having for cleanup.

## Backend
- [ ] `backend/src/models/diffShare.model.ts` — token, createdBy (nullable — allow anonymous), title (optional), leftLabel, rightLabel, leftContent, rightContent, language (optional override), createdAt, expiresAt (default e.g. 30 days), viewCount
- [ ] `backend/src/services/diffShare/diffShare.service.ts` — `createDiffShare()`, `getDiffShare(token)` (public, increments viewCount), `listMyDiffShares()`, `deleteDiffShare()`
- [ ] `backend/src/services/diffShare/diffShare.controller.ts` + `diffShare.routes.ts`:
  - [ ] `POST /` — create (works both authed and anonymous if we want a no-signup quick-share flow; otherwise require auth like Secrets)
  - [ ] `GET /:token` — public read
  - [ ] `GET /mine`, `DELETE /:id` — authed
- [ ] Size cap per side (e.g. 200KB) to keep this from becoming a general paste/file store
- [ ] TTL index for auto-expiry, same pattern as File Drop / Activity Log
- [ ] Language auto-detection fallback if not provided (reuse `getLanguageFromFilename`-style guess, or a simple heuristic/library)

## Frontend
- [ ] `frontend/app/share/diff/[token]/page.tsx` — public read-only page rendering `IDEDiffModal`'s `DiffEditor` inline (not as a modal) with left/right labels and a "copy link" button
- [ ] Create page: two text areas (or paste-from-clipboard), optional labels/title, language override, expiry selector
- [ ] Extract the `DiffEditor` rendering out of `IDEDiffModal` into a shared presentational component so both the version-history modal and this new page use the same core, instead of duplicating Monaco setup
- [ ] `frontend/services/diffShare.service.ts` + `frontend/types/diffShare.types.ts`
- [ ] "My Diffs" list page (optional for v1) — title/labels, created date, view count, delete
- [ ] Expired/not-found states on the public page
- [ ] Side-by-side/inline toggle carried over from `IDEDiffModal`
- [ ] Quick "New Diff" entry point from the dashboard/header, alongside existing "New Secret" affordance
