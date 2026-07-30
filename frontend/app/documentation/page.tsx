"use client"
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Terminal, GitBranch as Github, Copy, Check, Lock, FolderKanban, FileCode2,
  LayoutDashboard, ShieldCheck, Menu, X, ArrowRight, Search, ChevronDown,
  Server, Globe, Database, KeyRound, Mail, Clock, Circle, FileJson, FileType,
  Braces, Settings2, HelpCircle, BookOpen, ListChecks, PlugZap, CreditCard,
  History, Users, MessageSquare,
} from "lucide-react";
import { BrandMark } from "@/components/auth/brand-mark";

/* ------------------------------------------------------------------ */
/*  Sidebar structure                                                 */
/* ------------------------------------------------------------------ */

const SIDEBAR = [
  { id: "introduction", label: "Introduction", icon: BookOpen, top: true },
  {
    id: "getting-started",
    label: "Getting Started",
    icon: PlugZap,
    children: [
      { id: "getting-started-installation", label: "Installation" },
      { id: "getting-started-authentication", label: "Authentication" },
    //   { id: "getting-started-first-project", label: "First Project" },
    ],
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    children: [
      { id: "dashboard-projects", label: "Projects" },
      { id: "dashboard-files", label: "Files" },
      { id: "dashboard-editor", label: "Editor" },
      { id: "dashboard-versions", label: "Version history" },
      { id: "dashboard-team", label: "Team members" },
    ],
  },
  { id: "secrets", label: "Secret Sharing", icon: KeyRound, top: true },
  { id: "plans", label: "Plans & Limits", icon: CreditCard, top: true },
  {
    id: "cli",
    label: "CLI",
    icon: Terminal,
    children: [
      { id: "cli-installation", label: "Installation" },
      { id: "cli-login", label: "Login" },
      { id: "cli-commands", label: "Commands" },
    ],
  },
//   { id: "api-reference", label: "API Reference", icon: KeyRound, top: true },
  { id: "supported-files", label: "Supported Files", icon: FileCode2, top: true },
  { id: "admin", label: "Admin Panel", icon: ShieldCheck, top: true },
  { id: "faq", label: "FAQ", icon: HelpCircle, top: true },
  { id: "roadmap", label: "Roadmap", icon: ListChecks, top: true },
];

// Flat list of every scrollspy-able id, in document order
const ALL_IDS = SIDEBAR.flatMap((s) => (s.children ? [s.id, ...s.children.map((c) => c.id)] : [s.id]));

/* ------------------------------------------------------------------ */
/*  Content data                                                      */
/* ------------------------------------------------------------------ */

const API_GROUPS = [
  {
    title: "Auth",
    icon: KeyRound,
    rows: [
      { method: "POST", path: "/api/v1/auth/register", desc: "Create an account" },
      { method: "POST", path: "/api/v1/auth/login", desc: "Exchange credentials for tokens" },
      { method: "POST", path: "/api/v1/auth/logout", desc: "Invalidate the current session" },
      { method: "POST", path: "/api/v1/auth/refresh", desc: "Issue a new access token" },
      { method: "POST", path: "/api/v1/auth/forgot-password", desc: "Start account recovery" },
      { method: "POST", path: "/api/v1/auth/reset-password", desc: "Set a new password" },
    ],
  },
  {
    title: "Projects",
    icon: FolderKanban,
    rows: [
      { method: "POST", path: "/api/v1/projects", desc: "Create a project" },
      { method: "GET", path: "/api/v1/projects", desc: "List your projects" },
      { method: "GET", path: "/api/v1/projects/:id", desc: "Get a single project" },
      { method: "PATCH", path: "/api/v1/projects/:id", desc: "Update a project" },
      { method: "DELETE", path: "/api/v1/projects/:id", desc: "Delete a project" },
    ],
  },
  {
    title: "Project files",
    icon: FileCode2,
    rows: [
      { method: "POST", path: "/api/v1/projects/:id/files", desc: "Create a file" },
      { method: "GET", path: "/api/v1/projects/:id/files", desc: "List a project's files" },
      { method: "GET", path: "/api/v1/files/:id", desc: "Get a single file" },
    ],
  },
  {
    title: "Contact",
    icon: Mail,
    rows: [{ method: "POST", path: "/api/v1/contact/send", desc: "Send a message via Nodemailer" }],
  },
];

const CLI_COMMANDS = [
  { cmd: "konvoy login", desc: "Authenticate and store your session locally" },
  { cmd: "konvoy status", desc: "Check you're online, logged in, and your token still works" },
  { cmd: "konvoy init", desc: "Create a new project" },
  { cmd: "konvoy add", desc: "Pick specific file(s) to upload to a project you choose" },
  { cmd: "konvoy push", desc: "Push all local files in the current folder to a project you choose" },
  { cmd: "konvoy pull", desc: "List your projects" },
  { cmd: "konvoy share", desc: "Invite a teammate (by email) to a project you own" },
  { cmd: "konvoy leave", desc: "Leave a project you're a member of" },
  { cmd: "konvoy delete-file", desc: "Permanently delete file(s) from a project" },
  { cmd: "konvoy delete-project", desc: "Permanently delete a project you own" },
];

const SUPPORTED_FILES = [
  { icon: Settings2, ext: ".env", label: "Environment variables" },
  { icon: FileJson, ext: ".json", label: "JSON config" },
  { icon: Braces, ext: ".yaml / .yml", label: "YAML config" },
  { icon: FileType, ext: ".toml", label: "TOML config" },
  { icon: FileCode2, ext: ".js / .ts", label: "JS or TS config files" },
  { icon: Terminal, ext: "Dockerfile", label: "Container definitions" },
  { icon: Settings2, ext: ".eslintrc", label: "Lint configuration" },
  { icon: FileType, ext: ".gitignore", label: "Ignore rules" },
];

