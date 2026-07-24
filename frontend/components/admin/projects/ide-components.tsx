import React from "react";
import Editor from "@monaco-editor/react";
import { 
  Loader2, ArrowLeft, Search, FileCode, Plus, Trash2, Edit2, 
  ChevronRight, Sparkles, FolderOpen 
} from "lucide-react";
import { ProjectFile, Project } from "@/types/projectfile.types";
import { FileContent, getLanguageFromFilename, getFileIcon, getLangColor } from "@/utils/ide-utils";

// --- Header Component ---
export const IDEHeader = ({ router, project, activeFile, activeCacheData, isSaving, onNewFile, onSave }: any) => (
  <header className="h-12 border-b border-white/6 flex items-center justify-between px-4 bg-[#0b0b0d]/90 backdrop-blur-xl z-10 shrink-0">
    <div className="flex items-center gap-3">
      <button
        onClick={() => router.back()}
        className="p-1.5 -ml-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/5 transition-all active:scale-95"
      >
        <ArrowLeft size={16} />
      </button>
      <div className="flex items-center text-sm min-w-0">
        <div className="flex items-center gap-1.5 text-zinc-100">
          <Sparkles size={13} className="text-blue-400" />
          <span className="font-semibold tracking-tight">{project?.name || "DevVault"}</span>
        </div>
        {activeFile && (
          <>
            <ChevronRight size={13} className="mx-2 text-zinc-700 shrink-0" />
            <span className="text-zinc-300 flex items-center gap-1.5 min-w-0">
              {getFileIcon(activeFile.name)}
              <span className="truncate max-w-[220px]">{activeFile.name}</span>
              {activeCacheData?.isDirty && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 shadow-[0_0_6px_rgba(96,165,250,0.8)]"></span>
              )}
            </span>
          </>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onNewFile}
        className="flex items-center gap-1.5 px-3 py-[7px] text-xs font-medium rounded-md text-zinc-400 hover:text-white hover:bg-white/6 border border-transparent hover:border-white/10 transition-all active:scale-[0.97]"
      >
        <Plus size={13} /> New File
      </button>
      <button
        onClick={onSave}
        disabled={!activeCacheData?.isDirty || isSaving}
        className="flex items-center gap-2 px-4 py-[7px] bg-blue-600 hover:bg-blue-500 disabled:bg-white/4 disabled:text-zinc-600 text-white text-xs font-semibold rounded-md transition-all shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_8px_rgba(37,99,235,0.35)] disabled:shadow-none active:scale-[0.97] disabled:active:scale-100"
      >
        {isSaving ? <Loader2 size={13} className="animate-spin" /> : null}
        {isSaving ? "Saving..." : "Save"}
      </button>
    </div>
  </header>
);

