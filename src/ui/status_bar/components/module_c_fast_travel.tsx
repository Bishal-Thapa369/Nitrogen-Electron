import React from 'react';
import { useStore } from '../../../core/state/store';

export const FastTravelHub: React.FC = () => {
  const { cursorPosition, toggleCommandPalette } = useStore();

  return (
    <div 
      onClick={toggleCommandPalette}
      className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200 font-mono"
      title="Go to Line/Col (Ctrl+G)"
    >
      Ln {cursorPosition.line}, Col {cursorPosition.column}
    </div>
  );
};
