import React, { useRef, useEffect } from 'react';
import MonacoEditor, { OnMount } from '@monaco-editor/react';
import { useStore } from '../store';
import { Command, Search, Palette, Terminal as TerminalIcon } from 'lucide-react';

export const Editor: React.FC = () => {
  const { activeFileId, files, updateFileContent, theme, setCursorPosition, autoSave } = useStore();
  const editorRef = useRef<any>(null);

  const activeFile = files.find((f) => f.id === activeFileId);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition(e.position.lineNumber, e.position.column);
    });

    // Define custom theme to match our premium UI
    monaco.editor.defineTheme('premium-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { background: '121212' }
      ],
      colors: {
        'editor.background': '#121212',
        'editor.lineHighlightBackground': '#1C1C1C',
        'editorLineNumber.foreground': '#52525B',
        'editorLineNumber.activeForeground': '#A1A1AA',
        'editorCursor.foreground': '#3B82F6',
        'editor.selectionBackground': '#2563EB40',
        'editor.inactiveSelectionBackground': '#2563EB20',
        'editorIndentGuide.background': '#262626',
        'editorIndentGuide.activeBackground': '#3F3F46',
        'editorWidget.background': '#0A0A0A',
        'editorWidget.border': '#262626',
        'editorSuggestWidget.background': '#0A0A0A',
        'editorSuggestWidget.border': '#262626',
        'editorSuggestWidget.selectedBackground': '#3B82F640',
      }
    });

    monaco.editor.setTheme(theme === 'vs-dark' ? 'premium-dark' : theme);
  };

  useEffect(() => {
    if (editorRef.current && window.monaco) {
      window.monaco.editor.setTheme(theme === 'vs-dark' ? 'premium-dark' : theme);
    }
  }, [theme]);

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
      
      if (autoSave) {
        // Debounced save could be implemented here
        fetch('/api/files/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: activeFileId, content: value }),
        });
      }
    }
  };

  if (!activeFile) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-transparent text-[var(--color-text-secondary)] select-none">
        <div className="flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-700">
          <div className="w-32 h-32 mb-10 rounded-[2rem] bg-gradient-to-br from-[var(--color-accent-primary)] via-[var(--color-accent-secondary)] to-pink-500 flex items-center justify-center shadow-[0_20px_60px_-15px_rgba(59,130,246,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md transition-transform duration-700 group-hover:scale-110"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
            <span className="text-6xl font-black text-white tracking-tighter relative z-10 drop-shadow-lg">CW</span>
          </div>
          <h2 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4 tracking-tight">CodeWeaver</h2>
          <p className="text-[15px] text-[var(--color-text-tertiary)] mb-16 font-medium tracking-wide">Select a file to start editing</p>
        </div>
        
        <div className="grid grid-cols-2 gap-x-16 gap-y-6 text-[13px] max-w-lg w-full px-8">
          <div className="flex items-center justify-between group cursor-default">
            <span className="flex items-center gap-3 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors font-medium">
              <Command size={16} className="text-[var(--color-accent-primary)] opacity-70 group-hover:opacity-100 transition-opacity" /> Command Palette
            </span>
            <span className="font-mono text-[11px] font-semibold bg-[var(--color-bg-hover)] px-2.5 py-1.5 rounded-md text-[var(--color-text-tertiary)] border border-[var(--color-border-subtle)] shadow-sm">⌘K</span>
          </div>
          <div className="flex items-center justify-between group cursor-default">
            <span className="flex items-center gap-3 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors font-medium">
              <Search size={16} className="text-[var(--color-accent-primary)] opacity-70 group-hover:opacity-100 transition-opacity" /> Go to File
            </span>
            <span className="font-mono text-[11px] font-semibold bg-[var(--color-bg-hover)] px-2.5 py-1.5 rounded-md text-[var(--color-text-tertiary)] border border-[var(--color-border-subtle)] shadow-sm">⌘P</span>
          </div>
          <div className="flex items-center justify-between group cursor-default">
            <span className="flex items-center gap-3 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors font-medium">
              <Palette size={16} className="text-[var(--color-accent-primary)] opacity-70 group-hover:opacity-100 transition-opacity" /> Toggle Theme
            </span>
            <span className="font-mono text-[11px] font-semibold bg-[var(--color-bg-hover)] px-2.5 py-1.5 rounded-md text-[var(--color-text-tertiary)] border border-[var(--color-border-subtle)] shadow-sm">⌥T</span>
          </div>
          <div className="flex items-center justify-between group cursor-default">
            <span className="flex items-center gap-3 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors font-medium">
              <TerminalIcon size={16} className="text-[var(--color-accent-primary)] opacity-70 group-hover:opacity-100 transition-opacity" /> Toggle Terminal
            </span>
            <span className="font-mono text-[11px] font-semibold bg-[var(--color-bg-hover)] px-2.5 py-1.5 rounded-md text-[var(--color-text-tertiary)] border border-[var(--color-border-subtle)] shadow-sm">⌃`</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden bg-transparent">
      <MonacoEditor
        height="100%"
        language={activeFile.language}
        theme={theme === 'vs-dark' ? 'premium-dark' : theme}
        value={activeFile.content}
        onChange={handleEditorChange}
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
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
      />
    </div>
  );
};
