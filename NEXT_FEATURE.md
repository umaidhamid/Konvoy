# Next feature: Project Activity Log

Feed of project events (create, rename, member changes, file edits) shown on the project page.

**Status: shipped 2026-08-13.** See CHANGELOG.md.

## Backend
- [x] `backend/src/models/activityLog.model.ts` — ActivityLog model (projectId, actorId, action, message, createdAt)
- [x] Add TTL index for auto-expiry (e.g. 90 days)
- [x] Restrict `action` to a known enum of values
- [x] `backend/src/services/activity/activity.service.ts` — `logActivity()` + `listProjectActivity()`
- [x] `backend/src/services/activity/activity.controller.ts` — `getProjectActivity`
- [x] Wire `GET /:projectId/activity` in `projects.routes.ts`
- [x] Add `isMine` flag on entries (actorId === requester)
- [x] Log activity on `createProject`
- [x] Log activity on `updateProject`
- [x] Log activity on `addProjectMember`
- [x] Log activity on `removeProjectMember`
- [x] Log activity on `leaveProject`
- [x] Log activity on `createProjectFile`
- [x] Log activity on `renameProjectFile`
- [x] Log activity on `deleteProjectFile`
- [x] Log activity on `restoreFileVersion`

## Frontend
- [x] `frontend/types/activity.types.ts`
- [x] `frontend/services/activity.service.ts`
- [x] ~~`frontend/lib/formatRelativeTime.ts` util~~ — skipped; reused the existing `timeAgo()` in `lib/adminFormat.ts` instead of adding a second implementation
- [x] Action icon/label/color constants
- [x] `ActivityFeed` component (list rendering)
- [x] Loading state
- [x] Empty state
- [x] "Load more" pagination
- [x] Disable "Load more" while pending
- [x] Relative-time tooltip with absolute date on hover
- [x] Wire react-query for activity data in project page
- [x] Activity toggle/section in project detail page
- [x] "You" label using `isMine`
- [x] Error toast on fetch failure
- [x] aria-live/list semantics for a11y
- [x] Empty-state icon polish
- [x] Scroll container styling for long feed
- [x] Total-count badge ("N updates")
- [x] Actor name fallback to email when `fullname` missing
