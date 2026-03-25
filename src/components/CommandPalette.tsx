import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Search, Command, FileCode2, Palette, XSquare } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, toggleCommandPalette, setTheme, theme, openTabs, closeFile, files, openFile } = useStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { id: 'theme-dark', name: 'Color Theme: Dark (Visual Studio)', action: () => setTheme('vs-dark'), category: 'Theme', icon: <Palette size={14} /> },
    { id: 'theme-light', name: 'Color Theme: Light', action: () => setTheme('light'), category: 'Theme', icon: <Palette size={14} /> },
    { id: 'close-all', name: 'Close All Editors', action: () => openTabs.forEach(id => closeFile(id)), category: 'Editor', icon: <XSquare size={14} /> },
    ...files.map(f => ({ id: `file-${f.id}`, name: `Go to File: ${f.name}`, action: () => openFile(f.id), category: 'File', icon: <FileCode2 size={14} /> }))
  ];

  const filteredCommands = commands.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, toggleCommandPalette]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedCmd = filteredCommands[selectedIndex];
      if (selectedCmd) {
        selectedCmd.action();
        toggleCommandPalette();
      }
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={toggleCommandPalette}
          />
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[640px] bg-[var(--color-bg-panel)]/95 backdrop-blur-xl border border-[var(--color-border-subtle)] shadow-2xl rounded-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center px-5 py-4 border-b border-[var(--color-border-subtle)]">
              <Search size={20} className="mr-4 text-[var(--color-accent-primary)] opacity-80" />
              <input
                ref={inputRef}
                className="flex-1 bg-transparent border-none outline-none text-[var(--color-text-primary)] text-[16px] placeholder:text-[var(--color-text-tertiary)] font-medium"
                placeholder="Type a command or search files..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoComplete="off"
              />
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-tertiary)] bg-[var(--color-bg-hover)] px-2.5 py-1.5 rounded-md border border-[var(--color-border-subtle)] shadow-sm">
                <Command size={12} />
                <span>K</span>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto py-3 custom-scrollbar">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((command, index) => (
                  <div
                    key={command.id}
                    className={cn(
                      "px-5 py-3 mx-3 rounded-xl flex items-center justify-between cursor-pointer text-[14px] transition-all duration-150",
                      index === selectedIndex 
                        ? "bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white shadow-md shadow-[var(--color-accent-primary)]/20" 
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                    )}
                    onClick={() => {
                      command.action();
                      toggleCommandPalette();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-md",
                        index === selectedIndex ? "text-white/90" : "text-[var(--color-text-tertiary)]"
                      )}>
                        {command.icon}
                      </span>
                      <span className="font-medium">{command.name}</span>
                    </div>
                    <span className={cn(
                      "text-[11px] font-bold tracking-wider uppercase",
                      index === selectedIndex ? "text-white/80" : "text-[var(--color-text-tertiary)]"
                    )}>
                      {command.category}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-10 text-center text-[var(--color-text-tertiary)] text-[14px] font-medium">
                  No matching commands found
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
