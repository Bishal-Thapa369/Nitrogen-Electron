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
  setSelectedPath: (path: string | null) => void;
  collapseAll: () => void;
  clipboardItem: { path: string; type: 'copy' | 'cut' } | null;
  setClipboardItem: (path: string, type: 'copy' | 'cut') => void;

  // File Operations
  renameNode: (oldPath: string, newName: string) => Promise<{ success: boolean; error?: string }>;
  deleteNode: (targetPath: string) => Promise<{ success: boolean; error?: string }>;
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
  openTabs: [],
  activeFilePath: null,
  activeFileContent: null,
  theme: (localStorage.getItem('theme') as any) || 'vs-dark',
  isCommandPaletteOpen: false,
  isTerminalOpen: true,
  isSidebarOpen: true,
  cursorPosition: { line: 1, column: 1 },
  autoSave: true,

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
  setSelectedPath: (path) => set({ selectedPath: path }),
  clipboardItem: null,
  setClipboardItem: (path, type) => set({ clipboardItem: { path, type } }),
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
    const { rootPath } = get();
    if (!rootPath) return;
    try {
      const tree = await window.electronAPI.expandDirectory(rootPath);
      if (tree) get().setFileTree(tree, rootPath);
    } catch (err) {
      console.error('Refresh failed', err);
    }
  },

  deleteNode: async (targetPath) => {
    const result = await window.electronAPI.deleteItem(targetPath);
    if (result.success) {
      const { fileTree, activeFilePath, openTabs } = get();
      if (fileTree) {
        set({ fileTree: removeTreeNode(fileTree, targetPath) });
      }
      // Close tab if the deleted file was open
      if (activeFilePath === targetPath || openTabs.find(t => t.path === targetPath)) {
        get().closeFile(targetPath);
      }
    }
    return result;
  },

  pasteNode: async () => {
    const { clipboardItem, selectedPath, rootPath, fileTree } = get();
    if (!clipboardItem || !fileTree) return null;

    let destDir = rootPath || '/';

    // Determine target directory intelligently based on current selection
    if (selectedPath) {
      // Find the node to check if it's a directory
      const findNode = (path: string, node: FileTreeNode | null = fileTree): FileTreeNode | null => {
        if (!node) return null;
        if (node.path === path) return node;
        for (const child of node.children) {
          if (child.path === path) return child;
          if (child.isDirectory && path.startsWith(child.path + '/')) { // Added trailing slash to accurately match prefixes
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
          // Ensure target folder is expanded naturally
          if (!get().expandedFolders.includes(destDir)) {
             set((state) => ({ expandedFolders: [...state.expandedFolders, destDir] }));
          }
        } else {
          // If a file is selected, paste into its parent
          destDir = getParentPath(selectedNode.path);
        }
      }
    }

    const { path: sourcePath, type } = clipboardItem;
    let result;

    if (type === 'copy') {
      result = await window.electronAPI.copyItem(sourcePath, destDir);
    } else {
      result = await window.electronAPI.moveItem(sourcePath, destDir);
      // Automatically clear clipboard after a successful cut
      if (result.success) {
        set({ clipboardItem: null });
      }
    }

    if (result.success) {
      const refreshedDest = await window.electronAPI.refreshDirectory(destDir);
      
      set((state) => {
        let newTree = state.fileTree;
        if (!newTree) return state;
        
        // Optimistically remove the cut item locally to avoid hitting the disk twice
        if (type === 'cut') {
          newTree = removeTreeNode(newTree, sourcePath);
        }

        // Apply the refreshed destination node which includes the pasted file
        if (refreshedDest) {
          newTree = updateTreeNode(newTree, destDir, refreshedDest);
        }
        
        return { fileTree: newTree };
      });

      await get().updateExtensionMap();
    }

    return result;
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
