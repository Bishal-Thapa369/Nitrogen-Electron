import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../core/state/store';
import { Terminal as TerminalIcon, Trash2 } from 'lucide-react';
import 'xterm/css/xterm.css';

// Modular Imports
import { TerminalHeader } from './components/terminal_header';
import { TerminalInstance } from './components/terminal_instance';

export const Terminal: React.FC = () => {
  const { 
    terminals, 
    activeTerminalId, 
    addTerminal, 
    removeTerminal, 
    setActiveTerminal, 
    toggleTerminal,
    setFocusContext,
    killAllTerminals,
    isTerminalMaximized,
    toggleTerminalMaximize,
    updateTerminalTitle
  } = useStore();

  const [sidebarWidth, setSidebarWidth] = useState(192); // Default w-48
  const isResizing = useRef(false);
  const [isResizingActive, setIsResizingActive] = useState(false);

  // Tab Rename State
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const startResizing = (_e: React.MouseEvent) => {
    isResizing.current = true;
    setIsResizingActive(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const stopResizing = () => {
    isResizing.current = false;
    setIsResizingActive(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current) {
      // Calculate from the right edge of the screen
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 30 && newWidth < 400) {
        setSidebarWidth(newWidth);
      }
    }
  };

  const handleRenameStart = (id: string, currentTitle: string) => {
    setEditingTabId(id);
    setEditTitle(currentTitle);
  };

  const handleRenameSubmit = () => {
    if (editingTabId) {
      if (editTitle.trim() === '') {
        updateTerminalTitle(editingTabId, 'bash');
      } else {
        updateTerminalTitle(editingTabId, editTitle.trim());
      }
      setEditingTabId(null);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') setEditingTabId(null);
  };

  useEffect(() => {
    if (editingTabId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingTabId]);

  return (
    <div 
      className={`flex flex-col bg-transparent text-[var(--color-text-secondary)] overflow-hidden ${
        isTerminalMaximized ? 'fixed inset-0 z-50 bg-[var(--color-bg-base)] transition-all duration-300' : 'h-full'
      }`}
      onClick={() => setFocusContext('terminal')}
    >
      
      <TerminalHeader 
        isMaximized={isTerminalMaximized}
        onToggleMaximize={toggleTerminalMaximize}
        onToggleTerminal={toggleTerminal}
        onAddTerminal={() => addTerminal('bash')}
        onKillTerminal={killAllTerminals}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Terminal Viewport */}
        <div className="flex-1 relative bg-[var(--color-bg-surface)]/20">
          {terminals.map((tab) => (
            <TerminalInstance 
              key={tab.id}
              id={tab.id}
              sessionId={tab.sessionId}
              isActive={activeTerminalId === tab.id}
            />
          ))}
          
          {terminals.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-tertiary)] opacity-30 select-none">
                <TerminalIcon size={48} strokeWidth={1} />
             </div>
          )}
        </div>

        {/* Dynamic Sidebar (VS Code Style) */}
        {terminals.length > 1 && (
          <>
            {/* Zero-footprint Resizer */}
            <div 
              onMouseDown={startResizing}
              className={`w-[1px] flex-shrink-0 relative flex items-center justify-center cursor-col-resize group z-30 ${isResizingActive ? 'active-resize' : ''}`}
            >
              {/* Invisible grab area */}
              <div className="absolute inset-y-0 -inset-x-2 z-40" />
              {/* Visible border line */}
              <div className={`w-[1px] h-full transition-all duration-300 ${isResizingActive ? 'bg-[var(--color-accent-primary)] shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-[var(--color-border-subtle)] group-hover:bg-[var(--color-accent-primary)] group-hover:w-[2px]'}`} />
            </div>
            
            <div 
              style={{ width: sidebarWidth, minWidth: sidebarWidth < 60 ? sidebarWidth : 60 }} 
              className="flex flex-col bg-[var(--color-bg-panel)]/40 backdrop-blur-md overflow-hidden relative"
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
                {terminals.map((tab) => (
                  <div 
                    key={tab.id}
                    onClick={() => {
                        if (editingTabId !== tab.id) {
                            setActiveTerminal(tab.id);
                        }
                    }}
                    onDoubleClick={() => handleRenameStart(tab.id, tab.title)}
                    className={`group px-3 py-2 flex items-center justify-between cursor-pointer transition-all duration-200 border-l-2 ${
                      activeTerminalId === tab.id 
                        ? 'bg-[var(--color-accent-glow)] border-[var(--color-accent-primary)] text-[var(--color-text-primary)]' 
                        : 'border-transparent text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate min-w-0 pr-2">
                      <TerminalIcon size={12} className={`flex-shrink-0 ${activeTerminalId === tab.id ? 'text-[var(--color-accent-primary)]' : ''}`} />
                      
                      {/* Name or Edit Input */}
                      {editingTabId === tab.id ? (
                        <input
                          ref={renameInputRef}
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={handleRenameSubmit}
                          onKeyDown={handleRenameKeyDown}
                          className="bg-[var(--color-bg-base)] text-[var(--color-text-primary)] border border-[var(--color-accent-primary)] rounded px-1 text-[12px] font-medium min-w-0 w-full outline-none"
                        />
                      ) : (
                        <span 
                          className={`text-[12px] font-medium truncate transition-opacity duration-200 ${sidebarWidth < 80 ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}
                        >
                          {tab.title}
                        </span>
                      )}
                    </div>
                    
                    {/* Trash Icon */}
                    <Trash2 
                      size={12} 
                      className={`flex-shrink-0 transition-all duration-150 ${
                          activeTerminalId === tab.id 
                          ? 'opacity-60 hover:opacity-100 hover:text-red-500' 
                          : 'opacity-0 group-hover:opacity-60 hover:opacity-100 hover:text-red-500'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // prevent firing if we're mid-click on another element, but let's keep it direct.
                        removeTerminal(tab.id);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
