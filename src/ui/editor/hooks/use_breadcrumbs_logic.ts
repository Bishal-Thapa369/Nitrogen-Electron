import { useMemo, useState, useCallback } from 'react';
import { useStore, FileTreeNode } from '../../../core/state/store';

export interface BreadcrumbSegment {
  name: string;
  path: string;
  isDirectory: boolean;
}

/**
 * useBreadcrumbsLogic
 * Orchestrates path-to-segment transformation and sibling discovery.
 */
export const useBreadcrumbsLogic = (activeFilePath: string | null) => {
  const { fileTree, openFile, setActiveFileContent, updateNode } = useStore();
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [viewingPath, setViewingPath] = useState<string | null>(null);
  const [popupRect, setPopupRect] = useState<DOMRect | null>(null);
  const [popupExpandedFolders, setPopupExpandedFolders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // 1. Recursive Node Search Helper
  const findNode = useCallback((path: string, node: FileTreeNode | null = fileTree): FileTreeNode | null => {
    if (!node) return null;
    
    // Normalize both for comparison
    const normPath = path.replace(/\\/g, '/').replace(/\/$/, '');
    const normNodePath = node.path.replace(/\\/g, '/').replace(/\/$/, '');

    if (normNodePath === normPath) return node;
    
    if (normPath.startsWith(normNodePath + '/') || normNodePath === '' || normNodePath === '/') {
        for (const child of node.children) {
            const found = findNode(normPath, child);
            if (found) return found;
        }
    }
    return null;
  }, [fileTree]);

  // 2. Reactive Viewing Node Derivation (GOD-MODE REVISION)
  // This ensures that when fileTree updates, viewingNode automatically points to the new object
  const viewingNode = useMemo(() => {
    if (!viewingPath) return null;
    return findNode(viewingPath);
  }, [viewingPath, findNode]);

  // 3. Transform path into segments
  const segments = useMemo(() => {
    if (!activeFilePath || !fileTree) return [];
    
    const rootPathNorm = fileTree.path.replace(/\\/g, '/');
    const activePathNorm = activeFilePath.replace(/\\/g, '/');
    
    // Only show relative path if it's within the project root
    let displayParts: string[] = [];
    let baseAbsPath = rootPathNorm;

    if (activePathNorm.startsWith(rootPathNorm)) {
      const relative = activePathNorm.slice(rootPathNorm.length).replace(/^\//, '');
      displayParts = relative.split('/').filter(Boolean);
    } else {
      displayParts = activePathNorm.split('/').filter(Boolean);
      baseAbsPath = '';
    }

    const breadcrumbs: BreadcrumbSegment[] = [];
    let currentAbsPath = baseAbsPath;

    displayParts.forEach((part, index) => {
      currentAbsPath = currentAbsPath ? `${currentAbsPath}/${part}` : part;
      // Ensure path doesn't have double slashes if base was root
      const finalPath = currentAbsPath.replace(/\/+/g, '/');
      
      breadcrumbs.push({
        name: part,
        path: finalPath,
        isDirectory: index < displayParts.length - 1 || findNode(finalPath)?.isDirectory || false
      });
    });
    
    return breadcrumbs;
  }, [activeFilePath, fileTree, findNode]);

  // 4. Navigation Logic
  const handleSegmentClick = useCallback((path: string, rect: DOMRect) => {
    const normPath = path.replace(/\\/g, '/');
    if (activePopup === normPath) {
      setActivePopup(null);
      setViewingPath(null);
      setPopupRect(null);
      setPopupExpandedFolders([]);
    } else {
      setActivePopup(normPath);
      setPopupRect(rect);
      
      const node = findNode(normPath);
      if (node && !node.isDirectory) {
        // If it's a file, we want to view its parent folder's children (siblings)
        const parentPath = normPath.split('/').slice(0, -1).join('/');
        setViewingPath(parentPath || normPath); // Fallback if no parent
        setPopupExpandedFolders([parentPath || normPath]);
      } else {
        setViewingPath(normPath);
        setPopupExpandedFolders([normPath]);
      }
    }
  }, [activePopup, findNode]);

  const togglePopupFolder = useCallback(async (path: string) => {
    const isExpanded = popupExpandedFolders.includes(path);
    
    if (!isExpanded) {
      setPopupExpandedFolders(prev => [...prev, path]);
      const node = findNode(path);
      if (node && !node.isLoaded) {
        setIsLoading(path);
        try {
          const expandedNode = await window.electronAPI.expandDirectory(path);
          if (expandedNode) {
            await updateNode(path, expandedNode);
          }
        } catch (err) {
          console.error('Failed to expand folder from breadcrumb:', err);
        } finally {
          setIsLoading(null);
        }
      }
    } else {
      setPopupExpandedFolders(prev => prev.filter(p => p !== path));
    }
  }, [popupExpandedFolders, findNode, updateNode]);

  const navigateInto = useCallback(async (node: FileTreeNode) => {
    if (node.isDirectory) {
      setViewingPath(node.path);
      setPopupExpandedFolders(prev => Array.from(new Set([...prev, node.path])));
      if (!node.isLoaded) {
        setIsLoading(node.path);
        try {
          const expanded = await window.electronAPI.expandDirectory(node.path);
          if (expanded) await updateNode(node.path, expanded);
        } finally {
          setIsLoading(null);
        }
      }
    }
  }, [updateNode]);

  const navigateBack = useCallback(() => {
    if (!viewingPath || viewingPath === activePopup) return;
    
    const parts = viewingPath.split('/');
    if (parts.length <= 1) return;
    
    const parentPath = parts.slice(0, -1).join('/');
    setViewingPath(parentPath);
  }, [viewingPath, activePopup]);

  const handleSiblingSelect = async (node: FileTreeNode) => {
    if (!node.isDirectory) {
        openFile(node.path, node.name);
        try {
            const content = await window.electronAPI.readFile(node.path);
            if (content !== null) setActiveFileContent(content);
        } catch (err) {
            console.error('Breadcrumb I/O Error:', err);
        }
        setActivePopup(null);
        setViewingPath(null);
        setPopupRect(null);
        setPopupExpandedFolders([]);
    } else {
        await togglePopupFolder(node.path);
    }
  };

  return {
    segments,
    activePopup,
    viewingNode,
    setViewingPath,
    setActivePopup,
    handleSegmentClick,
    handleSiblingSelect,
    navigateInto,
    navigateBack,
    popupRect,
    popupExpandedFolders,
    togglePopupFolder,
    isLoading
  };
};
