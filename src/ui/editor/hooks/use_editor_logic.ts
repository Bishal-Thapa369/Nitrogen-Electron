import { useRef, useCallback } from 'react';
import { OnMount } from '@monaco-editor/react';
import { useStore } from '../../../core/state/store';
import { useEditorTheme } from './use_editor_theme';
import { getLanguage } from '../utils/language_map';

/**
 * Main logic orchestrator for the Monaco editor for a specific Group
 */
export const useEditorLogic = (groupId: string = 'primary') => {
  const { 
    editorGroups,
    theme, 
    isSplitScreen,
    setCursorPosition 
  } = useStore();

  const group = editorGroups.find(g => g.id === groupId) || editorGroups[0];
  const { activeFilePath, activeFileContent } = group;
  
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

    console.log(`Nitrogen Editor Core [${groupId}]: Mounted`, activeFilePath);
  }, [theme, setCursorPosition, activeFilePath, defineThemes, groupId]);

  const editorLanguage = activeFilePath ? getLanguage(activeFilePath) : 'plaintext';
  const editorTheme = theme === 'vs-dark' ? 'premium-dark' : theme;

  return {
    activeFilePath,
    activeFileContent,
    editorLanguage,
    editorTheme,
    handleEditorDidMount,
    editorRef,
    isSplitScreen
  };
};

