import { useEffect } from 'react';
import { useStore } from '../../../core/state/store';

/**
 * Premium Monaco Theme Engine
 * Defines the Nitrogen dark theme and handles theme switching
 */
export const useEditorTheme = (editorRef: React.MutableRefObject<any>) => {
  const { theme } = useStore();

  const defineThemes = (monaco: any) => {
    monaco.editor.defineTheme('premium-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { background: '121212' },
        { token: 'comment', foreground: '#52525B', fontStyle: 'italic' },
        { token: 'keyword', foreground: '#3B82F6', fontStyle: 'bold' },
        { token: 'string', foreground: '#10B981' },
        { token: 'number', foreground: '#F59E0B' },
        { token: 'type', foreground: '#8B5CF6' },
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
        'editorGroupHeader.tabsBackground': '#0A0A0A',
        'editorPane.background': '#121212',
      }
    });
  };

  useEffect(() => {
    if (editorRef.current && (window as any).monaco) {
      const monaco = (window as any).monaco;
      monaco.editor.setTheme(theme === 'vs-dark' ? 'premium-dark' : theme);
    }
  }, [theme, editorRef]);

  return { defineThemes };
};
