import React from 'react';
import { ChevronRight } from 'lucide-react';

export const SidebarFooter: React.FC = () => {
  return (
    <>
      <div className="px-4 py-3 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-tertiary)] uppercase font-bold tracking-[0.15em] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer flex items-center justify-between group text-nowrap shrink-0">
        <span>Outline</span>
        <ChevronRight size={14} strokeWidth={2.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="px-4 py-3 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-tertiary)] uppercase font-bold tracking-[0.15em] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer flex items-center justify-between group text-nowrap shrink-0">
        <span>Timeline</span>
        <ChevronRight size={14} strokeWidth={2.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </>
  );
};
