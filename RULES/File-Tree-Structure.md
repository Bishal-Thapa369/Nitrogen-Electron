# Project File Tree Structure

> [!IMPORTANT]
> ### 🚨 AI COMMAND OPERATING RULES (MANDATORY)
> These rules are non-negotiable and must be followed by the AI Assistant before any file modification.
> 1. **MANDATORY PRE-READ:** Before making any change, the AI MUST read **Plan.md**, **Optimizations.md**, and **FIle-Rules.md** to understand the architectural context.
> 2. **CONTEXTUAL AWARENESS:** After reading rules, the AI MUST read this **File-Tree-Structure.md** to confirm the current project state.
> 3. **HALLUCINATION PREVENTION:** Every single source file in this project MUST have a 1-2 sentence description explaining its specific role. If a file exists in the repository, it MUST be listed here.
> 4. **MANDATORY POST-UPDATE:** This document MUST be updated immediately after every file creation, deletion, or modification.
> 5. **PERMANENCE:** These command rules are permanent and must never be removed or altered.

---

# Current File Tree

## 📂 Root 
- `README.md` - Technical setup, build instructions, and architectural goals for the Nitrogen Editor.
- `package.json` / `package-lock.json` - Node.js project management for the React/Electron layers.
- `tsconfig.json` / `tsconfig.node.json` - TypeScript configuration for frontend and build tools.
- `vite.config.ts` - React build and development server configuration.
- `index.html` - Entrance for the Chromium-based UI.
- `main.js` - Electron Main process entry point; orchestrates native C++ runtime, session management, and PTY bridging.
- `preload.cjs` - Electron Preload security layer; exposes high-performance IPC methods to the frontend including terminal session control.
- `public/` - Static assets like `vite.svg` and `tauri.svg` served to the Chromium UI.
- `src/assets/` - Internal React assets like `react.svg`.
- `CMakeLists.txt` - CMake configuration for building the high-speed C++ native modules (File Explorer, Terminal, Search).
- `.gitignore` - Standard filters for ignoring build artifacts, caches, and node_modules.

## 📂 src/core/ (The C++ Engine & State Context)

### 📂 bridge/
- `file_explorer_bridge.cpp` - N-API implementation exposing high-performance disk scanning to Node.js.
- `search_bridge.cpp` - N-API bridge for the asynchronous, multithreaded universal search engine.
- `terminal_bridge.cpp` - Bridge for PTY-streaming using ThreadSafeFunctions for zero-latency terminal output.

### 📂 file_system/ 
- `file_explorer.cpp/hpp` - The core C++ engine for O(1) file scanning and lazy-loading recursive trees.
- `file_node.hpp` - Shared data structure for representing file and folder metadata in native memory.

### 📂 search/
- `search_engine.cpp/hpp` - The multithreaded logic for scanning 100k+ files for query matches in filenames and content.

### 📂 state/
- `store.ts` - Main Zustand state orchestrator that merges atomic slices into a single source of truth.
- `types.ts` - Central repository for all shared TypeScript interfaces (Tabs, Explorer, Search results, Concurrent Terminal sessions).
- `utils/tree_helpers.ts` - Utility functions for recursive tree updates and path transformations.
- `slices/ui_slice.ts` - Handles global UI toggles, terminal visibility/maximization, and theme state.
- `slices/editor_slice.ts` - Manages multi-group editor state, tabs, active filenames, and search queries.
- `slices/explorer_slice.ts` - Direct state interface for the C++ file explorer and sidebar interaction.

### 📂 terminal/
- `terminal_session.cpp/hpp` - Low-level PTY management (forkpty) and libvterm integration for native shell sessions.

## 📂 src/main/ (Backend IPC Bridge Logic)

### 📂 ipc/
- `file_operations.js` - Electron IPC handlers for CRUD filesystem operations (Create, Rename, Delete).
- `file_content.js` - Specialized bridge for high-speed file loading and saving.

## 📂 src/ui/ (Display & Interface Layer)

### 📂 hooks/
- `use_global_shortcuts.ts` - Global event listener that handles application-wide hotkeys like `Ctrl+P`, `Ctrl+Shift+P`, and `Ctrl+K`.

### 📂 sidebar/
- `sidebar.tsx` - Shell component orchestrating the transition between Explorer and Search panels.
- `components/search_panel.tsx` - Interface for universal project search and real-time result viewing.
- `components/file_row.tsx` - High-performance virtualized row for displaying file tree items.
- `components/sidebar_footer.tsx` / `sidebar_header.tsx` - Peripheral UI sections for section titles and status badges.
- `components/sticky_root.tsx` - Main project root header with actionable icons for file/folder creation.
- `components/new_input_row.tsx` - Contextual input field for naming new files or directories.
- `components/empty_sidebar.tsx` - Placeholder view when no workspace is active.
- `context_menu/context_menu.tsx` - Desktop-grade context menu for advanced file manipulation (Cut, Copy, Paste, Delete).
- `hooks/use_sidebar_virtualization.ts` - Logic for managing scroll offsets and windowed rendering of large trees.
- `hooks/use_sidebar_navigation.ts` - Logic for tree traversal, selection, and opening files into editor tabs.
- `hooks/use_sidebar_shortcuts.ts` - Keyboard listeners confined to the sidebar (Deletion, Renaming, Navigation).
- `hooks/use_sidebar_creation.ts` - State management for the file creation lifecycle.
- `logic/use_sidebar_logic.ts` - Main orchestrator hook for the sidebar display logic.
- `utils/sidebar_utils.tsx` - Specialized icon mappings and visual style calculation.

