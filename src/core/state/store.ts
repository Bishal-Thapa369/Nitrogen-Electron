import { create } from 'zustand';
import { EditorState } from './types';
import { createUISlice } from './slices/ui_slice';
import { createEditorSlice } from './slices/editor_slice';
import { createExplorerSlice } from './slices/explorer_slice';

// Re-export types for convenience across the app
export * from './types';

/**
 * Nitrogen Core Store: Atomic Orcherstrator
 * Merges specialized logic slices into a unified global state.
 */
export const useStore = create<EditorState>()((...a) => ({
  ...createUISlice(...a),
  ...createEditorSlice(...a),
  ...createExplorerSlice(...a),
} as EditorState));
