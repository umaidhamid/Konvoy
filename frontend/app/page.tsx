"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, ShieldAlert, GitBranch, Terminal, Layers } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
// --- Real World, Minimalistic Features Section ---
const Features = () => {
  const customFeatures = [
    {
      icon: <Terminal className="w-5 h-5 text-purple-400" />,
      title: "Zero-Config CLI Engine",
      description: "Inject environment states directly into runtime memory execution paths. Works cleanly with your existing npm, bun, or yarn scripts without relying on local `.env` files."
    },
    {
      icon: <GitBranch className="w-5 h-5 text-blue-400" />,
      title: "Deterministic Cryptographic Versioning",
      description: "Every file commit hashes into an immutable linear tree. Instantly roll back a compromised setup, compare diffs line-by-line, or branch configurations dynamically across environments."
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-zinc-400" />,
      title: "Pre-Flight Secret Scanning",
      description: "Our hooks automatically parse and flag raw API strings, exposed secret keys, and dangling production database URLs before they escape local machines or cross over to your remote repository."
    },
    {
      icon: <Layers className="w-5 h-5 text-zinc-400" />,
      title: "Scoped Team Environments",
      description: "Organize architecture variables into strict team workspaces. Grant granular edit rights to leads while securely serving read-only build tokens directly to isolated CI/CD workflows."
    }
  ];

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto border-t border-white/5 relative">
      {/* Structural Minimalist Header */}
      <div className="mb-16">
        <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase bg-zinc-900 px-3 py-1.5 rounded-md border border-white/5">
          Engine Capability
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-white mt-4 max-w-md">
          Built for teams tired of raw configuration fragmentation.
        </h2>
      </div>

      {/* Grid Layout using intentional modern minimalism */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {customFeatures.map((feat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: index * 0.05 }}
            className="group relative p-6 bg-zinc-900/20 border border-white/5 rounded-xl hover:border-white/10 transition-all duration-300"
          >
            {/* Minimal Icon Container */}
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-900 border border-white/10 mb-4 shadow-sm group-hover:scale-95 transition-transform duration-200">
              {feat.icon}
            </div>
            
            <h3 className="text-base font-semibold text-white mb-2 tracking-tight">
              {feat.title}
            </h3>
            
            <p className="text-sm text-zinc-400 leading-relaxed font-sans font-light">
              {feat.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// --- Page Wrapper Layout ---
export default function Home() {


  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 antialiased font-sans">
      {/* Decorative Minimal Line Accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <Hero />
      <Features />
    </main>
  );
}