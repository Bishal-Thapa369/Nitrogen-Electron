import { useStore } from '../../../core/state/store';
import { useCallback } from 'react';

/**
 * Tab state management and side effects
 */
export const useTabsLogic = (groupId?: string) => {
  const { 
    editorGroups,
    activeGroupId,
    closeFile, 
    setActiveFile, 
    setActiveFileContent,
    closeAllFiles,
    closeOtherFiles,
    splitGroup,
    closeGroup,
    setActiveGroup
  } = useStore();

  const currentGroup = editorGroups.find(g => g.id === (groupId || activeGroupId)) || editorGroups[0];
  const { tabs: openTabs, activeFilePath } = currentGroup;

  const handleTabClick = useCallback(async (tab: { path: string; name: string }) => {
    if (activeFilePath === tab.path && activeGroupId === currentGroup.id) return;
    
    // Set focused group first
    setActiveGroup(currentGroup.id);
    setActiveFile(tab.path, currentGroup.id);

    try {
      const content = await window.electronAPI.readFile(tab.path);
      if (content !== null) setActiveFileContent(content);
    } catch (err) {
      console.error('Nitrogen Logic: Failed to switch tab content', err);
    }
  }, [activeFilePath, activeGroupId, currentGroup.id, setActiveFile, setActiveFileContent, setActiveGroup]);

  const handleCloseTab = useCallback((path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeFile(path, currentGroup.id);
  }, [closeFile, currentGroup.id]);

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
    activeGroupId,
    currentGroupId: currentGroup.id,
    handleTabClick,
    handleCloseTab,
    switchToPreviousTab,
    switchToNextTab,
    closeAllFiles,
    closeOtherFiles,
    splitGroup,
    closeGroup,
    setActiveGroup
  };
};
