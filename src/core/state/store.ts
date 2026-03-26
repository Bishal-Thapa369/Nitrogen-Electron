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

interface EditorState {
  // File Tree (from C++ backend)
  fileTree: FileTreeNode | null;
  rootPath: string | null;
  expandedFolders: string[];  // Set of expanded directory paths
  extensionMap: Record<number, string>; // Maps C++ typeId to string extension

  // Editor State
  openTabs: { path: string; name: string }[];
  activeFilePath: string | null;
  activeFileContent: string | null;
  theme: 'vs-dark' | 'light';
  isCommandPaletteOpen: boolean;
  isTerminalOpen: boolean;
  isSidebarOpen: boolean;
  cursorPosition: { line: number; column: number };
  autoSave: boolean;

  // Actions
  setFileTree: (tree: FileTreeNode | null, rootPath: string | null) => void;
  updateExtensionMap: () => Promise<void>;
  updateNode: (path: string, updatedNode: FileTreeNode) => Promise<void>;
  toggleFolder: (dirPath: string) => void;
  openFile: (filePath: string, fileName: string) => void;
  closeFile: (filePath: string) => void;
  setActiveFile: (filePath: string | null) => void;
  setActiveFileContent: (content: string | null) => void;
  setTheme: (theme: 'vs-dark' | 'light') => void;
  toggleCommandPalette: () => void;
  toggleTerminal: () => void;
  toggleSidebar: () => void;
  setCursorPosition: (line: number, column: number) => void;
  toggleAutoSave: () => void;

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
  createFile: (parentDir: string, fileName: string) => Promise<{ success: boolean; error?: string }>;
  createFolder: (parentDir: string, folderName: string) => Promise<{ success: boolean; error?: string }>;
  refreshRoot: () => Promise<void>;
  pasteNode: () => Promise<{ success: boolean; error?: string } | null>;
  duplicateNode: (path: string) => Promise<{ success: boolean; error?: string }>;
  hidingPaths: Set<string>;
  setHidingPaths: (paths: Set<string>) => void;
  confirmBulkOperation: { 
    isOpen: boolean; 
    itemCount: number; 
    operation: 'paste' | 'delete'; 
    onProceed: () => void 
  } | null;
  setConfirmBulk: (data: EditorState['confirmBulkOperation']) => void;
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
  openTabs: [],
  activeFilePath: null,
  activeFileContent: null,
  theme: (localStorage.getItem('theme') as any) || 'vs-dark',
  isCommandPaletteOpen: false,
  isTerminalOpen: true,
  isSidebarOpen: true,
  cursorPosition: { line: 1, column: 1 },
  autoSave: true,
  confirmBulkOperation: null,
  hidingPaths: new Set(),
  setConfirmBulk: (data) => set({ confirmBulkOperation: data }),
  setHidingPaths: (paths) => set({ hidingPaths: paths }),

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

  openFile: (filePath, fileName) => {
    const { openTabs } = get();
    if (!openTabs.find(t => t.path === filePath)) {
      set({ openTabs: [...openTabs, { path: filePath, name: fileName }] });
    }
    set({ activeFilePath: filePath });
  },

  closeFile: (filePath) => {
    const { openTabs, activeFilePath } = get();
    const newTabs = openTabs.filter((t) => t.path !== filePath);
    let newActive = activeFilePath;
    if (activeFilePath === filePath) {
      newActive = newTabs.length > 0 ? newTabs[newTabs.length - 1].path : null;
    }
    set({ openTabs: newTabs, activeFilePath: newActive, activeFileContent: newActive === null ? null : get().activeFileContent });
  },

