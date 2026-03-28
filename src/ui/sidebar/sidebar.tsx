import React from 'react';
import { useStore } from '../../core/state/store';
import { ContextMenu } from './context_menu/context_menu';

// Modular Imports
import { getIconByType } from './utils/sidebar_utils';
import { useSidebarLogic } from './logic/use_sidebar_logic';
import { FileRow } from './components/file_row';
import { SidebarHeader } from './components/sidebar_header';
import { StickyRoot } from './components/sticky_root';
import { NewInputRow } from './components/new_input_row';
import { EmptySidebar } from './components/empty_sidebar';
import { SidebarFooter } from './components/sidebar_footer';
import { SearchPanel } from './components/search_panel';

export const Sidebar: React.FC = () => {
  const { 
    fileTree, expandedFolders, activeFilePath, selectedPath, selectedPaths, clipboardItems,
    containerRef, lastScrollTopRef, setScrollTop, 
    contextMenu, setContextMenu, newInput, setNewInput, newInputValue, setNewInputValue, inputRef,
    handleContextMenu, handleNodeClick, startCreation, handleCreateSubmit, handleCreateKeyDown,
    visibleItems, totalHeight, startIndex,
    refreshRoot, toggleFolder, setSelectedPath, setSelectedPaths
  } = useSidebarLogic();

  const { sidebarView, focusContext, setFocusContext } = useStore();

  const handleOpenFolder = async () => {
    try {
      const tree = await window.electronAPI.openFolderDialog();
      if (tree) {
        useStore.getState().setFileTree(tree, tree.path);
      }
    } catch (err) {
      console.error('Failed to open folder:', err);
    }
  };

  if (sidebarView === 'search') {
    return (
      <div 
        className="h-full bg-[var(--color-bg-panel)]/80 backdrop-blur-xl text-[var(--color-text-secondary)] flex flex-col select-none border-r border-[var(--color-border-subtle)]"
        onClick={() => setFocusContext('sidebar')}
      >
        <SearchPanel />
      </div>
    );
  }

  return (
    <div 
      className="h-full bg-[var(--color-bg-panel)]/80 backdrop-blur-xl text-[var(--color-text-secondary)] flex flex-col select-none border-r border-[var(--color-border-subtle)]"
      onClick={() => setFocusContext('sidebar')}
    >
      
      <div className="flex-1 flex flex-col group/explorer-section overflow-hidden">
        <SidebarHeader />

        <div 
          ref={containerRef}
          onScroll={(e) => {
            const currentTop = e.currentTarget.scrollTop;
            const delta = Math.abs(currentTop - lastScrollTopRef.current);
            setScrollTop(currentTop);
            
            const blurAmount = Math.min(1.5, delta / 150);
            if (e.currentTarget) {
              e.currentTarget.style.setProperty('--scroll-blur', `${blurAmount}px`);
              setTimeout(() => {
                if (containerRef.current) containerRef.current.style.setProperty('--scroll-blur', '0px');
              }, 50);
            }
            lastScrollTopRef.current = currentTop;
          }}
          className="flex-1 overflow-y-auto custom-scrollbar relative"
          onContextMenu={(e) => handleContextMenu(e, null)}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedPath(null);
              setSelectedPaths([]);
              if (newInput) setNewInput(null);
            }
          }}
        >
          {fileTree ? (
            <div className="pb-4">
              <StickyRoot 
                fileTree={fileTree}
                selectedPath={selectedPath}
                expandedFolders={expandedFolders}
                onToggle={toggleFolder}
                onSelect={setSelectedPath}
                onStartCreation={startCreation}
                onRefresh={refreshRoot}
                onCollapseAll={() => useStore.getState().collapseAll()}
              />

              <div style={{ 
                height: `${totalHeight}px`, 
                position: 'relative', width: '100%',
                filter: 'blur(var(--scroll-blur, 0px))',
                transition: 'filter 0.1s ease-out', willChange: 'filter, transform'
              }}>
                {visibleItems.map((item, index) => {
                  const absoluteIndex = startIndex + index;

                  if (item.type === 'input') {
                    return (
                      <NewInputRow 
                        key="new-input-field"
                        absoluteIndex={absoluteIndex}
                        level={item.level}
                        itemType={item.itemType}
                        value={newInputValue}
                        onChange={setNewInputValue}
                        onKeyDown={handleCreateKeyDown}
                        onBlur={handleCreateSubmit}
                        inputRef={inputRef}
                      />
                    );
                  }

                  const { node, level } = item;
                  return (
                    <FileRow 
                      key={node.path} node={node} level={level} absoluteIndex={absoluteIndex}
                      isExpanded={node.isDirectory && expandedFolders.includes(node.path)}
                      isSelected={selectedPaths.includes(node.path)}
                      isActive={activeFilePath === node.path}
                      isCutTarget={clipboardItems?.type === 'cut' && clipboardItems.paths.includes(node.path)}
                      isSidebarFocused={focusContext === 'sidebar'}
                      onClick={handleNodeClick} onContextMenu={handleContextMenu} getIconByType={getIconByType}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptySidebar onOpenFolder={handleOpenFolder} />
          )}
        </div>
      </div>

      <SidebarFooter />

      {contextMenu && (
        <ContextMenu
          node={contextMenu.node} x={contextMenu.x} y={contextMenu.y}
          onClose={() => setContextMenu(null)} onCreate={startCreation}
        />
      )}
    </div>
  );
};
