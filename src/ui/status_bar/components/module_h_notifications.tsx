import React from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { useStore } from '../../../core/state/store';

export const NotificationHub: React.FC = () => {
  const { backgroundTasks } = useStore();

  const isRunning = backgroundTasks.some(t => t.status === 'running');

  return (
    <div className="flex items-center hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200">
      {isRunning ? (
        <Loader2 size={13} className="animate-spin text-[var(--color-accent-primary)]" />
      ) : (
        <Bell size={13} strokeWidth={2.5} />
      )}
    </div>
  );
};
