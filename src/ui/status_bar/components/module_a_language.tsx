import React from 'react';
import { useStore } from '../../../core/state/store';

export const LanguageSwitcher: React.FC = () => {
  const { editorGroups, activeGroupId, toggleCommandPalette } = useStore();
  const activeGroup = editorGroups.find(g => g.id === activeGroupId) || editorGroups[0];
  const activeFilePath = activeGroup?.activeFilePath;

  const getLanguageLabel = (filePath: string | null): string => {
    if (!filePath) return 'Plain Text';
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) return 'TypeScript';
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) return 'JavaScript';
    if (filePath.endsWith('.html')) return 'HTML';
    if (filePath.endsWith('.css')) return 'CSS';
    if (filePath.endsWith('.json')) return 'JSON';
    if (filePath.endsWith('.md')) return 'Markdown';
    if (filePath.endsWith('.py')) return 'Python';
    if (filePath.endsWith('.cpp')) return 'C++';
    if (filePath.endsWith('.hpp') || filePath.endsWith('.h')) return 'C++ Header';
    return 'Plain Text';
  };

  return (
    <div 
      onClick={toggleCommandPalette}
      className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200 text-[var(--color-accent-secondary)]"
      title="Switch Language Mode"
    >
      {getLanguageLabel(activeFilePath)}
    </div>
  );
};
