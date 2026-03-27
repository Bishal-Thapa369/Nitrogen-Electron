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
    setActiveFileContent,
    closeAllFiles,
    closeOtherFiles,
    toggleSplitScreen,
    isSplitScreen
  } = useStore();

  const handleTabClick = useCallback(async (tab: { path: string; name: string }) => {
    if (activeFilePath === tab.path) return;
    setActiveFile(tab.path);
    try {
      const content = await window.electronAPI.readFile(tab.path);
      if (content !== null) setActiveFileContent(content);
    } catch (err) {
      console.error('Nitrogen Logic: Failed to switch tab content', err);
    }
  }, [activeFilePath, setActiveFile, setActiveFileContent]);

  const handleCloseTab = useCallback((path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeFile(path);
  }, [closeFile]);

  const switchToPreviousTab = useCallback(() => {
    if (openTabs.length < 2) return;
    const currentIndex = openTabs.findIndex(t => t.path === activeFilePath);
    const prevIndex = (currentIndex - 1 + openTabs.length) % openTabs.length;
    handleTabClick(openTabs[prevIndex]);
  }, [openTabs, activeFilePath, handleTabClick]);

  const switchToNextTab = useCallback(() => {
    if (openTabs.length < 2) return;
    const currentIndex = openTabs.findIndex(t => t.path === activeFilePath);
    const nextIndex = (currentIndex + 1) % openTabs.length;
    handleTabClick(openTabs[nextIndex]);
  }, [openTabs, activeFilePath, handleTabClick]);

  return {
    openTabs,
    activeFilePath,
    isSplitScreen,
    handleTabClick,
    handleCloseTab,
    switchToPreviousTab,
    switchToNextTab,
    closeAllFiles,
    closeOtherFiles,
    toggleSplitScreen
  };
};
