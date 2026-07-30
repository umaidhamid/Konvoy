# Konvoy CLI

Konvoy's developer workspace for the config files your projects depend on — from the terminal. Sync `.env` files, editor configs, and the rest of the files git leaves out with your Konvoy projects, and share them with teammates.

Every command that needs a project asks you to pick one fresh each time — there's no "linked folder" concept. Nothing about which project a folder belongs to is ever cached locally.

## Setup

```bash
konvoy login
```

Prompts for:
- **Email**
- **Password**

The API domain is currently fixed to `http://localhost:5000/api/v1` (hardcoded in `src/prompts/login.ts`, no prompt for it right now).

On success, your access/refresh tokens are stored locally so you don't need to log in again. On failure, the spinner shows the error and the command exits with a non-zero status code — nothing is saved.

---

## Commands

### `konvoy login`
Authenticates and stores your session locally. See [Setup](#setup) above.

### `konvoy status`
Checks whether you're logged in, online, and your stored access token still works — hits the server with it. Prints one of:
- `✓ Online` / `✓ Logged in as <email>` / `✓ Access token valid`
- `✗ Offline — could not reach <domain>` (network problem)
- `✗ Access token expired or invalid. Run konvoy login again.` (server reachable, token rejected)

### `konvoy init`
Creates a new project — prompts for a name and optional description. You become its owner. That's all it does; there's no "link this folder" step to run first or after.

### `konvoy add`
The controlled way to upload files. Shows a checklist so you choose exactly what goes up.

1. Scans the current folder (see [exclusions](#whats-excluded-from-scans) below) and shows every file as a checkbox list.
2. You tick the ones you want.
3. Asks **which project** to upload them to — lists every project you have access to, plus a "+ Create a new project" option.
4. For each selected file: if a file with that same relative path already exists on the project, you're asked to confirm the overwrite; otherwise it's created straight away.
5. Prints a live result per file (`✓ Created`, `✓ Updated`, `- Skipped`, `✗ Failed: <reason>`) and a summary.

### `konvoy push`
The bulk way to upload files — **no checklist, uploads everything** it finds in the folder (respecting the same exclusions as `add`). Same "which project?" prompt and per-file overwrite confirmation as `add`. Use this when you want the whole folder synced in one shot; use `add` when you want to be selective.

### `konvoy pull`
Downloads files **from** a project.

1. Lists your projects (owned + shared) → pick one.
2. Prints your current access on that project. If your access is scoped to specific files rather than the whole project, it also tells you how many files you can see — the file list you're shown is already filtered to just those.
3. Choose **Entire project** (writes every file you have access to) or **A particular file** (pick one from what you can see).
4. Confirms before writing.
5. If a file with that name already exists locally, it's saved as `name-copy1.ext`, `name-copy2.ext`, etc. instead of overwriting your existing file.

### `konvoy share`
Invite a teammate to one of your projects by email — with control over which files they can see:

1. Lists the projects **you own** (only owners can invite) → pick one.
2. Fetches that project's file list and asks: **all files** or **specific file(s) only** (checkbox picker).
3. Enter their email.

They're added instantly (no accept step) and get an email notification; the project immediately shows up in their `konvoy pull` list and dashboard, already filtered to whatever file scope you gave them. There's no separate "role" to choose — anyone you add can view and edit whatever is in their scope (see [Team access](#team-access) below).

> Note: file-scope restriction only limits which *existing* files a member can see/edit — it does not currently stop a member from creating brand-new files in the project.

### `konvoy leave`
Lists the projects you're a **member** of (not owner) → pick one → confirms → removes your own access. Owned projects aren't listed here; use `konvoy delete-project` for those.

### `konvoy delete-project`
Permanently deletes a project you own, and every file in it, for every member. Lists only projects you own, asks for confirmation (defaults to "no"). This cannot be undone.

### `konvoy delete-file`
Permanently deletes one or more files from any project you have access to. Pick the project, tick the file(s) to remove, confirm (defaults to "no"). Prints a result per file and a summary. This cannot be undone.

---

## Team access

Every project has one **owner** plus any number of **members**. There's no separate editor/viewer role — anyone added to a project can view and edit whatever is in their access scope:

| Access | Can view/pull files | Can push/edit/create files | Can invite/remove members | Can delete/rename project |
|--------|----------------------|------------------------------|-----------------------------|------------------------------|
| owner  | ✅ (all files)        | ✅                            | ✅                           | ✅                            |
| member | ✅ (scoped or all)    | ✅ (scoped or all)            | ❌                           | ❌                            |

**Access is enforced on the backend**, using the live database state on every request — every command re-fetches your project list fresh, so if an owner has removed you since the last time you ran a command, you'll get an immediate, accurate error instead of a pile of failed uploads.

**File scope** (set at invite time via `konvoy share`) limits *which files* a member can see and act on at all — `getProjectFiles`/`pull` only ever returns the files in scope, and trying to open/edit a file outside that scope 404s as if it didn't exist.

Use `konvoy share` (owner only) to add someone with a specific file scope, and `konvoy leave` (member) to remove yourself, or `konvoy delete-project` (owner) to remove everyone.

---

## What's excluded from scans

`add` and `push` both skip:
- Directories: `node_modules`, `.git`, `dist`, `build`, `.next`, `out`, `.konvoy`
- Files: `.env`, `.DS_Store`
- Binary-ish extensions: images, video, audio, archives, fonts, `.pdf`
- Any file over 2MB

**Known gap:** the `.env` exclusion only matches a file literally named `.env` — a file like `myproject.env` is *not* excluded and will be uploaded. Be careful with secrets in oddly-named env files until this is fixed.

---

## Typical workflows

**Upload a project, being selective:**
```bash
konvoy login
cd my-project
konvoy add        # tick the files, pick the project, repeat whenever you edit something
```

**Upload everything at once:**
```bash
cd my-project
konvoy push       # pick the project, confirm, done
```

**Pull someone else's project down:**
```bash
konvoy login
mkdir new-folder && cd new-folder
konvoy pull   # pick project → "Entire project"
```

**Bring a teammate onto a project:**
```bash
konvoy share   # pick project (from ones you own), all files or specific ones, then their email
```

**Step away from a shared project:**
```bash
konvoy leave   # pick which project to leave
```

**Delete a project you own:**
```bash
konvoy delete-project
```

**Remove specific files from a project:**
```bash
konvoy delete-file
```

**Check your session:**
```bash
konvoy status
```

---

## Roadmap (not built yet)

- **`konvoy push --dry-run`** — preview what would be created/updated/skipped before actually uploading anything.
- **`konvoy logout`** — clear stored credentials from this machine (currently there's no way to log out from the CLI).
- **Fix the `.env` exclusion** to match any `*.env` file, not just the literal `.env`.
- **Respect `.gitignore`** when scanning, instead of a fixed exclusion list.
- **`konvoy members`** — list/remove members of a project from the CLI (currently only possible from the frontend dashboard, plus `share` to add and `leave` to self-remove).
- **Frontend "Share" modal doesn't yet support file-scope selection** — it can only grant access to the whole project. The CLI (`konvoy share`) is currently the only way to scope a member to specific files.
- **File-scope doesn't block file creation** — a scoped member can still create new files outside their granted set; only existing-file access is scoped.
