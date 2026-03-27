import React from 'react';
import { ChevronDown, FilePlus2, FolderPlus, RefreshCw, Folders } from 'lucide-react';
import { FileTreeNode } from '../../../core/state/store';
import { cn } from '../utils/sidebar_utils';

interface StickyRootProps {
  fileTree: FileTreeNode;
  selectedPath: string | null;
  expandedFolders: string[];
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
  onStartCreation: (type: 'file' | 'folder') => void;
  onRefresh: () => void;
  onCollapseAll: () => void;
}

export const StickyRoot: React.FC<StickyRootProps> = ({
  fileTree, selectedPath, expandedFolders, onToggle, onSelect, onStartCreation, onRefresh, onCollapseAll
}) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(fileTree.path);
        onToggle(fileTree.path);
      }}
      className={cn(
        "flex items-center px-3 sticky top-0 bg-[var(--color-bg-panel)] z-30 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] cursor-pointer transition-all duration-150 group/root h-[32px]",
        selectedPath === fileTree.path && "bg-[var(--color-accent-glow)] text-[var(--color-text-primary)] font-extrabold ring-1 ring-inset ring-[var(--color-accent-primary)]/20"
      )}
    >
      <ChevronDown 
          size={14} 
          className={cn(
              "mr-1 text-[var(--color-text-tertiary)] transition-transform duration-150",
              !expandedFolders.includes(fileTree.path) && "-rotate-90"
          )} 
      />
      <span className="truncate flex-1">{fileTree.name}</span>
      
      {/* 4 ACTION ICONS FOR ROOT */}
      <div className="flex items-center space-x-1.5 opacity-0 group-hover/explorer-section:opacity-100 transition-opacity duration-200 bg-[var(--color-bg-panel)] z-40 px-1" onClick={e => e.stopPropagation()}>
        <div onClick={() => onStartCreation('file')} className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="New File">
          <FilePlus2 size={14} />
        </div>
        <div onClick={() => onStartCreation('folder')} className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="New Folder">
          <FolderPlus size={14} />
        </div>
        <div onClick={() => onRefresh()} className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="Refresh">
          <RefreshCw size={14} />
        </div>
        <div onClick={() => onCollapseAll()} className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text(--color-text-primary)] transition-all" title="Collapse All">
          <Folders size={14} />
        </div>
      </div>
    </div>
  );
};
