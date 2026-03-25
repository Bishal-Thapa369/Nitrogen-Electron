import React from 'react';
import { useStore } from '../store';
import { Play, Save, Search, Layout, MoreHorizontal, Command } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { activeFileId, files, theme, setTheme, autoSave, toggleAutoSave, toggleCommandPalette } = useStore();
  const activeFile = files.find((f) => f.id === activeFileId);

  return (
    <div className="h-12 bg-[var(--color-bg-base)]/60 backdrop-blur-md text-[var(--color-text-secondary)] flex items-center justify-between px-4 select-none border-b border-[var(--color-border-subtle)] drag-region relative z-10">
      {/* Left: macOS Traffic Lights & Title */}
      <div className="flex items-center space-x-6 flex-1">
        <div className="flex items-center space-x-2 no-drag">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-sm"></div>
        </div>
        
        <div className="flex items-center space-x-4 text-[13px] font-medium no-drag">
          <span className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200">File</span>
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
            <span>{activeFile ? activeFile.name : 'Search files or run commands...'}</span>
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
      </div>
    </div>
  );
};
