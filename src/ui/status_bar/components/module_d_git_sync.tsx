import React from 'react';
import { GitBranch } from 'lucide-react';
import { useStore } from '../../../core/state/store';

export const GitStatusSync: React.FC = () => {
  const { gitStatus } = useStore();

  if (!gitStatus) return null;

  return (
    <div 
      className="flex items-center hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200"
      title={`Git: ${gitStatus.branch} (${gitStatus.staged} staged, ${gitStatus.unstaged} unstaged)`}
    >
      <GitBranch size={13} strokeWidth={2.5} className="mr-1.5 text-[var(--color-accent-primary)]" />
      <span>{gitStatus.branch}</span>
      {(gitStatus.staged > 0 || gitStatus.unstaged > 0) && (
        <span className="ml-1.5 text-[var(--color-text-tertiary)] opacity-60 font-mono text-[9px]">
          ({gitStatus.staged}/{gitStatus.unstaged})
        </span>
      )}
    </div>
  );
};
