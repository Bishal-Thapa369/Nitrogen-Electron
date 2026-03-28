import { useEffect, useCallback } from 'react';
import { useStore } from '../../../core/state/store';

/**
 * useEditorShortcuts
 * Global keyboard listener to map system keys to editor actions.
 */
export const useEditorShortcuts = (
  editorRef: React.MutableRefObject<any>,
  actions: { 
    handleSave: () => void; 
    handleSaveAs: () => void;
    handleUndo: () => void;
    handleRedo: () => void;
  }
) => {
  const { handleSave, handleSaveAs, handleUndo, handleRedo } = actions;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const { focusContext } = useStore.getState();
      if (focusContext !== 'editor') return;

      if (!editorRef.current) return;

      const isModifier = e.ctrlKey || e.metaKey;

      if (isModifier) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            if (e.shiftKey) {
              handleSaveAs();
            } else {
              handleSave();
            }
            break;
          
          case 'f':
            e.preventDefault();
            editorRef.current.trigger('keyboard', 'actions.find', null);
            break;

          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;

          case 'y':
            e.preventDefault();
            handleRedo();
            break;

          case 'a':
            // Monaco handles this but prevent default to be safe
            break;
          
          default:
            break;
        }
      }
    },
    [editorRef, handleSave, handleSaveAs, handleUndo, handleRedo]
  );

  useEffect(() => {
    // We attach to the window for global shortcuts while the editor is mounted
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
