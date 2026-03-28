import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Search, Folder, Loader2 } from 'lucide-react';
import { FileTreeNode } from '../../../core/state/store';
import { cn, getIconByType } from '../../sidebar/utils/sidebar_utils';

interface BreadcrumbPopupProps {
  activePopup: string;
  viewingNode: FileTreeNode;
  popupRect: DOMRect;
  popupExpandedFolders: string[];
  isLoading: string | null;
  onToggle: (path: string) => void;
  onSelect: (node: FileTreeNode) => void;
  onNavigateBack: () => void;
  onClose: () => void;
}

/**
 * PopupFileRow: God-Mode Clone of Sidebar FileRow with expansion support.
 */
const PopupFileRow: React.FC<{
  node: FileTreeNode;
  level: number;
  popupExpandedFolders: string[];
  isLoading: string | null;
  onToggle: (path: string) => void;
  onSelect: (node: FileTreeNode) => void;
}> = ({ node, level, popupExpandedFolders, isLoading, onToggle, onSelect }) => {
  const isExpanded = popupExpandedFolders.includes(node.path);
  const isCurrentlyLoading = isLoading === node.path;

  return (
    <div className="flex flex-col">
      <div
        onClick={() => onSelect(node)}
        className={cn(
          "flex items-center cursor-pointer text-[13px] py-[3.5px] px-2 rounded-md transition-all duration-75 group shrink-0 relative",
          "hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
          isExpanded && node.isDirectory && "bg-[var(--color-bg-surface)]/40"
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {/* Sidebar-style Expansion Arrow */}
        {node.isDirectory && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.path);
            }}
            className="mr-1.5 opacity-40 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-[var(--color-bg-active)]"
          >
            {isCurrentlyLoading ? (
              <Loader2 size={13} className="animate-spin text-[var(--color-accent-primary)]" />
            ) : (
              <ChevronRight 
                size={13} 
                strokeWidth={2} 
                className={cn("transition-transform duration-150", isExpanded && "rotate-90")} 
              />
            )}
          </div>
        )}

        {/* Icon parity */}
        {(!node.isDirectory || (node.isDirectory && !isCurrentlyLoading)) && (
          <div className="mr-2 flex items-center justify-center w-4 h-4 shrink-0">
            {getIconByType(node.typeId, node.isDirectory)}
          </div>
        )}
        
        <span className={cn(
          "truncate flex-1 leading-none tracking-tight",
          isExpanded && node.isDirectory && "font-bold text-[var(--color-text-primary)]"
        )}>
          {node.name}
        </span>
      </div>

      {/* Animated Children Expansion */}
      <AnimatePresence initial={false}>
        {isExpanded && node.isDirectory && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {[...node.children]
              .sort((a, b) => {
                if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
                return a.isDirectory ? -1 : 1;
              })
              .map(child => (
                <PopupFileRow
                  key={child.path}
                  node={child}
                  level={level + 1}
                  popupExpandedFolders={popupExpandedFolders}
                  isLoading={isLoading}
                  onToggle={onToggle}
                  onSelect={onSelect}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const BreadcrumbPopup: React.FC<BreadcrumbPopupProps> = ({ 
  activePopup,
  viewingNode, 
  popupRect,
  popupExpandedFolders,
  isLoading,
  onToggle,
  onSelect, 
  onNavigateBack,
  onClose 
}) => {
  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;

  // Use the activePopup's name for the header to maintain segment context
  const headerName = activePopup.split('/').pop() || viewingNode.name;
  const isAtRoot = viewingNode.path === activePopup;
  
  // Root children (siblings/current folder content)
  const rootChildren = useMemo(() => {
    return [...viewingNode.children].sort((a, b) => {
      if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
      return a.isDirectory ? -1 : 1;
    });
  }, [viewingNode.children]);

  const popupStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${popupRect.bottom + 8}px`,
    left: `${Math.min(popupRect.left, window.innerWidth - 300)}px`,
    width: '320px',
    maxHeight: '520px',
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] bg-transparent cursor-default" 
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -4 }}
        style={popupStyle}
        className="z-[101] flex flex-col bg-[var(--color-bg-panel)] border border-[var(--color-border-emphasis)]/50 rounded-xl shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-xl"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header - Mimic VS Code Titlebar */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--color-bg-surface)]/80 border-b border-[var(--color-border-subtle)]/40">
          {!isAtRoot ? (
            <button 
              onClick={onNavigateBack}
              className="p-1 rounded-md hover:bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
          ) : (
            <div className="p-1 opacity-40">
              <Search size={14} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-extrabold text-[var(--color-text-secondary)] truncate block tracking-wide uppercase opacity-70">
              {headerName}
            </span>
          </div>
          <div className="px-1.5 py-0.5 rounded-md bg-[var(--color-accent-primary)]/10 text-[9px] font-bold text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20 uppercase tracking-tighter shadow-sm">
            God-Mode
          </div>
        </div>

        {/* List Content - God-Parity Animated Tree */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 min-h-[160px]">
          {rootChildren.length > 0 ? (
            <div className="flex flex-col gap-[1px]">
              {rootChildren.map(node => (
                <PopupFileRow 
                  key={node.path} 
                  node={node} 
                  level={0}
                  popupExpandedFolders={popupExpandedFolders}
                  isLoading={isLoading}
                  onToggle={onToggle}
                  onSelect={onSelect}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-[var(--color-text-tertiary)] opacity-30">
              {isLoading && !viewingNode.isLoaded ? (
                <Loader2 size={32} className="animate-spin mb-3 text-[var(--color-accent-primary)]" />
              ) : (
                <Folder size={32} strokeWidth={1} className="mb-3" />
              )}
              <p className="text-[11px] font-medium tracking-tight">
                {isLoading && !viewingNode.isLoaded ? 'Scanning directory...' : 'No items found in this directory'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[var(--color-bg-panel)]/80 border-t border-[var(--color-border-subtle)]/40 px-3 py-2 flex items-center justify-between text-[10px] text-[var(--color-text-tertiary)] opacity-60 font-medium tracking-tight">
          <span className="lowercase">{rootChildren.length} items available</span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">↵</kbd> select</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    portalRoot
  );
};
