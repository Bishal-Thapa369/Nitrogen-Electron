import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptySidebarProps {
  onOpenFolder: () => void;
}

export const EmptySidebar: React.FC<EmptySidebarProps> = ({ onOpenFolder }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <FolderOpen size={48} className="text-[var(--color-text-tertiary)] mb-4 opacity-30" />
      <p className="text-[13px] text-[var(--color-text-tertiary)] mb-4">No folder opened</p>
      <button
        onClick={onOpenFolder}
        className="text-[var(--color-accent-primary)] hover:text-[var(--color-text-primary)] transition-colors duration-200 border border-[var(--color-border-subtle)] hover:border-[var(--color-border-focus)] px-4 py-2 rounded-md text-[12px] font-semibold tracking-wide uppercase"
      >
        Open Folder
      </button>
    </div>
  );
};
