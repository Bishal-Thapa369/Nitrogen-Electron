/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    openFolderDialog: () => Promise<any>;
    expandDirectory: (dirPath: string) => Promise<any>;
    collapseDirectory: (dirPath: string) => Promise<any>;
    refreshDirectory: (dirPath: string, force?: boolean) => Promise<any>;
    getTree: () => Promise<any>;
    getExtensions: () => Promise<Record<string, string>>;
    // File Operations (Content)
    saveFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
    saveFileAs: (content: string, defaultPath: string) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>;
    searchAll: (query: string, rootPath: string) => Promise<Array<{ path: string; fileName: string; line: number; context: string }>>;
    readFile: (filePath: string) => Promise<string | null>;

    // File Operations
    renameItem: (oldPath: string, newName: string) => Promise<{ success: boolean; newPath?: string; error?: string }>;
    deleteItem: (targetPath: string) => Promise<{ success: boolean; error?: string }>;
    deleteItemsBulk: (targetPaths: string[]) => Promise<{ success: boolean; error?: string }>;
    createFile: (parentDir: string, fileName: string) => Promise<{ success: boolean; newPath?: string; error?: string }>;
    createFolder: (parentDir: string, folderName: string) => Promise<{ success: boolean; newPath?: string; error?: string }>;
    revealItem: (targetPath: string) => Promise<{ success: boolean; error?: string }>;
    copyPath: (targetPath: string) => Promise<{ success: boolean; error?: string }>;
    copyItem: (sourcePath: string, destDir: string) => Promise<{ success: boolean; newPath?: string; error?: string }>;
    moveItem: (sourcePath: string, destDir: string) => Promise<{ success: boolean; newPath?: string; error?: string }>;
    unmarkForDeletionBulk: (targetPaths: string[]) => Promise<boolean>;
    clearDeletionBlacklist: () => Promise<boolean>;

    // Terminal (High-Performance C++ Backend)
    terminalSpawn: (rows: number, cols: number) => Promise<number>;
    terminalWrite: (id: number, data: string) => void;
    terminalResize: (id: number, rows: number, cols: number) => void;
    terminalKill: (id: number) => void;
    onTerminalData: (callback: (payload: {id: number; data: string}) => void) => () => void;
    getAllFiles?: (rootPath: string) => Promise<any[]>;
  };
}

