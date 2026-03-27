import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useStore } from '../../../core/state/store';
import { getTerminalTheme } from '../utils/terminal_themes';

export const useTerminalLogic = () => {
  const { isTerminalOpen, theme } = useStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!isTerminalOpen || !terminalRef.current) return;

    if (!xtermRef.current) {
      const term = new XTerm({
        theme: getTerminalTheme(theme),
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        cursorBlink: true,
        cursorStyle: 'block',
        allowTransparency: true,
        scrollback: 20000,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      
      term.open(terminalRef.current);
      fitAddon.fit();

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      const initTerminal = async () => {
        const { rows, cols } = term;
        await window.electronAPI.terminalSpawn(rows, cols);
        
        window.electronAPI.onTerminalData((data: string) => {
          term.write(data);
        });
      };

      initTerminal();

      term.onData(data => {
        window.electronAPI.terminalWrite(data);
      });

      term.onResize(({ cols, rows }) => {
        window.electronAPI.terminalResize(rows, cols);
      });
    } else {
      setTimeout(() => {
        fitAddonRef.current?.fit();
        xtermRef.current?.focus();
      }, 50);
    }

    const handleResize = () => {
      fitAddonRef.current?.fit();
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(() => {
      fitAddonRef.current?.fit();
    });
    
    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [isTerminalOpen]); // Only runs on open

  const clearTerminal = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.focus();
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(prev => {
        const next = !prev;
        setTimeout(() => fitAddonRef.current?.fit(), 50);
        return next;
    });
  };

  return {
    terminalRef,
    xtermRef,
    fitAddonRef,
    isMaximized,
    clearTerminal,
    toggleMaximize,
    isTerminalOpen,
    theme
  };
};
