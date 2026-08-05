# Next feature: File Version Diff View

Side-by-side/inline diff between two versions of a project file, surfaced inside the existing Version History panel (`IDEVersionHistory` in [ide-components.tsx](frontend/components/admin/projects/ide-components.tsx)).

Today the panel only shows a truncated text preview and a raw `+N/-N chars vs current` count — no actual line diff. Monaco (already used for the editor via `@monaco-editor/react`) ships a `DiffEditor` component, so this is mostly wiring, not new infra. Backend already stores the last 2 previous versions per file and exposes them via `GET /:id/versions` ([projectFile.routes.ts](backend/src/services/ProjectFile/projectFile.routes.ts)) — no new persistence needed.

## Backend
- [ ] None required for v1 — `getFileVersions` already returns decrypted `current` + `previousVersions` content, which is enough to diff client-side
- [ ] (optional, later) Log a `viewDiff` activity action if we want this to show up in the activity feed

## Frontend
- [x] Add "Compare" button next to each non-current row in `IDEVersionHistory` (next to existing `Restore` button)
- [x] `IDEDiffModal` component wrapping Monaco's `DiffEditor` (original = selected version, modified = current)
- [x] Default to side-by-side diff mode; toggle for inline
- [x] Reuse `getLanguageFromFilename` (already used by the main editor) so diff gets syntax highlighting
- [x] Handle "identical to current" case — restore button disabled, header shows "identical — no changes" (Compare itself stays enabled so you can confirm there's nothing to see)
- [ ] Handle diffing two *previous* versions against each other (not just vs. current) — small dropdown/selector for the left side
- [x] Loading state while opening (content already in memory from `versions`; DiffEditor's own `loading` fallback covers the Monaco chunk load)
- [x] "Restore this version" action available directly from the diff view, not just the list row
- [ ] Line-count / additions-removals summary badge in the modal header
- [x] Keyboard shortcut / Esc to close, consistent with existing panel
- [ ] Empty-file edge case (e.g. version content is "") renders cleanly in DiffEditor — untested
