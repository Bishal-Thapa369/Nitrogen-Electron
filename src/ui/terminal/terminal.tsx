import React from 'react';
import { useStore } from '../../core/state/store';
import 'xterm/css/xterm.css';

// Modular Imports
import { TerminalHeader } from './components/terminal_header';
import { useTerminalLogic } from './hooks/use_terminal_logic';
import { useTerminalThemeSync } from './hooks/use_terminal_theme_sync';

export const Terminal: React.FC = () => {
  const { toggleTerminal, setFocusContext } = useStore();
  
  const { 
    terminalRef, xtermRef, isMaximized, clearTerminal, toggleMaximize, isTerminalOpen, theme 
  } = useTerminalLogic();

  // Handle Dynamic Theme Synchronization
  useTerminalThemeSync(xtermRef.current, theme);

  if (!isTerminalOpen) return null;

  return (
    <div 
      className={`flex flex-col bg-transparent text-[var(--color-text-secondary)] overflow-hidden ${isMaximized ? 'fixed inset-0 z-50 bg-[var(--color-bg-panel)]' : 'h-full'}`}
      onClick={() => setFocusContext('terminal')}
    >
      
      <TerminalHeader 
        isMaximized={isMaximized}
        onToggleMaximize={toggleMaximize}
        onToggleTerminal={toggleTerminal}
        onClearTerminal={clearTerminal}
      />

      <div className="flex-1 bg-[var(--color-bg-surface)]/30 relative">
        <div 
          className="absolute inset-[1px] rounded-t-[2px] rounded-b-[10px] overflow-hidden border border-[var(--color-border-subtle)]"
          style={{ backgroundColor: theme === 'light' ? '#ffffff' : '#000000' }}
        >
          <div ref={terminalRef} className="absolute inset-3" />
        </div>
      </div>
    </div>
  );
};
