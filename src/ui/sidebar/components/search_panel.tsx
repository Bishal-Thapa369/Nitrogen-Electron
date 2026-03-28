import React, { useCallback, useRef } from 'react';
import { Search, X, FileText, ChevronRight } from 'lucide-react';
import { useStore } from '../../../core/state/store';
import { cn } from '../../utils/cn';

interface SearchResult {
  path: string;
  fileName: string;
  line: number;
  context: string;
}

export const SearchPanel: React.FC = () => {
  const { 
    rootPath, openFile, selectedPaths, activeGroupId, setActiveFileContent,
    searchQuery, setSearchQuery, searchResults, setSearchResults, isSearching, setIsSearching 
  } = useStore();
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Use the first selected path if it's a folder, or the root path
  const searchPath = selectedPaths.length > 0 ? selectedPaths[0] : (rootPath || '');

  const performSearch = useCallback(async (searchQueryString: string) => {
    if (!searchQueryString || !rootPath) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await window.electronAPI.searchAll(searchQueryString, rootPath);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  }, [rootPath, setSearchResults, setIsSearching]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    searchTimeout.current = setTimeout(() => {
      performSearch(value);
    }, 300); // 300ms debounce for high-speed typing
  };

  const handleResultClick = async (result: SearchResult) => {
    openFile(result.path, result.fileName, activeGroupId);
    try {
      const content = await window.electronAPI.readFile(result.path);
      if (content !== null) {
        setActiveFileContent(content, activeGroupId);
      }
    } catch (err) {
      console.error('Failed to read file:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--color-border-subtle)]">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3">
          Search Project
        </h2>
        
        <div className="mt-1 text-[10px] text-[var(--color-text-tertiary)] flex items-center gap-1 opacity-70 group">
          <span className="font-medium">In:</span>
          <span className="truncate max-w-[180px] hover:text-[var(--color-text-secondary)] transition-colors cursor-help" title={searchPath}>
            {searchPath.split('/').pop() || 'Root'}
          </span>
        </div>

        <div className="relative group mt-3">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-accent-primary)] transition-colors">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search code or filenames..."
            className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] focus:border-[var(--color-accent-primary)] rounded-md py-1.5 pl-9 pr-8 text-[13px] outline-none transition-all placeholder:text-[var(--color-text-tertiary)]/50 shadow-sm"
            autoFocus
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--color-text-tertiary)]">
          <span>{isSearching ? 'Searching...' : `${searchResults.length} results`}</span>
          {isSearching && (
            <div className="w-3 h-3 border-2 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {searchResults.length > 0 ? (
          <div className="space-y-1">
            {searchResults.map((result, idx) => (
              <div
                key={`${result.path}-${idx}`}
                onClick={() => handleResultClick(result)}
                className="group flex flex-col p-2 rounded-lg hover:bg-[var(--color-bg-hover)] cursor-pointer transition-all border border-transparent hover:border-[var(--color-border-subtle)]/30"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-[var(--color-accent-primary)] opacity-70 group-hover:opacity-100 transition-opacity">
                    <FileText size={14} />
                  </div>
                  <span className="text-[12px] font-medium text-[var(--color-text-secondary)] truncate">
                    {result.fileName}
                  </span>
                  {result.line > 0 && (
                    <span className="text-[10px] bg-[var(--color-bg-surface)] px-1.5 rounded text-[var(--color-text-tertiary)]">
                      L{result.line}
                    </span>
                  )}
                </div>
                {result.context && (
                  <div className="text-[11px] text-[var(--color-text-tertiary)] font-mono whitespace-nowrap overflow-hidden text-ellipsis pl-6 border-l border-[var(--color-border-subtle)] ml-1.5 group-hover:text-[var(--color-text-secondary)] transition-colors">
                    {result.context.trim()}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : searchQuery && !isSearching ? (
          <div className="flex flex-col items-center justify-center h-40 text-[var(--color-text-tertiary)] opacity-50">
            <Search size={32} strokeWidth={1} className="mb-2" />
            <p className="text-[12px]">No matches found</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
