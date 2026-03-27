import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { EmptyEditor } from './components/empty_editor';
import { useEditorLogic } from './hooks/use_editor_logic';
import { useStore } from '../../core/state/store';
import { Tabs } from '../tabs/tabs';
import { cn } from '../utils/cn';

/**
 * Editor Group View
 * Represents a single pane in the multi-split architecture
 */
const EditorGroupView: React.FC<{ groupId: string; isOnly: boolean }> = ({ groupId, isOnly }) => {
  const { 
    activeFilePath, 
    activeFileContent, 
    editorLanguage, 
    editorTheme, 
    handleEditorDidMount 
  } = useEditorLogic(groupId);

  const { activeGroupId, setActiveGroup } = useStore();
  const isActive = activeGroupId === groupId;

  const monacoOptions = {
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
    mouseWheelZoom: true,
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-full overflow-hidden transition-all duration-300",
        !isOnly && "border-r border-[var(--color-border-subtle)] focus-within:ring-1 focus-within:ring-[var(--color-accent-blue)]/30",
        !isActive && "opacity-95"
      )}
      style={{ flex: 1 }}
      onClick={() => setActiveGroup(groupId)}
    >
      <Tabs groupId={groupId} />
      
      <div className="flex-1 relative">
        {activeFilePath ? (
          <MonacoEditor
            height="100%"
            language={editorLanguage}
            value={activeFileContent || ''}
            theme={editorTheme}
            options={monacoOptions}
            onMount={handleEditorDidMount}
          />
        ) : (
          <EmptyEditor />
        )}
      </div>
    </div>
  );
};

/**
 * Nitrogen Editor Orchestrator
 * Supports Dynamic Multi-Group Split Panes (VS Code Style)
 */
export const Editor: React.FC = () => {
  const { editorGroups } = useStore();

  return (
    <div className="flex h-full w-full bg-[var(--color-bg-primary)] overflow-hidden">
      {editorGroups.map((group) => (
        <EditorGroupView 
          key={group.id} 
          groupId={group.id} 
          isOnly={editorGroups.length === 1}
        />
      ))}
    </div>
  );
};
