import { StateCreator } from 'zustand';
import { EditorState } from '../types';

export const createUISlice: StateCreator<EditorState, [], [], Partial<EditorState>> = (set) => ({
  theme: (localStorage.getItem('theme') as any) || 'vs-dark',
  isCommandPaletteOpen: false,
  isTerminalOpen: true,
  isSidebarOpen: true,
  autoSave: true,

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleAutoSave: () => set((state) => ({ autoSave: !state.autoSave })),
});
