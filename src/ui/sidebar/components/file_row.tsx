import React from 'react';
import { ChevronRight } from 'lucide-react';
import { FileTreeNode } from '../../../core/state/store';
import { cn, ITEM_HEIGHT } from '../utils/sidebar_utils';

export interface FileRowProps {
  node: FileTreeNode;
  level: number;
  absoluteIndex: number;
  isExpanded: boolean;
  isSelected: boolean;
  isActive: boolean;
  isCutTarget: boolean;
  isSidebarFocused: boolean;
  onClick: (e: React.MouseEvent, node: FileTreeNode) => void;
  onContextMenu: (e: React.MouseEvent, node: FileTreeNode) => void;
  getIconByType: (typeId: number | undefined, isDirectory: boolean) => React.ReactNode;
}

export const FileRow = React.memo(({ 
  node, level, absoluteIndex, isExpanded, isSelected, isActive, isCutTarget, isSidebarFocused,
  onClick, onContextMenu, getIconByType 
}: FileRowProps) => {
  return (
    <div
      onClick={(e) => onClick(e, node)}
      onContextMenu={(e) => onContextMenu(e, node)}
      className={cn(
        "absolute left-0 right-0 flex items-center cursor-pointer text-[13px] transition-all duration-150 ease-out group z-10",
        (isSelected || isActive) ? (isSidebarFocused ? "bg-[var(--color-bg-active)]" : "bg-[var(--color-bg-panel)]") : "hover:bg-[var(--color-bg-hover)]",
        isSelected && isSidebarFocused && "ring-[0.5px] ring-inset ring-[var(--color-border-focus)]/30",
        isActive && "text-[var(--color-text-primary)] font-medium bg-[var(--color-accent-glow)]!",
        isSelected && !isSidebarFocused && "text-[var(--color-text-tertiary)]",
        isCutTarget && "opacity-40 grayscale-[100%]"
      )}
      style={{ 
        top: `${absoluteIndex * ITEM_HEIGHT}px`,
        height: `${ITEM_HEIGHT}px`,
        paddingLeft: `${level * 16 + (node.isDirectory ? 12 : 28)}px` 
      }}
    >
      {isActive && !node.isDirectory && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--color-accent-primary)] z-20" />
      )}
      
      {node.isDirectory && (
        <div className="mr-1 opacity-50 group-hover:opacity-100 transition-opacity">
          <ChevronRight 
            size={14} 
            strokeWidth={2.5} 
            className={cn("transition-transform duration-150", isExpanded && "rotate-90")} 
          />
        </div>
      )}

      <div className="mr-2 flex items-center justify-center w-4 h-4 shrink-0">
        {getIconByType(node.typeId, node.isDirectory)}
      </div>
      
      <span className="truncate flex-1 z-10 leading-none mt-[1px]">{node.name}</span>
    </div>
  );
}, (prev, next) => {
  return (
    prev.node.path === next.node.path &&
    prev.node.name === next.node.name &&
    prev.isExpanded === next.isExpanded &&
    prev.isSelected === next.isSelected &&
    prev.isActive === next.isActive &&
    prev.isCutTarget === next.isCutTarget &&
    prev.isSidebarFocused === next.isSidebarFocused &&
    prev.absoluteIndex === next.absoluteIndex
  );
});
