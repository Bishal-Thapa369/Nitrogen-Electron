import { create } from 'zustand';

export interface File {
  id: string;
  name: string;
  content: string;
  language: string;
  parentId: string | null;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

interface EditorState {
  files: File[];
  folders: Folder[];
  openTabs: string[]; // array of file IDs
  activeFileId: string | null;
  theme: 'vs-dark' | 'light';
  isCommandPaletteOpen: boolean;
  isTerminalOpen: boolean;
  cursorPosition: { line: number; column: number };
  autoSave: boolean;

  // Actions
  setFiles: (files: File[]) => void;
  setFolders: (folders: Folder[]) => void;
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string | null) => void;
  updateFileContent: (fileId: string, content: string) => void;
  setTheme: (theme: 'vs-dark' | 'light') => void;
  toggleCommandPalette: () => void;
  toggleTerminal: () => void;
  setCursorPosition: (line: number, column: number) => void;
  toggleAutoSave: () => void;
  createFile: (name: string, language: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
}

export const useStore = create<EditorState>((set, get) => ({
  files: [],
  folders: [],
  openTabs: [],
  activeFileId: null,
  theme: (localStorage.getItem('theme') as any) || 'vs-dark',
  isCommandPaletteOpen: false,
  isTerminalOpen: true,
  cursorPosition: { line: 1, column: 1 },
  autoSave: true,

  setFiles: (files) => set({ files }),
  setFolders: (folders) => set({ folders }),

  openFile: (fileId) => {
    const { openTabs } = get();
    if (!openTabs.includes(fileId)) {
      set({ openTabs: [...openTabs, fileId] });
    }
    set({ activeFileId: fileId });
  },

  closeFile: (fileId) => {
    const { openTabs, activeFileId } = get();
    const newTabs = openTabs.filter((id) => id !== fileId);
    let newActiveId = activeFileId;
    if (activeFileId === fileId) {
      newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1] : null;
    }
    set({ openTabs: newTabs, activeFileId: newActiveId });
  },

  setActiveFile: (fileId) => set({ activeFileId: fileId }),

  updateFileContent: (fileId, content) => {
    const { files } = get();
    const newFiles = files.map((f) => (f.id === fileId ? { ...f, content } : f));
    set({ files: newFiles });
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),

  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),

  setCursorPosition: (line, column) => set({ cursorPosition: { line, column } }),

  toggleAutoSave: () => set((state) => ({ autoSave: !state.autoSave })),

  createFile: async (name, language) => {
    const response = await fetch('/api/files/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, language }),
    });
    const newFile = await response.json();
    set((state) => ({ files: [...state.files, newFile] }));
    get().openFile(newFile.id);
  },

  deleteFile: async (fileId) => {
    await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
    set((state) => ({
      files: state.files.filter((f) => f.id !== fileId),
      openTabs: state.openTabs.filter((id) => id !== fileId),
      activeFileId: state.activeFileId === fileId ? null : state.activeFileId,
    }));
  },
}));
