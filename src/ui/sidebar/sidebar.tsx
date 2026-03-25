import React from 'react';
import { useStore, FileTreeNode } from '../../core/state/store';
import { FileCode, Folder, ChevronRight, ChevronDown, FileJson, FileType2, FileText, FileImage, FileCode2, FileTerminal, FolderOpen, MoreHorizontal, FilePlus2, FolderPlus, RefreshCw, Folders } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getFileIcon = (filename: string) => {
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return <FileCode2 size={14} className="text-yellow-400" />;
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return <FileType2 size={14} className="text-blue-400" />;
  if (filename.endsWith('.json')) return <FileJson size={14} className="text-green-400" />;
  if (filename.endsWith('.md')) return <FileText size={14} className="text-slate-400" />;
  if (filename.endsWith('.css')) return <FileCode size={14} className="text-pink-400" />;
  if (filename.endsWith('.html')) return <FileCode size={14} className="text-orange-400" />;
  if (filename.endsWith('.sh') || filename.endsWith('.bash')) return <FileTerminal size={14} className="text-emerald-400" />;
  if (filename.match(/\.(png|jpe?g|svg|gif)$/i)) return <FileImage size={14} className="text-purple-400" />;
  if (filename.endsWith('.cpp') || filename.endsWith('.hpp') || filename.endsWith('.h') || filename.endsWith('.c')) return <FileCode size={14} className="text-sky-400" />;
  if (filename.endsWith('.py')) return <FileCode2 size={14} className="text-yellow-300" />;
  return <FileCode size={14} className="text-[var(--color-text-tertiary)]" />;
};

// Recursive tree node renderer
const TreeNode: React.FC<{
  node: FileTreeNode;
  level: number;
}> = ({ node, level }) => {
  const { expandedFolders, toggleFolder, openFile, activeFilePath, updateNode } = useStore();
  const isExpanded = expandedFolders.includes(node.path);

  const handleFolderClick = async () => {
    toggleFolder(node.path);

    // Lazy-load: if not yet loaded, fetch children from C++ backend
    if (!isExpanded && !node.isLoaded && node.isDirectory) {
      try {
        const expandedNode = await window.electronAPI.expandDirectory(node.path);
        if (expandedNode) {
          updateNode(node.path, expandedNode);
        }
      } catch (err) {
        console.error('Failed to expand directory:', err);
      }
    }
  };

  const handleFileClick = async () => {
    openFile(node.path, node.name);
    try {
      const content = await window.electronAPI.readFile(node.path);
      if (content !== null) {
        useStore.getState().setActiveFileContent(content);
      }
    } catch (err) {
      console.error('Failed to read file:', err);
    }
  };

  if (node.isDirectory) {
    return (
      <div>
        <div
          className="flex items-center py-1 hover:bg-[var(--color-bg-hover)] cursor-pointer text-[13px] transition-colors duration-150 group"
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={handleFolderClick}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.15 }}
            className="mr-1 opacity-50 group-hover:opacity-100"
          >
            <ChevronDown size={14} strokeWidth={2.5} />
          </motion.div>
          <Folder size={14} strokeWidth={2} className="mr-2 text-[var(--color-accent-primary)]" />
          <span className="truncate flex-1 font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">
            {node.name}
          </span>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {node.children.map((child) => (
                <TreeNode key={child.path} node={child} level={level + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // File node
  return (
    <div
      className={cn(
        "group flex items-center py-1 cursor-pointer text-[13px] transition-all duration-150 relative",
        activeFilePath === node.path
          ? "bg-[var(--color-accent-glow)] text-[var(--color-text-primary)] font-medium"
          : "hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]"
      )}
      style={{ paddingLeft: `${level * 16 + 28}px` }}
      onClick={handleFileClick}
    >
      {activeFilePath === node.path && (
        <motion.div
          layoutId="activeFileIndicator"
          className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--color-accent-primary)]"
        />
      )}
      <div className="mr-2 z-10 flex items-center justify-center w-4 h-4">
        {getFileIcon(node.name)}
      </div>
      <span className="flex-1 truncate z-10">{node.name}</span>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { fileTree } = useStore();

  return (
    <div className="h-full bg-[var(--color-bg-panel)]/80 backdrop-blur-xl text-[var(--color-text-secondary)] flex flex-col select-none border-r border-[var(--color-border-subtle)]">
      {/* Explorer Section with Hover Group */}
      <div className="flex-1 flex flex-col group/explorer-section overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
          <span>Explorer</span>
          <div className="flex items-center space-x-0.5 no-drag">
            <div className="p-1 rounded-md hover:bg-[var(--color-bg-hover)] cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-all" title="More">
              <MoreHorizontal size={14} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {fileTree ? (
            <div>
              {/* Root folder header (styled as top-level active folder) */}
              <div className="flex items-center px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] cursor-pointer transition-all duration-150 group/root">
                <ChevronDown size={14} className="mr-1 text-[var(--color-text-tertiary)]" />
                <span className="truncate flex-1">{fileTree.name}</span>
                
                {/* Action Icons reveal on explorer section hover */}
                <div className="flex items-center space-x-1.5 opacity-0 group-hover/explorer-section:opacity-100 transition-opacity duration-200">
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
              {/* Render root's children */}
              {fileTree.children.map((child) => (
                <TreeNode key={child.path} node={child} level={0} />
              ))}
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

      <div className="px-4 py-3 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-tertiary)] uppercase font-bold tracking-[0.15em] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer flex items-center justify-between group text-nowrap">
        <span>Outline</span>
        <ChevronRight size={14} strokeWidth={2.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="px-4 py-3 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-tertiary)] uppercase font-bold tracking-[0.15em] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer flex items-center justify-between group text-nowrap">
        <span>Timeline</span>
        <ChevronRight size={14} strokeWidth={2.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

    </div>
  );
};
