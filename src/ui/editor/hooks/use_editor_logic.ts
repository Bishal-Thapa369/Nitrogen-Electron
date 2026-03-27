import { useRef, useCallback } from 'react';
import { OnMount } from '@monaco-editor/react';
import { useStore } from '../../../core/state/store';
import { useEditorTheme } from './use_editor_theme';
import { getLanguage } from '../utils/language_map';

/**
 * Main logic orchestrator for the Monaco editor
 */
export const useEditorLogic = () => {
  const { 
    activeFilePath, 
    activeFileContent, 
    theme, 
    isSplitScreen,
    setCursorPosition 
  } = useStore();
  
  const editorRef = useRef<any>(null);
  const { defineThemes } = useEditorTheme(editorRef);

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    (window as any).monaco = monaco;

    // Define premium themes
    defineThemes(monaco);
    
    // Set theme initially
    monaco.editor.setTheme(theme === 'vs-dark' ? 'premium-dark' : theme);

    // Track cursor position
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition(e.position.lineNumber, e.position.column);
    });

    // Potential syntax offloading hook point for Phase 3
    console.log('Nitrogen Editor Core: Mounted file', activeFilePath);
  }, [theme, setCursorPosition, activeFilePath, defineThemes]);

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
