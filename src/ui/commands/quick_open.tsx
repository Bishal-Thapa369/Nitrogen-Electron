import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, File } from 'lucide-react';
import { useStore } from '../../core/state/store';
import { useQuickOpenLogic } from './hooks/use_quick_open_logic';
import { cn } from '../utils/cn';

/**
 * QuickOpen Component
 * Global overlay for lightning-fast project navigation.
 */
export const QuickOpen: React.FC = () => {
  const { isQuickOpenOpen, toggleQuickOpen } = useStore();
  const { 
    query, 
    setQuery, 
    filteredResults, 
    selectedIndex, 
    handleSelect, 
    handleKeyDown 
  } = useQuickOpenLogic();

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll logic for keyboard navigation
  React.useEffect(() => {
    if (containerRef.current && selectedIndex >= 0) {
      const selectedItem = containerRef.current.children[0]?.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
        });
      }
    }
  }, [selectedIndex]);

  if (!isQuickOpenOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 backdrop-blur-sm bg-black/40 transition-all duration-300"
        onClick={toggleQuickOpen}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-2xl bg-[var(--color-bg-panel)] border border-[var(--color-border-emphasis)] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header & Search */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-accent-primary)] transition-colors">
              <Search size={18} />
            </div>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search project files..."
              className="w-full bg-transparent border-b border-[var(--color-border-subtle)] py-4 pl-12 pr-6 text-[15px] outline-none placeholder:text-[var(--color-text-tertiary)]/50"
            />
          </div>

          {/* Results List */}
          <div 
            ref={containerRef}
            className="max-h-[450px] overflow-y-auto modern-scrollbar p-2 outline-none"
          >
            {filteredResults.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {/* Section Headers */}
                {!query && (
                  <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest opacity-60">
                    Recently Opened
                  </div>
                )}
                {query && (
                  <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest opacity-60">
                    Files
                  </div>
                )}

                {filteredResults.map((file: any, idx) => (
                  <div
                    key={file.path}
                    onClick={() => handleSelect(file)}
                    className={cn(
                      "group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border border-transparent relative",
                      idx === selectedIndex 
                        ? "bg-[var(--color-accent-primary)]/10 border-[var(--color-accent-primary)]/20 shadow-sm" 
                        : "hover:bg-[var(--color-bg-hover)]"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={cn(
                        "p-1.5 rounded-md bg-[var(--color-bg-surface)] text-[var(--color-text-tertiary)] transition-colors opacity-60 shrink-0",
                        idx === selectedIndex && "text-[var(--color-accent-primary)] opacity-100"
                      )}>
                        <File size={16} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[13px] font-semibold truncate",
                            idx === selectedIndex ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
                          )}>
                            {file.name}
                          </span>
                          {file.isRecent && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20 uppercase tracking-tighter shadow-sm">
                              Recent
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[var(--color-text-tertiary)] truncate opacity-50 flex items-center gap-1">
                          {file.path.replace(/\\/g, '/').split('/').slice(-3, -1).join(' / ') || 'Project Root'}
                        </span>
                      </div>
                    </div>
                    {idx === selectedIndex && (
                      <motion.div 
                        layoutId="quick-open-selection"
                        className="absolute left-0 w-1 h-6 bg-[var(--color-accent-primary)] rounded-full"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-[var(--color-text-tertiary)] opacity-40">
                <Search size={32} strokeWidth={1} className="mb-2" />
                <p className="text-[13px]">No files matching "{query}"</p>
              </div>
            )}
          </div>

          {/* Footer Navigation Hints */}
          <div className="bg-[var(--color-bg-panel)]/50 border-t border-[var(--color-border-subtle)]/30 px-4 py-2 flex items-center gap-4 text-[10px] text-[var(--color-text-tertiary)] opacity-60">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] font-sans">↑↓</kbd>
              <span>to navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] font-sans">Enter</kbd>
              <span>to open</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] font-sans">Esc</kbd>
              <span>to close</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
