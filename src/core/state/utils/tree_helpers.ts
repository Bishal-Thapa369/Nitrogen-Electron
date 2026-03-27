import { FileTreeNode } from '../types';

/**
 * Intelligently merge C++ shallow refreshed nodes with old deeply loaded sub-nodes
 */
export function mergeTreeState(oldNode: FileTreeNode, newNode: FileTreeNode): FileTreeNode {
  if (!oldNode || !newNode || !oldNode.isDirectory || !newNode.isDirectory) return newNode;
  
  const mergedChildren = newNode.children.map(newChild => {
    const oldChild = oldNode.children.find(c => c.name === newChild.name);
    if (oldChild && oldChild.isDirectory) {
      if (oldChild.isLoaded || oldChild.children.length > 0) {
        return { 
          ...newChild, 
          isLoaded: true, 
          children: oldChild.children 
        };
      }
    }
    return newChild;
  });
  
  return { ...newNode, isLoaded: oldNode.isLoaded || newNode.isLoaded, children: mergedChildren };
}

/**
 * Deep-update a node within the tree by path
 */
export function updateTreeNode(node: FileTreeNode, targetPath: string, updatedNode: FileTreeNode): FileTreeNode {
  if (node.path === targetPath) return mergeTreeState(node, updatedNode);
  if (!node.isDirectory) return node;

  return {
    ...node,
    children: node.children.map(child => {
      if (child.isDirectory && (targetPath === child.path || targetPath.startsWith(child.path + '/'))) {
        return updateTreeNode(child, targetPath, updatedNode);
      }
      return child;
    }),
  };
}

/**
 * Remove a node from the tree by path
 */
export function removeTreeNode(node: FileTreeNode, targetPath: string): FileTreeNode {
  if (!node.isDirectory) return node;
  return {
    ...node,
    children: node.children
      .filter(child => child.path !== targetPath)
      .map(child => child.isDirectory && targetPath.startsWith(child.path + '/') ? removeTreeNode(child, targetPath) : child),
  };
}

/**
 * Get the parent directory path
 */
export function getParentPath(filePath: string): string {
  const parts = filePath.replace(/\/+$/, '').split('/');
  parts.pop();
  return parts.join('/') || '/';
}
