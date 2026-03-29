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

export interface SearchResult {
  path: string;
  fileName: string;
  line: number;
  context: string;
}

export interface TerminalTab {
  id: string;
  title: string;
  sessionId: number | null;
}

export interface Tab {
  path: string;
  name: string;
  isDirty?: boolean;
  cursorPosition?: { line: number; column: number };
  viewState?: any; // Monaco's ICodeEditorViewState
}

export interface EditorGroup {
  id: string;
  openTabs: Tab[];
  activeFilePath: string | null;
  activeFileContent: string | null;
}

export interface EditorState {
  // File Tree (from C++ backend)
  fileTree: FileTreeNode | null;
  rootPath: string | null;
  expandedFolders: string[];  // Set of expanded directory paths
  extensionMap: Record<number, string>; // Maps C++ typeId to string extension
  
  // Sidebar View Control
  sidebarView: 'explorer' | 'search';
  
  // Persistent Search State
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  
  // Focus & Context Control
  focusContext: 'editor' | 'sidebar' | 'terminal' | 'palette' | null;

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
  isQuickOpenOpen: boolean;
  isSplitScreen: boolean;
  
  // God-Mode Navigation & Search Index
  recentPaths: string[];      // Navigation history (ordered by recency)
  fullFileIndex: { path: string; name: string }[]; // Flat recursive project index

  // Terminal Multi-Tab State
  terminals: TerminalTab[];
  activeTerminalId: string | null;
  isTerminalMaximized: boolean;

  // Status Bar Modular State
  indentSize: number;
  insertSpaces: boolean;
  encoding: 'UTF-8' | 'UTF-16' | 'Windows-1252';
  eol: 'LF' | 'CRLF';
  readOnly: boolean;
  gitStatus: { branch: string; staged: number; unstaged: number } | null;
  backgroundTasks: { id: string; name: string; status: 'running' | 'done' }[];
  appMetrics: { totalMB: number; processes: { name: string; memoryMB: number; pid: number }[] } | null;

  // Actions
  setFileTree: (tree: FileTreeNode | null, rootPath: string | null) => void;
  updateExtensionMap: () => Promise<void>;
  updateNode: (path: string, updatedNode: FileTreeNode) => Promise<void>;
  toggleFolder: (dirPath: string) => void;
  openFile: (filePath: string, fileName: string, groupId?: string) => void;
  closeFile: (filePath: string, groupId?: string) => void;
  setActiveFile: (filePath: string | null, groupId?: string) => void;
  setActiveFileContent: (content: string | null, groupId?: string) => void;
  setFileDirty: (filePath: string, isDirty: boolean, groupId?: string) => void;
  setActiveGroup: (groupId: string) => void;
  updateTabState: (path: string, tabState: Partial<Tab>, groupId?: string) => void;

  setTheme: (theme: 'vs-dark' | 'light') => void;
  toggleCommandPalette: () => void;
  toggleQuickOpen: () => void;
  toggleTerminal: () => void;
  toggleSidebar: () => void;
  setCursorPosition: (line: number, column: number) => void;
  toggleAutoSave: () => void;
  toggleSplitScreen: () => void;
  closeOtherFiles: (filePath: string, groupId?: string) => void;
  closeAllFiles: (groupId?: string) => void;
  setFocusContext: (context: 'editor' | 'sidebar' | 'terminal' | 'palette' | null) => void;
  setSidebarView: (view: 'explorer' | 'search') => void;

  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setIsSearching: (isSearching: boolean) => void;

  // Explorer Selection & Clipboard
  selectedPath: string | null;
  selectedPaths: string[];
  navigationFocusPath: string | null;
  setSelectedPath: (path: string | null, multi?: boolean) => void;
  setNavigationFocusPath: (path: string | null) => void;
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
  setFullFileIndex: (files: { path: string; name: string }[]) => void;
  addToRecentPaths: (path: string) => void;

  // Terminal Actions
  addTerminal: (title?: string) => void;
  removeTerminal: (id: string) => void;
  setActiveTerminal: (id: string) => void;
  updateTerminalTitle: (id: string, title: string) => void;
  setTerminalSessionId: (terminalId: string, sessionId: number) => void;
  killAllTerminals: () => void;
  toggleTerminalMaximize: () => void;

  // Status Bar Actions
  setIndentOptions: (size: number, spaces: boolean) => void;
  setEncoding: (encoding: 'UTF-8' | 'UTF-16' | 'Windows-1252') => void;
  setEol: (eol: 'LF' | 'CRLF') => void;
  setReadOnly: (readOnly: boolean) => void;
  setGitStatus: (status: { branch: string; staged: number; unstaged: number } | null) => void;
  addBackgroundTask: (id: string, name: string) => void;
  removeBackgroundTask: (id: string) => void;
  setAppMetrics: (metrics: { totalMB: number; processes: { name: string; memoryMB: number; pid: number }[] } | null) => void;
}
