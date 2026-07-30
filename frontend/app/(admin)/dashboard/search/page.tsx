"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { FileCode2, FolderKanban, Search as SearchIcon, X } from "lucide-react";
import { searchService } from "@/services/search.service";

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setQuery(input.trim()), 250);
    return () => clearTimeout(t);
  }, [input]);

  // "/" focuses search from anywhere on the page, unless already typing somewhere else.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && target === inputRef.current) {
        setInput("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const searchQuery = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchService.search(query),
    enabled: query.length > 0,
  });

  const results = searchQuery.data?.data;
  const totalCount = (results?.projects.length ?? 0) + (results?.files.length ?? 0);
  const hasResults = totalCount > 0;

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="pb-6 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight">Search</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Find a project or file by name across everything you own or have access to.
          </p>
        </div>

        <div className="relative">
          <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search projects and files..."
            className="w-full pl-10 pr-10 py-3 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition"
          />
          {input ? (
            <button
              onClick={() => {
                setInput("");
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">
              /
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {query.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 border border-dashed border-border rounded-xl bg-card/30"
            >
              <SearchIcon className="w-6 h-6 mx-auto mb-3 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">Start typing to search your projects and files.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Press <span className="font-mono border border-border rounded px-1">/</span> anywhere to jump here.
              </p>
            </motion.div>
          ) : searchQuery.isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </motion.div>
          ) : !hasResults ? (
            <motion.div
              key="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 border border-dashed border-border rounded-xl bg-card/30"
            >
              <p className="text-sm text-muted-foreground font-medium">No matches for "{query}"</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Try a different name, or check the spelling.</p>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <p className="text-xs text-muted-foreground">
                {totalCount} result{totalCount === 1 ? "" : "s"} for "{query}"
              </p>

              {results!.projects.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Projects ({results!.projects.length})
                  </h2>
                  <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                    {results!.projects.map((p) => (
                      <Link
                        key={p._id}
                        href={`/dashboard/projects/${p.slug}`}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-card-hover transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FolderKanban className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 pt-1">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          {p.description && (
                            <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results!.files.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Files ({results!.files.length})
                  </h2>
                  <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                    {results!.files.map((f) => (
                      <Link
                        key={f._id}
                        href={`/dashboard/projects/${f.projectSlug}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-card-hover transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                          <FileCode2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{f.projectName}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
