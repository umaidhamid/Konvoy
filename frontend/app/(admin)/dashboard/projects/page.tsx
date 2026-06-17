"use client"
import React, { useState } from 'react';

// ==========================================
// 1. DUMMY DATA & MAIN APP STATE (ROUTER)
// ==========================================
export default function DevVaultApp() {
  // Flat structure: Projects contain Files directly (no folders for MVP)
  const [projects, setProjects] = useState([
    {
      id: 'p1',
      name: 'E-Commerce App',
      files: [
        { id: 'f1', name: 'README.md', content: '# E-Commerce App\nPlan your project here.' },
        { id: 'f2', name: 'todo.txt', content: '- Setup Auth\n- Create Cart Component' }
      ]
    }
  ]);

  // View state: 'dashboard' | 'workspace'
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeProjectId, setActiveProjectId] = useState(null);

  // Actions
  const createProject = (name) => {
    const newProject = { id: `p_${Date.now()}`, name, files: [] };
    setProjects([...projects, newProject]);
  };

  const openProject = (projectId) => {
    setActiveProjectId(projectId);
    setCurrentView('workspace');
  };

  const closeProject = () => {
    setActiveProjectId(null);
    setCurrentView('dashboard');
  };

  const updateProjectFiles = (projectId, updatedFiles) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, files: updatedFiles } : p
    ));
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
      {currentView === 'dashboard' && (
        <ProjectsDashboard 
          projects={projects} 
          onCreateProject={createProject} 
          onOpenProject={openProject} 
        />
      )}

      {currentView === 'workspace' && activeProject && (
        <FilesWorkspace 
          project={activeProject} 
          onBack={closeProject}
          updateFiles={(newFiles) => updateProjectFiles(activeProject.id, newFiles)}
        />
      )}
    </div>
  );
}

// ==========================================
// 2. DASHBOARD: CREATE & LIST PROJECTS
// ==========================================
function ProjectsDashboard({ projects, onCreateProject, onOpenProject }) {
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onCreateProject(newProjectName);
    setNewProjectName('');
  };

  return (
    <div className="max-w-4xl mx-auto p-8 h-full flex flex-col">
      <header className="mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight">DevVault Projects</h1>
        <p className="text-muted text-sm mt-1">Select a project or create a new one.</p>
      </header>

      <form onSubmit={handleCreate} className="flex gap-3 mb-8">
        <input 
          type="text" 
          placeholder="Enter new project name..."
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          className="flex-1 max-w-sm px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90">
          Create Project
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
        {projects.map(project => (
          <div 
            key={project.id} 
            onClick={() => onOpenProject(project.id)}
            className="p-5 border border-border rounded-lg bg-card cursor-pointer hover:border-primary hover:shadow-sm transition-all flex flex-col justify-between h-32"
          >
            <div>
              <h3 className="font-semibold text-lg">{project.name}</h3>
              <span className="text-xs text-muted mt-1">{project.files.length} files</span>
            </div>
            <div className="text-sm text-primary font-medium flex items-center gap-1 mt-4">
              Open Workspace →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 3. WORKSPACE: PROJECT FILES PAGE
// ==========================================
function FilesWorkspace({ project, onBack, updateFiles }) {
  const [newFileName, setNewFileName] = useState('');
  const [editingFile, setEditingFile] = useState(null); // Holds the file object currently being edited

  const handleCreateFile = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const newFile = {
      id: `f_${Date.now()}`,
      name: newFileName,
      content: '' // Start empty
    };
    updateFiles([...project.files, newFile]);
    setNewFileName('');
  };

  const saveFileContent = (fileId, newContent) => {
    const updated = project.files.map(f => 
      f.id === fileId ? { ...f, content: newContent } : f
    );
    updateFiles(updated);
    setEditingFile(null); // Close modal on save
  };

  return (
    <div className="flex flex-col h-full">
      {/* Workspace Header */}
      <header className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-sm text-muted hover:text-foreground border border-border px-3 py-1.5 rounded-md">
            ← Back to Dashboard
          </button>
          <h2 className="text-xl font-bold tracking-tight">{project.name} Workspace</h2>
        </div>
        
        <form onSubmit={handleCreateFile} className="flex gap-2">
          <input 
            type="text" 
            placeholder="New file name (e.g., notes.md)"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="w-64 px-3 py-1.5 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground font-medium border border-border rounded-md hover:bg-card-hover">
            + Add File
          </button>
        </form>
      </header>

      {/* Files Grid */}
      <main className="flex-1 overflow-y-auto p-6 bg-background">
        {project.files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted text-center">
            <p>This project is empty.</p>
            <p className="text-sm">Create a file using the input above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {project.files.map(file => (
              <div 
                key={file.id} 
                onClick={() => setEditingFile(file)}
                className="group p-4 border border-border rounded-lg bg-card cursor-pointer hover:border-primary transition-colors h-40 flex flex-col"
              >
                <div className="font-semibold text-sm border-b border-border pb-2 mb-2 truncate">
                  📄 {file.name}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-muted font-mono whitespace-pre-wrap truncate">
                    {file.content || <span className="italic opacity-50">Empty file...</span>}
                  </p>
                </div>
                <div className="mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to Edit
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* EDITOR MODAL */}
      {editingFile && (
        <EditorModal 
          file={editingFile} 
          onSave={saveFileContent} 
          onCancel={() => setEditingFile(null)} 
        />
      )}
    </div>
  );
}

// ==========================================
// 4. EDITOR MODAL
// ==========================================
function EditorModal({ file, onSave, onCancel }) {
  const [content, setContent] = useState(file.content);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-4xl h-[80vh] flex flex-col rounded-xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-border bg-background flex items-center justify-between">
          <h3 className="font-semibold font-mono text-sm">Editing: {file.name}</h3>
          <div className="flex gap-2">
            <button 
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-card-hover"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave(file.id, content)}
              className="px-4 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Modal Textarea */}
        <div className="flex-1 bg-background p-4">
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm bg-card border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Type your content here..."
          />
        </div>

      </div>
    </div>
  );
}