import { useState } from 'react';
import { useStore } from '../../../core/state/store';
import { terminalEvents } from '../utils/terminal_events';

/**
 * useTerminalLogic
 * 
 * Lightweight hook for Managing the Terminal Panel's UI state (maximize, clear, etc.)
 */
export const useTerminalLogic = () => {
  const { isTerminalOpen, theme } = useStore();
  const [isMaximized, setIsMaximized] = useState(false);

  const clearTerminal = () => {
    // Dispatch a global clear event that the active TerminalInstance will intercept
    terminalEvents.emit('clear-active');
  };

  const toggleMaximize = () => {
    setIsMaximized(prev => !prev);
  };

  return {
    isMaximized,
    clearTerminal,
    toggleMaximize,
    isTerminalOpen,
    theme
  };
};
