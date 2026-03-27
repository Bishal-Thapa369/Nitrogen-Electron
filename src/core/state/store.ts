import { create } from 'zustand';

// Mirrors the C++ FileNode structure returned by the native addon
export interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  isLoaded: boolean;
  typeId?: number; // Precomputed in C++ for flyweight icon rendering
  children: FileTreeNode[];
}

export interface EditorGroup {
  id: string;
  openTabs: { path: string; name: string }[];
  activeFilePath: string | null;
  activeFileContent: string | null;
}

interface EditorState {

  // File Tree (from C++ backend)
  fileTree: FileTreeNode | null;
  rootPath: string | null;
  expandedFolders: string[];  // Set of expanded directory paths
  extensionMap: Record<number, string>; // Maps C++ typeId to string extension

  // Editor Groups
  editorGroups: EditorGroup[];
  activeGroupId: string;
  focusHistory: string[]; // Tracks order of group focus for intelligent switching

  theme: 'vs-dark' | 'light';
  isCommandPaletteOpen: boolean;
  isTerminalOpen: boolean;
  isSidebarOpen: boolean;
  cursorPosition: { line: number; column: number };
  autoSave: boolean;
  isSplitScreen: boolean;


  // Actions
  setFileTree: (tree: FileTreeNode | null, rootPath: string | null) => void;
  updateExtensionMap: () => Promise<void>;
  updateNode: (path: string, updatedNode: FileTreeNode) => Promise<void>;
  toggleFolder: (dirPath: string) => void;
  openFile: (filePath: string, fileName: string, groupId?: string) => void;
  closeFile: (filePath: string, groupId?: string) => void;
  setActiveFile: (filePath: string | null, groupId?: string) => void;
  setActiveFileContent: (content: string | null, groupId?: string) => void;
  setActiveGroup: (groupId: string) => void;

  setTheme: (theme: 'vs-dark' | 'light') => void;
  toggleCommandPalette: () => void;
  toggleTerminal: () => void;
  toggleSidebar: () => void;
  setCursorPosition: (line: number, column: number) => void;
  toggleAutoSave: () => void;
  toggleSplitScreen: () => void;
  closeOtherFiles: (filePath: string, groupId?: string) => void;
  closeAllFiles: (groupId?: string) => void;



  // Explorer Selection & Clipboard
  selectedPath: string | null;
  selectedPaths: string[];
  setSelectedPath: (path: string | null, multi?: boolean) => void;
  setSelectedPaths: (paths: string[]) => void;
  selectAll: (targetPath?: string) => void;
  collapseAll: () => void;
  clipboardItems: { paths: string[]; type: 'copy' | 'cut' } | null;
  setClipboardItems: (paths: string[], type: 'copy' | 'cut') => void;

  // File Operations
  renameNode: (oldPath: string, newName: string) => Promise<{ success: boolean; error?: string }>;
  deleteNode: (targetPath: string) => Promise<{ success: boolean; error?: string }>;
  deleteNodesBulk: (paths: string[]) => Promise<{ success: boolean; error?: string }>;
  createFile: (parentDir: string, fileName: string) => Promise<{ success: boolean; error?: string }>;
  createFolder: (parentDir: string, folderName: string) => Promise<{ success: boolean; error?: string }>;
  refreshRoot: () => Promise<void>;
  pasteNode: () => Promise<{ success: boolean; error?: string } | null>;
  duplicateNode: (path: string) => Promise<{ success: boolean; error?: string }>;
}

