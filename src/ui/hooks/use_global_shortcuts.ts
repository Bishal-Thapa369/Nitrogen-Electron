import { useEffect } from 'react';
import { useStore } from '../../core/state/store';

export const useGlobalShortcuts = () => {
  const { toggleTerminal } = useStore();

  useEffect(() => {
    const handleGlobalKeyDown = async (e: KeyboardEvent) => {
      // Manual Save: Ctrl+S
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        console.log('Manual save triggered');
        // TODO: Implement actual save logic trigger here
      }

      // Toggle Terminal: Ctrl+`
      if ((e.metaKey || e.ctrlKey) && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
      }

      // Toggle Command Palette: Ctrl+Shift+P
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        useStore.getState().toggleCommandPalette();
      }

      // Quick Open: Ctrl+P
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        useStore.getState().toggleQuickOpen();
      }

      // Open Folder Dialog: Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        try {
          const tree = await window.electronAPI.openFolderDialog();
          if (tree) {
            useStore.getState().setFileTree(tree, tree.path);
          }
        } catch (err) {
          console.error('Failed to open folder:', err);
        }
      }

      // Close overlays: Escape
      if (e.key === 'Escape') {
        const state = useStore.getState();
        if (state.isQuickOpenOpen) state.toggleQuickOpen();
        if (state.isCommandPaletteOpen) state.toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toggleTerminal]);
};
