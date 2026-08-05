wh# Next feature: Project Activity Log

Feed of project events (create, rename, member changes, file edits) shown on the project page.

## Backend
- [x] `backend/src/models/activityLog.model.ts` — ActivityLog model (projectId, actorId, action, message, createdAt)
- [ ] Add TTL index for auto-expiry (e.g. 90 days)
- [ ] Restrict `action` to a known enum of values
- [ ] `backend/src/services/activity/activity.service.ts` — `logActivity()` + `listProjectActivity()`
- [ ] `backend/src/services/activity/activity.controller.ts` — `getProjectActivity`
- [ ] Wire `GET /:projectId/activity` in `projects.routes.ts`
- [ ] Add `isMine` flag on entries (actorId === requester)
- [ ] Log activity on `createProject`
- [ ] Log activity on `updateProject`
- [ ] Log activity on `addProjectMember`
- [ ] Log activity on `removeProjectMember`
- [ ] Log activity on `leaveProject`
- [ ] Log activity on `createProjectFile`
- [ ] Log activity on `renameProjectFile`
- [ ] Log activity on `deleteProjectFile`
- [ ] Log activity on `restoreFileVersion`
9870527666
## Frontend
- [ ] `frontend/types/activity.types.ts`
- [ ] `frontend/services/activity.service.ts`
- [ ] `frontend/lib/formatRelativeTime.ts` util
- [ ] Action icon/label/color constants
- [ ] `ActivityFeed` component (list rendering)
- [ ] Loading state
- [ ] Empty state
- [ ] "Load more" pagination
- [ ] Disable "Load more" while pending
- [ ] Relative-time tooltip with absolute date on hover
- [ ] Wire react-query for activity data in project page
- [ ] Activity toggle/section in project detail page
- [ ] "You" label using `isMine`
- [ ] Error toast on fetch failure
- [ ] aria-live/list semantics for a11y
- [ ] Empty-state icon polish
- [ ] Scroll container styling for long feed
- [ ] Total-count badge ("N updates")
- [ ] Actor name fallback to email when `fullname` missing