// Intelligently merge C++ shallow refreshed nodes with old deeply loaded sub-nodes
function mergeTreeState(oldNode: FileTreeNode, newNode: FileTreeNode): FileTreeNode {
  if (!oldNode || !newNode || !oldNode.isDirectory || !newNode.isDirectory) return newNode;
  
  const mergedChildren = newNode.children.map(newChild => {
    const oldChild = oldNode.children.find(c => c.name === newChild.name);
    if (oldChild && oldChild.isDirectory) {
      // Unconditionally preserve deep loaded children if they existed in frontend state
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

// Deep-update a node within the tree by path
function updateTreeNode(node: FileTreeNode, targetPath: string, updatedNode: FileTreeNode): FileTreeNode {
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

// Remove a node from the tree by path
function removeTreeNode(node: FileTreeNode, targetPath: string): FileTreeNode {
  if (!node.isDirectory) return node;
  return {
    ...node,
    children: node.children
      .filter(child => child.path !== targetPath)
      .map(child => child.isDirectory && targetPath.startsWith(child.path + '/') ? removeTreeNode(child, targetPath) : child),
  };
}

// Get the parent directory path
function getParentPath(filePath: string): string {
  const parts = filePath.replace(/\/+$/, '').split('/');
  parts.pop();
  return parts.join('/') || '/';
}

export const useStore = create<EditorState>((set, get) => ({
  fileTree: null,
  rootPath: null,
  expandedFolders: [],
  extensionMap: {},
  editorGroups: [{ id: 'primary', openTabs: [], activeFilePath: null, activeFileContent: null }],
  activeGroupId: 'primary',
  focusHistory: ['primary'],

  theme: (localStorage.getItem('theme') as any) || 'vs-dark',
  isCommandPaletteOpen: false,
  isTerminalOpen: true,
  isSidebarOpen: true,
  cursorPosition: { line: 1, column: 1 },
  autoSave: true,
  isSplitScreen: false,


  setFileTree: (tree, rootPath) => {
    set({ fileTree: tree, rootPath, expandedFolders: tree ? [tree.path] : [] });
    get().updateExtensionMap();
  },

  updateExtensionMap: async () => {
    try {
      const exts = await window.electronAPI.getExtensions();
      set({ extensionMap: exts as unknown as Record<number, string> });
    } catch (err) {
      console.error('Failed to sync extension map', err);
    }
  },

  updateNode: async (path, updatedNode) => {
    const { fileTree } = get();
    if (!fileTree) return;
    set({ fileTree: updateTreeNode(fileTree, path, updatedNode) });
    await get().updateExtensionMap();
  },

  toggleFolder: (dirPath) => {
    set((state) => ({
      expandedFolders: state.expandedFolders.includes(dirPath)
        ? state.expandedFolders.filter((p) => p !== dirPath)
        : [...state.expandedFolders, dirPath],
    }));
  },

  openFile: (filePath, fileName, groupId) => {
    const state = get();
    const targetGroupId = groupId || state.activeGroupId;
    const groups = [...state.editorGroups];
    const groupIndex = groups.findIndex(g => g.id === targetGroupId);
    if (groupIndex === -1) return;

    const group = groups[groupIndex];
    if (!group.openTabs.find(t => t.path === filePath)) {
      group.openTabs = [...group.openTabs, { path: filePath, name: fileName }];
    }
    group.activeFilePath = filePath;
    set({ editorGroups: groups, activeGroupId: targetGroupId });
  },

  closeFile: (filePath, groupId) => {
    const state = get();
    const targetGroupId = groupId || state.activeGroupId;
    const groups = [...state.editorGroups];
    const groupIndex = groups.findIndex(g => g.id === targetGroupId);
    if (groupIndex === -1) return;

    const group = groups[groupIndex];
    const newTabs = group.openTabs.filter((t) => t.path !== filePath);
    let newActive = group.activeFilePath;
    
    if (group.activeFilePath === filePath) {
      newActive = newTabs.length > 0 ? newTabs[newTabs.length - 1].path : null;
    }
    
    group.openTabs = newTabs;
    group.activeFilePath = newActive;
    group.activeFileContent = newActive === null ? null : group.activeFileContent;
    
    // Auto-collapse if no tabs left in a group and there are other groups
    if (newTabs.length === 0 && groups.length > 1) {
      const closedIdx = groups.findIndex(g => g.id === targetGroupId);
      const remainingGroups = groups.filter(g => g.id !== targetGroupId);
      
      const leftNeighbor = closedIdx > 0 ? groups[closedIdx - 1] : null;
      const rightNeighbor = closedIdx < groups.length - 1 ? groups[closedIdx + 1] : null;

      let nextFocusId = remainingGroups[0].id;
      if (leftNeighbor && !rightNeighbor) {
        nextFocusId = leftNeighbor.id;
      } else if (rightNeighbor && !leftNeighbor) {
        nextFocusId = rightNeighbor.id;
      } else if (leftNeighbor && rightNeighbor) {
        const lastLeft = state.focusHistory.lastIndexOf(leftNeighbor.id);
        const lastRight = state.focusHistory.lastIndexOf(rightNeighbor.id);
        nextFocusId = lastLeft > lastRight ? leftNeighbor.id : rightNeighbor.id;
      }

      set({ 
        isSplitScreen: remainingGroups.length > 1, 
        editorGroups: remainingGroups, 
        activeGroupId: nextFocusId,
        focusHistory: state.focusHistory.filter(id => id !== targetGroupId)
      });
      return;
    }

    set({ editorGroups: groups });
  },

  setActiveFile: (filePath, groupId) => {
    const state = get();
    const targetGroupId = groupId || state.activeGroupId;
    const groups = [...state.editorGroups];
    const groupIndex = groups.findIndex(g => g.id === targetGroupId);
    if (groupIndex === -1) return;
    groups[groupIndex].activeFilePath = filePath;
    set({ editorGroups: groups, activeGroupId: targetGroupId });
  },

  setActiveFileContent: (content, groupId) => {
    const state = get();
    const targetGroupId = groupId || state.activeGroupId;
    const groups = [...state.editorGroups];
    const groupIndex = groups.findIndex(g => g.id === targetGroupId);
    if (groupIndex === -1) return;
    groups[groupIndex].activeFileContent = content;
    set({ editorGroups: groups });
  },

  setActiveGroup: (groupId) => set((state) => ({ 
    activeGroupId: groupId,
    focusHistory: [...state.focusHistory.filter(id => id !== groupId), groupId]
  })),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setCursorPosition: (line, column) => set({ cursorPosition: { line, column } }),
  toggleAutoSave: () => set((state) => ({ autoSave: !state.autoSave })),
  toggleSplitScreen: () => {
    const { editorGroups, activeGroupId } = get();
    
    // Entering split mode / Adding more splits
    const activeGroup = editorGroups.find(g => g.id === activeGroupId) || editorGroups[0];
    const currentFile = activeGroup.openTabs.find(t => t.path === activeGroup.activeFilePath);

    const newGroupId = `group-${Date.now()}`;
    const newGroup: EditorGroup = {
      id: newGroupId,
      openTabs: currentFile ? [{ ...currentFile }] : [],
      activeFilePath: activeGroup.activeFilePath,
      activeFileContent: activeGroup.activeFileContent
    };

    const newGroups = [...editorGroups, newGroup];
    set({ 
      isSplitScreen: true, 
      editorGroups: newGroups, 
      activeGroupId: newGroupId,
      focusHistory: [...get().focusHistory, newGroupId]
    });
  },
  closeOtherFiles: (filePath, groupId) => {
    const state = get();
    const targetGroupId = groupId || state.activeGroupId;
    const groups = [...state.editorGroups];
    const groupIndex = groups.findIndex(g => g.id === targetGroupId);
    if (groupIndex === -1) return;

    const group = groups[groupIndex];
    group.openTabs = group.openTabs.filter(t => t.path === filePath);
    group.activeFilePath = filePath;
    set({ editorGroups: groups });
  },
  closeAllFiles: (groupId) => {
    const state = get();
    const targetGroupId = groupId || state.activeGroupId;
    const groups = [...state.editorGroups];
    const groupIndex = groups.findIndex(g => g.id === targetGroupId);
    if (groupIndex === -1) return;
    
    const group = groups[groupIndex];
    group.openTabs = [];
    group.activeFilePath = null;
    group.activeFileContent = null;
    
    // Auto-collapse if clearing all tabs and there are other groups
    if (groups.length > 1) {
      const closedIdx = groups.findIndex(g => g.id === targetGroupId);
      const remainingGroups = groups.filter(g => g.id !== targetGroupId);
      
      const leftNeighbor = closedIdx > 0 ? groups[closedIdx - 1] : null;
      const rightNeighbor = closedIdx < groups.length - 1 ? groups[closedIdx + 1] : null;

      let nextFocusId = remainingGroups[0].id;
      if (leftNeighbor && !rightNeighbor) {
        nextFocusId = leftNeighbor.id;
      } else if (rightNeighbor && !leftNeighbor) {
        nextFocusId = rightNeighbor.id;
      } else if (leftNeighbor && rightNeighbor) {
        const lastLeft = state.focusHistory.lastIndexOf(leftNeighbor.id);
        const lastRight = state.focusHistory.lastIndexOf(rightNeighbor.id);
        nextFocusId = lastLeft > lastRight ? leftNeighbor.id : rightNeighbor.id;
      }

      set({ 
        isSplitScreen: remainingGroups.length > 1, 
        editorGroups: remainingGroups, 
        activeGroupId: nextFocusId,
        focusHistory: state.focusHistory.filter(id => id !== targetGroupId)
      });
      return;
    }

    set({ editorGroups: groups });
  },


  // Explorer
  selectedPath: null,
  selectedPaths: [],
  setSelectedPath: (path, multi = false) => set((state) => ({ 
    selectedPath: path, 
    selectedPaths: multi ? state.selectedPaths : (path ? [path] : []) 
  })),
  setSelectedPaths: (paths) => set({ selectedPaths: paths }),

  selectAll: (forcedPath) => {
    const state = get();
    const { fileTree, selectedPath, rootPath } = state;
    if (!fileTree || !rootPath) return;

    // 1. Identify Target Directory
    let targetDir = forcedPath || rootPath;
    
    // If no specific path is forced, use the selection context
    if (!forcedPath && selectedPath) {
      const findNode = (path: string, node: FileTreeNode | null = fileTree): FileTreeNode | null => {
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
      };

      const selNode = findNode(selectedPath);
      if (selNode) {
        targetDir = selNode.isDirectory ? selNode.path : getParentPath(selNode.path);
      }
    }

    // 2. Fetch Children of that Target
    const findNodeByPath = (path: string, node: FileTreeNode | null = fileTree): FileTreeNode | null => {
        if (!node) return null;
        if (node.path === path) return node;
        for (const child of node.children) {
          if (child.path === path) return child;
          if (child.isDirectory && path.startsWith(child.path + '/')) {
            const found = findNodeByPath(path, child);
            if (found) return found;
          }
        }
        return null;
    };

    const targetNode = findNodeByPath(targetDir);
    if (targetNode && targetNode.isDirectory) {
      const allChildPaths = targetNode.children.map(c => c.path);
      set({ selectedPaths: allChildPaths });
    }
  },

  clipboardItems: null,
  setClipboardItems: (paths, type) => set({ clipboardItems: { paths, type } }),
  collapseAll: () => {
    const root = get().fileTree;
    set({ expandedFolders: root ? [root.path] : [] });
  },

  // ── File Operations ──────────────────────────────────────

  renameNode: async (oldPath, newName) => {
    const result = await window.electronAPI.renameItem(oldPath, newName);
    if (result.success) {
      const parentDir = getParentPath(oldPath);
      const newPath = parentDir + (parentDir.endsWith('/') ? '' : '/') + newName;
      
      // Creation Priority: Unmark new path just in case it was part of a recent deletion 
      await window.electronAPI.unmarkForDeletionBulk([newPath]);

      const refreshed = await window.electronAPI.refreshDirectory(parentDir, true);
      if (refreshed) await get().updateNode(parentDir, refreshed);
    }
    return result;
  },

  createFile: async (parentDir, fileName) => {
    const result = await window.electronAPI.createFile(parentDir, fileName);
    if (result.success) {
      const newPath = parentDir + (parentDir.endsWith('/') ? '' : '/') + fileName;
      // Creation Priority: Ensure the newly created file isn't hiding in the blacklist
      await window.electronAPI.unmarkForDeletionBulk([newPath]);

      const refreshed = await window.electronAPI.refreshDirectory(parentDir, true);
      if (refreshed) await get().updateNode(parentDir, refreshed);
    }
    return result;
  },

  createFolder: async (parentDir, folderName) => {
    const result = await window.electronAPI.createFolder(parentDir, folderName);
    if (result.success) {
      const newPath = parentDir + (parentDir.endsWith('/') ? '' : '/') + folderName;
      // Creation Priority: Ensure the newly created folder is visible
      await window.electronAPI.unmarkForDeletionBulk([newPath]);

      // Make sure the parent is expanded so the new folder is visible
      const { expandedFolders } = get();
      if (!expandedFolders.includes(parentDir)) {
        set((state) => ({ expandedFolders: [...state.expandedFolders, parentDir] }));
      }
      const refreshed = await window.electronAPI.refreshDirectory(parentDir, true);
      if (refreshed) await get().updateNode(parentDir, refreshed);
    }
    return result;
  },

  refreshRoot: async () => {
    const { rootPath, expandedFolders } = get();
    if (!rootPath) return;
    try {
      // To strictly obliterate ghost files or missing file glitches,
      // we perform a recursive Deep Reconstitution from the disk state buffer.
      const buildFreshTreeDeep = async (currentPath: string): Promise<FileTreeNode | null> => {
        // By calling refreshDirectory directly with force=true, we physically force the C++ backend 
        // to OBLITERATE its memory buffer for this node, ignore any blacklists, 
        // query the actual Operating System kernel, and return the exact state of the Hard Drive.
        const freshNode = await window.electronAPI.refreshDirectory(currentPath, true);
        if (!freshNode) return null;

        
        // Concurrently refetch deep children if they were expanded
        if (expandedFolders.includes(currentPath)) {
           const processedChildren = await Promise.all(
              freshNode.children.map(async (child: FileTreeNode) => {
                 if (child.isDirectory && expandedFolders.includes(child.path)) {
                    const deepChild = await buildFreshTreeDeep(child.path);
                    return deepChild || child;
                 }
                 return child;
              })
           );
           freshNode.children = processedChildren;
           freshNode.isLoaded = true;
        }
        
        return freshNode;
      };

      const newTree = await buildFreshTreeDeep(rootPath);
      
      if (newTree) {
         set({ fileTree: newTree });
         await get().updateExtensionMap();
      }
    } catch (err) {
      console.error('Refresh failed', err);
    }
  },

  deleteNode: async (targetPath) => {
    return get().deleteNodesBulk([targetPath]);
  },

  deleteNodesBulk: async (paths) => {
    if (!paths || paths.length === 0) return { success: true };

    const result = await window.electronAPI.deleteItemsBulk(paths);
    if (result.success) {
      // One single refresh for the entire bulk operation
      // Native C++ will have blacklisted all paths already
      await get().refreshRoot();

      const { activeGroupId, editorGroups } = get();
      const activeGroup = editorGroups.find(g => g.id === activeGroupId);
      const activeFilePath = activeGroup?.activeFilePath;
      const openTabs = activeGroup?.openTabs || [];

      paths.forEach(p => {
        if (activeFilePath === p || openTabs.find(t => t.path === p)) {
            get().closeFile(p, activeGroupId);
        }
      });
    }
    return result;
  },

  pasteNode: async () => {
    const { clipboardItems, selectedPath, rootPath, fileTree } = get();
    if (!clipboardItems || !fileTree || clipboardItems.paths.length === 0) return null;

    let destDir = rootPath || '/';

    // Determine target directory intelligently based on current selection
    if (selectedPath) {
      const findNode = (path: string, node: FileTreeNode | null = fileTree): FileTreeNode | null => {
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
      };

      const selectedNode = findNode(selectedPath);
      if (selectedNode) {
        if (selectedNode.isDirectory) {
          destDir = selectedNode.path;
          if (!get().expandedFolders.includes(destDir)) {
             set((state) => ({ expandedFolders: [...state.expandedFolders, destDir] }));
          }
        } else {
          destDir = getParentPath(selectedNode.path);
        }
      }
    }

    const { paths: sourcePaths, type } = clipboardItems;
    
    // Execute multiple operations concurrently on the native backend
    const operations = sourcePaths.map(sourcePath => {
      if (type === 'copy') {
        return window.electronAPI.copyItem(sourcePath, destDir);
      } else {
        return window.electronAPI.moveItem(sourcePath, destDir);
      }
    });

    const results = await Promise.all(operations);
    const anySuccess = results.some(r => r.success);

    if (type === 'cut') {
      set({ clipboardItems: null });
    }

    if (anySuccess) {
      // Clean Deletion Rule: Explicitly unmark all destination paths 
      // so they can be seen even if background deletion is still running.
      const destPaths = sourcePaths.map(sp => {
          const name = sp.split('/').pop() || '';
          return destDir + (destDir.endsWith('/') ? '' : '/') + name;
      });
      await window.electronAPI.unmarkForDeletionBulk(destPaths);

      // Security & Consistency Rule: Perform a full root reload to 
      // ensure the entire tree structure is perfectly synchronized.
      await get().refreshRoot();
      await get().updateExtensionMap();
    }

    return results[0]; // Return the status of the first operation as a fallback
  },

  duplicateNode: async (targetPath) => {
    const parentDir = getParentPath(targetPath);
    // Duplicate is just a copy to the same directory
    const result = await window.electronAPI.copyItem(targetPath, parentDir);
    if (result.success) {
      const refreshed = await window.electronAPI.refreshDirectory(parentDir, true);
      if (refreshed) await get().updateNode(parentDir, refreshed);
    }
    return result;
  },
}));
