import React from 'react';
import { AnimatePresence } from 'motion/react';
import { TabItem } from './components/tab_item';
import { useTabsLogic } from './hooks/use_tabs_logic';

/**
 * Nitrogen Tab Orchestrator (Shell)
 * Manages the high-performance horizontal scroll list for open documents.
 */
export const Tabs: React.FC = () => {
  const { 
    openTabs, 
    activeFilePath, 
    handleTabClick, 
    handleCloseTab 
  } = useTabsLogic();

  if (openTabs.length === 0) return null;

  return (
    <div className="flex bg-transparent overflow-x-auto no-scrollbar px-3 py-2 items-center gap-1.5 border-b border-[var(--color-border-subtle)]">
      <AnimatePresence initial={false}>
        {openTabs.map((tab) => (
          <TabItem
            key={tab.path}
            tab={tab}
            isActive={activeFilePath === tab.path}
            onClick={() => handleTabClick(tab)}
            onClose={(e) => handleCloseTab(tab.path, e)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
