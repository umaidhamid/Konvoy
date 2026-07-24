"use client";

import { motion } from "framer-motion";

const LINES = [
  { text: "$ konvoy login", tone: "command" },
  { text: "✔ Logged in successfully", tone: "muted" },
  { text: "$ konvoy projects", tone: "command" },
  { text: "✔ Projects fetched", tone: "muted" },
  { text: "? Select a project » envs", tone: "prompt" },
  { text: "✔ Project selected", tone: "muted" },
  { text: "? What do you want to create? » A particular file", tone: "prompt" },
  { text: "? Select a file » shahjeeenv", tone: "prompt" },
  { text: "? Create file \"shahjeeenv\" at ./shahjeeenv? » Yes", tone: "prompt" },
  { text: "✔ File created", tone: "muted" },
] as const;

const toneClass: Record<(typeof LINES)[number]["tone"], string> = {
  command: "text-foreground",
  muted: "text-muted-foreground",
  prompt: "text-primary",
};

export const CliShowcase = () => {
  return (
    <section id="cli" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            The CLI
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mt-3 mb-4">
            Pull a file, or an entire project, in one flow
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Every step asks before it touches your disk. Select a project, choose
            whether you want everything or a single file, confirm the exact path,
            and Konvoy writes it there — nothing runs silently in the background.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-card px-3 py-1.5 rounded-full border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            No write happens without confirmation
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border bg-card shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 h-10 border-b border-border bg-card-hover">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
            </div>
            <span className="text-[10px] text-muted-foreground font-mono ml-2">terminal</span>
          </div>
          <div className="p-5 font-mono text-xs sm:text-sm space-y-1.5 bg-background">
            {LINES.map((line, i) => (
              <div key={i} className={toneClass[line.tone]}>
                {line.text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
