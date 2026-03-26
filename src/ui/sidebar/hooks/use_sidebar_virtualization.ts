import { useMemo } from 'react';
import { FileTreeNode } from '../../../core/state/store';

const ITEM_HEIGHT = 24;
const OVERSCAN = 30;

export type VirtualRow = 
  | { type: 'node'; node: FileTreeNode; level: number }
  | { type: 'input'; itemType: 'file' | 'folder'; parentPath: string; level: number };

export function useSidebarVirtualization(
    fileTree: FileTreeNode | null,
    expandedFolders: string[],
    newInput: { type: 'file' | 'folder'; parentPath: string } | null,
    scrollTop: number,
    containerHeight: number
) {
    const flattenedVisibleNodes = useMemo(() => {
        const flat: VirtualRow[] = [];
        if (!fileTree) return flat;
        
        const traverse = (node: FileTreeNode, level: number) => {
            flat.push({ type: 'node', node, level });
            if (node.isDirectory && expandedFolders.includes(node.path)) {
                if (newInput && newInput.parentPath === node.path) {
                    flat.push({ type: 'input', itemType: newInput.type, parentPath: node.path, level: level + 1 });
                }
                for (const child of node.children) {
                    traverse(child, level + 1);
                }
            }
        };
        
        if (expandedFolders.includes(fileTree.path)) {
            if (newInput && newInput.parentPath === fileTree.path) {
                flat.push({ type: 'input', itemType: newInput.type, parentPath: fileTree.path, level: 0 });
            }
            for (const child of fileTree.children) {
                traverse(child, 0);
            }
        }
        
        return flat;
    }, [fileTree, expandedFolders, newInput]);

    const totalHeight = flattenedVisibleNodes.length * ITEM_HEIGHT;
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(
        flattenedVisibleNodes.length - 1,
        Math.floor((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
    );
    
    const visibleItems = flattenedVisibleNodes.slice(startIndex, endIndex + 1);

    return {
        flattenedVisibleNodes,
        totalHeight,
        startIndex,
        endIndex,
        visibleItems,
        ITEM_HEIGHT
    };
}
