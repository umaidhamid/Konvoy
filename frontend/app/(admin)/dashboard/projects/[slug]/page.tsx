"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMonaco } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import { projectfilesService } from "@/services/projectfiles.service";
import { ProjectFile, Project } from "@/types/projectfile.types";

// Import from your new extracted files
import { FileCache } from "@/utils/ide-utils";
import { 
  IDEHeader, IDESidebar, IDEEditorArea, 
  IDEStatusBar, IDEContextMenu, IDEModals 
} from "@/components/admin/projects/ide-components";

export default function WebIDE() {
  const { slug } = useParams();
  const router = useRouter();

  // --- State ---
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [fileCache, setFileCache] = useState<FileCache>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editor Stats
  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });

  // Dialog & Menu States
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: ProjectFile } | null>(null);
  const [modals, setModals] = useState({ create: false, rename: false, delete: false });
  const [targetFile, setTargetFile] = useState<ProjectFile | null>(null);
  const [inputValue, setInputValue] = useState("");

  // --- Initialization ---
  const fetchProjectFiles = useCallback(async () => {
    try {
      const res = await projectfilesService.getProjectFiles(slug as string);
      setProject(res.project);
      setFiles(res.files);
    } catch  {
      toast.error("Failed to load workspace");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => { 
    fetchProjectFiles(); 
  }, [fetchProjectFiles]);

  // --- Actions ---
  const loadFileContent = async (fileId: string) => {
    if (fileCache[fileId]) {
      setActiveFileId(fileId);
      return; 
    }

    setIsFileLoading(true);
    setActiveFileId(fileId); 
    try {
      const res = await projectfilesService.getProjectFileById(fileId);
      setFileCache(prev => ({
        ...prev,
        [fileId]: { content: res.content || "", initialContent: res.content || "", isDirty: false }
      }));
    } catch (err) {
      toast.error("Failed to load file content");
      setActiveFileId(null);
    } finally {
      setIsFileLoading(false);
    }
  };

  const handleEditorChange = (val: string | undefined) => {
    if (!activeFileId || val === undefined) return;
    setFileCache(prev => {
      const current = prev[activeFileId];
      if (!current) return prev;
      return {
        ...prev,
        [activeFileId]: { ...current, content: val, isDirty: val !== current.initialContent }
      };
    });
  };

  const handleSave = useCallback(async () => {
    setActiveFileId(currentActiveId => {
      if (!currentActiveId) return currentActiveId;

      setFileCache(prevCache => {
        const currentData = prevCache[currentActiveId];
        if (!currentData || !currentData.isDirty) return prevCache;

        setIsSaving(true);
        projectfilesService
          .updateProjectFile(currentActiveId, currentData.content)
          .then(() => {
            setFileCache(prev => ({
              ...prev,
              [currentActiveId]: { ...prev[currentActiveId], initialContent: currentData.content, isDirty: false }
            }));
            toast.success("Saved successfully");
          })
          .catch(() => toast.error("Failed to save file"))
          .finally(() => setIsSaving(false));

        return prevCache;
      });

      return currentActiveId;
    });
  }, []);

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      const res = await projectfilesService.createProjectFile(slug as string, inputValue, "");
      const newFile: ProjectFile = { _id: res._id, name: res.name || inputValue };
      setFiles(prev => [...prev, newFile]);
      setFileCache(prev => ({ ...prev, [newFile._id]: { content: "", initialContent: "", isDirty: false } }));
      setModals(prev => ({ ...prev, create: false }));
      setInputValue("");
      setActiveFileId(newFile._id);
      toast.success("File created");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create file");
    }
  };

  const handleDeleteFile = async () => {
    if (!targetFile) return;
    try {
      await projectfilesService.deleteProjectFile(targetFile._id);
      setFiles(prev => prev.filter(f => f._id !== targetFile._id));
      setFileCache(prev => {
        const next = { ...prev };
        delete next[targetFile._id];
        return next;
      });
      if (activeFileId === targetFile._id) setActiveFileId(null);
      setModals(prev => ({ ...prev, delete: false }));
      toast.success("File deleted");
    } catch (err) {
      toast.error("Failed to delete file");
    }
  };

  const handleRenameFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFile || !inputValue.trim()) return;
    try {
      await projectfilesService.renameProjectFile(targetFile._id, inputValue);
      setFiles(prev => prev.map(f => f._id === targetFile._id ? { ...f, name: inputValue } : f));
      setModals(prev => ({ ...prev, rename: false }));
      toast.success("File renamed");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to rename file");
    }
  };

  // --- Keyboard Shortcuts & Event Listeners ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // --- Derived State ---
  const activeFile = files.find(f => f._id === activeFileId);
  const activeCacheData = activeFileId ? fileCache[activeFileId] : null;
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // --- Render ---
  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#08080a] flex flex-col items-center justify-center text-zinc-400 gap-3">
        <div className="relative">
          <div className="absolute inset-0 blur-xl bg-blue-500/20 rounded-full"></div>
          <Loader2 className="animate-spin relative text-blue-400" size={30} />
        </div>
        <p className="text-xs text-zinc-500 tracking-wide">Loading workspace…</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#08080a] text-zinc-300 font-sans overflow-hidden selection:bg-blue-500/30">
      <IDEHeader 
        router={router}
        project={project}
        activeFile={activeFile}
        activeCacheData={activeCacheData}
        isSaving={isSaving}
        onNewFile={() => { setInputValue(""); setModals(prev => ({ ...prev, create: true })); }}
        onSave={handleSave}
      />

      <div className="flex-1 flex overflow-hidden">
        <IDESidebar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredFiles={filteredFiles}
          activeFileId={activeFileId}
          fileCache={fileCache}
          loadFileContent={loadFileContent}
          setTargetFile={setTargetFile}
          setContextMenu={setContextMenu}
        />
        
        <IDEEditorArea 
          activeFileId={activeFileId}
          isFileLoading={isFileLoading}
          activeFile={activeFile}
          activeCacheData={activeCacheData}
          handleEditorChange={handleEditorChange}
          setCursorPos={setCursorPos}
          onNewFile={() => { setInputValue(""); setModals(prev => ({ ...prev, create: true })); }}
        />
      </div>

      <IDEStatusBar 
        activeFile={activeFile}
        activeCacheData={activeCacheData}
        cursorPos={cursorPos}
      />

      <IDEContextMenu 
        contextMenu={contextMenu}
        onRename={() => { setInputValue(contextMenu?.file.name || ""); setModals(prev => ({ ...prev, rename: true })); }}
        onDelete={() => setModals(prev => ({ ...prev, delete: true }))}
      />

      <IDEModals 
        modals={modals}
        setModals={setModals}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleCreateFile={handleCreateFile}
        handleRenameFile={handleRenameFile}
        handleDeleteFile={handleDeleteFile}
        targetFile={targetFile}
      />
    </div>
  );
}