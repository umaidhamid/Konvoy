import React from "react";
import { FileCode, FileJson, FileText, File } from "lucide-react";

// --- Types ---
export type FileContent = { content: string; initialContent: string; isDirty: boolean };
export type FileCache = Record<string, FileContent>;

// --- Utility Helpers ---
export const getLanguageFromFilename = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': case 'jsx': return 'javascript';
    case 'ts': case 'tsx': return 'typescript';
    case 'json': return 'json';
    case 'md': return 'markdown';
    case 'html': return 'html';
    case 'css': return 'css';
    case 'yml': case 'yaml': return 'yaml';
    case 'sh': return 'shell';
    default: return 'plaintext';
  }
};

export const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': case 'jsx': case 'ts': case 'tsx': return <FileCode size={16} className="text-blue-400" />;
    case 'json': return <FileJson size={16} className="text-amber-400" />;
    case 'md': return <FileText size={16} className="text-zinc-400" />;
    default: return <File size={16} className="text-zinc-400" />;
  }
};

export const getLangColor = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': case 'jsx': return 'bg-yellow-400';
    case 'ts': case 'tsx': return 'bg-blue-400';
    case 'json': return 'bg-amber-400';
    case 'md': return 'bg-zinc-400';
    case 'html': return 'bg-orange-400';
    case 'css': return 'bg-sky-400';
    default: return 'bg-zinc-500';
  }
};