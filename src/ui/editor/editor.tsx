import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useStore } from '../../core/state/store';
import { EmptyEditor } from './components/empty_editor';
import { useEditorLogic } from './hooks/use_editor_logic';
import { useEditorActions } from './hooks/use_editor_actions';
import { useEditorShortcuts } from './hooks/use_editor_shortcuts';
import { cn } from '../utils/cn';

/**
 * Nitrogen Editor (Optimized Architectural Shell)
 * The main display layer for text manipulation, offloading all calculation
 * logic to the C++ core while maintaining a premium React/Monaco skin.
 */
/**
 * Nitrogen Editor (Optimized Architectural Shell)
 */
export const Editor: React.FC<{ groupId?: string }> = ({ groupId = 'primary' }) => {
  const { 
    activeFilePath, 
    activeFileContent, 
    editorLanguage, 
    editorTheme, 
    handleEditorDidMount,
    editorRef
  } = useEditorLogic(groupId);
  
  const actions = useEditorActions(editorRef, groupId);
  useEditorShortcuts(editorRef, actions);

  const { setActiveGroup, activeGroupId, setFileDirty, setFocusContext } = useStore();
  const isFocused = activeGroupId === groupId;

  // Show premium empty state if no file is selected
  if (!activeFilePath || activeFileContent === null) {
    return (
      <div 
        className="h-full w-full" 
        onClick={() => {
          setActiveGroup(groupId);
          setFocusContext('editor');
        }}
      >
        <EmptyEditor />
      </div>
    );
  }

  const editorOptions = {
    minimap: { enabled: true, scale: 0.75, renderCharacters: false },
    fontSize: 14,
    fontFamily: 'var(--font-mono)',
    fontLigatures: true,
    wordWrap: 'on' as any,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    padding: { top: 24, bottom: 24 },
    lineNumbers: 'on' as any,
    renderLineHighlight: 'all' as any,
    cursorBlinking: 'smooth' as any,
    cursorSmoothCaretAnimation: 'on' as any,
    smoothScrolling: true,
    readOnly: false,
    scrollbar: {
      vertical: 'visible' as any,
      horizontal: 'visible' as any,
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    selectionHighlight: true,
    links: true,
    contextmenu: true,
    mouseWheelZoom: true,
  };

  return (
    <div 
      className={cn(
        "h-full w-full overflow-hidden bg-transparent transition-opacity duration-300",
        !isFocused ? "opacity-90" : "opacity-100"
      )}
      onClick={() => {
        setActiveGroup(groupId);
        setFocusContext('editor');
      }}
    >
      <MonacoEditor
        height="100%"
        language={editorLanguage}
        theme={editorTheme}
        value={activeFileContent}
        onMount={handleEditorDidMount}
        onChange={() => activeFilePath && setFileDirty(activeFilePath, true, groupId)}
        options={editorOptions}
      />
    </div>
  );
};
