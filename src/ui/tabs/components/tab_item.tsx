import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getFileIcon } from '../utils/tab_icons';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TabItemProps {
  tab: { path: string; name: string; isDirty?: boolean };
  isActive: boolean;
  onClick: () => void;
  onClose: (e: React.MouseEvent) => void;
}

/**
 * Atomic Tab Component
 * Optimized for O(1) rendering using React.memo
 */
export const TabItem: React.FC<TabItemProps> = React.memo(({ 
  tab, 
  isActive, 
  onClick, 
  onClose 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, width: 0, padding: 0, margin: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative flex items-center min-w-fit px-3 py-1.5 cursor-pointer text-[12px] select-none transition-all duration-200 rounded-md border",
        isActive 
          ? "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[var(--color-border-focus)] shadow-sm z-10" 
          : "bg-transparent text-[var(--color-text-tertiary)] border-transparent hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]"
      )}
      onClick={onClick}
    >
      <div className="mr-2 z-10 flex items-center justify-center w-4 h-4 text-xs">
        {getFileIcon(tab.name)}
      </div>
      <span className="flex-1 whitespace-nowrap font-medium z-10">{tab.name}</span>
      <button
        onClick={onClose}
        className={cn(
          "ml-2 p-0.5 rounded-md hover:bg-[var(--color-bg-active)] hover:text-red-400 transition-all duration-200 z-10 flex items-center justify-center min-w-[18px]",
          isActive || tab.isDirty ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        {tab.isDirty && !isActive ? (
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] group-hover:hidden" />
        ) : null}
        <X 
          size={13} 
          strokeWidth={2.5} 
          className={cn(tab.isDirty && !isActive ? "hidden group-hover:block" : "block")} 
        />
      </button>
      
      {isActive && (
        <motion.div 
          layoutId="activeTabIndicator"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]"
        />
      )}
    </motion.div>
  );
});
