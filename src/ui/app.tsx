import React, { useState, useRef } from 'react';
import { useStore } from '../core/state/store';
import { Sidebar } from './sidebar/sidebar';
import { EditorGroup } from './editor/editor_group';
import { StatusBar } from './status_bar/status_bar';
import { TopBar } from './top_bar/top_bar';
import { Terminal } from './terminal/terminal';
import { CommandPalette } from './command_palette/command_palette';
import { useGlobalShortcuts } from './hooks/use_global_shortcuts';
import { Files, Search, GitBranch, Play, Settings, UserCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const { 
    theme, isTerminalOpen, isSidebarOpen, toggleSidebar, 
    isSplitScreen, editorGroups, sidebarView, setSidebarView 
  } = useStore();
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [terminalHeight, setTerminalHeight] = useState(240);
  const isResizing = useRef(false);
  const isTerminalResizing = useRef(false);
  const [isSidebarResizingActive, setIsSidebarResizingActive] = useState(false);
  const [isTerminalResizingActive, setIsTerminalResizingActive] = useState(false);


  useGlobalShortcuts();



  const startResizing = (_e: React.MouseEvent) => {
    isResizing.current = true;
    setIsSidebarResizingActive(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const stopResizing = () => {
    isResizing.current = false;
    setIsSidebarResizingActive(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current) {
      // Activity Bar Width (32px) + Outer Padding (12px) + Activity Bar Margin (12px) + Half Resizer (6px) = 62px
      const newWidth = e.clientX - 62; 
      
      // If dragged almost to the edge ( < 50px), collapse the sidebar
      if (newWidth < 50) {
        if (isSidebarOpen) toggleSidebar();
        stopResizing();
        return;
      }
      
      if (newWidth > 180 && newWidth < 600) {
        setSidebarWidth(newWidth);
      }
    }
    if (isTerminalResizing.current) {
      // Status Bar (32px) + Bottom Padding (12px) + Half of Resizer Height (6px) = 50px
      const newHeight = window.innerHeight - e.clientY - 50; 
      if (newHeight > 100 && newHeight < window.innerHeight - 200) {
        setTerminalHeight(newHeight);
      }
    }
  };

  const startTerminalResizing = (_e: React.MouseEvent) => {
    isTerminalResizing.current = true;
    setIsTerminalResizingActive(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopTerminalResizing);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const stopTerminalResizing = () => {
    isTerminalResizing.current = false;
    setIsTerminalResizingActive(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopTerminalResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
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
      
      <div className="flex-1 flex overflow-hidden p-3 gap-0">
        {/* Activity Bar */}
        <div className="w-8 flex flex-col items-center py-4 space-y-4 text-[var(--color-text-tertiary)] select-none z-10 mr-3">
          <div 
            onClick={() => {
              if (sidebarView === 'explorer' && isSidebarOpen) {
                toggleSidebar();
              } else {
                setSidebarView('explorer');
                if (!isSidebarOpen) toggleSidebar();
              }
            }}
            className={cn(
              "p-1 rounded-md cursor-pointer transition-all duration-200 shadow-sm",
              isSidebarOpen && sidebarView === 'explorer'
                ? "bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)] shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                : "hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
            )}
          >
            <Files size={24} strokeWidth={2} />
          </div>
          <div 
            onClick={() => {
              if (sidebarView === 'search' && isSidebarOpen) {
                toggleSidebar();
              } else {
                setSidebarView('search');
                if (!isSidebarOpen) toggleSidebar();
              }
            }}
            className={cn(
              "p-1 rounded-md cursor-pointer transition-all duration-200 shadow-sm",
              isSidebarOpen && sidebarView === 'search'
                ? "bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)] shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                : "hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
            )}
          >
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

        {/* Sidebar Group with Cinematic Animation */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: sidebarWidth + 12, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={isSidebarResizingActive 
                ? { duration: 0 } 
                : { duration: 0.32 + Math.min(0.1, sidebarWidth / 3000), ease: [0.16, 1, 0.3, 1] }
              }
              className="flex-shrink-0 flex overflow-hidden h-full"
            >
              {/* Actual Sidebar */}
              <div 
                style={{ width: sidebarWidth }} 
                className="flex-shrink-0 relative bg-[var(--color-bg-panel)]/60 backdrop-blur-2xl rounded-xl border border-[var(--color-border-subtle)] overflow-hidden shadow-2xl flex flex-col h-full"
              >
                <Sidebar />
              </div>

              {/* Sidebar Resizer (Stays locked inside the animated container for perfect gap consistency) */}
              <div 
                onMouseDown={startResizing}
                className={`w-3 flex-shrink-0 flex items-center justify-center cursor-col-resize group z-30 ${isSidebarResizingActive ? 'active-resize' : ''}`}
              >
                <div className={`w-[2px] h-full rounded-full transition-all duration-300 ${isSidebarResizingActive ? 'bg-[var(--color-accent-primary)] shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-transparent group-hover:bg-[var(--color-accent-primary)] shadow-[0_0_10px_rgba(59,130,246,0)] group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor Area (Split Support) */}
        <div className="flex-1 flex flex-col gap-0 overflow-hidden">
          <div className={cn(
            "flex-1 flex gap-3 overflow-hidden transition-all duration-300",
            isSplitScreen ? "flex-row" : "flex-col"
          )}>
            {editorGroups.map((group) => (
              <EditorGroup key={group.id} id={group.id} />
            ))}
          </div>
          
          {/* Terminal */}
          <AnimatePresence>
            {isTerminalOpen && (
              <>
                {/* Terminal Resizer (In Gap) */}
                <div 
                  onMouseDown={startTerminalResizing}
                  className={`h-3 flex-shrink-0 flex flex-col items-center justify-center cursor-row-resize group z-30 ${isTerminalResizingActive ? 'active-resize' : ''}`}
                >
                  <div className={`h-[2px] w-full rounded-full transition-all duration-300 ${isTerminalResizingActive ? 'bg-[var(--color-accent-primary)] shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-transparent group-hover:bg-[var(--color-accent-primary)] shadow-[0_0_10px_rgba(59,130,246,0)] group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} />
                </div>
                
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: terminalHeight, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-shrink-0 relative flex flex-col bg-[var(--color-bg-panel)]/60 backdrop-blur-2xl rounded-xl border border-[var(--color-border-subtle)] overflow-hidden shadow-2xl"
                >
                  <Terminal />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <StatusBar />
      <CommandPalette />
    </div>
  );
}
