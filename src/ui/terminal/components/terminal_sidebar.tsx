import React from 'react';
import { useStore } from '../../../core/state/store';
import { TerminalSquare, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const TerminalSidebar: React.FC = () => {
  const { terminals, activeTerminalId, setActiveTerminal, removeTerminal } = useStore();

  if (terminals.length <= 1) return null;

  return (
    <div className="w-12 hover:w-48 group bg-transparent border-l border-[var(--color-border-subtle)]/50 transition-all duration-300 overflow-hidden flex flex-col shrink-0">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-1">
        {terminals.map((term, index) => (
          <div
            key={term.id}
            onClick={() => setActiveTerminal(term.id)}
            className={cn(
              "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors relative min-w-[180px]",
              activeTerminalId === term.id 
                ? "bg-[var(--color-bg-active)] text-[var(--color-text-primary)]" 
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
            )}
          >
            <div className="flex items-center gap-2 overflow-hidden w-full">
              <TerminalSquare size={14} className="shrink-0" />
              <span className="text-[12px] truncate transition-opacity duration-300 opacity-0 group-hover:opacity-100 font-mono">
                {index + 1}: {term.name}
              </span>
            </div>
            
            <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTerminal(term.id);
                }}
                className="p-1 hover:bg-black/20 hover:text-red-400 rounded-sm"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
