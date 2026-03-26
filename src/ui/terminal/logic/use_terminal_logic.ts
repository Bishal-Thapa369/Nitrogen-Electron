import { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { getTerminalTheme } from '../utils/terminal_themes';

export const useTerminalLogic = (isTerminalOpen: boolean, theme: 'light' | 'dark', toggleTerminal: () => void) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  // Initialize Terminal
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

        // Initialize Native Terminal Session
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
        // Refit on open
        setTimeout(() => {
            fitAddonRef.current?.fit();
            xtermRef.current?.focus();
        }, 50);
    }

    const handleResize = () => {
        fitAddonRef.current?.fit();
    };

    window.addEventListener('resize', handleResize);
    
    // ResizeObserver for container changes
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
  }, [isTerminalOpen, theme]);

  // Update theme when it changes
  useEffect(() => {
    if (xtermRef.current) {
      const xtermTheme = getTerminalTheme(theme);
      xtermRef.current.options.theme = {
        background: 'transparent',
        foreground: xtermTheme.foreground,
        cursor: xtermTheme.cursor,
        selectionBackground: xtermTheme.selectionBackground,
      };
    }
  }, [theme]);

  const clearTerminal = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.focus();
    }
  }, []);

  const handleToggleMaximize = useCallback(() => {
    setIsMaximized(prev => !prev);
    setTimeout(() => fitAddonRef.current?.fit(), 50);
  }, []);

  return {
    terminalRef,
    isMaximized,
    setIsMaximized,
    clearTerminal,
    handleToggleMaximize,
    toggleTerminal
  };
};
