import React, { useState, useCallback, useMemo } from 'react';
import { useStore, FileTreeNode } from '../../../core/state/store';

// Atomic Logic Hooks
import { useSidebarVirtualization } from '../hooks/use_sidebar_virtualization';
import { useSidebarCreation } from '../hooks/use_sidebar_creation';
import { useSidebarShortcuts } from '../hooks/use_sidebar_shortcuts';
import { useSidebarNavigation } from '../hooks/use_sidebar_navigation';

export type VirtualRow = 
  | { type: 'node'; node: FileTreeNode; level: number }
  | { type: 'input'; itemType: 'file' | 'folder'; parentPath: string; level: number };

export const useSidebarLogic = () => {
  const { 
    fileTree, expandedFolders, toggleFolder, setSelectedPath, setSelectedPaths, 
    selectedPath, selectedPaths, editorGroups, activeGroupId, clipboardItems, refreshRoot
  } = useStore();

  const activeGroup = editorGroups.find(g => g.id === activeGroupId) || editorGroups[0];
  const activeFilePath = activeGroup.activeFilePath;
  
  // 1. Core State Orchestration
  const [contextMenu, setContextMenu] = useState<{ node: FileTreeNode | null; x: number; y: number } | null>(null);

  // 2. Tree Flattening Logic (Shared Dependency)
  const flattenedVisibleNodes = useMemo(() => {
    const flat: VirtualRow[] = [];
    if (!fileTree) return flat;
    
    // Check if new input is being created
    // (We'll pass a dummy object here or fetch from creation hook later, 
    // but for now we'll handle it via the hub approach)
    const traverse = (node: FileTreeNode, level: number) => {
      flat.push({ type: 'node', node, level });
      if (node.isDirectory && expandedFolders.includes(node.path)) {
        for (const child of node.children) {
          traverse(child, level + 1);
        }
      }
    };
    
    if (expandedFolders.includes(fileTree.path)) {
      for (const child of fileTree.children) traverse(child, 0);
    }
    
    return flat;
  }, [fileTree, expandedFolders]);

  // 3. Specialized Logic Hooks
  const navigation = useSidebarNavigation({ fileTree, flattenedVisibleNodes });
  
  const creation = useSidebarCreation({
    fileTree, 
    selectedPath, 
    findNode: navigation.findNode, 
    toggleFolder, 
    expandedFolders 
  });

  useSidebarShortcuts();

  // 4. Hub Event Handlers
  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileTreeNode | null) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (node) {
        if (!selectedPaths.includes(node.path)) {
            setSelectedPaths([node.path]);
            setSelectedPath(node.path);
        }
    } else {
        setSelectedPath(null);
        setSelectedPaths([]);
    }
    setContextMenu({ node, x: e.clientX, y: e.clientY });
  }, [selectedPaths, setSelectedPath, setSelectedPaths]);

  // Inject new creation row logic into the flattened list (Dynamic injection)
  const augmentedVisibleNodes = useMemo(() => {
    if (!creation.newInput) return flattenedVisibleNodes;
    
    const augmented: VirtualRow[] = [];
    if (!fileTree) return augmented;
    
    const traverse = (node: FileTreeNode, level: number) => {
        augmented.push({ type: 'node', node, level });
        if (node.isDirectory && expandedFolders.includes(node.path)) {
            if (creation.newInput?.parentPath === node.path) {
                augmented.push({ type: 'input', itemType: creation.newInput.type, parentPath: node.path, level: level + 1 });
            }
            for (const child of node.children) traverse(child, level + 1);
        }
    };
    
    if (expandedFolders.includes(fileTree.path)) {
        if (creation.newInput?.parentPath === fileTree.path) {
            augmented.push({ type: 'input', itemType: creation.newInput.type, parentPath: fileTree.path, level: 0 });
        }
        for (const child of fileTree.children) traverse(child, 0);
    }
    return augmented;
  }, [flattenedVisibleNodes, creation.newInput, expandedFolders, fileTree]);

  // Update virtualization with augmented nodes
  const finalVirtualization = useSidebarVirtualization(augmentedVisibleNodes);

  return {
    fileTree, expandedFolders, activeFilePath, selectedPath, selectedPaths, clipboardItems,
    ...finalVirtualization,
    contextMenu, setContextMenu, ...creation,
    handleContextMenu, ...navigation,
    refreshRoot, toggleFolder, setSelectedPath, setSelectedPaths,
    flattenedVisibleNodes: augmentedVisibleNodes
  };
};
