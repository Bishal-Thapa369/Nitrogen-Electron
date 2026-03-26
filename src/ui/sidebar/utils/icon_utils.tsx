import React from 'react';
import { Folder, FileCode } from 'lucide-react';

// Algorithmic Icon Assignment (No Hardcoding)
export const FILE_COLORS = [
  '#38bdf8', '#facc15', '#60a5fa', '#4ade80', '#94a3b8', 
  '#f472b6', '#fb923c', '#34d399', '#c084fc', '#fde047',
  '#818cf8', '#2dd4bf', '#a78bfa', '#f87171', '#fb7185',
  '#e879f9', '#22d3ee', '#86efac', '#fca5a5', '#d8b4fe'
];

export const getIconByType = (typeId: number | undefined, isDirectory: boolean) => {
  if (isDirectory || typeId === 1) {
    return <Folder size={14} strokeWidth={2} className="text-[var(--color-accent-primary)]" />;
  }
  
  if (typeId === undefined || typeId === 0) {
    return <FileCode size={14} className="text-[var(--color-text-tertiary)]" />;
  }

  const colorIndex = typeId % FILE_COLORS.length;
  const assignedColor = FILE_COLORS[colorIndex];

  return <FileCode size={14} style={{ color: assignedColor }} />;
};
