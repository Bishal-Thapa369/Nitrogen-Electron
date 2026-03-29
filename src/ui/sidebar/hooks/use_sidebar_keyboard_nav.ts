import { useEffect, useCallback } from 'react';
import { useStore, FileTreeNode } from '../../../core/state/store';
import { VirtualRow } from '../logic/use_sidebar_logic';
import { getParentPath } from '../../../core/state/utils/tree_helpers';

interface UseSidebarKeyboardNavProps {
  flattenedVisibleNodes: VirtualRow[];
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const useSidebarKeyboardNav = ({
  flattenedVisibleNodes,
  containerRef
}: UseSidebarKeyboardNavProps) => {
  const { 
    navigationFocusPath, 
    setNavigationFocusPath, 
    selectedPath,
    openFile, 
    toggleFolder, 
    expandedFolders,
    updateNode,
    focusContext
  } = useStore();

  const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
    if (focusContext !== 'sidebar') return;
    
    // Ignore if typing in a rename/create input (though focusContext should be different)
    if (e.target instanceof HTMLInputElement) return;

    const nodes = flattenedVisibleNodes.filter(n => n.type === 'node').map(n => (n as any).node as FileTreeNode);
    if (nodes.length === 0) return;

    const currentIndex = nodes.findIndex(n => n.path === navigationFocusPath);
    
    // ⬇️ Vertical Navigation: ArrowDown / j
    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      const nextIndex = Math.min(currentIndex + 1, nodes.length - 1);
      setNavigationFocusPath(nodes[nextIndex].path);
    }
    
    // ⬆️ Vertical Navigation: ArrowUp / k
    else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      const prevIndex = Math.max(currentIndex - 1, 0);
      setNavigationFocusPath(nodes[prevIndex].path);
    }
    
    // ⏎ Enter: Open File / Toggle Folder
    else if (e.key === 'Enter') {
      e.preventDefault();
      const node = nodes.find(n => n.path === navigationFocusPath);
      if (node) {
        if (node.isDirectory) {
          toggleFolder(node.path);
        } else {
          openFile(node.path, node.name);
          useStore.getState().setSelectedPath(node.path);
        }
      }
    }

    // ➡ / l: Expand Folder / Move to First Child
    else if (e.key === 'ArrowRight' || e.key === 'l') {
        e.preventDefault();
        const node = nodes.find(n => n.path === navigationFocusPath);
        if (node && node.isDirectory) {
            if (!expandedFolders.includes(node.path)) {
                toggleFolder(node.path);
                if (!node.isLoaded) {
                    const expandedNode = await window.electronAPI.expandDirectory(node.path);
                    if (expandedNode) updateNode(node.path, expandedNode);
                }
            } else {
                // Move focus to first child
                const nextNode = nodes[currentIndex + 1];
                if (nextNode && getParentPath(nextNode.path) === node.path) {
                    setNavigationFocusPath(nextNode.path);
                }
            }
        }
    }

    // ⬅ / h: Collapse Folder / Move to Parent
    else if (e.key === 'ArrowLeft' || e.key === 'h') {
        e.preventDefault();
        const node = nodes.find(n => n.path === navigationFocusPath);
        if (node) {
            if (node.isDirectory && expandedFolders.includes(node.path)) {
                toggleFolder(node.path);
            } else {
                const parentPath = getParentPath(node.path);
                if (parentPath && parentPath !== node.path) {
                    // Find parent in the list
                    const parentNode = nodes.find(n => n.path === parentPath);
                    if (parentNode) {
                        setNavigationFocusPath(parentPath);
                    }
                }
            }
        }
    }

    // ⌴ Space: Toggle Expansion / Open
    else if (e.key === ' ') {
        e.preventDefault();
        const node = nodes.find(n => n.path === navigationFocusPath);
        if (node) {
            if (node.isDirectory) {
                toggleFolder(node.path);
            } else {
                openFile(node.path, node.name);
            }
        }
    }

    // ⎋ Escape: Parent Navigation
    else if (e.key === 'Escape') {
        e.preventDefault();
        const node = nodes.find(n => n.path === navigationFocusPath);
        if (node) {
            const parentPath = getParentPath(node.path);
            if (parentPath && parentPath !== node.path) {
                setNavigationFocusPath(parentPath);
            }
        }
    }

    // Letter Jump (a-z)
    else if (e.key.length === 1 && e.key.match(/[a-z0-9]/i) && !e.ctrlKey && !e.metaKey) {
        const char = e.key.toLowerCase();
        const nextMatch = nodes.slice(currentIndex + 1).find(n => n.name.toLowerCase().startsWith(char))
                         || nodes.find(n => n.name.toLowerCase().startsWith(char));
        
        if (nextMatch) setNavigationFocusPath(nextMatch.path);
    }
  }, [flattenedVisibleNodes, navigationFocusPath, setNavigationFocusPath, openFile, toggleFolder, expandedFolders, updateNode, focusContext]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Initial Sync: Red follows Blue when entering focuses
  useEffect(() => {
    if (focusContext === 'sidebar' && !navigationFocusPath && selectedPath) {
        setNavigationFocusPath(selectedPath);
    }
  }, [focusContext, selectedPath, navigationFocusPath, setNavigationFocusPath]);

  // Scroll into view logic
  useEffect(() => {
    if (!navigationFocusPath || !containerRef.current) return;
    
    // Virtualization means the element might not exist yet
    // We wait for the next frame
    requestAnimationFrame(() => {
        const row = containerRef.current?.querySelector(`[data-path="${CSS.escape(navigationFocusPath)}"]`);
        if (row) {
            row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    });
  }, [navigationFocusPath, containerRef]);

  return { handleKeyDown };
};
