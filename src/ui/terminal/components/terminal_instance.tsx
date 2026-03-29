import React from 'react';
import { useTerminalInstance } from '../hooks/use_terminal_instance';

interface TerminalInstanceProps {
  id: string;
  sessionId: number | null;
  isActive: boolean;
}

/**
 * TerminalInstance
 * 
 * Component representing a single concurrent terminal session.
 * Stays mounted in the background to preserve process state and buffer.
 */
export const TerminalInstance: React.FC<TerminalInstanceProps> = ({ 
  id, sessionId, isActive 
}) => {
  const { terminalRef } = useTerminalInstance(id, sessionId);

  return (
    <div 
      className={`absolute inset-0 transition-opacity duration-200 ${
        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
      }`}
    >
      <div 
        className="absolute inset-[1px] rounded-t-[2px] rounded-b-[10px] border border-[var(--color-border-subtle)]"
        style={{ 
          backgroundColor: '#000000',
          boxShadow: isActive ? 'inset 0 0 20px rgba(59, 130, 246, 0.05)' : 'none'
        }}
      >
        <div 
          ref={terminalRef} 
          className="absolute inset-4 xterm-instance" 
          style={{ visibility: isActive ? 'visible' : 'hidden' }}
        />
      </div>
    </div>
  );
};
