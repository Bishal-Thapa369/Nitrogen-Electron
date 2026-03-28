import { useCallback } from 'react';
import { useStore } from '../../../core/state/store';

/**
 * useEditorActions
 * Specialized hook for content persistence and history manipulation.
 */
export const useEditorActions = (editorRef: React.MutableRefObject<any>, groupId: string = 'primary') => {
  const { 
    setFileDirty, 
    openFile, 
    editorGroups 
  } = useStore();

  const group = editorGroups.find(g => g.id === groupId) || editorGroups[0];
  const { activeFilePath } = group;

  // ── Save ──────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!editorRef.current || !activeFilePath) return;

    const content = editorRef.current.getValue();
    const result = await window.electronAPI.saveFile(activeFilePath, content);

    if (result.success) {
      setFileDirty(activeFilePath, false, groupId);
      console.log('File Saved:', activeFilePath);
    } else {
      console.error('Save Failed:', result.error);
    }
  }, [activeFilePath, editorRef, setFileDirty, groupId]);

  // ── Save As ───────────────────────────────────────────────
  const handleSaveAs = useCallback(async () => {
    if (!editorRef.current) return;

    const content = editorRef.current.getValue();
    const result = await window.electronAPI.saveFileAs(content, activeFilePath || '');

    if (result.success && result.filePath) {
      // Open the newly saved file
      const fileName = result.filePath.split(/[\\/]/).pop() || 'untitled';
      openFile(result.filePath, fileName, groupId);
      setFileDirty(result.filePath, false, groupId);
      console.log('File Saved As:', result.filePath);
    }
  }, [activeFilePath, editorRef, openFile, setFileDirty, groupId]);

  // ── Undo / Redo ───────────────────────────────────────────
  const handleUndo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo', null);
    }
  }, [editorRef]);

  const handleRedo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo', null);
    }
  }, [editorRef]);

  return {
    handleSave,
    handleSaveAs,
    handleUndo,
    handleRedo
  };
};
