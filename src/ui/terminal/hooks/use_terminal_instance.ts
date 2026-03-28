import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useStore } from '../../../core/state/store';
import { getTerminalTheme } from '../utils/terminal_themes';
import { setupTerminalShortcuts } from './use_terminal_shortcuts';
import { useTerminalThemeSync } from './use_terminal_theme_sync';

export const useTerminalInstance = (_terminalId: string, isActive: boolean) => {
  const { theme, isTerminalOpen } = useStore();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const initialized = useRef(false);

  // Sync theme dynamically
  useTerminalThemeSync(xtermRef.current, theme);

  useEffect(() => {
    if (!terminalRef.current || initialized.current) return;

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
    
    // We must wait a tick for DOM to size correctly
    setTimeout(() => {
        try { fitAddon.fit(); } catch(e){}
    }, 10);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;
    initialized.current = true;

    setupTerminalShortcuts(term);

    const initBackend = async () => {
      // Spawn on backend and get the REAL string/number ID back
      // Since we pass `terminalId` from frontend (uuid), we don't need the backend ID unless we want to map it.
      // Wait, the backend uses its own spawned ID. We need to map our frontend uuid to the backend PTY id!
      // Actually, we can just pass the rows/cols, get backend ID, and send it back to the store?
      // Or we can just let 'terminalSpawn' return a backend ID, and we update our terminal ID to match it, OR we keep a local ref.
      const backendId = await window.electronAPI.terminalSpawn(term.rows || 24, term.cols || 80);
      
      // We will cast backendId to string internally to match frontend
      term.onData(data => {
        window.electronAPI.terminalWrite(backendId, data);
      });

      term.onResize(({ cols, rows }) => {
        window.electronAPI.terminalResize(backendId, rows, cols);
      });

      // We need a global listener in the app or a singleton, but for now we can filter here:
      (term as any)._unsubscribe = window.electronAPI.onTerminalData((payload: any) => {
        if (payload.id === backendId) {
          term.write(payload.data);
        }
      });
      // Important: store cleanup requires knowing backendId
      (term as any)._backendId = backendId;
    };

    initBackend();

    const resizeObserver = new ResizeObserver(() => {
      try {
        if (terminalRef.current && terminalRef.current.clientWidth > 0 && terminalRef.current.clientHeight > 0) {
            fitAddon.fit();
        }
      } catch (e) {}
    });
    
    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
      if ((term as any)._unsubscribe) {
        (term as any)._unsubscribe();
      }
      term.dispose();
      if ((term as any)._backendId !== undefined) {
         window.electronAPI.terminalKill((term as any)._backendId);
      }
    };
  }, []); // Only mount once

  // React to active state
  useEffect(() => {
    if (isActive && isTerminalOpen) {
      setTimeout(() => {
        try {
          fitAddonRef.current?.fit();
          xtermRef.current?.focus();
        } catch (e) {}
      }, 50);
    }
  }, [isActive, isTerminalOpen]);

  const clearTerminal = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.focus();
    }
  };

  return {
    terminalRef,
    clearTerminal
  };
};
