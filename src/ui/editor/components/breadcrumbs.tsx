import React from 'react';
import { ChevronRight, Folder, File } from 'lucide-react';
import { useBreadcrumbsLogic } from '../hooks/use_breadcrumbs_logic';
import { BreadcrumbPopup } from './breadcrumb_popup';
import { cn } from '../../utils/cn';

interface BreadcrumbsProps {
  activeFilePath: string | null;
}

/**
 * Breadcrumbs Component
 * Interactive path visualization with "Mini-Explorer" portal.
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ activeFilePath }) => {
  const { 
    segments, 
    activePopup, 
    viewingNode,
    setViewingPath, 
    setActivePopup,
    handleSegmentClick, 
    handleSiblingSelect,
    navigateBack,
    togglePopupFolder,
    popupRect,
    popupExpandedFolders,
    isLoading
  } = useBreadcrumbsLogic(activeFilePath);

  if (!activeFilePath || segments.length === 0) {
    return (
      <div className="h-9 border-b border-[var(--color-border-subtle)]/30 px-4 flex items-center bg-[var(--color-bg-panel)]/40">
        <span className="text-[10px] text-[var(--color-text-tertiary)] opacity-50 uppercase tracking-widest font-bold">
          No file open
        </span>
      </div>
    );
  }

  return (
    <div className="h-9 border-b border-[var(--color-border-subtle)]/30 px-3 flex items-center bg-[var(--color-bg-panel)]/40 overflow-x-auto no-scrollbar gap-1 relative">
      {segments.map((segment, idx) => (
        <div key={`${segment.path}-${idx}`} className="flex items-center gap-1 shrink-0 relative">
          {/* Segment Toggle Button */}
          <button
            onClick={(e) => handleSegmentClick(segment.path, e.currentTarget.getBoundingClientRect())}
            className={cn(
              "flex items-center gap-1.5 px-1.5 py-1 rounded-md text-[11px] font-medium transition-all group",
              activePopup === segment.path 
                ? "bg-[var(--color-bg-active)] text-[var(--color-accent-primary)] shadow-sm border border-[var(--color-border-subtle)]/50"
                : segment.isDirectory 
                  ? "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]" 
                  : "text-[var(--color-text-secondary)] font-bold"
            )}
          >
            {segment.isDirectory ? (
              <Folder size={11} className="opacity-60 group-hover:opacity-100 transition-opacity text-amber-500/80" />
            ) : (
              <File size={11} className="opacity-80" />
            )}
            <span className="whitespace-nowrap">{segment.name}</span>
          </button>

          {/* Separator Node */}
          {idx < segments.length - 1 && (
            <ChevronRight size={12} className="text-[var(--color-text-tertiary)] opacity-30 mx-0.5" />
          )}

          {/* Mini-Explorer Popup Portal */}
          {activePopup === segment.path && viewingNode && popupRect && (
            <BreadcrumbPopup
              activePopup={activePopup}
              viewingNode={viewingNode}
              popupRect={popupRect}
              popupExpandedFolders={popupExpandedFolders}
              onToggle={togglePopupFolder}
              onSelect={handleSiblingSelect}
              isLoading={isLoading}
              onNavigateBack={navigateBack}
              onClose={() => {
                setActivePopup(null);
                setViewingPath(null);
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
