import React from 'react';
import { useStore } from '../store';
import { Info, Bell, Check, GitBranch, Terminal as TerminalIcon } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { activeFileId, files, cursorPosition, theme, toggleTerminal, isTerminalOpen } = useStore();
  const activeFile = files.find((f) => f.id === activeFileId);

  return (
    <div className="h-8 bg-[var(--color-bg-base)] text-[var(--color-text-tertiary)] flex items-center justify-between px-4 text-[11px] font-medium tracking-wide select-none border-t border-[var(--color-border-subtle)]">
      <div className="flex items-center space-x-5">
        <div className="flex items-center hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200">
          <GitBranch size={13} strokeWidth={2.5} className="mr-1.5 text-[var(--color-accent-primary)]" />
          <span>main*</span>
        </div>
        <div className="flex items-center hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200">
          <Check size={13} strokeWidth={2.5} className="mr-1.5 text-emerald-500" />
          <span>Prettier</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {activeFile && (
          <>
            <div className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200 font-mono">
              Ln {cursorPosition.line}, Col {cursorPosition.column}
            </div>
            <div className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200">
              Spaces: 2
            </div>
            <div className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200 uppercase">
              UTF-8
            </div>
            <div className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200 text-[var(--color-accent-secondary)]">
              {activeFile.language === 'javascript' ? 'JavaScript' : activeFile.language.charAt(0).toUpperCase() + activeFile.language.slice(1)}
            </div>
          </>
        )}
        <div 
          onClick={toggleTerminal}
          className={`flex items-center cursor-pointer transition-colors duration-200 ${isTerminalOpen ? 'text-[var(--color-accent-primary)]' : 'hover:text-[var(--color-text-primary)]'}`}
          title="Toggle Terminal (Ctrl+`)"
        >
          <TerminalIcon size={13} strokeWidth={2.5} />
        </div>
        <div className="flex items-center hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200">
          <Bell size={13} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};
