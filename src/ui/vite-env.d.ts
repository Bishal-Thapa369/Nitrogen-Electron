/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    openFolderDialog: () => Promise<any>;
    expandDirectory: (dirPath: string) => Promise<any>;
    collapseDirectory: (dirPath: string) => Promise<any>;
    refreshDirectory: (dirPath: string) => Promise<any>;
    getTree: () => Promise<any>;
    readFile: (filePath: string) => Promise<string | null>;
  };
}
