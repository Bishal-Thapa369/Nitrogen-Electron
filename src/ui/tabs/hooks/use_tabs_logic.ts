import { useStore } from '../../../core/state/store';
import { useCallback } from 'react';

/**
 * Tab state management and side effects
 */
export const useTabsLogic = () => {
  const { 
    openTabs, 
    activeFilePath, 
    closeFile, 
    setActiveFile, 
    setActiveFileContent 
  } = useStore();

  const handleTabClick = useCallback(async (tab: { path: string; name: string }) => {
    // Only switch if it's not already active
    if (activeFilePath === tab.path) return;
    
    setActiveFile(tab.path);
    try {
      const content = await window.electronAPI.readFile(tab.path);
      if (content !== null) {
        setActiveFileContent(content);
      }
    } catch (err) {
      console.error('Nitrogen Logic: Failed to switch tab content', err);
    }
  }, [activeFilePath, setActiveFile, setActiveFileContent]);

  const handleCloseTab = useCallback((path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeFile(path);
  }, [closeFile]);

  return {
    openTabs,
    activeFilePath,
    handleTabClick,
    handleCloseTab
  };
};
