import { useRef, useCallback, useEffect } from 'react';
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
    setCursorPosition,
    updateTabState
  } = useStore();

  const group = editorGroups.find(g => g.id === groupId) || editorGroups[0];
  const { activeFilePath, activeFileContent, openTabs } = group;
  const currentTab = openTabs.find(t => t.path === activeFilePath);
  
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const { defineThemes } = useEditorTheme(editorRef);

  // Sync editor to current tab state
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !activeFilePath) return;
    
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    // 1. Save state of previous model if it exists
    const currentModel = editor.getModel();
    if (currentModel) {
      const prevUri = currentModel.uri.toString();
      // Only save if it's different from the new path
      if (!prevUri.endsWith(activeFilePath.replace(/\\/g, '/'))) {
         const viewState = editor.saveViewState();
         const prevPath = prevUri.replace('file:///', '/'); 
         // Find which group this model belongs to (usually the current one if not split)
         // For simplicity in a single-model-per-editor setup:
         updateTabState(prevPath, { viewState }, groupId);
      }
    }

    // 2. Find or create model for the new path
    const fileUri = monaco.Uri.file(activeFilePath);
    let targetModel = monaco.editor.getModel(fileUri);
    
    if (!targetModel) {
      targetModel = monaco.editor.createModel(
        activeFileContent || '', 
        getLanguage(activeFilePath), 
        fileUri
      );
    }

    // 3. Set the model
    editor.setModel(targetModel);

    // 4. Restore view state OR default to line 1
    if (currentTab?.viewState) {
      editor.restoreViewState(currentTab.viewState);
    } else if (currentTab?.cursorPosition) {
       editor.setPosition({ 
         lineNumber: currentTab.cursorPosition.line, 
         column: currentTab.cursorPosition.column 
       });
       editor.revealLineInCenter(currentTab.cursorPosition.line);
    } else {
       editor.setPosition({ lineNumber: 1, column: 1 });
       editor.revealLine(1);
    }

    editor.focus();
  }, [activeFilePath, groupId, activeFileContent]);

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    (window as any).monaco = monaco;

    defineThemes(monaco);
    monaco.editor.setTheme(theme === 'vs-dark' ? 'premium-dark' : theme);

    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition(e.position.lineNumber, e.position.column);
      
      // Update per-tab cursor position for persistence
      if (activeFilePath) {
        updateTabState(activeFilePath, { 
          cursorPosition: { line: e.position.lineNumber, column: e.position.column } 
        }, groupId);
      }
    });

    // Save view state on blur for extra safety
    editor.onDidBlurEditorText(() => {
      if (activeFilePath) {
        const viewState = editor.saveViewState();
        updateTabState(activeFilePath, { viewState }, groupId);
      }
    });

    console.log(`Nitrogen Editor Core [${groupId}]: Mounted`, activeFilePath);
  }, [theme, setCursorPosition, activeFilePath, defineThemes, groupId, updateTabState]);

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

