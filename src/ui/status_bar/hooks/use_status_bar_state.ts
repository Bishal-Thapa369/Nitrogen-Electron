import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../../../core/state/store';

export const useStatusBarState = () => {
  const { 
    rootPath, 
    setGitStatus, 
    setAppMetrics,
    backgroundTasks 
  } = useStore();

  const [activePopup, setActivePopup] = useState<string | null>(null);

  const togglePopup = useCallback((id: string) => {
    setActivePopup(prev => (prev === id ? null : id));
  }, []);

  // Git Polling Logic (Poll every 15 seconds)
  useEffect(() => {
    if (!rootPath) return;

    const updateGit = async () => {
      const status = await (window as any).electronAPI.getGitStatus(rootPath);
      setGitStatus(status);
    };

    updateGit();
    const interval = setInterval(updateGit, 15000);
    return () => clearInterval(interval);
  }, [rootPath, setGitStatus]);

  // RAM Polling Logic (Poll every 2 seconds)
  useEffect(() => {
    const updateRAM = async () => {
      const metrics = await (window as any).electronAPI.getMemoryUsage();
      setAppMetrics(metrics);
    };

    updateRAM();
    const interval = setInterval(updateRAM, 2000);
    return () => clearInterval(interval);
  }, [setAppMetrics]);

  return {
    activePopup,
    togglePopup,
    backgroundTasks
  };
};
