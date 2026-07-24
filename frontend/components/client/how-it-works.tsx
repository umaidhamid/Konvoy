"use client";

import { motion } from "framer-motion";
import { LogIn, FolderKanban, DownloadCloud } from "lucide-react";

const STEPS = [
  {
    icon: LogIn,
    title: "Sign in once",
    description:
      "Authenticate from the web app or the CLI. Your session is tied to your account, not a machine.",
  },
  {
    icon: FolderKanban,
    title: "Keep files in a project",
    description:
      "Group related .env files, configs, and templates under a project. Edit them from the web IDE whenever you need to.",
  },
  {
    icon: DownloadCloud,
    title: "Pull them anywhere",
    description:
      "Run konvoy projects on any machine, pick a project and a file, confirm the destination, and it's written to disk.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-xl">
          <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            How it works
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mt-3">
            Three steps, no shared spreadsheets
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="relative pl-6"
            >
              <span className="absolute left-0 top-1 text-xs font-mono text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="ml-6 border-l border-border pl-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
