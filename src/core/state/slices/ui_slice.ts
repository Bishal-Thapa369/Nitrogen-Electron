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
});
