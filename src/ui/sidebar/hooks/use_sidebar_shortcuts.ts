import { useEffect } from 'react';
import { useStore } from '../../../core/state/store';

export const useSidebarShortcuts = () => {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input field
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const state = useStore.getState();
      
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c' && state.selectedPaths.length > 0) {
          state.setClipboardItems(state.selectedPaths, 'copy');
        } else if (e.key === 'x' && state.selectedPaths.length > 0) {
          state.setClipboardItems(state.selectedPaths, 'cut');
        } else if (e.key === 'v') {
          state.pasteNode();
        } else if (e.key === 'a') {
          e.preventDefault();
          state.selectAll();
        } else if (e.key === 'd' && state.selectedPaths.length > 0) {
          e.preventDefault();
          state.selectedPaths.forEach(p => state.duplicateNode(p));
        }
      } else if (e.key === 'Delete' && state.selectedPaths.length > 0) {
        state.deleteNodesBulk(state.selectedPaths);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);
};
