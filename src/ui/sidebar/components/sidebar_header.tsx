import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export const SidebarHeader: React.FC = () => {
  return (
    <div className="px-4 py-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] bg-[var(--color-bg-panel)] z-10 relative border-b border-[var(--color-border-subtle)] h-[32px]">
      <span>Explorer</span>
      <div className="flex items-center space-x-0.5 no-drag">
        <div className="p-1 rounded-md hover:bg-[var(--color-bg-hover)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="More">
          <MoreHorizontal size={14} />
        </div>
      </div>
    </div>
  );
};
