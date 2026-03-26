import React, { useState, useEffect, useRef } from 'react';
import { useStore, FileTreeNode } from '../../../core/state/store';

interface UseSidebarCreationProps {
  fileTree: FileTreeNode | null;
  selectedPath: string | null;
  findNode: (path: string) => FileTreeNode | null;
  toggleFolder: (path: string) => void;
  expandedFolders: string[];
}

export const useSidebarCreation = ({
  fileTree, selectedPath, findNode, toggleFolder, expandedFolders
}: UseSidebarCreationProps) => {
  const { createFile, createFolder } = useStore();
  
  const [newInput, setNewInput] = useState<{ type: 'file' | 'folder'; parentPath: string } | null>(null);
  const [newInputValue, setNewInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newInput) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [newInput]);

  const startCreation = (type: 'file' | 'folder') => {
    if (!fileTree) return;
    
    let targetParentPath = fileTree.path;
    
    if (selectedPath) {
      const selectedNode = findNode(selectedPath);
      if (selectedNode) {
        if (selectedNode.isDirectory) {
          targetParentPath = selectedNode.path;
          if (!expandedFolders.includes(selectedNode.path)) {
            toggleFolder(selectedNode.path);
          }
        } else {
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
    setNewInput(null);

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

  return {
    newInput,
    setNewInput,
    newInputValue,
    setNewInputValue,
    inputRef,
    startCreation,
    handleCreateSubmit,
    handleCreateKeyDown
  };
};
