"use client";

import { motion } from "framer-motion";

const ROADMAP = [
  {
    title: "Team workspaces",
    description: "Share a project with teammates instead of copy-pasting secrets into chat.",
  },
  {
    title: "File version history",
    description: "See what changed in a file and roll back to an earlier version.",
  },
  {
    title: "CI/CD tokens",
    description: "Scoped, read-only tokens so a pipeline can pull files without a user login.",
  },
  {
    title: "Secret scanning on upload",
    description: "Flag things that look like leaked keys before they're stored.",
  },
];

export const Roadmap = () => {
  return (
    <section id="roadmap" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-xl">
          <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            Coming next
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mt-3">
            What we're building after this
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {ROADMAP.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="flex gap-4 p-6 rounded-2xl border border-dashed border-border"
            >
              <span className="text-xs font-mono text-muted-foreground shrink-0 mt-0.5">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
