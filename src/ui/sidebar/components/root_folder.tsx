import React from 'react';
import { ChevronDown, FilePlus2, FolderPlus, RefreshCw, Folders } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FileTreeNode } from '../../../core/state/store';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RootFolderProps {
    fileTree: FileTreeNode;
    isExpanded: boolean;
    isSelected: boolean;
    onToggle: (path: string) => void;
    onStartFile: () => void;
    onStartFolder: () => void;
    onRefresh: () => void;
    onCollapseAll: () => void;
}

export const RootFolder: React.FC<RootFolderProps> = ({
    fileTree, isExpanded, isSelected, onToggle, onStartFile, onStartFolder, onRefresh, onCollapseAll
}) => {
    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onToggle(fileTree.path);
            }}
            className={cn(
                "flex items-center px-3 sticky top-0 bg-[var(--color-bg-panel)] z-30 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] cursor-pointer transition-all duration-150 group/root h-[32px]",
                isSelected && "bg-[var(--color-accent-glow)] text-[var(--color-text-primary)] font-extrabold ring-1 ring-inset ring-[var(--color-accent-primary)]/20"
            )}
        >
            <ChevronDown 
                size={14} 
                className={cn(
                    "mr-1 text-[var(--color-text-tertiary)] transition-transform duration-150",
                    !isExpanded && "-rotate-90"
                )} 
            />
            <span className="truncate flex-1">{fileTree.name}</span>
            
            <div className="flex items-center space-x-1.5 opacity-0 group-hover/explorer-section:opacity-100 transition-opacity duration-200 bg-[var(--color-bg-panel)] z-40 px-1" onClick={e => e.stopPropagation()}>
                <div onClick={onStartFile} className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="New File">
                    <FilePlus2 size={14} />
                </div>
                <div onClick={onStartFolder} className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="New Folder">
                    <FolderPlus size={14} />
                </div>
                <div onClick={onRefresh} className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="Refresh">
                    <RefreshCw size={14} />
                </div>
                <div onClick={onCollapseAll} className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="Collapse All">
                    <Folders size={14} />
                </div>
            </div>
        </div>
    );
};
