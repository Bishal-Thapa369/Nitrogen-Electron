# Project File Tree Structure

> [!IMPORTANT]
> ### 🚨 AI COMMAND OPERATING RULES (MANDATORY)
> These rules are non-negotiable and must be followed by the AI Assistant before any file modification.
> 1. **MANDATORY PRE-READ:** Before making any change, the AI MUST read **Plan.md**, **Optimizations.md**, and **FIle-Rules.md** to understand the architectural context.
> 2. **CONTEXTUAL AWARENESS:** After reading rules, the AI MUST read this **File-Tree-Structure.md** to confirm the current project state.
> 3. **HALLUCINATION PREVENTION:** Every file in this project must have a 1-2 sentence description explaining its specific role. If a file is not in this list, it should not exist.
> 4. **MANDATORY POST-UPDATE:** This document MUST be updated immediately after every file creation, deletion, or modification.
> 5. **PERMANENCE:** These command rules are permanent and must never be removed or altered.
> 6. **PROGRESS TRACKING:** Never remove or truncate data from **Progress.md**. Only append new achievements and update the current focus to maintain a complete historical record.

---

# Current File Tree

## 📂 Root
- `/README.md` - Technical overview and build instructions for the Nitrogen Editor.
- `/package.json` - Node.js configuration for the React/Electron frontend.
- `/tsconfig.json` - TypeScript configuration for the frontend layers.
- `/vite.config.ts` - Build configuration for the React frontend with API proxying.
- `/index.html` - Entry point for the Chromium (Electron) frontend.
- `/CMakeLists.txt` - Root CMake build file for the C++ native addon (cmake-js).
- `/main.js` - Electron Main process entry point (ESM) that manages the native C++ bridge (N-API).
- `/preload.cjs` - Electron Preload script for secure IPC and native exposure.
- `/third_party/libvterm/` - External collection of libvterm source files for ANSI/VT100 state management.

## 📂 src/ui/ (Display Layer)
- `src/ui/app.tsx` - Main React entry point for the editor UI.
- `src/ui/main.tsx` - Bootstrapper for the React application.
- `src/ui/styles/index.css` - Global styling including Tailwind 4 themes and custom glassmorphism.
- `src/ui/sidebar/sidebar.tsx` - The 60-line structural orchestrator (Shell) for the recursive file explorer.
- `src/ui/sidebar/components/` - Atomic Visual Skins (Pure `tsx` components).
    - `file_row.tsx`: Single file item rendering (memoized).
    - `sidebar_header.tsx`: "Explorer" title and options.
    - `sticky_root.tsx`: Sticky root header with 4 action icons.
    - `new_input_row.tsx`: Dynamic absolute-positioned creation input row.
    - `empty_sidebar.tsx`: "No folder opened" view.
    - `sidebar_footer.tsx`: Outline and Timeline section footers.
- `src/ui/sidebar/hooks/` - Specialized Logic Subsystems.
    - `use_sidebar_virtualization.ts`: Scroll math and row-slicing logic.
    - `use_sidebar_creation.ts`: File/Folder creation state management.
    - `use_sidebar_navigation.ts`: Multi-selection and tree traversal logic.
    - `use_sidebar_shortcuts.ts`: Global keyboard event listeners (Ctrl+V, Delete, etc.).
- `src/ui/sidebar/logic/` - The Orchestrator Hub.
    - `use_sidebar_logic.ts`: Connects all sub-hooks to the main Sidebar shell.
- `src/ui/sidebar/utils/` - Style helpers and icon mapping algorithms.
- `src/ui/sidebar/context_menu/context_menu.tsx` - Right-click context menu (Rename, Delete, Cut, Copy, Paste, Duplicate).
- `src/ui/editor/editor.tsx` - The clean structural orchestrator (Shell) for the Monaco-based text editor.
- `src/ui/editor/components/` - Atomic UI Components.
    - `empty_editor.tsx`: Premium "Nitrogen" empty state view (The "N" screen).
- `src/ui/editor/hooks/` - Specialized Logic Subsystems.
    - `use_editor_logic.ts`: The orchestrator hook for layout, cursor tracking, and mounting.
    - `use_editor_theme.ts`: Premium Monaco theme engine for the "Nitrogen" aesthetic.