const MVP_DONE = [
  "Register, log in, log out, account recovery",
  "Create, view, update, delete projects",
  "Create, view, edit, save files — encrypted at rest",
  "Version history (last 2 saves, with restore)",
  "Invite teammates to a project by email, with per-file access scoping",
  "CLI: login, init, add, push, pull, share, leave, delete",
  "Dashboard: projects, files, editor",
  "Secret sharing — expiring, single-use links for passwords and config values",
  "Plans & quotas — file size, storage, files/project, members/project, projects/user",
  "Admin panel — users, projects, plans, contact inbox, activity log",
];

const DEFERRED = [
  "Diff view between file versions",
  "Two-factor authentication (2FA)",
  "GitHub integration",
  "CLI watch mode",
  "Automatic sync",
  "Personal access tokens for CI",
  "Search inside file contents",
  "Self-serve payment for paid plans",
  "AI features",
];

const FAQS = [
  {
    q: "Is my file content encrypted?",
    a: "Yes. File content is encrypted (AES-256-GCM) before it's stored, and only decrypted when you fetch it for editing or download. The same applies to anything sent through Secret Sharing.",
  },
  {
    q: "Can I use the CLI in CI?",
    a: "You can today by pulling with a locally stored session, but scoped personal access tokens for headless environments haven't shipped yet. They're on the roadmap.",
  },
  {
    q: "Does Konvoy support teams or shared projects?",
    a: "Yes — a project owner can invite teammates by email, optionally scoped to specific files. How many teammates fit in one project depends on your plan's limit.",
  },
  {
    q: "How does Secret Sharing decide when a link stops working?",
    a: "Whichever comes first: the expiry you chose when creating it (10 minutes up to 7 days), or — if you left \"Single use only\" checked — the moment someone reveals it. Either way, the content is gone from the server after that.",
  },
  {
    q: "What happens if I pull on a machine with existing files?",
    a: "konvoy pull writes the tracked versions to disk, overwriting local copies at the same path. Commit or back up local changes first if you're not sure they're tracked.",
  },
  {
    q: "Can I self-host the backend?",
    a: "The backend is a standard Node.js and Express service backed by MongoDB, so it can run anywhere you can run those. There's no packaged self-host guide yet.",
  },
];

/* ------------------------------------------------------------------ */
/*  Tiny syntax highlighter (regex-based, no deps)                    */
/* ------------------------------------------------------------------ */

