import { StateCreator } from 'zustand';
import { EditorState } from '../types';

export const createUISlice: StateCreator<EditorState, [], [], Partial<EditorState>> = (set) => ({
  theme: (localStorage.getItem('theme') as any) || 'vs-dark',
  isCommandPaletteOpen: false,
  isTerminalOpen: true,
  isSidebarOpen: true,
  isQuickOpenOpen: false,
  autoSave: true,
  recentPaths: [],
  fullFileIndex: [],
  
  terminals: [],
  activeTerminalId: null,

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  toggleQuickOpen: () => set((state) => ({ isQuickOpenOpen: !state.isQuickOpenOpen })),
  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
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

  // Multi-Tab Terminal Actions
  addTerminal: (id, name = 'bash') => set((state) => ({
    terminals: [...state.terminals, { id, name, isProcessing: false }],
    activeTerminalId: id,
    isTerminalOpen: true, // Ensure panel is open when a new terminal spawns
  })),

  removeTerminal: (id) => set((state) => {
    const newTerminals = state.terminals.filter(t => t.id !== id);
    let newActiveId = state.activeTerminalId;

    if (state.activeTerminalId === id) {
      // If we close the active terminal, pick the last available one
      newActiveId = newTerminals.length > 0 ? newTerminals[newTerminals.length - 1].id : null;
    }

    return { 
      terminals: newTerminals,
      activeTerminalId: newActiveId,
      // Optional: Auto-close terminal panel if last terminal is removed
      // isTerminalOpen: newTerminals.length > 0 ? state.isTerminalOpen : false 
    };
  }),

  setActiveTerminal: (id) => set({ activeTerminalId: id }),

  renameTerminal: (id, newName) => set((state) => ({
    terminals: state.terminals.map(t => t.id === id ? { ...t, name: newName } : t)
  })),

  setTerminalProcessing: (id, isProcessing) => set((state) => ({
    terminals: state.terminals.map(t => t.id === id ? { ...t, isProcessing } : t)
  })),
});
