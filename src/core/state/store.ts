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
  setCursorPosition: (line: number, column: number) => void;
  toggleAutoSave: () => void;
}

// Deep-update a node within the tree by path
function updateTreeNode(node: FileTreeNode, targetPath: string, updatedNode: FileTreeNode): FileTreeNode {
  if (node.path === targetPath) return updatedNode;
  if (!node.isDirectory) return node;

  return {
    ...node,
    children: node.children.map(child => {
      if (child.isDirectory && targetPath.startsWith(child.path)) {
        return updateTreeNode(child, targetPath, updatedNode);
      }
      return child;
    }),
  };
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
  cursorPosition: { line: 1, column: 1 },
  autoSave: true,

  setFileTree: (tree, rootPath) => {
    set({ fileTree: tree, rootPath, expandedFolders: [] });
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
  setCursorPosition: (line, column) => set({ cursorPosition: { line, column } }),
  toggleAutoSave: () => set((state) => ({ autoSave: !state.autoSave })),
}));
