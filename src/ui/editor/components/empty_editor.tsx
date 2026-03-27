import React from 'react';
import { Command, Search, Palette, Terminal as TerminalIcon } from 'lucide-react';

/**
 * Premium Empty State View (The "Nitrogen" Screen)
 */
export const EmptyEditor: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-transparent text-[var(--color-text-secondary)] select-none">
      <div className="flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-700">
        <div className="w-32 h-32 mb-10 rounded-[2rem] bg-gradient-to-br from-[var(--color-accent-primary)] via-[var(--color-accent-secondary)] to-pink-500 flex items-center justify-center shadow-[0_20px_60px_-15px_rgba(59,130,246,0.5)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-md transition-transform duration-700 group-hover:scale-110"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
          <span className="text-6xl font-black text-white tracking-tighter relative z-10 drop-shadow-lg">N</span>
        </div>
        <h2 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4 tracking-tight">Nitrogen</h2>
        <p className="text-[15px] text-[var(--color-text-tertiary)] mb-16 font-medium tracking-wide">Select a file to start editing</p>
      </div>
      
      <div className="grid grid-cols-2 gap-x-16 gap-y-6 text-[13px] max-w-lg w-full px-8">
        <div className="flex items-center justify-between group cursor-default">
          <span className="flex items-center gap-3 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors font-medium">
            <Command size={16} className="text-[var(--color-accent-primary)] opacity-70 group-hover:opacity-100 transition-opacity" /> Command Palette
          </span>
          <span className="font-mono text-[11px] font-semibold bg-[var(--color-bg-hover)] px-2.5 py-1.5 rounded-md text-[var(--color-text-tertiary)] border border-[var(--color-border-subtle)] shadow-sm">⌘K</span>
        </div>
        <div className="flex items-center justify-between group cursor-default">
          <span className="flex items-center gap-3 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors font-medium">
            <Search size={16} className="text-[var(--color-accent-primary)] opacity-70 group-hover:opacity-100 transition-opacity" /> Go to File
          </span>
          <span className="font-mono text-[11px] font-semibold bg-[var(--color-bg-hover)] px-2.5 py-1.5 rounded-md text-[var(--color-text-tertiary)] border border-[var(--color-border-subtle)] shadow-sm">⌘P</span>
        </div>
        <div className="flex items-center justify-between group cursor-default">
          <span className="flex items-center gap-3 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors font-medium">
            <Palette size={16} className="text-[var(--color-accent-primary)] opacity-70 group-hover:opacity-100 transition-opacity" /> Toggle Theme
          </span>
          <span className="font-mono text-[11px] font-semibold bg-[var(--color-bg-hover)] px-2.5 py-1.5 rounded-md text-[var(--color-text-tertiary)] border border-[var(--color-border-subtle)] shadow-sm">⌥T</span>
        </div>
        <div className="flex items-center justify-between group cursor-default">
          <span className="flex items-center gap-3 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors font-medium">
            <TerminalIcon size={16} className="text-[var(--color-accent-primary)] opacity-70 group-hover:opacity-100 transition-opacity" /> Toggle Terminal
          </span>
          <span className="font-mono text-[11px] font-semibold bg-[var(--color-bg-hover)] px-2.5 py-1.5 rounded-md text-[var(--color-text-tertiary)] border border-[var(--color-border-subtle)] shadow-sm">⌃`</span>
        </div>
      </div>
    </div>
  );
};
