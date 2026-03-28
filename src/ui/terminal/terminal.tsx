import React, { useEffect } from 'react';
import { useStore } from '../../core/state/store';
import 'xterm/css/xterm.css';

// Modular Imports
import { TerminalHeader } from './components/terminal_header';
import { TerminalSidebar } from './components/terminal_sidebar';
import { useTerminalInstance } from './hooks/use_terminal_instance';

const TerminalInstance: React.FC<{ terminalId: string; isActive: boolean }> = ({ terminalId, isActive }) => {
  const { terminalRef, clearTerminal: _clearTerminal } = useTerminalInstance(terminalId, isActive);

  // We expose clearTerminal to the parent via a ref or store if needed, 
  // but let's keep it simple: the header's clear button can just clear the active terminal.
  // For now, it's scoped internally. We will integrate it in the next step.

  return (
    <div 
      className="absolute inset-[1px] rounded-t-[2px] rounded-b-[10px] overflow-hidden"
      style={{ display: isActive ? 'block' : 'none' }}
    >
      <div ref={terminalRef} className="absolute inset-3" />
    </div>
  );
};

export const Terminal: React.FC = () => {
  const { 
    terminals, activeTerminalId, addTerminal, removeTerminal,
    toggleTerminal, setFocusContext, isTerminalOpen, theme 
  } = useStore();
  
  const [isMaximized, setIsMaximized] = React.useState(false);

  // Auto-spawn initial terminal if opened and empty
  useEffect(() => {
    if (isTerminalOpen && terminals.length === 0) {
      addTerminal(Date.now().toString(), 'bash');
    }
  }, [isTerminalOpen, terminals.length, addTerminal]);

  if (!isTerminalOpen) return null;

  return (
    <div 
      className={`flex flex-col bg-transparent text-[var(--color-text-secondary)] overflow-hidden ${isMaximized ? 'fixed inset-0 z-50 bg-[var(--color-bg-panel)]' : 'h-full'}`}
      onClick={() => setFocusContext('terminal')}
    >
      <TerminalHeader 
        isMaximized={isMaximized}
        onToggleMaximize={() => setIsMaximized(!isMaximized)}
        onToggleTerminal={toggleTerminal}
        onAddTerminal={() => addTerminal(Date.now().toString(), 'bash')}
        onKillTerminal={() => activeTerminalId && removeTerminal(activeTerminalId)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Terminal Area */}
        <div className="flex-1 bg-[var(--color-bg-surface)]/30 relative border border-[var(--color-border-subtle)]"
             style={{ backgroundColor: theme === 'light' ? '#ffffff' : '#000000' }}
        >
          {terminals.map(term => (
            <TerminalInstance 
              key={term.id} 
              terminalId={term.id} 
              isActive={term.id === activeTerminalId} 
            />
          ))}
        </div>
        
        {/* Dynamic Multi-Tab Sidebar */}
        <TerminalSidebar />
      </div>
    </div>
  );
};
