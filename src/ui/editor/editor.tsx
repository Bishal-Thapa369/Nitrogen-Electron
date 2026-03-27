import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { EmptyEditor } from './components/empty_editor';
import { useEditorLogic } from './hooks/use_editor_logic';
import { cn } from '../utils/cn';

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
    handleEditorDidMount,
    isSplitScreen
  } = useEditorLogic();

  // Show premium empty state if no file is selected
  if (!activeFilePath || activeFileContent === null) {
    return <EmptyEditor />;
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
    readOnly: true,
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
    <div className={cn(
      "h-full w-full overflow-hidden bg-transparent",
      isSplitScreen ? "flex gap-[1px] bg-[var(--color-border-subtle)]" : ""
    )}>
      {/* Primary Editor */}
      <div className={cn("h-full", isSplitScreen ? "w-1/2 bg-[var(--color-bg-surface)]" : "w-full")}>
        <MonacoEditor
          height="100%"
          language={editorLanguage}
          theme={editorTheme}
          value={activeFileContent}
          onMount={handleEditorDidMount}
          options={editorOptions}
        />
      </div>

      {/* Split Secondary Editor */}
      {isSplitScreen && (
        <div className="h-full w-1/2 bg-[var(--color-bg-surface)]">
          <MonacoEditor
            height="100%"
            language={editorLanguage}
            theme={editorTheme}
            value={activeFileContent}
            onMount={handleEditorDidMount}
            options={editorOptions}
          />
        </div>
      )}
    </div>
  );
};
