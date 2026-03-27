import { useStore } from '../../../core/state/store';
import { useCallback } from 'react';

/**
 * Tab state management and side effects for a specific Editor Group
 */
export const useTabsLogic = (groupId: string = 'primary') => {
  const { 
    editorGroups,
    activeGroupId,
    setActiveFile, 
    setActiveFileContent,
    closeFile,
    closeAllFiles,
    closeOtherFiles,
    toggleSplitScreen,
    isSplitScreen,
    setActiveGroup
  } = useStore();

  const group = editorGroups.find(g => g.id === groupId) || editorGroups[0];
  const { openTabs, activeFilePath } = group;
  const isFocused = activeGroupId === groupId;

  const handleTabClick = useCallback(async (tab: { path: string; name: string }) => {
    setActiveGroup(groupId);
    if (activeFilePath === tab.path) return;
    
    // Set loading or similar if needed
    setActiveFile(tab.path, groupId);
    try {
      const content = await window.electronAPI.readFile(tab.path);
      if (content !== null) setActiveFileContent(content, groupId);
    } catch (err) {
      console.error('Nitrogen Logic: Failed to switch tab content', err);
    }
  }, [groupId, activeFilePath, setActiveFile, setActiveFileContent, setActiveGroup]);

  const handleCloseTab = useCallback((path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeFile(path, groupId);
  }, [closeFile, groupId]);

  const switchToPreviousTab = useCallback(() => {
    if (openTabs.length < 2) return;
    const currentIndex = openTabs.findIndex((t: any) => t.path === activeFilePath);
    const prevIndex = (currentIndex - 1 + openTabs.length) % openTabs.length;
    handleTabClick(openTabs[prevIndex]);
  }, [openTabs, activeFilePath, handleTabClick]);

  const switchToNextTab = useCallback(() => {
    if (openTabs.length < 2) return;
    const currentIndex = openTabs.findIndex((t: any) => t.path === activeFilePath);
    const nextIndex = (currentIndex + 1) % openTabs.length;
    handleTabClick(openTabs[nextIndex]);
  }, [openTabs, activeFilePath, handleTabClick]);

  return {
    openTabs,
    activeFilePath,
    isSplitScreen,
    isFocused,
    handleTabClick,
    handleCloseTab,
    switchToPreviousTab,
    switchToNextTab,
    closeAllFiles: () => closeAllFiles(groupId),
    closeOtherFiles: (path: string) => closeOtherFiles(path, groupId),
    toggleSplitScreen,
    setActiveGroup: () => setActiveGroup(groupId)
  };
};

