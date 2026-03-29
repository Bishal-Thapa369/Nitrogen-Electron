import React from 'react';
import { useStore } from '../../../core/state/store';

export const IndentationEngine: React.FC = () => {
  const { indentSize, insertSpaces, setIndentOptions } = useStore();

  const handleToggle = () => {
    // Simple toggle between 2 and 4 for now, could open a popup later
    const nextSize = indentSize === 2 ? 4 : 2;
    setIndentOptions(nextSize, insertSpaces);
  };

  return (
    <div 
      onClick={handleToggle}
      className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200"
      title="Change Indentation Settings"
    >
      {insertSpaces ? 'Spaces' : 'Tabs'}: {indentSize}
    </div>
  );
};
