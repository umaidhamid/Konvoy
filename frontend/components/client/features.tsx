"use client";

import { motion } from "framer-motion";
import { Lock, Code2, Terminal, FolderTree } from "lucide-react";

const FEATURES = [
  {
    icon: Terminal,
    title: "One CLI command to sync",
    description:
      "konvoy login, then konvoy projects. Pick a project, pick a file or pull the whole thing, confirm the path, done.",
  },
  {
    icon: Lock,
    title: "Encrypted at rest",
    description:
      "File contents are encrypted before they're stored, and decrypted only when you fetch them for editing or download.",
  },
  {
    icon: Code2,
    title: "A web editor when you need one",
    description:
      "Open any project in the browser to read, edit, and save files without touching a terminal.",
  },
  {
    icon: FolderTree,
    title: "Projects, not one giant bucket",
    description:
      "Every file belongs to a project. Switch projects to switch context — nothing leaks between them.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-xl">
          <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            What's here today
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mt-3">
            Built for the config files you actually deal with
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
