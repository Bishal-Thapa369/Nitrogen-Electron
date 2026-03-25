import React, { useState } from 'react';
import { useStore } from '../store';
import { FileCode, Folder, ChevronRight, ChevronDown, Plus, Trash2, MoreVertical, FileJson, FileType2, FileText, FileImage, FileCode2, FileTerminal } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getFileIcon = (filename: string) => {
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return <FileCode2 size={14} className="text-yellow-400" />;
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return <FileType2 size={14} className="text-blue-400" />;
  if (filename.endsWith('.json')) return <FileJson size={14} className="text-green-400" />;
  if (filename.endsWith('.md')) return <FileText size={14} className="text-slate-400" />;
  if (filename.endsWith('.css')) return <FileCode size={14} className="text-pink-400" />;
  if (filename.endsWith('.html')) return <FileCode size={14} className="text-orange-400" />;
  if (filename.endsWith('.sh') || filename.endsWith('.bash')) return <FileTerminal size={14} className="text-emerald-400" />;
  if (filename.match(/\.(png|jpe?g|svg|gif)$/i)) return <FileImage size={14} className="text-purple-400" />;
  return <FileCode size={14} className="text-[var(--color-text-tertiary)]" />;
};

export const Sidebar: React.FC = () => {
  const { files, openFile, activeFileId, deleteFile, createFile } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName) return;
    
    let language = 'javascript';
    if (newFileName.endsWith('.html')) language = 'html';
    if (newFileName.endsWith('.css')) language = 'css';
    if (newFileName.endsWith('.py')) language = 'python';
    if (newFileName.endsWith('.json')) language = 'json';
    if (newFileName.endsWith('.md')) language = 'markdown';
    if (newFileName.endsWith('.ts') || newFileName.endsWith('.tsx')) language = 'typescript';

    await createFile(newFileName, language);
    setNewFileName('');
    setIsCreating(false);
  };

  return (
    <div className="h-full bg-[var(--color-bg-panel)]/80 backdrop-blur-xl text-[var(--color-text-secondary)] flex flex-col select-none border-r border-[var(--color-border-subtle)]">
      <div className="px-4 py-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
        <span>Explorer</span>
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => {
              setIsExpanded(true);
              setIsCreating(true);
            }}
            className="p-1 hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] rounded-md transition-all duration-200"
            title="New File"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
          <button className="p-1 hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] rounded-md transition-all duration-200">
            <MoreVertical size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        <div 
          className="flex items-center px-3 py-1.5 mx-2 rounded-md hover:bg-[var(--color-bg-hover)] cursor-pointer text-[13px] font-semibold text-[var(--color-text-primary)] transition-colors duration-200 group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
            className="mr-1.5 opacity-60 group-hover:opacity-100"
          >
            <ChevronDown size={14} strokeWidth={2.5} />
          </motion.div>
          <Folder size={14} strokeWidth={2.5} className="mr-2.5 text-[var(--color-accent-primary)]" />
          <span className="truncate tracking-wide">CODEWEAVER-PROJECT</span>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1 relative"
            >
              <div className="absolute left-[22px] top-0 bottom-0 w-[1px] bg-[var(--color-border-subtle)] opacity-50" />

              <div className="ml-6 pl-2">
                {isCreating && (
                  <form onSubmit={handleCreateFile} className="px-2 py-1 mb-1">
                    <div className="flex items-center bg-[var(--color-bg-surface)] border border-[var(--color-accent-primary)] rounded-md px-2 py-1 shadow-[0_0_0_2px_var(--color-accent-glow)]">
                      <FileCode size={14} className="mr-2 text-[var(--color-accent-primary)]" />
                      <input
                        autoFocus
                        className="bg-transparent text-[var(--color-text-primary)] text-[13px] w-full outline-none placeholder:text-[var(--color-text-tertiary)] font-medium"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onBlur={() => setIsCreating(false)}
                        placeholder="filename.js"
                        spellCheck={false}
                        autoComplete="off"
                      />
                    </div>
                  </form>
                )}

                {files.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      "group flex items-center px-2.5 py-1.5 my-0.5 mx-2 rounded-md cursor-pointer text-[13px] transition-all duration-200 relative",
                      activeFileId === file.id 
                        ? "bg-[var(--color-accent-glow)] text-[var(--color-text-primary)] font-medium" 
                        : "hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] text-[var(--color-text-secondary)]"
                    )}
                    onClick={() => openFile(file.id)}
                  >
                    {activeFileId === file.id && (
                      <motion.div 
                        layoutId="activeFileGlow"
                        className="absolute inset-0 border border-[var(--color-accent-primary)]/30 rounded-md bg-[var(--color-accent-primary)]/10"
                      />
                    )}
                    <div className="mr-2.5 z-10 flex items-center justify-center w-4 h-4">
                      {getFileIcon(file.name)}
                    </div>
                    <span className="flex-1 truncate z-10">{file.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--color-bg-active)] hover:text-red-400 rounded-md transition-all duration-200 z-10"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                ))}
                
                {files.length === 0 && !isCreating && (
                  <div className="px-4 py-8 text-center text-[13px] text-[var(--color-text-tertiary)]">
                    <p className="mb-4">No files yet</p>
                    <button 
                      onClick={() => setIsCreating(true)}
                      className="text-[var(--color-accent-primary)] hover:text-[var(--color-text-primary)] transition-colors duration-200 border border-[var(--color-border-subtle)] hover:border-[var(--color-border-focus)] px-4 py-2 rounded-md text-[12px] font-semibold tracking-wide uppercase"
                    >
                      Create a file
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 py-3 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-tertiary)] uppercase font-bold tracking-[0.15em] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer flex items-center justify-between group">
        <span>Outline</span>
        <ChevronRight size={14} strokeWidth={2.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="px-4 py-3 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-tertiary)] uppercase font-bold tracking-[0.15em] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer flex items-center justify-between group">
        <span>Timeline</span>
        <ChevronRight size={14} strokeWidth={2.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

