import React from 'react';
import { useStore } from '../../core/state/store';
import { X, FileCode, FileJson, FileType2, FileText, FileImage, FileCode2, FileTerminal } from 'lucide-react';
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
  if (filename.endsWith('.cpp') || filename.endsWith('.hpp')) return <FileCode size={14} className="text-sky-400" />;
  return <FileCode size={14} className="text-[var(--color-text-tertiary)]" />;
};

export const Tabs: React.FC = () => {
  const { openTabs, activeFilePath, closeFile, setActiveFile, setActiveFileContent } = useStore();

  if (openTabs.length === 0) return null;

  const handleTabClick = async (tab: { path: string; name: string }) => {
    setActiveFile(tab.path);
    try {
      const content = await window.electronAPI.readFile(tab.path);
      if (content !== null) {
        setActiveFileContent(content);
      }
    } catch (err) {
      console.error('Failed to read file:', err);
    }
  };

  return (
    <div className="flex bg-transparent overflow-x-auto no-scrollbar px-3 py-2 items-center gap-1.5 border-b border-[var(--color-border-subtle)]">
      <AnimatePresence initial={false}>
        {openTabs.map((tab) => {
          const isActive = activeFilePath === tab.path;

          return (
            <motion.div
              key={tab.path}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, width: 0, padding: 0, margin: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "group relative flex items-center min-w-[120px] max-w-[200px] px-3 py-1.5 cursor-pointer text-[12px] select-none transition-all duration-200 rounded-md border overflow-hidden",
                isActive 
                  ? "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[var(--color-border-focus)] shadow-sm z-10" 
                  : "bg-transparent text-[var(--color-text-tertiary)] border-transparent hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]"
              )}
              onClick={() => handleTabClick(tab)}
            >
              <div className="mr-2 z-10 flex items-center justify-center w-4 h-4">
                {getFileIcon(tab.name)}
              </div>
              <span className="flex-1 truncate font-medium z-10">{tab.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(tab.path);
                }}
                className={cn(
                  "ml-2 p-0.5 rounded-md hover:bg-[var(--color-bg-active)] hover:text-red-400 transition-all duration-200 z-10",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                <X size={13} strokeWidth={2.5} />
              </button>
              
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]"
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
