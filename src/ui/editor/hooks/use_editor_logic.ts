import { useRef, useCallback, useEffect } from 'react';
import { OnMount } from '@monaco-editor/react';
import { useStore } from '../../../core/state/store';
import { useEditorTheme } from './use_editor_theme';
import { getLanguage } from '../utils/language_map';

/**
 * Main logic orchestrator for the Monaco editor
 */
export const useEditorLogic = (groupId?: string) => {
  const { 
    editorGroups,
    activeGroupId,
    activeFileContent, 
    theme, 
    setCursorPosition,
    setActiveFileContent
  } = useStore();
  
  const currentGroup = editorGroups.find(g => g.id === (groupId || activeGroupId)) || editorGroups[0];
  const activeFilePath = currentGroup.activeFilePath;

  const editorRef = useRef<any>(null);
  const { defineThemes } = useEditorTheme(editorRef);

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    (window as any).monaco = monaco;

    defineThemes(monaco);
    monaco.editor.setTheme(theme === 'vs-dark' ? 'premium-dark' : theme);

    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition(e.position.lineNumber, e.position.column);
    });
  }, [theme, setCursorPosition, defineThemes]);

  // Synchronize content for this specific group when activeFilePath changes
  useEffect(() => {
    if (activeFilePath) {
      window.electronAPI.readFile(activeFilePath).then(content => {
        if (content !== null) setActiveFileContent(content);
      });
    }
  }, [activeFilePath, setActiveFileContent]);

  const editorLanguage = activeFilePath ? getLanguage(activeFilePath) : 'plaintext';
  const editorTheme = theme === 'vs-dark' ? 'premium-dark' : theme;

  return {
    activeFilePath,
    activeFileContent,
    editorLanguage,
    editorTheme,
    handleEditorDidMount,
    editorRef
  };
};
