import React, { useState } from 'react';
import { Columns, ChevronLeft, ChevronRight, MoreHorizontal, Trash2, XCircle } from 'lucide-react';
import { useTabsLogic } from '../hooks/use_tabs_logic';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Premium Tab Control Toolbar
 * Logic: [Split Screen] [Prev Tab] [Next Tab] [More Options]
 */
export const TabsToolbar: React.FC = () => {
  const { 
    switchToPreviousTab, 
    switchToNextTab, 
    closeAllFiles, 
    closeOtherFiles, 
    toggleSplitScreen,
    isSplitScreen,
    activeFilePath
  } = useTabsLogic();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex items-center gap-0.5 px-2 h-full border-l border-[var(--color-border-subtle)] bg-transparent relative">
      {/* 1. Toggle Split Screen */}
      <button 
        onClick={toggleSplitScreen}
        title="Split Editor"
        className={cn(
          "p-1.5 rounded-md transition-all duration-200 hover:bg-[var(--color-bg-hover)]",
          isSplitScreen ? "text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10" : "text-[var(--color-text-tertiary)]"
        )}
      >
        <Columns size={16} strokeWidth={2} />
      </button>

      {/* 2. Switch to Previous Tab */}
      <button 
        onClick={switchToPreviousTab}
        title="Previous Tab"
        className="p-1.5 rounded-md transition-all duration-200 hover:bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
      >
        <ChevronLeft size={16} strokeWidth={2} />
      </button>

      {/* 3. Switch to Next Tab */}
      <button 
        onClick={switchToNextTab}
        title="Next Tab"
        className="p-1.5 rounded-md transition-all duration-200 hover:bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
      >
        <ChevronRight size={16} strokeWidth={2} />
      </button>

      {/* 4. More Options Menu */}
      <div className="relative">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="More Actions"
          className={cn(
            "p-1.5 rounded-md transition-all duration-200 hover:bg-[var(--color-bg-hover)]",
            isMenuOpen ? "text-[var(--color-text-primary)] bg-[var(--color-bg-hover)]" : "text-[var(--color-text-tertiary)]"
          )}
        >
          <MoreHorizontal size={16} strokeWidth={2} />
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsMenuOpen(false)} 
              />
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-48 py-1 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-xl"
              >
                <button 
                  onClick={() => {
                    if (activeFilePath) closeOtherFiles(activeFilePath);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <Trash2 size={14} className="opacity-70" />
                  Close Other Tabs
                </button>
                <button 
                  onClick={() => {
                    closeAllFiles();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <XCircle size={14} className="opacity-70" />
                  Close All Tabs
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
