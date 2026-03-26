import React, { useEffect, useRef, useState } from 'react';
import { X, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { useStore } from '../../core/state/store';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export const Terminal: React.FC = () => {
  const { isTerminalOpen, toggleTerminal, theme } = useStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);


  useEffect(() => {
    if (!isTerminalOpen || !terminalRef.current) return;

    if (!xtermRef.current) {
      const term = new XTerm({
        theme: {
          background: 'transparent',
          foreground: theme === 'light' ? '#333333' : '#EDEDED',
          cursor: theme === 'light' ? '#333333' : '#3B82F6',
          selectionBackground: theme === 'light' ? '#add6ff' : '#2563EB40',
          black: '#000000',
          red: '#EF4444',
          green: '#10B981',
          yellow: '#F59E0B',
          blue: '#3B82F6',
          magenta: '#8B5CF6',
          cyan: '#06B6D4',
          white: '#F4F4F5',
          brightBlack: '#52525B',
          brightRed: '#F87171',
          brightGreen: '#34D399',
          brightYellow: '#FBBF24',
          brightBlue: '#60A5FA',
          brightMagenta: '#A78BFA',
          brightCyan: '#22D3EE',
          brightWhite: '#FAFAFA'
        },
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
    
    // Create a ResizeObserver to watch the terminal container
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
      xtermRef.current.options.theme = {
        background: 'transparent',
        foreground: theme === 'light' ? '#333333' : '#EDEDED',
        cursor: theme === 'light' ? '#333333' : '#3B82F6',
        selectionBackground: theme === 'light' ? '#add6ff' : '#2563EB40',
      };
    }
  }, [theme]);

  // Mock functions removed for real backend integration


  const clearTerminal = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.focus();
    }
  };

  if (!isTerminalOpen) return null;

  return (
    <div className={`flex flex-col bg-transparent text-[var(--color-text-secondary)] overflow-hidden ${isMaximized ? 'fixed inset-0 z-50 bg-[var(--color-bg-panel)]' : 'h-full'}`}>
      <div className="flex items-center justify-between px-5 py-3 bg-transparent border-b border-[var(--color-border-subtle)] select-none">
        <div className="flex items-center space-x-8 text-[11px] font-bold tracking-[0.15em] uppercase">
          <span className="text-[var(--color-text-primary)] border-b-2 border-[var(--color-accent-primary)] pb-1.5 cursor-pointer">Terminal</span>
          <span className="opacity-60 hover:opacity-100 hover:text-[var(--color-text-primary)] cursor-pointer transition-all duration-200">Output</span>
          <span className="opacity-60 hover:opacity-100 hover:text-[var(--color-text-primary)] cursor-pointer transition-all duration-200">Debug Console</span>
          <span className="opacity-60 hover:opacity-100 hover:text-[var(--color-text-primary)] cursor-pointer transition-all duration-200">Problems</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={clearTerminal}
            className="p-1.5 hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] rounded-md transition-all duration-200"
            title="Clear Terminal"
          >
            <Trash2 size={14} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => {
              setIsMaximized(!isMaximized);
              setTimeout(() => fitAddonRef.current?.fit(), 50);
            }}
            className="p-1.5 hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] rounded-md transition-all duration-200"
            title={isMaximized ? "Restore Terminal" : "Maximize Terminal"}
          >
            {isMaximized ? <Minimize2 size={14} strokeWidth={2.5} /> : <Maximize2 size={14} strokeWidth={2.5} />}
          </button>
          <button 
            onClick={toggleTerminal}
            className="p-1.5 hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] rounded-md transition-all duration-200"
            title="Close Terminal"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

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