### 📂 editor/
- `editor.tsx` - Main shell for the text editor, managing groups and individual instances.
- `editor_group.tsx` - Container for managing split-screen editor views, now including breadcrumb integration.
- `components/breadcrumbs.tsx` - Premium breadcrumb navigation for deep project location tracking.
- `components/breadcrumb_popup.tsx` - Contextual popup for navigating sibling files and direct parent hierarchies.
- `components/empty_editor.tsx` - The premium "N" screen when no document is open.
- `hooks/use_editor_logic.ts` - Logic for mounting Monaco and managing the editor lifecycle.
- `hooks/use_editor_theme.ts` - Custom-themed Monaco configuration for the high-end Nitrogen brand.
- `hooks/use_editor_actions.ts` - Common editor functions (Saving, Formatting, Tab Closing).
- `hooks/use_editor_shortcuts.ts` - Editor-specific keyboard shortcuts (Split view, Goto line).
- `hooks/use_breadcrumbs_logic.ts` - Logic for calculating and navigating breadcrumb paths based on active editor state.
- `utils/language_map.ts` - Algorithmic mapping of file extensions to editor languages.

### 📂 tabs/
- `tabs.tsx` - Interactive tab bar for document management.
- `components/tab_item.tsx`: Visual representation of an open file with close and modified indicators.
- `components/tabs_toolbar.tsx`: Actions for splitting screens and zooming.
- `hooks/use_tabs_logic.ts`: State transitions for switching focus between document tabs.
- `utils/tab_icons.tsx`: Extension-to-icon mapping for tab visual identities.

### 📂 terminal/
- `terminal.tsx` - Multi-session concurrent terminal wrapper with resizable sidebar and max/min support.
- `components/terminal_header.tsx` - Control bar for multi-tab management (New, Reset, Maximize, Hide).
- `components/terminal_instance.tsx` - Individual xterm.js instance bound to a specific C++ PID.
- `hooks/use_terminal_logic.ts` - State orchestrator for multiple concurrent terminal sessions.
- `hooks/use_terminal_instance.ts` - Reusable hook for single terminal session lifecycle and data routing.
- `hooks/use_terminal_shortcuts.ts` - Professional console shortcuts (Ctrl+Shift+C/V, SIGINT vs Copy handler).
- `hooks/use_terminal_theme_sync.ts` - Utility for ensuring terminal visuals match global editor themes.
- `utils/terminal_themes.ts` - Central color palette for the ANSI/VT-100 terminal output.
- `utils/terminal_events.ts` - Global event emitter for cross-tab terminal communication and data routing.

### 📂 status_bar/
- `status_bar.tsx`: The Modular Shell that orchestrates 8 atomic command modules.
- `hooks/use_status_bar_state.ts`: Central logic for the status bar, managing periodic Git polling, memory refresh, and internal popup states.
- `popups/ram_breakdown.tsx`: Premium interactive dashboard showing detailed RAM metrics for all Nitrogen processes (Main, UI, GPU, Utility).
- `components/module_a_language.tsx`: Fuzzy-search trigger for Monaco syntax modes.
- `components/module_b_indentation.tsx`: Quick-toggle for Spaces/Tabs and indent size.
- `components/module_c_fast_travel.tsx`: Go-to-Line navigation via Ln/Col tracker.
- `components/module_d_git_sync.tsx`: Real-time branch monitoring and change counts.
- `components/module_e_ram_monitor.tsx`: Industrial-grade monitor displaying the 'TOTAL RAM' footprint across the whole app.
- `components/module_f_format_guard.tsx`: Global "Prettier" formatting trigger.
- `components/module_g_encoding_lock.tsx`: File integrity toggles (UTF-8, LF/CRLF, Read-Only).
- `components/module_h_notifications.tsx`: Atomic progress hub for background C++ tasks.

### 📂 top_bar/
- `top_bar.tsx`: Premium window title bar with system menu integration.

### 📂 command_palette / commands /
- `command_palette/command_palette.tsx`: Universal Command Palette (`Ctrl+Shift+P`) for quick action discovery.
- `commands/quick_open.tsx`: High-speed Quick Open (`Ctrl+P`) interface for instant filename-based navigation.
- `commands/hooks/use_quick_open_logic.ts`: Logic for real-time result filtering and project-wide file discovery.

### 📂 utils/
- `cn.ts`: Standard Tailwind-merge utility for dynamic CSS classes.
- `vite-env.d.ts`: Vite environment type definitions for TypeScript.

---

## 📂 RULES/ & scripts/
- `RULES/Plan.md`: The development roadmap and architectural strategy.
- `RULES/Progress.md`: Chronological log of implemented features.
- `RULES/FIle-Rules.md`: Conventions for code styling and directory hierarchy.
- `RULES/File-Tree-Structure.md`: (This file) 100% accurate map of repository contents.
- `RULES/Architecture-to-Package.md`: Deployment and native-addon compilation strategies.
- `RULES/Optimizations.md`: Roadmap for high-performance UI and backend patterns.
- `scripts/ram-usages.sh`: Utility script for performance auditing.
