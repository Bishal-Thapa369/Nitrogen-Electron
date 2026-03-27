import React from 'react';
import { AnimatePresence } from 'motion/react';
import { TabItem } from './components/tab_item';
import { useTabsLogic } from './hooks/use_tabs_logic';
import { TabsToolbar } from './components/tabs_toolbar';
import { cn } from '../utils/cn';

/**
 * Nitrogen Tab Orchestrator (Shell)
 * Now group-aware to support Multi-Pane Split Editing
 */
interface TabsProps {
  groupId: string;
}

export const Tabs: React.FC<TabsProps> = ({ groupId }) => {
  const { 
    openTabs, 
    activeFilePath, 
    handleTabClick, 
    handleCloseTab,
    activeGroupId,
    currentGroupId,
    setActiveGroup
  } = useTabsLogic(groupId);

  const isActive = activeGroupId === currentGroupId;

  return (
    <div 
      className={cn(
        "flex items-center justify-between w-full h-[41px] border-b transition-colors",
        isActive 
          ? "bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)]" 
          : "bg-[var(--color-bg-primary)] border-[var(--color-border-subtle)] opacity-80"
      )}
      onClick={() => setActiveGroup(currentGroupId)}
    >
      <div className="flex-1 flex items-center h-full overflow-x-auto no-scrollbar px-2 gap-1">
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

      <TabsToolbar groupId={currentGroupId} />
    </div>
  );
};
