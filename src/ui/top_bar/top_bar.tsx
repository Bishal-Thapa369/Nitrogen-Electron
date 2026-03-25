import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../core/state/store';
import { Play, Save, Search, Layout, MoreHorizontal, Minimize2, Maximize2, X, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';



export const TopBar: React.FC = () => {
  const { activeFilePath, openTabs, theme, setTheme, autoSave, toggleAutoSave, toggleCommandPalette, setFileTree } = useStore();
  const activeTab = openTabs.find((t) => t.path === activeFilePath);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setFileMenuOpen(false);
      }
    };
    if (fileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fileMenuOpen]);

  const handleOpenFolder = async () => {
    setFileMenuOpen(false);
    try {
      const tree = await window.electronAPI.openFolderDialog();
      if (tree) {
        setFileTree(tree, tree.path);
      }
    } catch (err) {
      console.error('Failed to open folder:', err);
    }
  };

  return (
    <div className="h-12 bg-[var(--color-bg-base)]/60 backdrop-blur-md text-[var(--color-text-secondary)] flex items-center justify-between px-4 select-none border-b border-[var(--color-border-subtle)] drag-region relative z-50">
      {/* Left: macOS Traffic Lights & Menu */}
      <div className="flex items-center space-x-6 flex-1">
        <div className="flex items-center space-x-2 no-drag">
          <div 
            onClick={() => window.electronAPI.close()}
            className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-sm cursor-pointer hover:brightness-90 active:brightness-75 transition-all"
          ></div>
          <div 
            onClick={() => window.electronAPI.minimize()}
            className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm cursor-pointer hover:brightness-90 active:brightness-75 transition-all"
          ></div>
          <div 
            onClick={() => window.electronAPI.maximize()}
            className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-sm cursor-pointer hover:brightness-90 active:brightness-75 transition-all"
          ></div>
        </div>
        
        <div className="flex items-center space-x-4 text-[13px] font-medium no-drag">
          {/* File Menu with Dropdown */}
          <div className="relative" ref={menuRef}>
            <span 
              className={`hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200 ${fileMenuOpen ? 'text-[var(--color-text-primary)]' : ''}`}
              onClick={() => setFileMenuOpen(!fileMenuOpen)}
            >
              File
            </span>

            <AnimatePresence>
              {fileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-8 left-0 w-56 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-lg shadow-2xl overflow-hidden backdrop-blur-xl z-50"
                >
                  <div className="py-1">
                    <button
                      onClick={handleOpenFolder}
                      className="w-full flex items-center px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors duration-150"
                    >
                      <FolderOpen size={14} className="mr-3 text-[var(--color-accent-primary)]" />
                      <span>Open Folder...</span>
                      <span className="ml-auto text-[11px] text-[var(--color-text-tertiary)]">Ctrl+O</span>
                    </button>
                    <div className="h-[1px] bg-[var(--color-border-subtle)] mx-2 my-1" />
                    <button
                      className="w-full flex items-center px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors duration-150"
                    >
                      <Save size={14} className="mr-3" />
                      <span>Save</span>
                      <span className="ml-auto text-[11px] text-[var(--color-text-tertiary)]">Ctrl+S</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200">Edit</span>
          <span className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200">View</span>
          <span className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200">Go</span>
          <span className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200">Run</span>
          <span className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200">Terminal</span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 flex justify-center no-drag">
        <div 
          onClick={toggleCommandPalette}
          className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-full px-4 py-1 text-[12px] w-[400px] flex items-center justify-between text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-focus)] hover:text-[var(--color-text-secondary)] transition-all duration-200 cursor-pointer shadow-sm group"
        >
          <div className="flex items-center">
            <Search size={14} className="mr-2 opacity-70 group-hover:opacity-100 transition-opacity" />
            <span>{activeTab ? activeTab.name : 'Search files or run commands...'}</span>
          </div>
          <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <kbd className="font-sans text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--color-bg-active)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">⌘</kbd>
            <kbd className="font-sans text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--color-bg-active)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">K</kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-end space-x-1.5 flex-1 no-drag">
        <button 
          onClick={toggleAutoSave}
          className={`p-1.5 rounded-md hover:bg-[var(--color-bg-hover)] transition-colors duration-200 ${autoSave ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
          title="Toggle Auto-save"
        >
          <Save size={15} strokeWidth={2} />
        </button>
        <button 
          onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
          className="p-1.5 rounded-md hover:bg-[var(--color-bg-hover)] transition-colors duration-200 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          title="Toggle Theme"
        >
          <Layout size={15} strokeWidth={2} />
        </button>
        <div className="h-4 w-[1px] bg-[var(--color-border-subtle)] mx-1"></div>
        <button className="p-1.5 rounded-md hover:bg-[var(--color-bg-hover)] transition-colors duration-200 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <Play size={15} strokeWidth={2} className="text-emerald-500" />
        </button>
        <button className="p-1.5 rounded-md hover:bg-[var(--color-bg-hover)] transition-colors duration-200 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <MoreHorizontal size={15} strokeWidth={2} />
        </button>

        {/* Standard Window Controls */}
        <div className="flex items-center ml-2 border-l border-[var(--color-border-subtle)] pl-2 space-x-0.5">
          <button 
            onClick={() => window.electronAPI.minimize()}
            className="p-1.5 rounded-md hover:bg-[var(--color-bg-hover)] transition-colors duration-200 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            title="Minimize"
          >
            <Minimize2 size={14} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => window.electronAPI.maximize()}
            className="p-1.5 rounded-md hover:bg-[var(--color-bg-hover)] transition-colors duration-200 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            title="Maximize"
          >
            <Maximize2 size={14} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => window.electronAPI.close()}
            className="p-1.5 rounded-md hover:bg-red-500/20 transition-colors duration-200 text-[var(--color-text-tertiary)] hover:text-red-500 font-bold"
            title="Close"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
