import React, { useState } from 'react';
import { 
  Columns, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
} from 'lucide-react';
import { useTabsLogic } from '../hooks/use_tabs_logic';
import { cn } from '../../utils/cn';

interface TabsToolbarProps {
  groupId: string;
}

/**
 * Premium Tab Control Toolbar
 * Logic: [Split Screen] [Prev Tab] [Next Tab] [More Options]
 */
export const TabsToolbar: React.FC<TabsToolbarProps> = ({ groupId }) => {
  const { 
    openTabs,
    switchToPreviousTab, 
    switchToNextTab, 
    closeAllFiles, 
    closeOtherFiles, 
    splitGroup,
    closeGroup,
    activeGroupId,
    activeFilePath
  } = useTabsLogic(groupId);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isActiveGroup = activeGroupId === groupId;

  return (
    <div className="flex items-center gap-0.5 px-2 h-full border-l border-[var(--color-border-subtle)] bg-transparent relative">
      {/* 1. Split Screen Toggle (Only for active group) */}
      {isActiveGroup && (
        <button
          onClick={() => splitGroup(groupId)}
          className={cn(
            "p-1.5 rounded-md transition-all duration-200 group-btn",
            "hover:bg-[var(--color-tab-hover)] text-[var(--color-text-dim)] hover:text-[var(--color-text-primary)]"
          )}
          title="Split Editor (Side by Side)"
        >
          <Columns size={15} />
        </button>
      )}

      {/* 2. Navigation Control (Only for active group and if tabs exist) */}
      {isActiveGroup && openTabs.length > 0 && (
        <>
          <button
            onClick={switchToPreviousTab}
            className="p-1.5 rounded-md hover:bg-[var(--color-tab-hover)] text-[var(--color-text-dim)] hover:text-[var(--color-text-primary)] transition-colors"
            title="Previous Tab"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={switchToNextTab}
            className="p-1.5 rounded-md hover:bg-[var(--color-tab-hover)] text-[var(--color-text-dim)] hover:text-[var(--color-text-primary)] transition-colors"
            title="Next Tab"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* 3. More Actions Dropdown (Always present) */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={cn(
            "p-1.5 rounded-md transition-all duration-200",
            isMenuOpen 
              ? "bg-[var(--color-tab-hover)] text-[var(--color-text-primary)]" 
              : "hover:bg-[var(--color-tab-hover)] text-[var(--color-text-dim)] hover:text-[var(--color-text-primary)]"
          )}
          title="More Actions"
        >
          <MoreHorizontal size={16} />
        </button>

        {/* Glassmorphic Dropdown Menu */}
        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 py-1.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-tertiary)]/90 backdrop-blur-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <button
                onClick={() => {
                  if (activeFilePath) closeOtherFiles(activeFilePath, groupId);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-blue)]/10 hover:text-[var(--color-accent-blue)] transition-colors"
              >
                Close Other Tabs
              </button>
              <button
                onClick={() => {
                  closeAllFiles(groupId);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-blue)]/10 hover:text-[var(--color-accent-blue)] transition-colors"
              >
                Close All Tabs
              </button>
              <div className="my-1 border-t border-[var(--color-border-subtle)]" />
              <button
                onClick={() => {
                  closeGroup(groupId);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-[13px] text-red-400 hover:bg-red-400/10 transition-colors"
              >
                Close Split
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
