import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { EmptyEditor } from './components/empty_editor';
import { useEditorLogic } from './hooks/use_editor_logic';

/**
 * Nitrogen Editor (Optimized Architectural Shell)
 * The main display layer for text manipulation, offloading all calculation
 * logic to the C++ core while maintaining a premium React/Monaco skin.
 */
export const Editor: React.FC = () => {
  const { 
    activeFilePath, 
    activeFileContent, 
    editorLanguage, 
    editorTheme, 
    handleEditorDidMount 
  } = useEditorLogic();

  // Show premium empty state if no file is selected
  if (!activeFilePath || activeFileContent === null) {
    return <EmptyEditor />;
  }

  return (
    <div className="h-full w-full overflow-hidden bg-transparent">
      <MonacoEditor
        height="100%"
        language={editorLanguage}
        theme={editorTheme}
        value={activeFileContent}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true, scale: 0.75, renderCharacters: false },
          fontSize: 14,
          fontFamily: 'var(--font-mono)',
          fontLigatures: true,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 24, bottom: 24 },
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          readOnly: true, // Read-only for Phase 1/2 until C++ Piece Table is functional
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          // Selection styling
          selectionHighlight: true,
          links: true,
          contextmenu: true,
          mouseWheelZoom: true,
          // Defaulting quickSuggestions

        }}
      />
    </div>
  );
};
