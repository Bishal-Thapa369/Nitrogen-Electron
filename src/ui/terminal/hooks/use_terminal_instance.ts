import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useStore } from '../../../core/state/store';
import { getTerminalTheme } from '../utils/terminal_themes';
import { setupTerminalShortcuts } from './use_terminal_shortcuts';
import { terminalEvents } from '../utils/terminal_events';

/**
 * useTerminalInstance
 * 
 * Reusable hook for a single xterm.js instance bound to a C++ PID.
 */
export const useTerminalInstance = (terminalId: string, sessionId: number | null) => {
  const { theme, setTerminalSessionId, activeTerminalId } = useStore();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const isActive = activeTerminalId === terminalId;

  useEffect(() => {
    if (!terminalRef.current) return;

    if (!xtermRef.current) {
      const term = new XTerm({
        theme: getTerminalTheme(theme),
        fontFamily: '"MesloLGS NF", "Fira Code", "Hack", "Consolas", var(--font-mono), monospace',
        fontSize: 13,
        lineHeight: 1.0,
        letterSpacing: 0,
        customGlyphs: true, // Forces xterm.js to draw box-drawing characters perfectly
        cursorBlink: true,
        cursorStyle: 'block',
        allowTransparency: true,
        scrollback: 20000,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      
      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      setupTerminalShortcuts(term);

      const spawnSession = async () => {
        if (sessionId === null) {
          const { rows, cols } = term;
          const newSid = await window.electronAPI.terminalSpawn(rows, cols);
          setTerminalSessionId(terminalId, newSid);
        } else {
          // Re-attach data listener if session already exists
          // Handle initial content if needed, but for now we just listen
        }
      };

      spawnSession();

      term.onData(data => {
        const currentSid = useStore.getState().terminals.find(t => t.id === terminalId)?.sessionId;
        if (currentSid !== null && currentSid !== undefined) {
          window.electronAPI.terminalWrite(currentSid, data);
        }
      });

      term.onResize(({ cols, rows }) => {
        const currentSid = useStore.getState().terminals.find(t => t.id === terminalId)?.sessionId;
        if (currentSid !== null && currentSid !== undefined) {
            window.electronAPI.terminalResize(currentSid, rows, cols);
        }
      });
    }
  }, []);

  // Effect to handle data routing and clear events once sessionId is available
  useEffect(() => {
    if (sessionId !== null && xtermRef.current) {
      const onData = (data: string) => {
        xtermRef.current?.write(data);
      };

      const onClear = () => {
        if (activeTerminalId === terminalId) {
          xtermRef.current?.clear();
          xtermRef.current?.focus();
        }
      };
      
      terminalEvents.on(`data-${sessionId}`, onData);
      terminalEvents.on('clear-active', onClear);
      
      // Auto-fit on first attach
      setTimeout(() => fitAddonRef.current?.fit(), 100);

      return () => {
        terminalEvents.off(`data-${sessionId}`, onData);
        terminalEvents.off('clear-active', onClear);
      };
    }
  }, [sessionId, activeTerminalId]);

  // Handle active focus and resize
  const { isTerminalOpen } = useStore();
  
  useEffect(() => {
    if (isActive && isTerminalOpen && xtermRef.current) {
      // 350ms ensures the 300ms CSS animation in App.tsx has finished
      // so fitAddon calculates based on the final expanded dimensions.
      const timer = setTimeout(() => {
        fitAddonRef.current?.fit();
        xtermRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isActive, isTerminalOpen]);

  // Handle theme changes
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = getTerminalTheme(theme);
    }
  }, [theme]);

  // Global resize listener
  useEffect(() => {
    const handleResize = () => fitAddonRef.current?.fit();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { terminalRef, xtermRef, fitAddonRef };
};
