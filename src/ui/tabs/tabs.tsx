import React from 'react';
import { AnimatePresence } from 'motion/react';
import { TabItem } from './components/tab_item';
import { useTabsLogic } from './hooks/use_tabs_logic';
import { TabsToolbar } from './components/tabs_toolbar';
import { cn } from '../utils/cn';

/**
 * Nitrogen Tab Orchestrator (Shell)
 */
export const Tabs: React.FC<{ groupId?: string }> = ({ groupId = 'primary' }) => {
  const { 
    openTabs, 
    activeFilePath, 
    handleTabClick, 
    handleCloseTab,
    setActiveGroup,
    isFocused
  } = useTabsLogic(groupId);

  if (openTabs.length === 0) return (
    <div 
      className={cn("h-11 border-b border-[var(--color-border-subtle)] flex items-center transition-colors px-4", isFocused ? "bg-[var(--color-bg-panel)]" : "bg-transparent")}
      onClick={setActiveGroup}
    />
  );

  return (
    <div 
      className={cn(
        "flex bg-transparent items-center border-b border-[var(--color-border-subtle)] h-11 transition-all duration-300",
        isFocused ? "border-b-[var(--color-accent-primary)]/50" : ""
      )}
      onClick={setActiveGroup}
    >
      <div className="flex-1 flex overflow-x-auto no-scrollbar px-3 py-2 items-center gap-1.5 h-full">
        <AnimatePresence initial={false}>
          {openTabs.map((tab: any) => (
            <TabItem
              key={tab.path}
              tab={tab}
              isActive={activeFilePath === tab.path}
              onClick={() => handleTabClick(tab)}
              onClose={(e: any) => handleCloseTab(tab.path, e)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Control Toolbar */}
      <TabsToolbar groupId={groupId} />
    </div>
  );
};
