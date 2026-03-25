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
- `/main.js` - Electron Main process entry point (ESM) that manages the window and native bridge.
- `/preload.js` - Electron Preload script for secure IPC communication.
- `/server.ts` - Mock backend server for handling file operations during development.
- `/mock-fs.json` - Temporary JSON-based file system storage for the mock server.

## 📂 src/ (Frontend & Core Shared)
- `src/App.tsx` - Main React entry point for the editor UI.
- `src/main.tsx` - Bootstrapper for the React application.
- `src/index.css` - Global styling including Tailwind 4 themes and glassmorphism.

## 📂 src/core/ (C++ Backend Core)
- `src/core/document/text_buffer/piece_table.hpp` - Header defining the `PieceTable` class and its Piece/Buffer descriptors.
- `src/core/document/text_buffer/piece_table.cpp` - Implementation of the Piece Table buffer logic for $O(1)$ amortized edit performance.

## 📂 scripts/ (Tooling)
- `scripts/ram-usages.sh` - Utility task to monitor and audit current Electron/Node process memory usage.

## 📂 RULES/ (Standard Procedures)
- `RULES/FIle-Rules.md` - Strict architectural and directory conventions.
- `RULES/File-Tree-Structure.md` - (This file) Mandatory project state and file roles.
- `RULES/Progress.md` - Permanent historical achievement log and current mission focus.
- `RULES/Optimizations.md` - Strategic roadmap for performance-first implementation.
- `RULES/Plan.md` - The specialized architecture plan for C++ (Logic) and Electron (Display).
