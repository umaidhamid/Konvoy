# Changelog

Notable changes to the Konvoy platform (backend, dashboard, and marketing site). The CLI has its own history — see [`cli/README.md`](cli/README.md).

## 2026-08-13

### Added — Projects

- **Project activity feed.** Every project now keeps a running log of what's happened to it — created, updated, members added/removed/left, and files created, renamed, deleted, or restored to a previous version. Open it from the new "Activity" section in a project's Share modal; entries are attributed to "You" or the teammate who did it, paginate with "Load more," and auto-expire after 90 days.

## 2026-08-07

### Added — DevOps tools

- **Diff Share.** Paste two versions of any text or config and get a read-only, shareable diff link — side-by-side or inline view, optional expiry, optional view limit. No account needed to view a shared link.
- **Env Drift Check.** Pick two files in a project (e.g. `.env.staging` vs `.env.production`) and see which keys are missing on either side, or present in both with a different value. Values are hidden by default and only shown if you reveal them. Handles `export KEY=value` (bash-sourced) files, and clearly flags a file that doesn't parse as `KEY=VALUE` format instead of silently reporting "no drift."
- **AWS Parameter Store push.** Push a project's `KEY=VALUE` file straight into AWS Systems Manager Parameter Store as `SecureString` or `String` parameters, under a prefix you choose. Credentials are supplied per-request and never stored, logged, or reused. Fails fast on bad credentials (skips remaining keys instead of retrying each one), validates the region/access-key format and the parameter prefix up front, and correctly labels each key as created vs. updated using AWS's own response rather than guessing.

### Added — Admin

- **Per-user bonus storage grants.** Admins can now set a user's bonus storage allowance directly from the Users table (reuses the same `bonusStorageBytes` field the referral program grants). Capped at 100GB per grant. Notifies the user only on a genuine increase — reducing or re-saving the same amount no longer sends a misleading "granted you storage" message.
- **Overview page.** Stat tiles now have icons and the Users/Projects tiles link straight to their admin section.

### Fixed — Navigation & UI

- **Mobile navigation was completely missing** from the dashboard — the sidebar was `hidden` below the `md` breakpoint with nothing replacing it. Added a hamburger-triggered drawer with a backdrop and scroll lock.
- **Dashboard header breadcrumb was hardcoded** to always read "Workspace / Overview" regardless of the current page. It now reflects whichever section is actually active.
- **Diff Share's public share page** was reusing the full marketing navbar (pricing, login, nav links) — replaced with a minimal branded header appropriate for a link someone outside your team might open.
- **Marketing site roadmap section** was listing two already-shipped features ("Team workspaces", "File version history") as "coming next." Replaced with accurate upcoming items.

### Documentation

- Added a "DevOps Tools" section to the in-app documentation page covering Diff Share, Env Drift Check, and AWS Parameter Store push.
- Updated the marketing site's feature grid and the documentation "what's in the MVP" list to include the above.
