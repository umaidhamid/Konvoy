import { useState } from "react";
import { motion } from "framer-motion";
import { INITIAL_FILES } from "@/Data/client/herosection/files";

// Map for file icons styled to look great across themes using text-muted and specific colors
const FILE_ICONS = {
  "next.config.js": (
    <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  ".env": (
    <svg className="w-3.5 h-3.5 text-warning" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM11 6a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  "docker.yaml": (
    <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13.983 11.078h2.119c.102 0 .186-.084.186-.186V8.774c0-.102-.084-.186-.186-.186h-2.119c-.102 0-.186.084-.186.186v2.118c0 .102.084.186.186.186zm-2.95.078h2.118c.102 0 .185-.084.185-.186V8.774c0-.102-.084-.186-.185-.186h-2.118c-.101 0-.186.084-.186.186v2.118c0 .102.085.186.186.186zm-2.95 0h2.118c.101 0 .185-.084.185-.186V8.774c0-.102-.084-.186-.185-.186H8.083c-.102 0-.186.084-.186.186v2.118c0 .102.084.186.186.186zm-2.948 0h2.118c.101 0 .185-.084.185-.186V8.774c0-.102-.084-.186-.185-.186H5.135c-.102 0-.186.084-.186.186v2.118c0 .102.084.186.186.186zm-2.95 0h2.119c.101 0 .185-.084.185-.186V8.774c0-.102-.084-.186-.185-.186H2.186c-.102 0-.186.084-.186.186v2.118c0 .102.084.186.186.186zm5.898-3.084h2.118c.101 0 .185-.083.185-.185V5.689c0-.102-.084-.186-.185-.186H8.083c-.102 0-.186.084-.186.186v2.119c0 .101.084.185.186.185zm-2.948 0h2.118c.101 0 .185-.083.185-.185V5.689c0-.102-.084-.186-.185-.186H5.135c-.102 0-.186.084-.186.186v2.119c0 .101.084.185.186.185zm0-3.085h2.118c.101 0 .185-.084.185-.186V2.603c0-.102-.084-.186-.185-.186H5.135c-.102 0-.186.084-.186.186v2.119c0 .101.084.186.186.186zm14.12 6.17c-.183-.012-.36-.102-.56-.233-.772-.518-1.5-.724-2.41-.724H1.424c-.21 0-.356.113-.417.31-.144.475-.157.942-.048 1.45.36 1.681 1.487 3.328 3.09 4.5 2.11 1.543 4.887 2.314 8.04 2.235 5.56-.14 9.774-3.4 10.306-7.884a2.766 2.766 0 00-.4-.654z"/>
    </svg>
  )
};

export const Hero = () => {
  const [activeFile, setActiveFile] = useState("next.config.js");
  const [files, setFiles] = useState(INITIAL_FILES);

  const handleTextChange = (e) => {
    setFiles({
      ...files,
      [activeFile]: e.target.value
    });
  };

  const lineCount = files[activeFile]?.split("\n").length || 1;

  return (
    <section className="relative min-h-screen pt-36 pb-24 px-4 sm:px-6 lg:px-8 bg-background text-foreground overflow-hidden selection:bg-primary/10 selection:text-primary">
      
      {/* Dynamic Background Mesh Grid using border token color */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-primary/10 to-transparent blur-[120px] rounded-full" />
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)`,
            backgroundSize: '3rem 3rem',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 60%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 60%, transparent 100%)'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Side: Copywriting adjusting seamlessly to themes */}
        <div className="lg:col-span-5 text-center lg:text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-secondary text-xs font-semibold tracking-wide mb-6 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              v2.0 Workspace Live
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
              Never Lose Your <br />
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Config Files
              </span> Again
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-base sm:text-lg text-secondary max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed"
          >
            Store, version, and instantly retrieve env files, Docker configurations, cloud templates, and secure API bindings from any machine.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <button className="w-full sm:w-auto bg-primary text-primary-foreground hover:opacity-90 px-8 py-3.5 rounded-xl font-semibold shadow-md shadow-primary/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 cursor-pointer">
              Get Started for Free
            </button>
            <button className="w-full sm:w-auto bg-background border border-border text-secondary hover:text-foreground hover:bg-card-hover px-8 py-3.5 rounded-xl font-semibold shadow-xs transition-all duration-150 cursor-pointer">
              Read Docs
            </button>
          </motion.div>
        </div>

        {/* Right Side: High-Fidelity IDE Mockup utilizing theme card & input structures */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="lg:col-span-7 w-full"
        >
          <div className="relative rounded-2xl border border-border bg-card shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]">
            
            {/* Top Toolbar / Tab Row */}
            <div className="flex items-center justify-between border-b border-border px-4 h-12 bg-card-hover rounded-t-2xl select-none">
              <div className="flex items-center gap-6">
                {/* Window Controls - Use border/muted tokens cleanly */}
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                </div>
                <span className="text-xs text-muted font-mono tracking-tight hidden sm:inline-block">🗂️ main</span>
              </div>

              {/* Theme Variable Controlled File Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[70%] sm:max-w-none">
                {Object.keys(files).map((fileName) => {
                  const isActive = activeFile === fileName;
                  return (
                    <button
                      key={fileName}
                      onClick={() => setActiveFile(fileName)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-mono text-xs transition-all duration-150 border cursor-pointer ${
                        isActive
                          ? "bg-background border-border text-primary shadow-xs font-semibold"
                          : "bg-transparent border-transparent text-muted hover:text-foreground hover:bg-background/40"
                      }`}
                    >
                      {FILE_ICONS[fileName] || FILE_ICONS["next.config.js"]}
                      <span>{fileName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Code Editor Body */}
            <div className="p-5 font-mono text-xs sm:text-sm flex gap-4 min-h-[260px] max-h-[400px] overflow-y-auto bg-background">
              
              {/* Line Numbers utilizing text-muted */}
              <div className="text-muted/60 select-none text-right w-5 space-y-1 pt-[3px]">
                {Array.from({ length: lineCount }).map((_, i) => (
                  <div key={i} className="h-5 leading-5 text-[11px] sm:text-xs">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Editor Sandbox */}
              <div className="flex-1 relative">
                <textarea
                  value={files[activeFile] || ""}
                  onChange={handleTextChange}
                  className="w-full h-full bg-transparent text-foreground focus:outline-none resize-none font-mono whitespace-pre overflow-x-auto leading-5 tracking-wide transition-colors"
                  spellCheck="false"
                  style={{ minHeight: `${lineCount * 20}px` }}
                />
              </div>
            </div>

            {/* Status Footer Bar */}
            <div className="flex items-center justify-between border-t border-border px-4 h-9 bg-card-hover rounded-b-2xl font-mono text-[10px] text-muted select-none">
              <div className="flex items-center gap-3">
                <span className="text-success font-medium flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-success" /> Sync Active
                </span>
                <span>UTF-8</span>
              </div>
              <div>Line Count: {lineCount}</div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};