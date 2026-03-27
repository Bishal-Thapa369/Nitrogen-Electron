import React from 'react';
import { Tabs } from '../tabs/tabs';
import { Editor } from './editor';
import { useStore } from '../../core/state/store';
import { cn } from '../utils/cn';

interface EditorGroupProps {
  id: string;
}

/**
 * EditorGroup combines Tabs and Editor for a single pane.
 * It is group-aware and handles its own focus state.
 */
export const EditorGroup: React.FC<EditorGroupProps> = ({ id }) => {
  const { activeGroupId, setActiveGroup } = useStore();
  const isFocused = activeGroupId === id;

  return (
    <div 
      className={cn(
        "flex-1 flex flex-col bg-[var(--color-bg-surface)]/90 backdrop-blur-2xl rounded-xl border transition-all duration-300 overflow-hidden shadow-2xl relative",
        isFocused ? "border-[var(--color-accent-primary)]/40" : "border-[var(--color-border-subtle)]"
      )}
      onClick={() => setActiveGroup(id)}
    >
      <Tabs groupId={id} />
      <div className="flex-1 relative overflow-hidden">
        <Editor groupId={id} />
      </div>
    </div>
  );
};