// --- Sidebar Component ---
export const IDESidebar = ({ searchQuery, setSearchQuery, filteredFiles, activeFileId, fileCache, loadFileContent, setTargetFile, setContextMenu }: any) => (
  <aside className="w-64 shrink-0 border-r border-white/6 flex flex-col bg-[#0a0a0c]">
    <div className="p-3 shrink-0">
      <div className="relative group">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-400 transition-colors" />
        <input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#141416] border border-white/6 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/40 focus:bg-[#18181b] focus:ring-2 focus:ring-blue-500/10 transition-all"
        />
      </div>
      <div className="flex items-center justify-between mt-3 px-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Files</span>
        <span className="text-[10px] text-zinc-600">{filteredFiles.length}</span>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {filteredFiles.length === 0 ? (
        <div className="mt-10 text-center px-4">
          <FolderOpen size={22} className="mx-auto mb-2 text-zinc-700" />
          <p className="text-xs text-zinc-600">No files found.</p>
        </div>
      ) : (
        <div className="space-y-[3px]">
          {filteredFiles.map((file: ProjectFile) => {
            const isActive = activeFileId === file._id;
            const isDirty = fileCache[file._id]?.isDirty;
            return (
              <div
                key={file._id}
                onClick={() => loadFileContent(file._id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setTargetFile(file);
                  setContextMenu({ x: e.pageX, y: e.pageY, file });
                }}
                className={`group relative flex items-center justify-between pl-2.5 pr-2 py-[7px] rounded-md cursor-pointer text-[13px] transition-all duration-150
                  ${isActive ? 'bg-blue-500/10 text-blue-300' : 'text-zinc-400 hover:bg-white/4 hover:text-zinc-200'}
                `}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2.5px] rounded-full bg-blue-400"></span>}
                <div className="flex items-center gap-2 truncate">
                  {getFileIcon(file.name)}
                  <span className="truncate">{file.name}</span>
                </div>
                {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 shadow-[0_0_6px_rgba(96,165,250,0.7)]"></span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  </aside>
);

// --- Editor Area Component ---
export const IDEEditorArea = ({ activeFileId, isFileLoading, activeFile, activeCacheData, handleEditorChange, setCursorPos, onNewFile }: any) => (
  <main className="flex-1 flex flex-col relative bg-[#08080a]">
    {!activeFileId ? (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 animate-in fade-in duration-500">
        <div className="relative mb-5">
          <div className="absolute inset-0 blur-2xl bg-blue-500/10 rounded-full"></div>
          <div className="relative w-16 h-16 rounded-2xl bg-white/3 border border-white/6 flex items-center justify-center">
            <FileCode size={26} className="text-zinc-600" />
          </div>
        </div>
        <h2 className="text-base font-semibold text-zinc-200 mb-1.5">Welcome to DevVault</h2>
        <p className="text-sm text-zinc-500 mb-6 max-w-xs text-center">Select a file from the sidebar to start editing, or create a new one.</p>
        <button
          onClick={onNewFile}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/9 border border-white/8 rounded-lg text-sm font-medium text-zinc-200 transition-all active:scale-[0.97]"
        >
          <Plus size={15} /> Create File
        </button>
      </div>
    ) : isFileLoading ? (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-600" size={22} />
      </div>
    ) : (
      <div className="flex-1 relative animate-in fade-in duration-300">
        <Editor
          theme="vs-dark"
          language={getLanguageFromFilename(activeFile?.name || "")}
          value={activeCacheData?.content || ""}
          onChange={handleEditorChange}
          onMount={(editor) => {
            editor.onDidChangeCursorPosition((e) => {
              setCursorPos({ ln: e.position.lineNumber, col: e.position.column });
            });
          }}
          options={{
            minimap: { enabled: true, scale: 0.75 },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            padding: { top: 16 },
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
            wordWrap: "on",
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
          className="absolute inset-0"
        />
      </div>
    )}
  </main>
);

// --- Status Bar Component ---
export const IDEStatusBar = ({ activeFile, activeCacheData, cursorPos }: any) => (
  <footer className="h-7 border-t border-white/6 flex items-center px-4 justify-between text-[11px] font-medium text-zinc-500 bg-[#0b0b0d] shrink-0">
    <div className="flex items-center gap-5">
      <span className="flex items-center gap-1.5 hover:text-zinc-300 cursor-pointer transition-colors">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.7)]"></span>
        Ready
      </span>
      {activeFile && (
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${getLangColor(activeFile.name)}`}></span>
          {getLanguageFromFilename(activeFile.name).toUpperCase()}
        </span>
      )}
    </div>
    <div className="flex items-center gap-5">
      {activeFile && <span>Ln {cursorPos.ln}, Col {cursorPos.col}</span>}
      <span>UTF-8</span>
      <span>LF</span>
      {activeCacheData?.isDirty ? (
        <span className="text-blue-400 font-semibold">● Unsaved</span>
      ) : (
        <span className="text-zinc-600">Saved</span>
      )}
    </div>
  </footer>
);

// --- Context Menu Component ---
export const IDEContextMenu = ({ contextMenu, onRename, onDelete }: any) => {
  if (!contextMenu) return null;
  return (
    <div
      className="fixed z-50 w-48 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/60 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{ top: contextMenu.y, left: contextMenu.x }}
    >
      <button
        onClick={onRename}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.07] hover:text-white transition-colors"
      >
        <Edit2 size={14} /> Rename
      </button>
      <div className="h-px bg-white/6 my-1 mx-2"></div>
      <button
        onClick={onDelete}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
      >
        <Trash2 size={14} /> Delete
      </button>
    </div>
  );
};

// --- Modals Component ---
export const IDEModals = ({ modals, setModals, inputValue, setInputValue, handleCreateFile, handleRenameFile, handleDeleteFile, targetFile }: any) => (
  <>
    {(modals.create || modals.rename) && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-[#141416] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl shadow-black/50 p-6 animate-in zoom-in-95 duration-200 scale-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              {modals.create ? <Plus size={16} className="text-blue-400" /> : <Edit2 size={15} className="text-blue-400" />}
            </div>
            <h3 className="text-base font-semibold text-white">
              {modals.create ? "Create New File" : "Rename File"}
            </h3>
          </div>
          <p className="text-[13px] text-zinc-500 mb-5 ml-12 -mt-0.5">
            {modals.create ? "Enter a filename with extension (e.g. .env, config.json)" : "Keep the original extension for accurate syntax highlighting."}
          </p>
          <form onSubmit={modals.create ? handleCreateFile : handleRenameFile}>
            <input
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. docker-compose.yml"
              className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 mb-6 transition-all"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModals((prev: any) => ({ ...prev, create: false, rename: false }))}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-white transition-colors active:scale-[0.97]"
              >
                {modals.create ? "Create File" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {modals.delete && targetFile && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-[#141416] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl shadow-black/50 p-6 animate-in zoom-in-95 duration-200 scale-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Trash2 size={16} className="text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Delete File</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-6 ml-12 -mt-1">
            Are you sure you want to delete <strong className="text-white font-medium">{targetFile.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModals((prev: any) => ({ ...prev, delete: false }))}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteFile}
              className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-500 transition-colors active:scale-[0.97] shadow-[0_2px_8px_rgba(220,38,38,0.35)]"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);