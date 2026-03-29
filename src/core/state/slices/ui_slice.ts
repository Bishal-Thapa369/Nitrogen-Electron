import { StateCreator } from 'zustand';
import { EditorState } from '../types';

export const createUISlice: StateCreator<EditorState, [], [], Partial<EditorState>> = (set) => ({
  theme: (localStorage.getItem('theme') as any) || 'vs-dark',
  isCommandPaletteOpen: false,
  isTerminalOpen: false,
  isSidebarOpen: true,
  isQuickOpenOpen: false,
  autoSave: true,
  recentPaths: [],
  fullFileIndex: [],
  terminals: [{ id: 'term-default', title: 'bash', sessionId: null }],
  activeTerminalId: 'term-default',
  isTerminalMaximized: false,

  // Status Bar Modular State
  indentSize: 2,
  insertSpaces: true,
  encoding: 'UTF-8',
  eol: 'LF',
  readOnly: false,
  gitStatus: null,
  backgroundTasks: [],
  appMetrics: null,

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  toggleQuickOpen: () => set((state) => ({ isQuickOpenOpen: !state.isQuickOpenOpen })),
  toggleTerminal: () => set((state) => {
    const nextOpen = !state.isTerminalOpen;
    // If opening the panel and no terminals exist (e.g. after a Kill All), spawn one
    if (nextOpen && state.terminals.length === 0) {
      const id = `term-${Math.random().toString(36).substr(2, 9)}`;
      return { 
        isTerminalOpen: nextOpen,
        terminals: [{ id, title: 'bash', sessionId: null }],
        activeTerminalId: id
      };
    }
    return { isTerminalOpen: nextOpen };
  }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleAutoSave: () => set((state) => ({ autoSave: !state.autoSave })),
  
  setFullFileIndex: (files) => set({ fullFileIndex: files }),
  
  addToRecentPaths: (path) => set((state) => {
    // Only add if not already at the top
    if (state.recentPaths[0] === path) return state;
    
    const nextPaths = [
      path, 
      ...state.recentPaths.filter(p => p !== path)
    ].slice(0, 15); // Keep history focused
    
    return { recentPaths: nextPaths };
  }),

  addTerminal: (title) => set((state) => {
    const id = `term-${Date.now()}`;
    const newTerminal = { id, title: title || 'bash', sessionId: null };
    return {
      terminals: [...state.terminals, newTerminal],
      activeTerminalId: id
    };
  }),

  removeTerminal: (id) => set((state) => {
    const nextTerminals = state.terminals.filter((t) => t.id !== id);
    let nextActiveId = state.activeTerminalId;
    
    if (state.activeTerminalId === id) {
      nextActiveId = nextTerminals.length > 0 ? nextTerminals[nextTerminals.length - 1].id : null;
    }
    
    return {
      terminals: nextTerminals,
      activeTerminalId: nextActiveId
    };
  }),

  setActiveTerminal: (id) => set({ activeTerminalId: id }),

  updateTerminalTitle: (id, title) => set((state) => ({
    terminals: state.terminals.map((t) => (t.id === id ? { ...t, title } : t))
  })),

  setTerminalSessionId: (id, sessionId) => set((state) => ({
    terminals: state.terminals.map((t) => (t.id === id ? { ...t, sessionId } : t))
  })),

  killAllTerminals: () => set({
    terminals: [],
    activeTerminalId: null,
    isTerminalOpen: false
  }),

  toggleTerminalMaximize: () => set((state) => ({ isTerminalMaximized: !state.isTerminalMaximized })),

  // Status Bar Actions
  setIndentOptions: (size, spaces) => set({ indentSize: size, insertSpaces: spaces }),
  setEncoding: (encoding) => set({ encoding }),
  setEol: (eol) => set({ eol }),
  setReadOnly: (readOnly) => set({ readOnly }),
  setGitStatus: (status) => set({ gitStatus: status }),
  addBackgroundTask: (id, name) => set((state) => ({
    backgroundTasks: [...state.backgroundTasks, { id, name, status: 'running' }]
  })),
  removeBackgroundTask: (id) => set((state) => ({
    backgroundTasks: state.backgroundTasks.filter((t) => t.id !== id)
  })),
  setAppMetrics: (metrics) => set({ appMetrics: metrics }),
});
