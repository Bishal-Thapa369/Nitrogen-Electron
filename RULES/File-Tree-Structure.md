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
- `src/ui/sidebar/sidebar.tsx` - Sidebar component for recursive native file explorer.
- `src/ui/sidebar/context_menu/context_menu.tsx` - Right-click context menu (Rename, Delete, Cut, Copy, Paste, Duplicate).
- `src/ui/editor/editor.tsx` - Monaco-based core editor rendering surface.
- `src/ui/tabs/tabs.tsx` - Tab management UI.
- `src/ui/status_bar/status_bar.tsx` - Informational status bar at the bottom.
- `src/ui/top_bar/top_bar.tsx` - Application control bar at the top.
- `src/ui/terminal/terminal.tsx` - Integrated terminal interface connected to the high-performance C++ backend.
- `src/ui/command_palette/command_palette.tsx` - Quick-action command interface.

## 📂 src/core/ (C++ Backend & Logic)
- `src/core/state/store.ts` - Central reactive state manager (Zustand).
- `src/core/document/text_buffer/piece_table.hpp` - Header for Piece Table logic.
- `src/core/document/text_buffer/piece_table.cpp` - Implementation of the Piece Table buffer logic.
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
- `RULES/Optimizations.md` - Strategic roadmap for performance-first implementation.
- `RULES/Plan.md` - The specialized architecture plan for C++ (Logic) and Electron (Display).