- `src/ui/editor/utils/` - Editor utilities.
    - `language_map.ts`: Extension-to-language mapping algorithm.
- `src/ui/tabs/tabs.tsx` - The clean structural orchestrator (Shell) for the horizontal document tab list.
- `src/ui/tabs/components/` - Atomic UI Components.
    - `tab_item.tsx`: Individual tab component with close logic and active indicators.
- `src/ui/tabs/hooks/` - Specialized Logic Subsystems.
    - `use_tabs_logic.ts`: Hook for tab switching, reading file contents, and closing events.
- `src/ui/tabs/utils/` - Tab utilities.
    - `tab_icons.tsx`: Specialized file extension to themed-icon mapping.
- `src/ui/status_bar/status_bar.tsx` - Informational status bar at the bottom.
- `src/ui/top_bar/top_bar.tsx` - Application control bar at the top.
- `src/ui/terminal/terminal.tsx` - The clean 40-line structural orchestrator (Shell) for the integrated terminal.
- `src/ui/terminal/components/` - Atomic Visual Components.
    - `terminal_header.tsx`: Tab navigation and action buttons (Clear, Maximize, Close).
- `src/ui/terminal/hooks/` - Specialized Logic Subsystems.
    - `use_terminal_logic.ts`: The XTerm and N-API engine.
    - `use_terminal_theme_sync.ts`: Light/Dark mode visual synchronization.
- `src/ui/terminal/utils/` - Global Terminal utilities.
    - `terminal_themes.ts`: The 40+ line ANSI/Neon palette definitions.
- `src/ui/command_palette/command_palette.tsx` - Quick-action command interface.

## 📂 src/core/ (C++ Backend & Logic)
- `src/core/state/store.ts` - Central reactive state manager (Zustand). Now an orchestrator for atomic slices.
- `src/core/state/types.ts` - Centralized interfaces for tree nodes, editor groups, and global state.
- `src/core/state/utils/tree_helpers.ts` - Isolated recursive logic for tree merging, updating, and path resolution.
- `src/core/state/slices/` - Specialized store fragments.
    - `ui_slice.ts`: Global theme and layout toggles.
    - `editor_slice.ts`: N-group split management, tab focus, and history tracking.
    - `explorer_slice.ts`: Native C++ bridge interactions, bulk operations, and sidebar state.
- `src/core/document/text_buffer/` - Directory for native editor buffer implementations.
- `src/core/file_system/file_node.hpp` - FileNode struct for recursive tree representation.
- `src/core/file_system/file_explorer.hpp` - FileExplorer class API (scan, expand, collapse, refresh).
- `src/core/file_system/file_explorer.cpp` - Implementation using std::filesystem with depth-limited scanning.
- `src/core/terminal/terminal_session.hpp` - Header for TerminalSession, managing PTY and libvterm states.
- `src/core/terminal/terminal_session.cpp` - Implementation of PTY spawning (forkpty) and asynchronous PTY I/O thread.
- `src/core/bridge/file_explorer_bridge.cpp` - N-API bridge exposing C++ FileExplorer to Node.js/Electron.
- `src/core/bridge/terminal_bridge.cpp` - N-API bridge exposing the terminal backend via ThreadSafeFunction for real-time streaming.


## 📂 src/main/ipc/ (Modular IPC Handlers)
- `src/main/ipc/file_operations.js` - IPC handlers for file rename, delete, move, and copy operations.

## 📂 scripts/ (Tooling)
- `scripts/ram-usages.sh` - Utility task to monitor and audit current Electron/Node process memory usage.

## 📂 RULES/ (Standard Procedures)
- `RULES/FIle-Rules.md` - Strict architectural and directory conventions.
- `RULES/File-Tree-Structure.md` - (This file) Mandatory project state and file roles.
- `RULES/Progress.md` - Permanent historical achievement log and current mission focus.
- `RULES/Architecture-to-Package.md` - Strategy for hybrid compilation and OS-specific bundling.
- `RULES/Plugin-Architecture-Vision.md` - Roadmap for process-isolated extensions and NitroScript hooks.
- `RULES/Optimizations.md` - Strategic roadmap for performance-first implementation.
- `RULES/Plan.md` - The specialized architecture plan for C++ (Logic) and Electron (Display).
