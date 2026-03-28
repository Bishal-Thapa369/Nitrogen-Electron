import { StateCreator } from 'zustand';
import { EditorState, EditorGroup } from '../types';

export const createEditorSlice: StateCreator<EditorState, [], [], Partial<EditorState>> = (set, get) => ({
  editorGroups: [{ id: 'primary', openTabs: [], activeFilePath: null, activeFileContent: null }],
  activeGroupId: 'primary',
  focusHistory: ['primary'],
  isSplitScreen: false,
  cursorPosition: { line: 1, column: 1 },
  focusContext: 'editor',
  sidebarView: 'explorer',
  
  searchQuery: '',
  searchResults: [],
  isSearching: false,

  setCursorPosition: (line, column) => set({ cursorPosition: { line, column } }),

  setActiveGroup: (groupId) => set((state) => ({ 
    activeGroupId: groupId,
    focusHistory: [...state.focusHistory.filter(id => id !== groupId), groupId]
  })),

  openFile: (filePath, fileName, groupId) => {
    const state = get();
    if (filePath) state.addToRecentPaths(filePath);
    const targetGroupId = groupId || state.activeGroupId;
    const groups = [...state.editorGroups];
    const groupIndex = groups.findIndex(g => g.id === targetGroupId);
    if (groupIndex === -1) return;

    const group = groups[groupIndex];
    if (!group.openTabs.find(t => t.path === filePath)) {
      group.openTabs = [...group.openTabs, { 
        path: filePath, 
        name: fileName, 
        isDirty: false,
        cursorPosition: { line: 1, column: 1 }
      }];
    }
    group.activeFilePath = filePath;
    set({ editorGroups: groups, activeGroupId: targetGroupId });
  },

  closeFile: (filePath, groupId) => {
    const state = get();
    const targetGroupId = groupId || state.activeGroupId;
    const groups = [...state.editorGroups];
    const groupIndex = groups.findIndex(g => g.id === targetGroupId);
    if (groupIndex === -1) return;

    const group = groups[groupIndex];
    const newTabs = group.openTabs.filter((t) => t.path !== filePath);
    let newActive = group.activeFilePath;
    
    if (group.activeFilePath === filePath) {
      newActive = newTabs.length > 0 ? newTabs[newTabs.length - 1].path : null;
    }
    
    group.openTabs = newTabs;
    group.activeFilePath = newActive;
    
    // Auto-collapse if no tabs left in a group and there are other groups
    if (newTabs.length === 0 && groups.length > 1) {
      const closedIdx = groups.findIndex(g => g.id === targetGroupId);
      const remainingGroups = groups.filter(g => g.id !== targetGroupId);
      
      const leftNeighbor = closedIdx > 0 ? groups[closedIdx - 1] : null;
      const rightNeighbor = closedIdx < groups.length - 1 ? groups[closedIdx + 1] : null;

      let nextFocusId = remainingGroups[0].id;
      if (leftNeighbor && !rightNeighbor) {
        nextFocusId = leftNeighbor.id;
      } else if (rightNeighbor && !leftNeighbor) {
        nextFocusId = rightNeighbor.id;
      } else if (leftNeighbor && rightNeighbor) {
        const lastLeft = state.focusHistory.lastIndexOf(leftNeighbor.id);
        const lastRight = state.focusHistory.lastIndexOf(rightNeighbor.id);
        nextFocusId = lastLeft > lastRight ? leftNeighbor.id : rightNeighbor.id;
      }

      set({ 
        isSplitScreen: remainingGroups.length > 1, 
        editorGroups: remainingGroups, 
        activeGroupId: nextFocusId,
        focusHistory: state.focusHistory.filter(id => id !== targetGroupId)
      });
      return;
    }

    set({ editorGroups: groups });
  },

  setActiveFile: (filePath, groupId) => {
    const state = get();
    if (filePath) state.addToRecentPaths(filePath);
    const targetGroupId = groupId || state.activeGroupId;
    const groups = [...state.editorGroups];
    const groupIndex = groups.findIndex(g => g.id === targetGroupId);
    if (groupIndex === -1) return;
    groups[groupIndex].activeFilePath = filePath;
    set({ editorGroups: groups, activeGroupId: targetGroupId });
  },

  setActiveFileContent: (content, groupId) => {
    const state = get();
    const targetGroupId = groupId || state.activeGroupId;
    const groups = [...state.editorGroups];
    const groupIndex = groups.findIndex(g => g.id === targetGroupId);
    if (groupIndex === -1) return;
    groups[groupIndex].activeFileContent = content;
    set({ editorGroups: groups });
  },

  setFileDirty: (filePath, isDirty, groupId) => {
    const state = get();
    const targetGroupId = groupId || state.activeGroupId;
    const groups = [...state.editorGroups];
    const groupIndex = groups.findIndex(g => g.id === targetGroupId);
    if (groupIndex === -1) return;
    
    const group = groups[groupIndex];
    const tab = group.openTabs.find(t => t.path === filePath);
    if (tab) {
      tab.isDirty = isDirty;
      set({ editorGroups: groups });
    }
  },

  updateTabState: (path, tabState, groupId) => {
    const state = get();
    const targetGroupId = groupId || state.activeGroupId;
    const groups = [...state.editorGroups];
    const groupIndex = groups.findIndex(g => g.id === targetGroupId);
    if (groupIndex === -1) return;

    const group = groups[groupIndex];
    const tabIndex = group.openTabs.findIndex(t => t.path === path);
    if (tabIndex !== -1) {
      group.openTabs[tabIndex] = { ...group.openTabs[tabIndex], ...tabState };
      set({ editorGroups: groups });
    }
  },

  toggleSplitScreen: () => {
    const { editorGroups, activeGroupId, focusHistory } = get();
    const activeGroup = editorGroups.find(g => g.id === activeGroupId) || editorGroups[0];
    const currentFile = activeGroup.openTabs.find(t => t.path === activeGroup.activeFilePath);

    const newGroupId = `group-${Date.now()}`;
    const newGroup: EditorGroup = {
      id: newGroupId,
      openTabs: currentFile ? [{ ...currentFile }] : [],
      activeFilePath: activeGroup.activeFilePath,
      activeFileContent: activeGroup.activeFileContent
    };

    const newGroups = [...editorGroups, newGroup];
    set({ 
      isSplitScreen: true, 
      editorGroups: newGroups, 
      activeGroupId: newGroupId,
      focusHistory: [...focusHistory, newGroupId]
    });
  },

  closeOtherFiles: (filePath, groupId) => {
    const state = get();
    const targetGroupId = groupId || state.activeGroupId;
    const groups = [...state.editorGroups];
    const groupIndex = groups.findIndex(g => g.id === targetGroupId);
    if (groupIndex === -1) return;

    const group = groups[groupIndex];
    group.openTabs = group.openTabs.filter(t => t.path === filePath);
    group.activeFilePath = filePath;
    set({ editorGroups: groups });
  },

  closeAllFiles: (groupId) => {
    const state = get();
    const targetGroupId = groupId || state.activeGroupId;
    const groups = [...state.editorGroups];
    const groupIndex = groups.findIndex(g => g.id === targetGroupId);
    if (groupIndex === -1) return;
    
    const group = groups[groupIndex];
    group.openTabs = [];
    group.activeFilePath = null;
    group.activeFileContent = null;
    
    // Auto-collapse if clearing all tabs and there are other groups
    if (groups.length > 1) {
      const closedIdx = groups.findIndex(g => g.id === targetGroupId);
      const remainingGroups = groups.filter(g => g.id !== targetGroupId);
      
      const leftNeighbor = closedIdx > 0 ? groups[closedIdx - 1] : null;
      const rightNeighbor = closedIdx < groups.length - 1 ? groups[closedIdx + 1] : null;

      let nextFocusId = remainingGroups[0].id;
      if (leftNeighbor && !rightNeighbor) {
        nextFocusId = leftNeighbor.id;
      } else if (rightNeighbor && !leftNeighbor) {
        nextFocusId = rightNeighbor.id;
      } else if (leftNeighbor && rightNeighbor) {
        const lastLeft = state.focusHistory.lastIndexOf(leftNeighbor.id);
        const lastRight = state.focusHistory.lastIndexOf(rightNeighbor.id);
        nextFocusId = lastLeft > lastRight ? leftNeighbor.id : rightNeighbor.id;
      }

      set({ 
        isSplitScreen: remainingGroups.length > 1, 
        editorGroups: remainingGroups, 
        activeGroupId: nextFocusId,
        focusHistory: state.focusHistory.filter(id => id !== targetGroupId)
      });
      return;
    }

    set({ editorGroups: groups });
  },

  setFocusContext: (context) => set({ focusContext: context }),

  setSidebarView: (view) => set({ sidebarView: view }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (isSearching) => set({ isSearching }),
});