function highlight(code: string, lang: string) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = esc(code);

  if (lang === "bash") {
    html = html
      .replace(/^(#.*)$/gm, '<span class="tok-comment">$1</span>')
      .replace(/^([\w-]+)(?=\s|$)/gm, '<span class="tok-cmd">$1</span>')
      .replace(/(--?[\w-]+)/g, '<span class="tok-flag">$1</span>')
      .replace(/(&lt;[^&]+?&gt;)/g, '<span class="tok-var">$1</span>');
  } else if (lang === "json") {
    html = html
      .replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="tok-key">$1</span>$2')
      .replace(/:\s*(&quot;[^&]*?&quot;)/g, ': <span class="tok-str">$1</span>')
      .replace(/:\s*(\d+(\.\d+)?)/g, ': <span class="tok-num">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span class="tok-key2">$1</span>');
  } else if (lang === "js" || lang === "ts") {
    html = html
      .replace(/(\/\/.*)$/gm, '<span class="tok-comment">$1</span>')
      .replace(/\b(const|let|import|from|export|default|async|await|function|return|new)\b/g, '<span class="tok-kw">$1</span>')
      .replace(/(&#39;[^&]*?&#39;|"[^"]*?")/g, '<span class="tok-str">$1</span>');
  } else if (lang === "http") {
    html = html
      .replace(/^(GET|POST|PATCH|DELETE|PUT)/gm, '<span class="tok-kw">$1</span>')
      .replace(/^([\w-]+):/gm, '<span class="tok-key">$1</span>:');
  }
  return html;
}

function CopyButton({ text, small }: { text: string; small?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable — no-op */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button onClick={handleCopy} className={`knv-copy-btn ${small ? "sm" : ""}`} aria-label="Copy to clipboard" type="button">
      {copied ? <Check size={13} /> : <Copy size={13} />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function CodeLine({ text }: { text: string }) {
  return (
    <div className="knv-codeline">
      <span className="knv-prompt">$</span>
      <code dangerouslySetInnerHTML={{ __html: highlight(text, "bash") }} />
      <CopyButton text={text} small />
    </div>
  );
}

function CodeBlock({ code, lang = "bash", filename }: { code: string; lang?: string; filename?: string }) {
  return (
    <div className="knv-codeblock">
      <div className="knv-codeblock-head">
        <div className="knv-codeblock-dots">
          <span /><span /><span />
        </div>
        <span className="knv-codeblock-file">{filename || lang}</span>
        <CopyButton text={code} small />
      </div>
      <pre><code dangerouslySetInnerHTML={{ __html: highlight(code, lang) }} /></pre>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="knv-eyebrow">{children}</div>;
}

function MethodBadge({ method }: { method: string }) {
  return <span className={`knv-method knv-method-${method.toLowerCase()}`}>{method}</span>;
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
type SidebarItem = (typeof SIDEBAR)[number];
export default function KonvoyDocs() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState("introduction");
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    ALL_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredSidebar : SidebarItem[]=  useMemo(() => {
    if (!query.trim()) return SIDEBAR;
    const q = query.toLowerCase();
    return SIDEBAR.map((s) => {
      if (s.children) {
        const children = s.children.filter((c) => c.label.toLowerCase().includes(q));
        const selfMatch = s.label.toLowerCase().includes(q);
        if (children.length || selfMatch) return { ...s, children: selfMatch ? s.children : children };
        return null;
      }
      return s.label.toLowerCase().includes(q) ? s : null;
    }).filter((item): item is SidebarItem => item !== null);
  }, [query]);

  const isActiveGroup = (item: SidebarItem) =>
    item.id === activeId || (item.children && item.children.some((c) => c.id === activeId));

  const SidebarNav = (
    <nav className="knv-side-nav" aria-label="Documentation">
      <div className="knv-side-search">
        <Search size={14} />
        <input
          type="text"
          placeholder="Search docs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search documentation"
        />
        <span className="knv-side-search-kbd">/</span>
      </div>
      <div className="knv-side-groups">
        {filteredSidebar.map((item) => (
          <div className="knv-side-group" key={item.id}>
            <button
              className={`knv-side-link ${item.top ? "top" : "group"} ${isActiveGroup(item) ? "active" : ""}`}
              onClick={() => scrollTo(item.id)}
            >
              <item.icon size={14} />
              <span>{item.label}</span>
            </button>
            {item.children && (
              <div className="knv-side-children">
                {item.children.map((c) => (
                  <button
                    key={c.id}
                    className={`knv-side-link child ${activeId === c.id ? "active" : ""}`}
                    onClick={() => scrollTo(c.id)}
                  >
                    <span className="knv-side-dot" />
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );

  return (
    <div className="konvoy-docs">
      <style>{`
        .konvoy-docs {
          --bg: var(--background);
          --surface: var(--card);
          --surface-2: var(--muted);
          --border-soft: color-mix(in srgb, var(--border) 70%, transparent);
          --text: var(--foreground);
          --text-muted: var(--muted-foreground);
          --text-faint: color-mix(in srgb, var(--muted-foreground) 75%, transparent);
          --amber: var(--primary);
          --amber-dim: color-mix(in srgb, var(--primary) 45%, transparent);
          --amber-wash: color-mix(in srgb, var(--primary) 10%, transparent);
          --blue: #5b8def;
          --blue-dim: color-mix(in srgb, #5b8def 18%, transparent);
          --green: var(--success);
          --green-dim: color-mix(in srgb, var(--success) 18%, transparent);
          --red: var(--destructive);
          --red-dim: color-mix(in srgb, var(--destructive) 18%, transparent);
          font-family: var(--font-sans), system-ui, sans-serif;
          background: var(--bg);
          color: var(--text);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          scroll-behavior: smooth;
        }
        .konvoy-docs * { box-sizing: border-box; }
        .konvoy-docs h1, .konvoy-docs h2, .konvoy-docs h3 { font-family: var(--font-geist-sans), sans-serif; letter-spacing: -0.02em; margin: 0; }
        .konvoy-docs code, .knv-mono { font-family: var(--font-geist-mono), monospace; }
        .konvoy-docs a { color: inherit; text-decoration: none; }
        .konvoy-docs p { margin: 0; }

        /* ---------- top nav ---------- */
        .knv-nav {
          position: sticky; top: 0; z-index: 60; display: flex; align-items: center; justify-content: space-between;
          height: 56px; padding: 0 20px; background: color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-soft);
        }
        .knv-brand { display: flex; align-items: center; gap: 9px; }
        .knv-brand-tag {
          font-family: var(--font-geist-mono), monospace; font-size: 10px; color: var(--text-faint);
          border: 1px solid var(--border); padding: 1px 6px; border-radius: 4px; margin-left: 2px;
        }
        .knv-nav-right { display: flex; align-items: center; gap: 10px; }
        .knv-gh-btn {
          display: flex; align-items: center; gap: 6px; font-size: 13px; border: 1px solid var(--border);
          padding: 6px 12px; border-radius: 7px; color: var(--text-muted); transition: border-color .15s, color .15s;
        }
        .knv-gh-btn:hover { color: var(--text); border-color: var(--text-faint); }
        .knv-menu-btn { display: none; background: none; border: none; color: var(--text); padding: 6px; }

        /* ---------- shell: sidebar + content ---------- */
        .knv-shell { display: grid; grid-template-columns: 260px minmax(0,1fr); max-width: 1240px; margin: 0 auto; }

        .knv-sidebar {
          position: sticky; top: 56px; height: calc(100vh - 56px); overflow-y: auto;
          border-right: 1px solid var(--border-soft); padding: 24px 14px 60px;
        }
        .knv-sidebar::-webkit-scrollbar { width: 6px; }
        .knv-sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

        .knv-side-search {
          display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--border);
          border-radius: 8px; padding: 8px 10px; margin-bottom: 20px; color: var(--text-faint);
        }
        .knv-side-search input {
          flex: 1; background: none; border: none; outline: none; color: var(--text); font-size: 13px; font-family: var(--font-sans), sans-serif;
        }
        .knv-side-search input::placeholder { color: var(--text-faint); }
        .knv-side-search-kbd {
          font-family: var(--font-geist-mono), monospace; font-size: 10px; border: 1px solid var(--border);
          border-radius: 4px; padding: 1px 5px; color: var(--text-faint);
        }

        .knv-side-groups { display: flex; flex-direction: column; gap: 2px; }
        .knv-side-group { margin-bottom: 6px; }
        .knv-side-link {
          width: 100%; display: flex; align-items: center; gap: 9px; background: none; border: none; cursor: pointer;
          text-align: left; padding: 7px 10px; border-radius: 7px; font-size: 13.5px; color: var(--text-muted);
          font-family: var(--font-sans), sans-serif; transition: color .15s, background .15s;
        }
        .knv-side-link.top { font-weight: 600; color: var(--text); }
        .knv-side-link.group { font-weight: 600; color: var(--text); margin-bottom: 1px; }
        .knv-side-link:hover { color: var(--text); background: var(--surface); }
        .knv-side-link.active { color: var(--amber); background: var(--amber-wash); }
        .knv-side-link.child { padding: 6px 10px 6px 14px; font-size: 13px; font-weight: 400; position: relative; }
        .knv-side-children { border-left: 1px solid var(--border-soft); margin-left: 20px; padding-left: 0; display: flex; flex-direction: column; }
        .knv-side-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--text-faint); flex-shrink: 0; }
        .knv-side-link.child.active .knv-side-dot { background: var(--amber); box-shadow: 0 0 6px var(--amber); }

        .knv-mobile-panel {
          position: fixed; inset: 56px 0 0 0; z-index: 55; background: var(--bg); padding: 20px; overflow-y: auto;
        }

        /* ---------- main content ---------- */
        .knv-main { min-width: 0; padding: 0 40px 120px; }
        .knv-doc-section { padding: 64px 0; border-top: 1px solid var(--border-soft); max-width: 760px; }
        .knv-doc-section:first-of-type { border-top: none; padding-top: 56px; }
        .knv-doc-sub { padding: 44px 0 8px; max-width: 760px; scroll-margin-top: 72px; }
        .knv-doc-section { scroll-margin-top: 72px; }

        .knv-eyebrow {
          font-family: var(--font-geist-mono), monospace; font-size: 11.5px; color: var(--amber); letter-spacing: 0.08em;
          text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
        }
        .knv-eyebrow::before { content: ''; width: 14px; height: 1px; background: var(--amber-dim); }
        .knv-h1 { font-size: 34px; font-weight: 700; margin-bottom: 14px; }
        .knv-h2 { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
        .knv-h3 { font-size: 17px; font-weight: 600; margin-bottom: 10px; }
        .knv-lede { color: var(--text-muted); font-size: 15.5px; margin-bottom: 28px; }
        .knv-p { color: var(--text-muted); font-size: 14.5px; margin-bottom: 16px; }
        .knv-p:last-child { margin-bottom: 0; }
        .knv-p strong, .knv-p b { color: var(--text); font-weight: 600; }
        .knv-p code { background: var(--surface-2); border: 1px solid var(--border-soft); border-radius: 4px; padding: 1px 6px; font-size: 13px; color: var(--amber); }

        .knv-hero-badge {
          display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-muted);
          border: 1px solid var(--border); padding: 5px 12px; border-radius: 999px; margin-bottom: 22px;
          font-family: var(--font-geist-mono), monospace;
        }
        .knv-hero-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px var(--green); }

        .knv-btn-primary {
          display: inline-flex; align-items: center; gap: 8px; background: var(--amber); color: var(--primary-foreground); font-weight: 600;
          font-size: 14px; padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer; transition: background .15s;
        }
        .knv-btn-primary:hover { background: color-mix(in srgb, var(--amber) 85%, white); }
        .knv-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px; background: var(--surface); color: var(--text); font-weight: 500;
          font-size: 14px; padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border); cursor: pointer; transition: border-color .15s;
        }
        .knv-btn-secondary:hover { border-color: var(--text-faint); }
        .knv-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 30px; }

        /* code line (inline command) */
        .knv-codeline {
          display: flex; align-items: center; gap: 10px; background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 8px; padding: 9px 11px; max-width: 480px; margin: 14px 0;
        }
        .knv-prompt { color: var(--amber); font-family: var(--font-geist-mono), monospace; font-size: 13px; }
        .knv-codeline code { font-size: 13px; color: var(--text); flex: 1; white-space: nowrap; overflow-x: auto; }
        .knv-copy-btn {
          display: flex; align-items: center; gap: 5px; background: none; border: none; color: var(--text-faint);
          font-size: 11px; cursor: pointer; padding: 4px 6px; border-radius: 5px; font-family: var(--font-sans), sans-serif; flex-shrink: 0;
        }
        .knv-copy-btn:hover { color: var(--text); background: var(--surface); }

        /* full code block */
        .knv-codeblock { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin: 16px 0; }
        .knv-codeblock-head { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-bottom: 1px solid var(--border-soft); background: var(--surface-2); }
        .knv-codeblock-dots { display: flex; gap: 5px; }
        .knv-codeblock-dots span { width: 8px; height: 8px; border-radius: 50%; background: var(--border); }
        .knv-codeblock-file { flex: 1; font-family: var(--font-geist-mono), monospace; font-size: 11.5px; color: var(--text-faint); }
        .knv-codeblock pre { margin: 0; padding: 16px; overflow-x: auto; }
        .knv-codeblock code { font-family: var(--font-geist-mono), monospace; font-size: 13px; line-height: 1.7; color: var(--text); white-space: pre; }
        .tok-comment { color: var(--text-faint); font-style: italic; }
        .tok-cmd { color: var(--amber); }
        .tok-flag { color: var(--blue); }
        .tok-var { color: var(--green); }
        .tok-key { color: var(--blue); }
        .tok-key2 { color: var(--amber); }
        .tok-str { color: var(--green); }
        .tok-num { color: #d99a5b; }
        .tok-kw { color: var(--amber); }

        /* route / timeline signature — used for step sequences */
        .knv-route { position: relative; padding-left: 30px; margin-top: 20px; }
        .knv-route::before {
          content: ''; position: absolute; left: 5px; top: 4px; bottom: 4px; width: 2px;
          background-image: linear-gradient(var(--amber-dim), var(--amber-dim) 55%, transparent 55%);
          background-size: 2px 12px; background-repeat: repeat-y; opacity: 0.55;
        }
        .knv-step { position: relative; padding-bottom: 26px; }
        .knv-step:last-child { padding-bottom: 0; }
        .knv-step::before {
          content: ''; position: absolute; left: -30px; top: 3px; width: 11px; height: 11px; border-radius: 50%;
          background: var(--bg); border: 2px solid var(--amber);
        }
        .knv-step h4 { font-size: 14.5px; font-weight: 600; margin-bottom: 4px; }
        .knv-step p { font-size: 13.5px; color: var(--text-muted); margin: 0 0 10px; }

        /* cards */
        .knv-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 8px; }
        .knv-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 8px; }
        .knv-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 8px; }
        .knv-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px;
          transition: border-color .15s, transform .15s;
        }
        .knv-card:hover { border-color: var(--text-faint); }
        .knv-card-icon {
          width: 30px; height: 30px; border-radius: 8px; background: var(--surface-2); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center; margin-bottom: 12px; color: var(--amber);
        }
        .knv-card h4 { font-size: 14px; font-weight: 600; margin-bottom: 6px; }
        .knv-card p { font-size: 13px; color: var(--text-muted); margin: 0; }

        .knv-file-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 9px; padding: 14px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .knv-file-card .ext { font-family: var(--font-geist-mono), monospace; font-size: 13px; color: var(--text); font-weight: 600; }
        .knv-file-card p { font-size: 12px; color: var(--text-muted); margin: 0; }
        .knv-file-card svg { color: var(--amber); }

        /* api / cli rows */
        .knv-api-group { margin-bottom: 28px; }
        .knv-api-group:last-child { margin-bottom: 0; }
        .knv-api-group-title {
          display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-muted); font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;
        }
        .knv-row {
          display: grid; grid-template-columns: 64px 1fr auto; align-items: center; gap: 14px; padding: 11px 13px;
          border: 1px solid var(--border-soft); border-radius: 8px; margin-bottom: 6px; background: var(--surface);
        }
        .knv-row code { font-size: 12.5px; color: var(--text); }
        .knv-row .desc { font-size: 12px; color: var(--text-faint); text-align: right; }
        .knv-method {
          font-family: var(--font-geist-mono), monospace; font-size: 10px; font-weight: 600; text-align: center;
          padding: 3px 0; border-radius: 5px; letter-spacing: 0.03em;
        }
        .knv-method-get { color: var(--blue); background: var(--blue-dim); }
        .knv-method-post { color: var(--green); background: var(--green-dim); }
        .knv-method-patch { color: var(--amber); background: var(--amber-wash); }
        .knv-method-delete { color: var(--red); background: var(--red-dim); }

        .knv-cli-row {
          display: grid; grid-template-columns: minmax(200px, 1fr) 1fr; gap: 18px; align-items: center;
          padding: 12px 13px; border: 1px solid var(--border-soft); border-radius: 8px; margin-bottom: 6px; background: var(--surface);
        }
        .knv-cli-row code { font-size: 12.5px; color: var(--amber); }
        .knv-cli-row span.d { font-size: 12.5px; color: var(--text-muted); }

        /* faq accordion */
        .knv-faq-item { border: 1px solid var(--border-soft); border-radius: 9px; margin-bottom: 8px; overflow: hidden; background: var(--surface); }
        .knv-faq-q {
          width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: none;
          border: none; cursor: pointer; padding: 14px 16px; text-align: left; color: var(--text); font-size: 14px; font-weight: 500;
          font-family: var(--font-sans), sans-serif;
        }
        .knv-faq-q svg { color: var(--text-faint); flex-shrink: 0; transition: transform .2s; }
        .knv-faq-q.open svg { transform: rotate(180deg); color: var(--amber); }
        .knv-faq-a { padding: 0 16px 16px; font-size: 13.5px; color: var(--text-muted); max-width: 620px; }

        /* roadmap */
        .knv-roadmap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 8px; }
        .knv-roadmap-card { border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; background: var(--surface); }
        .knv-roadmap-card h4 { font-size: 13.5px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; font-weight: 600; }
        .knv-roadmap-card ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .knv-roadmap-card li { display: flex; align-items: center; gap: 9px; font-size: 13px; color: var(--text-muted); }
        .knv-check { color: var(--green); flex-shrink: 0; }
        .knv-later { color: var(--text-faint); flex-shrink: 0; }
        .knv-roadmap-card.done h4 { color: var(--green); }
        .knv-roadmap-card.later h4 { color: var(--text-faint); }

        .knv-callout {
          display: flex; gap: 10px; background: var(--amber-wash); border: 1px solid var(--amber-dim); border-radius: 9px;
          padding: 13px 15px; font-size: 13px; color: var(--text-muted); margin: 16px 0;
        }
        .knv-callout strong { color: var(--text); }

        .knv-footer {
          padding: 36px 40px; border-top: 1px solid var(--border-soft); display: flex; align-items: center;
          justify-content: space-between; color: var(--text-faint); font-size: 12px; grid-column: 1 / -1;
        }

        @media (max-width: 980px) {
          .knv-shell { grid-template-columns: 1fr; }
          .knv-sidebar { display: none; }
          .knv-menu-btn { display: block; }
          .knv-main { padding: 0 24px 100px; }
          .knv-grid-3, .knv-grid-2, .knv-roadmap-grid { grid-template-columns: 1fr; }
          .knv-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .knv-h1 { font-size: 28px; }
          .knv-row { grid-template-columns: 52px 1fr; }
          .knv-row .desc { display: none; }
          .knv-cli-row { grid-template-columns: 1fr; gap: 6px; }
          .knv-footer { flex-direction: column; gap: 8px; align-items: flex-start; padding: 28px 24px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .konvoy-docs * { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
        }
      `}</style>

      {/* TOP NAV */}
      <nav className="knv-nav">
        <div className="knv-brand">
          <BrandMark />
          <span className="knv-brand-tag">docs</span>
        </div>
        <div className="knv-nav-right">
          <a className="knv-gh-btn" href="#" onClick={(e) => e.preventDefault()}>
            <Github size={14} /> GitHub
          </a>
          <button className="knv-menu-btn" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen && <div className="knv-mobile-panel">{SidebarNav}</div>}

      <div className="knv-shell">
        <aside className="knv-sidebar">{SidebarNav}</aside>

        <main className="knv-main">
          {/* INTRODUCTION */}
          <section id="introduction" className="knv-doc-section">
            <div className="knv-hero-badge"><span className="dot" /> Actively in development — MVP</div>
            <h1 className="knv-h1">Introduction</h1>
            <p className="knv-lede">
              Konvoy is a developer workspace for the config files your projects depend on but your
              git history usually leaves out — <code>.env</code> files, editor and lint configs, Docker
              files, and the small settings scattered across every repo you touch.
            </p>
            <p className="knv-p">
              Most teams solve this with a mix of shared notes apps, Slack messages, and "ask Dana for
              the .env" — which works until Dana is on vacation or the file quietly drifts between
              machines. Konvoy gives every project a single source of truth for its config: store a
              file once, edit it from a dashboard or your editor, and pull the exact same version onto
              any machine you're signed in on.
            </p>
            <p className="knv-p">
              Developers reach for Konvoy when they're onboarding a new teammate, setting up a fresh
              machine, or tired of reconstructing the same five config files every time they clone a
              repo somewhere new. It isn't version control, but it does double as a lightweight way to
              hand off a one-off secret — see Secret Sharing below.
            </p>
            <div className="knv-hero-actions">
              <button className="knv-btn-primary" onClick={() => scrollTo("getting-started")}>
                Get started <ArrowRight size={15} />
              </button>
              <button className="knv-btn-secondary" onClick={() => scrollTo("secrets")}>
                Secret Sharing
              </button>
            </div>
          </section>

          {/* GETTING STARTED */}
          <section id="getting-started" className="knv-doc-section">
            <Eyebrow>Getting started</Eyebrow>
            <h2 className="knv-h2">Set up Konvoy in a few minutes</h2>
            <p className="knv-p">Install the CLI, authenticate , view your projects ,pull in your directory.</p>

            <div id="getting-started-installation" className="knv-doc-sub">
              <h3 className="knv-h3">Installation</h3>
              <p className="knv-p">Install the CLI globally with npm. Node 18 or later is required.</p>
              <CodeBlock lang="bash" code={"npm install -g konvoy-cli"} filename="terminal" />
              <p className="knv-p">Confirm it installed correctly:</p>
              <CodeLine text="konvoy --version" />
            </div>

            <div id="getting-started-authentication" className="knv-doc-sub">
              <h3 className="knv-h3">Authentication</h3>
              <p className="knv-p">
                Konvoy accounts use JWT access and refresh tokens under the hood. You can register and
                log in from the dashboard, or authenticate directly from the CLI — either way, the CLI
                stores your session locally with <code>Conf</code> so you only log in once per machine.
              </p>
              <CodeLine text="konvoy login" />
              <div className="knv-callout">
                <Lock size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span><strong>Passwords are hashed</strong> and never stored in plain text. Sessions can be revoked instantly by logging out.</span>
              </div>
            </div>

            {/* <div id="getting-started-first-project" className="knv-doc-sub">
              <h3 className="knv-h3">First project</h3>
              <p className="knv-p">Create a project, then track your first file from the CLI or the dashboard.</p>
              <div className="knv-route">
                <div className="knv-step">
                  <h4>Create the project</h4>
                  <p>Give it a name — this becomes the container for every file you track.</p>
                  <CodeLine text="konvoy project create my-app" />
                </div>
                <div className="knv-step">
                  <h4>Track a file</h4>
                  <p>Point Konvoy at a config file already on disk.</p>
                  <CodeLine text="konvoy file create ./.env" />
                </div>
                <div className="knv-step">
                  <h4>Pull it anywhere</h4>
                  <p>On any other machine you're logged into, restore the whole project at once.</p>
                  <CodeLine text="konvoy pull" />
                </div>
              </div>
            </div> */}
          </section>

          {/* DASHBOARD */}
          <section id="dashboard" className="knv-doc-section">
            <Eyebrow>Dashboard</Eyebrow>
            <h2 className="knv-h2">A VS Code–style workspace in the browser</h2>
            <p className="knv-p">Everything you can do from the CLI, you can also do from the dashboard.</p>

            <div id="dashboard-projects" className="knv-doc-sub">
              <h3 className="knv-h3">Projects</h3>
              <p className="knv-p">
                The projects screen lists every project you own or belong to. Create, rename, and delete
                projects you own here — each one holds its own set of files, isolated from your others.
                How many projects you can create is set by your plan.
              </p>
            </div>

            <div id="dashboard-files" className="knv-doc-sub">
              <h3 className="knv-h3">Files</h3>
              <p className="knv-p">
                Open a project to see its tracked files. Konvoy stores each file's content alongside
                its extension and a detected language, so the dashboard knows to render a
                <code>.json</code> file differently from a <code>.env</code> file before you even open it.
                Content is encrypted before it's stored.
              </p>
            </div>

            <div id="dashboard-editor" className="knv-doc-sub">
              <h3 className="knv-h3">Editor</h3>
              <p className="knv-p">
                The built-in editor mirrors a lightweight code editor: a file explorer on the left,
                syntax-aware editing in the middle, and save, rename, and delete actions available
                without leaving the page.
              </p>
            </div>

            <div id="dashboard-versions" className="knv-doc-sub">
              <h3 className="knv-h3">Version history</h3>
              <p className="knv-p">
                Every save keeps the previous version around — up to 2 saves back per file. Open{" "}
                <strong>History</strong> in the editor toolbar to review an earlier version and restore it
                if you need to undo a change.
              </p>
            </div>

            <div id="dashboard-team" className="knv-doc-sub">
              <h3 className="knv-h3">Team members</h3>
              <p className="knv-p">
                As a project owner, invite a teammate by email from the projects screen. You can grant
                access to every file in the project, or restrict them to specific files. How many
                teammates fit in one project is set by your plan.
              </p>
            </div>

            <div className="knv-grid-3">
              <div className="knv-card">
                <div className="knv-card-icon"><FolderKanban size={16} /></div>
                <h4>Projects</h4>
                <p>Create, list, update, and delete — scoped to your account.</p>
              </div>
              <div className="knv-card">
                <div className="knv-card-icon"><FileCode2 size={16} /></div>
                <h4>Files</h4>
                <p>Content, extension, and language, stored per project.</p>
              </div>
              <div className="knv-card">
                <div className="knv-card-icon"><LayoutDashboard size={16} /></div>
                <h4>Editor</h4>
                <p>Explorer, editing, and save actions in one workspace.</p>
              </div>
            </div>
          </section>

          {/* SECRET SHARING */}
          <section id="secrets" className="knv-doc-section">
            <Eyebrow>Secret Sharing</Eyebrow>
            <h2 className="knv-h2">Share a secret without pasting it in chat</h2>
            <p className="knv-lede">
              From <strong>Secrets</strong> in the sidebar, paste a password, API key, or config value and get
              back a one-time link — instead of dropping it into Slack or email, where it lingers forever.
            </p>
            <div className="knv-grid-3">
              <div className="knv-card">
                <div className="knv-card-icon"><Clock size={16} /></div>
                <h4>Expires on its own</h4>
                <p>Pick 10 minutes, 1 hour, 1 day, or 7 days. After that, the link stops working.</p>
              </div>
              <div className="knv-card">
                <div className="knv-card-icon"><Lock size={16} /></div>
                <h4>Single use only</h4>
                <p>On by default — the secret is deleted from the server the moment someone reveals it.</p>
              </div>
              <div className="knv-card">
                <div className="knv-card-icon"><KeyRound size={16} /></div>
                <h4>No account needed to view</h4>
                <p>Whoever you send the link to can open and reveal it without signing in.</p>
              </div>
            </div>
            <p className="knv-p" style={{ marginTop: 16 }}>
              Opening the link doesn't reveal the secret by itself — the recipient has to click{" "}
              <strong>Reveal secret</strong>, so a link preview or bot fetching the URL won't burn a
              single-use secret before the real recipient sees it. From the Secrets page you can also see
              the status of everything you've shared (active, viewed, or expired) and revoke a link early.
            </p>
          </section>

          {/* PLANS */}
          <section id="plans" className="knv-doc-section">
            <Eyebrow>Plans & Limits</Eyebrow>
            <h2 className="knv-h2">Every account runs on a plan</h2>
            <p className="knv-lede">
              A plan sets five numbers: max file size, files per project, teammates per project, projects per
              account, and total storage. Check <strong>Plans</strong> in the sidebar to see your current
              numbers and usage, or the{" "}
              <a href="/pricing" style={{ color: "var(--amber)" }}>public pricing page</a> to compare tiers.
            </p>
            <p className="knv-p">
              If you're not assigned a plan, you're on the platform's default — an admin can move you to a
              different one, including a plan billed over 1, 3, 6, or 12 months. If a plan assignment
              expires, your account quietly reverts to the default plan's limits rather than blocking you.
            </p>
          </section>

          {/* CLI */}
          <section id="cli" className="knv-doc-section">
            <Eyebrow>CLI</Eyebrow>
            <h2 className="knv-h2">Everything from the terminal</h2>
            <p className="knv-p">The CLI is the fastest path from a fresh machine to a fully configured project.</p>

            <div id="cli-installation" className="knv-doc-sub">
              <h3 className="knv-h3">Installation</h3>
              <p className="knv-p">Install globally with npm, or your package manager of choice.</p>
              <CodeBlock lang="bash" code={"npm install -g konvoy-cli\n# or\nyarn global add konvoy-cli"} />
            </div>

            <div id="cli-login" className="knv-doc-sub">
              <h3 className="knv-h3">Login</h3>
              <p className="knv-p">
                Logging in authenticates against the same account you use on the dashboard and stores
                the session locally so future commands don't ask again.
              </p>
              <CodeLine text="konvoy login" />
              <p className="knv-p">
                There's no logout command yet — clearing the local session has to be done by hand for now.
              </p>
            </div>

            <div id="cli-commands" className="knv-doc-sub">
              <h3 className="knv-h3">Commands</h3>
              <p className="knv-p">The full command set, stable across the current MVP release.</p>
              {CLI_COMMANDS.map((c) => (
                <div className="knv-cli-row" key={c.cmd}>
                  <code>{c.cmd}</code>
                  <span className="d">{c.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* API REFERENCE */}
          {/* <section id="api-reference" className="knv-doc-section">
            <Eyebrow>API reference</Eyebrow>
            <h2 className="knv-h2">Backend endpoints</h2>
            <p className="knv-lede">
              All routes are namespaced under <code>/api/v1</code> and, aside from contact and auth,
              require a valid access token in the <code>Authorization</code> header.
            </p>
            <CodeBlock
              lang="bash"
              filename="example request"
              code={'curl https://api.konvoy.dev/v1/projects \\\n  -H "Authorization: Bearer <access_token>"'}
            />
            {API_GROUPS.map((g) => (
              <div className="knv-api-group" key={g.title}>
                <div className="knv-api-group-title"><g.icon size={13} /> {g.title}</div>
                {g.rows.map((r) => (
                  <div className="knv-row" key={r.path}>
                    <MethodBadge method={r.method} />
                    <code>{r.path}</code>
                    <span className="desc">{r.desc}</span>
                  </div>
                ))}
              </div>
            ))}
          </section> */}

          {/* SUPPORTED FILES */}
          <section id="supported-files" className="knv-doc-section">
            <Eyebrow>Supported files</Eyebrow>
            <h2 className="knv-h2">Track any text-based config file</h2>
            <p className="knv-lede">
              Konvoy stores raw file content, so it isn't limited to a fixed list — but these are the
              formats it recognizes and syntax-highlights automatically.
            </p>
            <div className="knv-grid-4">
              {SUPPORTED_FILES.map((f) => (
                <div className="knv-file-card" key={f.ext}>
                  <f.icon size={16} />
                  <span className="ext">{f.ext}</span>
                  <p>{f.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ADMIN */}
          <section id="admin" className="knv-doc-section">
            <Eyebrow>Admin Panel</Eyebrow>
            <h2 className="knv-h2">Platform-wide controls for admins</h2>
            <p className="knv-lede">
              If your account has the <code>admin</code> role, an <strong>Admin</strong> link appears in the
              sidebar. It's separate from your own projects and plan — it covers every user on the platform.
            </p>
            <div className="knv-grid-3">
              <div className="knv-card">
                <div className="knv-card-icon"><Users size={16} /></div>
                <h4>Users</h4>
                <p>Change roles, deactivate accounts, assign plans, filter by plan status, export to CSV.</p>
              </div>
              <div className="knv-card">
                <div className="knv-card-icon"><CreditCard size={16} /></div>
                <h4>Plans</h4>
                <p>Create and edit pricing plans, including plans hidden from the public pricing page.</p>
              </div>
              <div className="knv-card">
                <div className="knv-card-icon"><FolderKanban size={16} /></div>
                <h4>Projects</h4>
                <p>View or delete any project on the platform, not just your own.</p>
              </div>
              <div className="knv-card">
                <div className="knv-card-icon"><MessageSquare size={16} /></div>
                <h4>Contact inbox</h4>
                <p>Every message submitted through the public contact form, with read/unread tracking.</p>
              </div>
              <div className="knv-card">
                <div className="knv-card-icon"><History size={16} /></div>
                <h4>Activity log</h4>
                <p>An audit trail of role changes, deactivations, plan assignments, and deletions.</p>
              </div>
              <div className="knv-card">
                <div className="knv-card-icon"><LayoutDashboard size={16} /></div>
                <h4>Overview</h4>
                <p>Platform-wide totals — users, projects, files, and storage used.</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="knv-doc-section">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="knv-h2">Common questions</h2>
            <p className="knv-lede">Answers to what people usually ask before adopting Konvoy.</p>
            {FAQS.map((f, i) => (
              <div className="knv-faq-item" key={f.q}>
                <button
                  className={`knv-faq-q ${openFaq === i ? "open" : ""}`}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  {f.q}
                  <ChevronDown size={16} />
                </button>
                {openFaq === i && <div className="knv-faq-a">{f.a}</div>}
              </div>
            ))}
          </section>

          {/* ROADMAP */}
          <section id="roadmap" className="knv-doc-section">
            <Eyebrow>Roadmap</Eyebrow>
            <h2 className="knv-h2">Where Konvoy stands</h2>
            <p className="knv-lede">The MVP focuses on backup and restore. Collaboration and sync come next.</p>
            <div className="knv-roadmap-grid">
              <div className="knv-roadmap-card done">
                <h4><Check size={15} /> In the MVP</h4>
                <ul>
                  {MVP_DONE.map((i) => (
                    <li key={i}><Check size={14} className="knv-check" />{i}</li>
                  ))}
                </ul>
              </div>
              <div className="knv-roadmap-card later">
                <h4><Clock size={14} /> Deferred until after MVP</h4>
                <ul>
                  {DEFERRED.map((i) => (
                    <li key={i}><Circle size={7} className="knv-later" fill="currentColor" />{i}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </main>

        <footer className="knv-footer">
          <span>Konvoy — developer workspace platform</span>
          <span>Next.js · Express · MongoDB</span>
        </footer>
      </div>
    </div>
  );
}