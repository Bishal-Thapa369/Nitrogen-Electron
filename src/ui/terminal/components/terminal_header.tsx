import React from 'react';
import { X, Trash2, Maximize2, Minimize2, Plus } from 'lucide-react';

interface TerminalHeaderProps {
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onToggleTerminal: () => void;
  onAddTerminal: () => void;
  onKillTerminal: () => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  isMaximized, onToggleMaximize, onToggleTerminal, onAddTerminal, onKillTerminal
}) => {
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-transparent border-b border-[var(--color-border-subtle)] select-none">
      <div className="flex items-center space-x-8 text-[11px] font-bold tracking-[0.15em] uppercase">
        <span className="text-[var(--color-text-primary)] border-b-2 border-[var(--color-accent-primary)] pb-1.5 cursor-pointer">Terminal</span>
        <span className="opacity-60 hover:opacity-100 hover:text-[var(--color-text-primary)] cursor-pointer transition-all duration-200">Output</span>
        <span className="opacity-60 hover:opacity-100 hover:text-[var(--color-text-primary)] cursor-pointer transition-all duration-200">Debug Console</span>
        <span className="opacity-60 hover:opacity-100 hover:text-[var(--color-text-primary)] cursor-pointer transition-all duration-200">Problems</span>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={onAddTerminal}
          className="p-1.5 hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] rounded-md transition-all duration-200"
          title="New Terminal"
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
        <button 
          onClick={onKillTerminal}
          className="p-1.5 hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] rounded-md transition-all duration-200"
          title="Kill Terminal"
        >
          <Trash2 size={14} strokeWidth={2.5} />
        </button>
        <button 
          onClick={onToggleMaximize}
          className="p-1.5 hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] rounded-md transition-all duration-200"
          title={isMaximized ? "Restore Terminal" : "Maximize Terminal"}
        >
          {isMaximized ? <Minimize2 size={14} strokeWidth={2.5} /> : <Maximize2 size={14} strokeWidth={2.5} />}
        </button>
        <button 
          onClick={onToggleTerminal}
          className="p-1.5 hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] rounded-md transition-all duration-200"
          title="Close Terminal"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
