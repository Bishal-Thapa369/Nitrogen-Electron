import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore, FileTreeNode } from '../../core/state/store';
import { FileCode, Folder, ChevronRight, ChevronDown, FolderOpen, MoreHorizontal, FilePlus2, FolderPlus, RefreshCw, Folders } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ContextMenu } from './context_menu/context_menu';


function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Algorithmic Icon Assignment (No Hardcoding)
const FILE_COLORS = [
  '#38bdf8', '#facc15', '#60a5fa', '#4ade80', '#94a3b8', 
  '#f472b6', '#fb923c', '#34d399', '#c084fc', '#fde047',
  '#818cf8', '#2dd4bf', '#a78bfa', '#f87171', '#fb7185',
  '#e879f9', '#22d3ee', '#86efac', '#fca5a5', '#d8b4fe'
];

const getIconByType = (typeId: number | undefined, isDirectory: boolean) => {
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

const ITEM_HEIGHT = 24; 
const OVERSCAN = 30;    

type VirtualRow = 
  | { type: 'node'; node: FileTreeNode; level: number }
  | { type: 'input'; itemType: 'file' | 'folder'; parentPath: string; level: number };

export const Sidebar: React.FC = () => {
  const { 
    fileTree, expandedFolders, toggleFolder, openFile, activeFilePath, 
    updateNode, selectedPath, setSelectedPath, collapseAll, 
    createFile, createFolder, refreshRoot, clipboardItem 
  } = useStore();
  
  // Virtualization State
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollResetRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTopRef = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ node: FileTreeNode | null; x: number; y: number } | null>(null);

  const [newInput, setNewInput] = useState<{ type: 'file' | 'folder'; parentPath: string } | null>(null);
  const [newInputValue, setNewInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileTreeNode | null) => {
    e.preventDefault();
    e.stopPropagation();
    if (node) setSelectedPath(node.path);
    else setSelectedPath(null);
    setContextMenu({ node, x: e.clientX, y: e.clientY });
  }, [setSelectedPath]);

  // Focus input automatically when creating
  useEffect(() => {
    if (newInput) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [newInput]);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fileTree]);

  // Flatten tree for O(1) indexed rendering (including root and dynamic input fields)
  const flattenedVisibleNodes = React.useMemo(() => {
    const flat: VirtualRow[] = [];
    if (!fileTree) return flat;
    
    const traverse = (node: FileTreeNode, level: number) => {
      flat.push({ type: 'node', node, level });
      if (node.isDirectory && expandedFolders.includes(node.path)) {
        // If an input is actively being created inside this folder, render it first
        if (newInput && newInput.parentPath === node.path) {
          flat.push({ type: 'input', itemType: newInput.type, parentPath: node.path, level: level + 1 });
        }
        for (const child of node.children) {
          traverse(child, level + 1);
        }
      }
    };
    
    // We do NOT map the root node as part of the virtualized list since it is sticky
    // BUT we must check if input is directly under root
    if (expandedFolders.includes(fileTree.path)) {
      if (newInput && newInput.parentPath === fileTree.path) {
        flat.push({ type: 'input', itemType: newInput.type, parentPath: fileTree.path, level: 0 });
      }
      for (const child of fileTree.children) {
        traverse(child, 0);
      }
    }
    
    return flat;
  }, [fileTree, expandedFolders, newInput]);

  const handleNodeClick = async (node: FileTreeNode) => {
    setSelectedPath(node.path);
    
    if (node.isDirectory) {
      toggleFolder(node.path);
      // Lazy load from C++ if needed
      const isExpanded = expandedFolders.includes(node.path);
      if (!isExpanded && !node.isLoaded) {
        try {
          const expandedNode = await window.electronAPI.expandDirectory(node.path);
          if (expandedNode) updateNode(node.path, expandedNode);
        } catch (err) {
          console.error('Failed to expand directory:', err);
        }
      }
    } else {
      openFile(node.path, node.name);
      try {
        const content = await window.electronAPI.readFile(node.path);
        if (content !== null) {
          useStore.getState().setActiveFileContent(content);
        }
      } catch (err) {
        console.error('Failed to read file:', err);
      }
    }
  };

  // Helper to find a node by path
  const findNode = (path: string, node: FileTreeNode | null = fileTree): FileTreeNode | null => {
    if (!node) return null;
    if (node.path === path) return node;
    for (const child of node.children) {
      if (child.path === path) return child;
      // Ensure we match whole folder names by adding a trailing slash to the check
      if (child.isDirectory && path.startsWith(child.path + '/')) {
        const found = findNode(path, child);
        if (found) return found;
      }
    }
    return null;
  };

  // Actions
  const startCreation = (type: 'file' | 'folder') => {
    if (!fileTree) return;
    
    let targetParentPath = fileTree.path;
    
    // Determine creation parent based on selection
    if (selectedPath) {
      const selectedNode = findNode(selectedPath);
      if (selectedNode) {
        if (selectedNode.isDirectory) {
          targetParentPath = selectedNode.path;
          // Ensure folder is expanded
          if (!expandedFolders.includes(selectedNode.path)) {
            toggleFolder(selectedNode.path);
          }
        } else {
          // It's a file, so create in its parent folder
          const parts = selectedNode.path.split('/');
          parts.pop();
          targetParentPath = parts.join('/') || '/';
        }
      }
    }

    setNewInput({ type, parentPath: targetParentPath });
    setNewInputValue('');
  };

  const handleCreateSubmit = async () => {
    if (!newInput || !newInputValue.trim()) {
      setNewInput(null);
      return;
    }

    const { type, parentPath } = newInput;
    const name = newInputValue.trim();
    setNewInput(null); // Optimistic close

    if (type === 'file') {
      await createFile(parentPath, name);
    } else {
      await createFolder(parentPath, name);
    }
  };

  const handleCreateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateSubmit();
    } else if (e.key === 'Escape') {
      setNewInput(null);
    }
  };

  // Virtualization math
  const totalHeight = flattenedVisibleNodes.length * ITEM_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    flattenedVisibleNodes.length - 1,
    Math.floor((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
  );
  
  const visibleItems = flattenedVisibleNodes.slice(startIndex, endIndex + 1);

  return (
    <div className="h-full bg-[var(--color-bg-panel)]/80 backdrop-blur-xl text-[var(--color-text-secondary)] flex flex-col select-none border-r border-[var(--color-border-subtle)]">
      
      {/* Explorer Section with Hover Group */}
      <div className="flex-1 flex flex-col group/explorer-section overflow-hidden">
        
        {/* Top Header */}
        <div className="px-4 py-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] bg-[var(--color-bg-panel)] z-10 relative border-b border-[var(--color-border-subtle)] h-[32px]">
          <span>Explorer</span>
          <div className="flex items-center space-x-0.5 no-drag">
            <div className="p-1 rounded-md hover:bg-[var(--color-bg-hover)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="More">
              <MoreHorizontal size={14} />
            </div>
          </div>
        </div>

        {/* Scrollable Area */}
        <div 
          ref={containerRef}
          onScroll={(e) => {
            const currentTop = e.currentTarget.scrollTop;
            const delta = Math.abs(currentTop - lastScrollTopRef.current);
            setScrollTop(currentTop);
            
            // Motion blur effect
            const blurAmount = Math.min(1.5, delta / 150);
            if (e.currentTarget) {
              e.currentTarget.style.setProperty('--scroll-blur', `${blurAmount}px`);
              if (scrollResetRef.current) clearTimeout(scrollResetRef.current);
              scrollResetRef.current = setTimeout(() => {
                if (containerRef.current) {
                  containerRef.current.style.setProperty('--scroll-blur', '0px');
                }
              }, 50);
            }
            
            lastScrollTopRef.current = currentTop;
          }}
          className="flex-1 overflow-y-auto custom-scrollbar relative"
          onContextMenu={(e) => handleContextMenu(e, null)}
          onClick={() => {
            if (selectedPath) setSelectedPath(null);
            if (newInput) setNewInput(null);
          }}
        >
          {fileTree ? (
            <div className="pb-4">
              {/* Root Folder Header - Sticky */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPath(fileTree.path);
                  toggleFolder(fileTree.path);
                }}
                className={cn(
                  "flex items-center px-3 sticky top-0 bg-[var(--color-bg-panel)] z-30 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] cursor-pointer transition-all duration-150 group/root h-[32px]",
                  selectedPath === fileTree.path && "bg-[var(--color-accent-glow)] text-[var(--color-text-primary)] font-extrabold ring-1 ring-inset ring-[var(--color-accent-primary)]/20"
                )}
              >
                <ChevronDown 
                    size={14} 
                    className={cn(
                        "mr-1 text-[var(--color-text-tertiary)] transition-transform duration-150",
                        !expandedFolders.includes(fileTree.path) && "-rotate-90"
                    )} 
                />
                <span className="truncate flex-1">{fileTree.name}</span>
                
                {/* 4 ACTION ICONS FOR ROOT */}
                <div className="flex items-center space-x-1.5 opacity-0 group-hover/explorer-section:opacity-100 transition-opacity duration-200 bg-[var(--color-bg-panel)] z-40 px-1" onClick={e => e.stopPropagation()}>
                  <div onClick={() => startCreation('file')} className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="New File">
                    <FilePlus2 size={14} />
                  </div>
                  <div onClick={() => startCreation('folder')} className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="New Folder">
                    <FolderPlus size={14} />
                  </div>
                  <div onClick={() => refreshRoot()} className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="Refresh">
                    <RefreshCw size={14} />
                  </div>
                  <div onClick={() => collapseAll()} className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="Collapse All">
                    <Folders size={14} />
                  </div>
                </div>
              </div>

              {/* Virtualized Tree Container */}
              <div style={{ 
                height: `${totalHeight}px`, 
                position: 'relative', 
                width: '100%',
                filter: 'blur(var(--scroll-blur, 0px))',
                transition: 'filter 0.1s ease-out',
                willChange: 'filter, transform'
              }}>
                {visibleItems.map((item, index) => {
                  const absoluteIndex = startIndex + index;

                  // Render Injectable Input Row
                  if (item.type === 'input') {
                    return (
                        <div
                            key="new-input-field"
                            className="absolute left-0 right-0 flex items-center bg-[var(--color-bg-active)] z-10 transition-all duration-200 ease-out"
                            style={{ 
                                top: `${absoluteIndex * ITEM_HEIGHT}px`,
                                height: `${ITEM_HEIGHT}px`,
                                paddingLeft: `${item.level * 16 + (item.itemType === 'folder' ? 12 : 28)}px` 
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="mr-2 flex items-center justify-center w-4 h-4 shrink-0 opacity-70">
                                {item.itemType === 'folder' ? <Folder size={14} /> : <FileCode size={14} />}
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={newInputValue}
                                onChange={(e) => setNewInputValue(e.target.value)}
                                onKeyDown={handleCreateKeyDown}
                                onBlur={handleCreateSubmit}
                                className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--color-text-primary)] ring-1 ring-[var(--color-accent-primary)] px-1 -ml-1 rounded-[2px]"
                            />
                        </div>
                    );
                  }

                  // Render standard node row
                  const { node, level } = item;
                  const isExpanded = node.isDirectory && expandedFolders.includes(node.path);
                  const isSelected = selectedPath === node.path;
                  const isActive = activeFilePath === node.path; // Indicates an open document tab
                  const isCutTarget = clipboardItem?.type === 'cut' && clipboardItem.path === node.path;

                  return (
                    <div
                      key={node.path}
                      onClick={(e) => { e.stopPropagation(); handleNodeClick(node); }}
                      onContextMenu={(e) => handleContextMenu(e, node)}
                      className={cn(
                        "absolute left-0 right-0 flex items-center cursor-pointer text-[13px] transition-all duration-200 ease-out group z-10",
                        isSelected || isActive ? "bg-[var(--color-bg-active)]" : "hover:bg-[var(--color-bg-hover)]",
                        isSelected && "ring-1 ring-inset ring-[var(--color-border-focus)]/50",
                        isActive && "text-[var(--color-text-primary)] font-medium bg-[var(--color-accent-glow)]!",
                        isCutTarget && "opacity-40 grayscale-[50%]"
                      )}
                      style={{ 
                        top: `${absoluteIndex * ITEM_HEIGHT}px`,
                        height: `${ITEM_HEIGHT}px`,
                        paddingLeft: `${level * 16 + (node.isDirectory ? 12 : 28)}px` 
                      }}
                    >
                      {isActive && !node.isDirectory && (
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--color-accent-primary)] z-20" />
                      )}
                      
                      {node.isDirectory && (
                        <div className="mr-1 opacity-50 group-hover:opacity-100 transition-opacity">
                          <ChevronRight 
                            size={14} 
                            strokeWidth={2.5} 
                            className={cn("transition-transform duration-150", isExpanded && "rotate-90")} 
                          />
                        </div>
                      )}

                      <div className="mr-2 flex items-center justify-center w-4 h-4 shrink-0">
                        {getIconByType(node.typeId, node.isDirectory)}
                      </div>
                      
                      <span className="truncate flex-1 z-10 leading-none mt-[1px]">{node.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <FolderOpen size={48} className="text-[var(--color-text-tertiary)] mb-4 opacity-30" />
              <p className="text-[13px] text-[var(--color-text-tertiary)] mb-4">No folder opened</p>
              <button
                onClick={async () => {
                  try {
                    const tree = await window.electronAPI.openFolderDialog();
                    if (tree) {
                      useStore.getState().setFileTree(tree, tree.path);
                    }
                  } catch (err) {
                    console.error('Failed to open folder:', err);
                  }
                }}
                className="text-[var(--color-accent-primary)] hover:text-[var(--color-text-primary)] transition-colors duration-200 border border-[var(--color-border-subtle)] hover:border-[var(--color-border-focus)] px-4 py-2 rounded-md text-[12px] font-semibold tracking-wide uppercase"
              >
                Open Folder
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-tertiary)] uppercase font-bold tracking-[0.15em] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer flex items-center justify-between group text-nowrap shrink-0">
        <span>Outline</span>
        <ChevronRight size={14} strokeWidth={2.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="px-4 py-3 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-tertiary)] uppercase font-bold tracking-[0.15em] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer flex items-center justify-between group text-nowrap shrink-0">
        <span>Timeline</span>
        <ChevronRight size={14} strokeWidth={2.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* ── Overlays ── */}
      {contextMenu && (
        <ContextMenu
          node={contextMenu.node}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCreate={(type) => startCreation(type)}
        />
      )}

    </div>
  );
};
