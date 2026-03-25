import React, { useState, useEffect, useRef } from 'react';
import { useStore, FileTreeNode } from '../../core/state/store';
import { FileCode, Folder, ChevronRight, ChevronDown, FolderOpen, MoreHorizontal, FilePlus2, FolderPlus, RefreshCw, Folders } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';


function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Algorithmic Icon Assignment (No Hardcoding)
// The system automatically maps any C++ calculated typeId to a distinct, consistent color.
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

  // Map the C++ calculated hash ID to a specific color index
  const colorIndex = typeId % FILE_COLORS.length;
  const assignedColor = FILE_COLORS[colorIndex];

  return <FileCode size={14} style={{ color: assignedColor }} />;
};

const ITEM_HEIGHT = 24; // Fixed height for each virtualized row
const OVERSCAN = 30;    // Increased buffer (60 total) for smoother high-speed scrolls

export const Sidebar: React.FC = () => {
  const { fileTree, expandedFolders, toggleFolder, openFile, activeFilePath, updateNode } = useStore();
  
  // Virtualization State
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollResetRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTopRef = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Measure container height on mount/resize
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

  // Flatten tree for O(1) indexed rendering
  const flattenedVisibleNodes = React.useMemo(() => {
    const flat: { node: FileTreeNode; level: number }[] = [];
    if (!fileTree) return flat;
    
    const traverse = (node: FileTreeNode, level: number) => {
      flat.push({ node, level });
      if (node.isDirectory && expandedFolders.includes(node.path)) {
        for (const child of node.children) {
          traverse(child, level + 1);
        }
      }
    };
    
    // Start traversal from root's children, root itself is handled manually
    for (const child of fileTree.children) {
      traverse(child, 0);
    }
    
    return flat;
  }, [fileTree, expandedFolders]);

  const handleNodeClick = async (node: FileTreeNode) => {
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
            
            // Calculate and apply cinematic motion blur (Direct DOM update for performance)
            // v < 50 = no blur, v = 225 = 1.5px blur, cap at 1.5px
            const blurAmount = Math.min(1.5, delta / 150);
            if (e.currentTarget) {
              e.currentTarget.style.setProperty('--scroll-blur', `${blurAmount}px`);
              
              // Reset blur after scrolling stops
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
        >
          {fileTree ? (
            <div className="pb-4">
              {/* Root Folder Header */}
              <div className="flex items-center px-3 sticky top-0 bg-[var(--color-bg-panel)] z-30 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] cursor-pointer transition-all duration-150 group/root h-[32px]">
                <ChevronDown size={14} className="mr-1 text-[var(--color-text-tertiary)]" />
                <span className="truncate flex-1">{fileTree.name}</span>
                
                {/* Action Icons reveal on explorer hover */}
                <div className="flex items-center space-x-1.5 opacity-0 group-hover/explorer-section:opacity-100 transition-opacity duration-200 bg-[var(--color-bg-panel)] z-40 px-1">
                  <div className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="New File">
                    <FilePlus2 size={14} />
                  </div>
                  <div className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="New Folder">
                    <FolderPlus size={14} />
                  </div>
                  <div className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="Refresh">
                    <RefreshCw size={14} />
                  </div>
                  <div className="p-1 rounded-md hover:bg-[var(--color-bg-active)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="Collapse All">
                    <Folders size={14} />
                  </div>
                </div>
              </div>

              {/* Virtualized Tree Container with Motion Blur Layering */}
              <div style={{ 
                height: `${totalHeight}px`, 
                position: 'relative', 
                width: '100%',
                filter: 'blur(var(--scroll-blur, 0px))',
                transition: 'filter 0.1s ease-out',
                willChange: 'filter, transform'
              }}>
                {visibleItems.map((item, index) => {
                  const { node, level } = item;
                  const absoluteIndex = startIndex + index;
                  const isExpanded = node.isDirectory && expandedFolders.includes(node.path);
                  const isActive = activeFilePath === node.path;

                  return (
                    <div
                      key={node.path}
                      onClick={() => handleNodeClick(node)}
                      className={cn(
                        "absolute left-0 right-0 flex items-center cursor-pointer text-[13px] transition-colors duration-150 group z-10",
                        isActive ? "bg-[var(--color-accent-glow)] text-[var(--color-text-primary)] font-medium" : "hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]"
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

    </div>
  );
};
