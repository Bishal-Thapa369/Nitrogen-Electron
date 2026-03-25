import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../core/state/store';
import { Sidebar } from './sidebar/sidebar';
import { Editor } from './editor/editor';
import { Tabs } from './tabs/tabs';
import { StatusBar } from './status_bar/status_bar';
import { TopBar } from './top_bar/top_bar';
import { Terminal } from './terminal/terminal';
import { CommandPalette } from './command_palette/command_palette';
import { Files, Search, GitBranch, Play, Settings, UserCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { theme, isTerminalOpen, toggleTerminal } = useStore();
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [terminalHeight, setTerminalHeight] = useState(240);
  const isResizing = useRef(false);
  const isTerminalResizing = useRef(false);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        console.log('Manual save triggered');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTerminal]);

  const startResizing = (_e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current) {
      const newWidth = e.clientX - 48; // Adjusted for padding and activity bar
      if (newWidth > 180 && newWidth < 600) {
        setSidebarWidth(newWidth);
      }
    }
    if (isTerminalResizing.current) {
      const newHeight = window.innerHeight - e.clientY - 32; // Adjusted for status bar
      if (newHeight > 100 && newHeight < window.innerHeight - 200) {
        setTerminalHeight(newHeight);
      }
    }
  };

  const startTerminalResizing = (_e: React.MouseEvent) => {
    isTerminalResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopTerminalResizing);
    document.body.style.cursor = 'row-resize';
  };

  const stopTerminalResizing = () => {
    isTerminalResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopTerminalResizing);
    document.body.style.cursor = 'default';
  };

  return (
    <div 
      className={`h-screen w-screen flex flex-col overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-sans relative ${theme === 'light' ? 'light-theme' : ''}`}
      style={{
        backgroundImage: theme === 'light' 
          ? 'radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.05) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(124, 58, 237, 0.05) 0%, transparent 50%)'
          : 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)'
      }}
    >
      <TopBar />
      
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Activity Bar */}
        <div className="w-8 flex flex-col items-center py-4 space-y-4 text-[var(--color-text-tertiary)] select-none z-10">
          <div className="p-1 rounded-md bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)] cursor-pointer transition-all duration-200 shadow-sm">
            <Files size={24} strokeWidth={2} />
          </div>
          <div className="p-1 rounded-md hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] cursor-pointer transition-all duration-200">
            <Search size={24} strokeWidth={2} />
          </div>
          <div className="p-1 rounded-md hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] cursor-pointer transition-all duration-200">
            <GitBranch size={24} strokeWidth={2} />
          </div>
          <div className="p-1 rounded-md hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] cursor-pointer transition-all duration-200">
            <Play size={24} strokeWidth={2} />
          </div>
          <div className="p-1 rounded-md hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] cursor-pointer transition-all duration-200">
            <Package size={24} strokeWidth={2} />
          </div>
          
          <div className="flex-1"></div>
          
          <div className="p-1 rounded-md hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] cursor-pointer transition-all duration-200">
            <UserCircle size={24} strokeWidth={2} />
          </div>
          <div className="p-1 rounded-md hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] cursor-pointer transition-all duration-200">
            <Settings size={24} strokeWidth={2} />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: sidebarWidth }} className="flex-shrink-0 relative bg-[var(--color-bg-panel)]/60 backdrop-blur-2xl rounded-xl border border-[var(--color-border-subtle)] overflow-hidden shadow-2xl flex flex-col">
          <Sidebar />
          <div 
            onMouseDown={startResizing}
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-[var(--color-accent-primary)] transition-colors duration-300 z-20 opacity-0 hover:opacity-100"
          />
        </div>

        {/* Main Content Area & Terminal */}
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          {/* Editor */}
          <div className="flex-1 flex flex-col bg-[var(--color-bg-surface)]/90 backdrop-blur-2xl rounded-xl border border-[var(--color-border-subtle)] overflow-hidden shadow-2xl relative">
            <Tabs />
            <div className="flex-1 relative overflow-hidden">
              <Editor />
            </div>
          </div>
          
          {/* Terminal */}
          <AnimatePresence>
            {isTerminalOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: terminalHeight, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex-shrink-0 relative flex flex-col bg-[var(--color-bg-panel)]/60 backdrop-blur-2xl rounded-xl border border-[var(--color-border-subtle)] overflow-hidden shadow-2xl"
              >
                <div 
                  onMouseDown={startTerminalResizing}
                  className="absolute -top-1.5 left-0 w-full h-3 cursor-row-resize hover:bg-[var(--color-accent-primary)] transition-colors duration-300 z-20 opacity-0 hover:opacity-100"
                />
                <Terminal />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <StatusBar />
      <CommandPalette />
    </div>
  );
}

