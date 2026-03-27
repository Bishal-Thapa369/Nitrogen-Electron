import React from 'react';
import { useStore } from '../../core/state/store';
import { Bell, Check, GitBranch, Terminal as TerminalIcon } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { editorGroups, activeGroupId, cursorPosition, toggleTerminal, isTerminalOpen } = useStore();

  const activeGroup = editorGroups.find(g => g.id === activeGroupId) || editorGroups[0];
  const activeFilePath = activeGroup.activeFilePath;

  const getLanguageLabel = (filePath: string): string => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) return 'TypeScript';
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) return 'JavaScript';
    if (filePath.endsWith('.html')) return 'HTML';
    if (filePath.endsWith('.css')) return 'CSS';
    if (filePath.endsWith('.json')) return 'JSON';
    if (filePath.endsWith('.md')) return 'Markdown';
    if (filePath.endsWith('.py')) return 'Python';
    if (filePath.endsWith('.cpp')) return 'C++';
    if (filePath.endsWith('.hpp') || filePath.endsWith('.h')) return 'C++ Header';
    return 'Plain Text';
  };

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
        {activeFilePath && (
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
              {getLanguageLabel(activeFilePath)}
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
