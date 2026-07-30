"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { projectfilesService } from "@/services/projectfiles.service";
import { ProjectFile, Project } from "@/types/projectfile.types";

// Import from your new extracted files
import { FileCache } from "@/utils/ide-utils";
import {
  IDEHeader, IDESidebar, IDEEditorArea,
  IDEStatusBar, IDEContextMenu, IDEModals, IDEVersionHistory
} from "@/components/admin/projects/ide-components";

export default function WebIDE() {
  const { slug } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- State ---
  const [searchQuery, setSearchQuery] = useState("");

  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [fileCache, setFileCache] = useState<FileCache>({});

  const [isFileLoading, setIsFileLoading] = useState(false);

  // Editor Stats
  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });

  // Dialog & Menu States
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: ProjectFile } | null>(null);
  const [modals, setModals] = useState({ create: false, rename: false, delete: false });
  const [targetFile, setTargetFile] = useState<ProjectFile | null>(null);
  const [inputValue, setInputValue] = useState("");

  // Version history
  const [historyOpen, setHistoryOpen] = useState(false);

  // --- Data: project + file list, cached per slug ---
  const filesQuery = useQuery({
    queryKey: ["projectFiles", slug],
    queryFn: () => projectfilesService.getProjectFiles(slug as string),
    enabled: !!slug,
  });

  const project: Project | null = filesQuery.data?.project ?? null;
  const files: ProjectFile[] = filesQuery.data?.files ?? [];
  const isLoading = filesQuery.isLoading;

  useEffect(() => {
    if (filesQuery.isError) toast.error("Failed to load workspace");
  }, [filesQuery.isError]);

  // --- Actions ---
  const loadFileContent = async (fileId: string) => {
    if (fileCache[fileId]) {
      setActiveFileId(fileId);
      return;
    }

    setIsFileLoading(true);
    setActiveFileId(fileId);
    try {
      // Cached by react-query - re-opening a file already viewed this session skips the network call
      const res = await queryClient.fetchQuery({
        queryKey: ["fileContent", fileId],
        queryFn: () => projectfilesService.getProjectFileById(fileId),
      });
      setFileCache(prev => ({
        ...prev,
        [fileId]: { content: res.content || "", initialContent: res.content || "", isDirty: false }
      }));
    } catch {
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

  const saveMutation = useMutation({
    mutationFn: ({ fileId, content }: { fileId: string; content: string }) =>
      projectfilesService.updateProjectFile(fileId, content),
    onSuccess: (_res, vars) => {
      setFileCache(prev => ({
        ...prev,
        [vars.fileId]: { ...prev[vars.fileId], initialContent: vars.content, isDirty: false }
      }));
      queryClient.invalidateQueries({ queryKey: ["fileVersions", vars.fileId] });
      toast.success("Saved successfully");
    },
    onError: () => toast.error("Failed to save file"),
  });

  const handleSave = useCallback(() => {
    if (!activeFileId) return;
    const currentData = fileCache[activeFileId];
    if (!currentData || !currentData.isDirty) return;
    saveMutation.mutate({ fileId: activeFileId, content: currentData.content });
  }, [activeFileId, fileCache, saveMutation]);

  const createFileMutation = useMutation({
    mutationFn: () => projectfilesService.createProjectFile(slug as string, inputValue, ""),
    onSuccess: (res) => {
      const newFile: ProjectFile = { _id: res._id, name: res.name || inputValue };
      queryClient.setQueryData(["projectFiles", slug], (old: any) =>
        old ? { ...old, files: [...old.files, newFile] } : old
      );
      setFileCache(prev => ({ ...prev, [newFile._id]: { content: "", initialContent: "", isDirty: false } }));
      setModals(prev => ({ ...prev, create: false }));
      setInputValue("");
      setActiveFileId(newFile._id);
      toast.success("File created");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create file"),
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => projectfilesService.deleteProjectFile(fileId),
    onSuccess: (_res, fileId) => {
      queryClient.setQueryData(["projectFiles", slug], (old: any) =>
        old ? { ...old, files: old.files.filter((f: ProjectFile) => f._id !== fileId) } : old
      );
      setFileCache(prev => {
        const next = { ...prev };
        delete next[fileId];
        return next;
      });
      if (activeFileId === fileId) setActiveFileId(null);
      setModals(prev => ({ ...prev, delete: false }));
      toast.success("File deleted");
    },
    onError: () => toast.error("Failed to delete file"),
  });

  const renameFileMutation = useMutation({
    mutationFn: ({ fileId, name }: { fileId: string; name: string }) =>
      projectfilesService.renameProjectFile(fileId, name),
    onSuccess: (_res, vars) => {
      queryClient.setQueryData(["projectFiles", slug], (old: any) =>
        old ? { ...old, files: old.files.map((f: ProjectFile) => (f._id === vars.fileId ? { ...f, name: vars.name } : f)) } : old
      );
      setModals(prev => ({ ...prev, rename: false }));
      toast.success("File renamed");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to rename file"),
  });

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || createFileMutation.isPending) return;
    createFileMutation.mutate();
  };

  const handleDeleteFile = () => {
    if (!targetFile || deleteFileMutation.isPending) return;
    deleteFileMutation.mutate(targetFile._id);
  };

  const handleRenameFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFile || !inputValue.trim() || renameFileMutation.isPending) return;
    renameFileMutation.mutate({ fileId: targetFile._id, name: inputValue });
  };

  // Cached per file - reopening history for the same file within the staleTime window skips the network call
  const versionsQuery = useQuery({
    queryKey: ["fileVersions", activeFileId],
    queryFn: () => projectfilesService.getFileVersions(activeFileId as string),
    enabled: historyOpen && !!activeFileId,
  });

  const restoreMutation = useMutation({
    mutationFn: (versionIndex: number) =>
      projectfilesService.restoreFileVersion(activeFileId as string, versionIndex),
    onSuccess: (res) => {
      if (!activeFileId) return;
      setFileCache(prev => ({
        ...prev,
        [activeFileId]: { content: res.content || "", initialContent: res.content || "", isDirty: false }
      }));
      queryClient.invalidateQueries({ queryKey: ["fileVersions", activeFileId] });
      queryClient.invalidateQueries({ queryKey: ["fileContent", activeFileId] });
      toast.success("Version restored");
    },
    onError: () => toast.error("Failed to restore version"),
  });

  const handleOpenHistory = () => {
    if (!activeFileId) return;
    setHistoryOpen(true);
  };

  const handleRestoreVersion = (versionIndex: number) => {
    if (!confirm("Restore this version? Your current content will be kept as a version too.")) return;
    restoreMutation.mutate(versionIndex);
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

  useEffect(() => {
    if (versionsQuery.isError) toast.error("Failed to load version history");
  }, [versionsQuery.isError]);

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
        isSaving={saveMutation.isPending}
        onNewFile={() => { setInputValue(""); setModals(prev => ({ ...prev, create: true })); }}
        onSave={handleSave}
        onOpenHistory={handleOpenHistory}
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

      <IDEVersionHistory
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        fileName={activeFile?.name}
        loading={versionsQuery.isLoading}
        versions={versionsQuery.data ?? null}
        restoringIndex={restoreMutation.isPending ? (restoreMutation.variables ?? null) : null}
        onRestore={handleRestoreVersion}
      />
    </div>
  );
}