  setActiveFile: (filePath) => set({ activeFilePath: filePath }),
  setActiveFileContent: (content) => set({ activeFileContent: content }),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setCursorPosition: (line, column) => set({ cursorPosition: { line, column } }),
  toggleAutoSave: () => set((state) => ({ autoSave: !state.autoSave })),

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
      const refreshed = await window.electronAPI.refreshDirectory(parentDir);
      if (refreshed) await get().updateNode(parentDir, refreshed);
    }
    return result;
  },

  createFile: async (parentDir, fileName) => {
    const result = await window.electronAPI.createFile(parentDir, fileName);
    if (result.success) {
      const refreshed = await window.electronAPI.refreshDirectory(parentDir);
      if (refreshed) await get().updateNode(parentDir, refreshed);
    }
    return result;
  },

  createFolder: async (parentDir, folderName) => {
    const result = await window.electronAPI.createFolder(parentDir, folderName);
    if (result.success) {
      // Make sure the parent is expanded so the new folder is visible
      const { expandedFolders } = get();
      if (!expandedFolders.includes(parentDir)) {
        set((state) => ({ expandedFolders: [...state.expandedFolders, parentDir] }));
      }
      const refreshed = await window.electronAPI.refreshDirectory(parentDir);
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
        // By calling refreshDirectory directly, we physically force the C++ backend to 
        // dump its memory buffer for this node, query the actual Operating System kernel, 
        // and return the exact state of the Hard Drive right now.
        const freshNode = await window.electronAPI.refreshDirectory(currentPath);
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
    const { selectedPaths } = get();
    // Use selection count if deleting from a multi-select, otherwise just 1
    const count = selectedPaths.length > 1 ? selectedPaths.length : 1;
    
    // Safety check for mass delete
    if (count > 200 && !get().confirmBulkOperation?.isOpen) {
        return new Promise((resolve) => {
            get().setConfirmBulk({
                isOpen: true,
                itemCount: count,
                operation: 'delete',
                onProceed: async () => {
                   const { selectedPaths } = get();
                   // INSTANT HIDE: Add paths to blacklist for O(1) UI masking
                   const newHiding = new Set(get().hidingPaths);
                   selectedPaths.forEach(p => newHiding.add(p));
                   set({ hidingPaths: newHiding });

                   const res = await get().deleteNode(targetPath);
                   get().setConfirmBulk(null);
                   resolve(res);
                }
            });
        });
    }

    // Capture standard single-path delete in hiding paths too
    if (!get().confirmBulkOperation?.isOpen) {
        set((state) => {
            const next = new Set(state.hidingPaths);
            next.add(targetPath);
            return { hidingPaths: next };
        });
    }

    // Execute multiple operations concurrently
    const targets = selectedPaths.length > 1 ? selectedPaths : [targetPath];
    
    // Execute multiple operations concurrently
    const operations = targets.map(p => window.electronAPI.deleteItem(p));
    const results = await Promise.all(operations);
    const anySuccess = results.some(r => r.success);

    if (anySuccess) {
      // 1. CLEAR local memory (Blacklist) and re-sync natively
      set((state) => {
        const nextHiding = new Set(state.hidingPaths);
        targets.forEach(p => nextHiding.delete(p));
        return { hidingPaths: nextHiding };
      });

      // 2. Perform ONE single Deep Sync from C++ disk scan
      await get().refreshRoot();
    }
    return results[0];
  },

  pasteNode: async () => {
    const { clipboardItems, selectedPath, rootPath, fileTree } = get();
    if (!clipboardItems || !fileTree || clipboardItems.paths.length === 0) return null;

    // Safety check for mass paste
    if (clipboardItems.paths.length > 200 && !get().confirmBulkOperation?.isOpen) {
        return new Promise((resolve) => {
            get().setConfirmBulk({
                isOpen: true,
                itemCount: clipboardItems.paths.length,
                operation: 'paste',
                onProceed: async () => {
                   // INSTANT HIDE (For Cut/Move): Mask sources immediately
                   if (get().clipboardItems?.type === 'cut') {
                       const next = new Set(get().hidingPaths);
                       get().clipboardItems!.paths.forEach(p => next.add(p));
                       set({ hidingPaths: next });
                   }

                   const res = await get().pasteNode();
                   get().setConfirmBulk(null);
                   resolve(res);
                }
            });
        });
    }

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
      // CLEAR local memory (Blacklist) and re-sync natively
      set((state) => {
        const nextHiding = new Set(state.hidingPaths);
        if (type === 'cut') {
            sourcePaths.forEach(p => nextHiding.delete(p));
        }
        return { hidingPaths: nextHiding };
      });

      await get().updateExtensionMap();
      // ONE single Deep Sync from C++ disk scan
      await get().refreshRoot();
    }

    return results[0]; // Return the status of the first operation as a fallback
  },

  duplicateNode: async (targetPath) => {
    const parentDir = getParentPath(targetPath);
    // Duplicate is just a copy to the same directory
    const result = await window.electronAPI.copyItem(targetPath, parentDir);
    if (result.success) {
      const refreshed = await window.electronAPI.refreshDirectory(parentDir);
      if (refreshed) await get().updateNode(parentDir, refreshed);
    }
    return result;
  },
}));
