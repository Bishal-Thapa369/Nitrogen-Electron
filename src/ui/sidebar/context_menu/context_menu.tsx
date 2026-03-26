import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStore, FileTreeNode } from '../../../core/state/store';
import { Pencil, Trash2, FilePlus2, FolderPlus, ExternalLink, Copy, Scissors, ClipboardPaste, CopyPlus } from 'lucide-react';

interface ContextMenuProps {
  node: FileTreeNode | null;
  x: number;
  y: number;
  onClose: () => void;
  onCreate: (type: 'file' | 'folder') => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ node, x, y, onClose, onCreate }) => {
  const { renameNode, deleteNode, rootPath, setClipboardItem, clipboardItem, pasteNode, duplicateNode } = useStore();
  const [mode, setMode] = useState<'menu' | 'rename' | 'confirmDelete'>('menu');
  const [newName, setNewName] = useState(node?.name || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ x, y });
  
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleReveal = async () => {
    if (node) await window.electronAPI.revealItem(node.path);
    onClose();
  };

  const handleCopyPath = async () => {
    if (node) await window.electronAPI.copyPath(node.path);
    onClose();
  };

  const handleCopyRelativePath = async () => {
    if (node && rootPath) {
      const rel = node.path.replace(rootPath, '').replace(/^\/+/, '');
      await window.electronAPI.copyPath(rel);
    }
    onClose();
  };

  const handleCut = () => {
    if (node) setClipboardItem(node.path, 'cut');
    onClose();
  };

  const handleCopy = () => {
    if (node) setClipboardItem(node.path, 'copy');
    onClose();
  };

  const handlePaste = async () => {
    await pasteNode();
    onClose();
  };

  const handleDuplicate = async () => {
    if (node) await duplicateNode(node.path);
    onClose();
  };

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Auto-focus rename input
  useEffect(() => {
    if (mode === 'rename' && inputRef.current && node) {
      inputRef.current.focus();
      if (!node.isDirectory) {
        const dotIdx = node.name.lastIndexOf('.');
        inputRef.current.setSelectionRange(0, dotIdx > 0 ? dotIdx : node.name.length);
      } else {
        inputRef.current.select();
      }
    }
  },[mode, node]);

  // Dynamically calculate actual dimensions to prevent cutoff
  useLayoutEffect(() => {
    if (!menuRef.current) return;
    
    const rect = menuRef.current.getBoundingClientRect();
    const PADDING = 24; // Extra margin so it doesn't sit entirely flush against screen edges
    
    let newX = x;
    let newY = y;

    // Check right edge
    if (newX + rect.width > window.innerWidth - PADDING) {
      newX = window.innerWidth - rect.width - PADDING;
    }
    
    // Check bottom edge
    if (newY + rect.height > window.innerHeight - PADDING) {
      // If there's no space below, flip the menu to open *above* the cursor
      if (y - rect.height > PADDING) {
        newY = y - rect.height;
      } else {
        // Otherwise, just rest it comfortably above the bottom edge
        newY = window.innerHeight - rect.height - PADDING;
      }
    }

    // Ensure it doesn't fall off the top or left side either
    setPosition({ 
      x: Math.max(PADDING, newX), 
      y: Math.max(PADDING, newY) 
    });
  }, [x, y, mode, node, clipboardItem]);

  const handleRename = async () => {
    if (!node) return;
    if (!newName.trim() || newName === node.name) {
      onClose();
      return;
    }
    setLoading(true);
    setError(null);
    const result = await renameNode(node.path, newName.trim());
    setLoading(false);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Rename failed.');
    }
  };

  const handleDelete = async () => {
    if (!node) return;
    setLoading(true);
    setError(null);
    const result = await deleteNode(node.path);
    setLoading(false);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Delete failed.');
    }
  };

  const content = (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[200px] rounded-lg overflow-hidden shadow-2xl border border-[var(--color-border-subtle)]"
      style={{
        left: position.x,
        top: position.y,
        backgroundColor: 'var(--color-bg-panel)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Main Menu ── */}
      {mode === 'menu' && (
        <div className="py-1.5 flex flex-col">
          <button
            onClick={() => { onCreate('file'); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <FilePlus2 size={14} />
            <span>New File</span>
          </button>
          <button
            onClick={() => { onCreate('folder'); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <FolderPlus size={14} />
            <span>New Folder</span>
          </button>
          
          {clipboardItem && (
            <>
              <div className="mx-3 my-1 h-px bg-[var(--color-border-subtle)]" />
              <button
                onClick={handlePaste}
                className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <ClipboardPaste size={14} />
                <span>Paste</span>
              </button>
            </>
          )}
          
          {node && (
            <>
              <div className="mx-3 my-1 h-px bg-[var(--color-border-subtle)]" />
              <button
                onClick={handleCut}
                className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <Scissors size={14} />
                <span>Cut</span>
              </button>
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <Copy size={14} />
                <span>Copy</span>
              </button>
              <button
                onClick={handleDuplicate}
                className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <CopyPlus size={14} />
                <span>Duplicate</span>
              </button>

              <div className="mx-3 my-1 h-px bg-[var(--color-border-subtle)]" />
              <button
                onClick={handleCopyPath}
                className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <Copy size={14} />
                <span>Copy Path</span>
              </button>
              <button
                onClick={handleCopyRelativePath}
                className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <Copy size={14} className="opacity-50" />
                <span>Copy Relative Path</span>
              </button>
              
              <div className="mx-3 my-1 h-px bg-[var(--color-border-subtle)]" />
              <button
                onClick={handleReveal}
                className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <ExternalLink size={14} />
                <span>Reveal in Explorer</span>
              </button>
              
              <div className="mx-3 my-1 h-px bg-[var(--color-border-subtle)]" />
              <button
                onClick={() => setMode('rename')}
                className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <Pencil size={14} />
                <span>Rename</span>
              </button>
              <button
                onClick={() => setMode('confirmDelete')}
                className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Rename Input ── */}
      {mode === 'rename' && node && (
        <div className="p-3 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Rename</p>
          <input
            ref={inputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') onClose();
            }}
            disabled={loading}
            className="w-full px-3 py-1.5 rounded-md text-[13px] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] focus:border-[var(--color-accent-primary)] outline-none transition-colors"
          />
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRename}
              disabled={loading || !newName.trim()}
              className="px-3 py-1 rounded text-[12px] bg-[var(--color-accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? '...' : 'Rename'}
            </button>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {mode === 'confirmDelete' && node && (
        <div className="p-3 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-red-400">Confirm Delete</p>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            Delete <strong className="text-[var(--color-text-primary)]">{node.name}</strong>
            {node.isDirectory ? ' and all its contents' : ''}?
          </p>
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded text-[12px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-3 py-1 rounded text-[12px] bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
};