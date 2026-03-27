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

export interface EditorState {
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
