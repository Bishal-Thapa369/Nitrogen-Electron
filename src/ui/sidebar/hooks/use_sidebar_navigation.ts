import React, { useCallback } from 'react';
import { useStore, FileTreeNode } from '../../../core/state/store';
import { VirtualRow } from '../logic/use_sidebar_logic';

interface UseSidebarNavigationProps {
  fileTree: FileTreeNode | null;
  flattenedVisibleNodes: VirtualRow[];
}

export const useSidebarNavigation = ({
  fileTree, flattenedVisibleNodes
}: UseSidebarNavigationProps) => {
  const { 
    toggleFolder, openFile, updateNode, setSelectedPath, setSelectedPaths, 
    expandedFolders, activeGroupId, setActiveFileContent
  } = useStore();

  const findNode = useCallback((path: string, node: FileTreeNode | null = fileTree): FileTreeNode | null => {
    if (!node) return null;
    if (node.path === path) return node;
    for (const child of node.children) {
      if (child.path === path) return child;
      if (child.isDirectory && path.startsWith(child.path + '/')) {
        const found = findNode(path, child);
        if (found) return found;
      }
    }
    return null;
  }, [fileTree]);

  const handleNodeClick = useCallback(async (e: React.MouseEvent, node: FileTreeNode) => {
    e.stopPropagation();

    const state = useStore.getState();
    const currentSelected = state.selectedPaths;

    if (e.ctrlKey || e.metaKey) {
      if (currentSelected.includes(node.path)) {
        const newPaths = currentSelected.filter(p => p !== node.path);
        setSelectedPaths(newPaths);
        if (state.selectedPath === node.path) setSelectedPath(newPaths.length > 0 ? newPaths[newPaths.length - 1] : null, true);
      } else {
        setSelectedPaths([...currentSelected, node.path]);
        setSelectedPath(node.path, true);
      }
    } else if (e.shiftKey && state.selectedPath) {
      const flatNodePaths = flattenedVisibleNodes.filter(n => n.type === 'node').map(n => (n as any).node.path);
      const startIdx = flatNodePaths.indexOf(state.selectedPath);
      const endIdx = flatNodePaths.indexOf(node.path);
      if (startIdx !== -1 && endIdx !== -1) {
        const min = Math.min(startIdx, endIdx);
        const max = Math.max(startIdx, endIdx);
        const range = flatNodePaths.slice(min, max + 1);
        setSelectedPaths(range);
      }
    } else {
      setSelectedPaths([node.path]);
      setSelectedPath(node.path);
    }
    
    if (node.isDirectory) {
      toggleFolder(node.path);
      const isExpanded = expandedFolders.includes(node.path);
      if (!isExpanded && !node.isLoaded) {
        try {
          const expandedNode = await window.electronAPI.expandDirectory(node.path);
          if (expandedNode) updateNode(node.path, expandedNode);
        } catch (err) {
          console.error('Failed to expand directory:', err);
        }
      }
    } else {
      openFile(node.path, node.name, activeGroupId);
      try {
        const content = await window.electronAPI.readFile(node.path);
        if (content !== null) {
          setActiveFileContent(content, activeGroupId);
        }
      } catch (err) {
        console.error('Failed to read file:', err);
      }
    }
  }, [flattenedVisibleNodes, expandedFolders, setSelectedPaths, setSelectedPath, toggleFolder, updateNode, openFile, activeGroupId, setActiveFileContent]);

  return { findNode, handleNodeClick };
};
