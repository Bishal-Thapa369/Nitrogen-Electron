import { useState, useMemo, useCallback, useEffect } from 'react';
import { useStore } from '../../../core/state/store';

/**
 * useQuickOpenLogic
 * God-Mode logic for global file discovery and navigation memory.
 */
export const useQuickOpenLogic = () => {
  const { 
    rootPath, 
    fullFileIndex, 
    recentPaths, 
    setFullFileIndex,
    openFile, 
    toggleQuickOpen, 
    setActiveFileContent 
  } = useStore();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 1. Initialize Global Index (God-Mode Discovery)
  useEffect(() => {
    const initIndex = async () => {
      if (rootPath && fullFileIndex.length === 0) {
        try {
          const files = await (window.electronAPI as any).getAllFiles(rootPath);
          if (files) setFullFileIndex(files);
        } catch (err) {
          console.error('Failed to build global file index:', err);
        }
      }
    };
    initIndex();
  }, [rootPath, fullFileIndex.length, setFullFileIndex]);

  // 2. Intelligent Filtering (History + Global Results)
  const filteredResults = useMemo(() => {
    // A. Empty Query: Show History (Recents)
    if (!query) {
      return recentPaths
        .map(path => {
          const name = path.split('/').pop() || '';
          return { path, name, isRecent: true };
        });
    }

    // B. Search Mode: Shallow Fuzzy across Global Index
    const searchTerms = query.toLowerCase().split(/[/\s\\]+/).filter(Boolean);
    
    return fullFileIndex
      .filter(file => {
        const fullPath = file.path.toLowerCase();
        // Match ALL terms against the full path (deep search)
        return searchTerms.every(term => fullPath.includes(term));
      })
      .sort((a, b) => {
        // Prioritize exact filename matches
        const aMatch = a.name.toLowerCase().includes(query.toLowerCase());
        const bMatch = b.name.toLowerCase().includes(query.toLowerCase());
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      })
      .slice(0, 200); // 200 items for deep exploration
  }, [fullFileIndex, recentPaths, query]);

  // 3. Command Execution
  const handleSelect = useCallback(async (file: { path: string; name: string }) => {
    openFile(file.path, file.name);
    toggleQuickOpen();
    
    try {
      const content = await window.electronAPI.readFile(file.path);
      if (content !== null) setActiveFileContent(content);
    } catch (err) {
      console.error('Quick Open Navigation Error:', err);
    }
  }, [openFile, toggleQuickOpen, setActiveFileContent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % (filteredResults.length || 1));
    } else if (e.key === 'Enter') {
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex]);
      }
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return {
    query,
    setQuery,
    selectedIndex,
    filteredResults,
    handleSelect,
    handleKeyDown
  };
};
