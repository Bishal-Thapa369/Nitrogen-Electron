# Nitrogen Editor: Strategic Architectural Plan

> [!IMPORTANT]
> ### 🚨 THE "CALCULATION OFF-LOAD" STRATEGY
> To achieve the performance of a native C++ editor with the aesthetics of a modern web interface, we strictly separate concerns# Nitrogen Editor Project Plan 🚀

### PHASE 1: UI & Base Architecture (COMPLETED ✅)
- [x] Absolute-tracking resizer handles.
- [x] O(1) File Explorer with virtualization (100k+ files).
- [x] Monaco editor mount & custom theme base.
- [x] Sidebar navigation & folder selection.

### PHASE 2: Core Editor Features (CURRENT 🎯)
- [ ] **Save System:** Implement Electron IPC to write file content to disk (Ctrl+S).
- [ ] **Search & Replace:** Universal search (Ctrl+F) and project-wide search.
- [ ] **Undo/Redo Stability:** Leveraging Monaco's internal model for 100% reliability.
- [ ] **Persistence:** Auto-restore open tabs and cursor position across sessions.
- [ ] **Tab Management:** Smooth switching with state persistence.

### PHASE 3: Navigation & Buffer Intelligence 🧠
- [ ] **O(1) Minimap:** High-performance preview for 10k+ lines of code.
- [ ] **Navigation Persistence:** Buffer 50 lines above/below for instant tab swaps.
- [ ] **Context-Aware Sidebar:** Syncing explorer selection with active tab.

### PHASE 4: Industrial Syntax Engine (Final Polish ✨)
- [ ] **Tree-sitter Integration:** Connect the already-compiled C++ AST engine.
- [ ] **High-Fidelity Coloring:** Replace Monaco's regex with structural AST tokens.
- [ ] **Pro-Grade Themes:** Premium neon and muted slate palettes.

---

## 1. Core Architecture Pattern

### 1.1 Logic Layer (The Brain) → C++
- **Responsibility**: ALL heavy-duty calculations, data management, and logic.
- **Tech**: C++17/20 (String-pool, Tree-sitter, Ripgrep, Filesystem).
- **Tasks**:
  - Text Buffer operations ($O(1)$ native manipulation).
  - Syntax tokenization & incremental parsing (Tree-sitter).
  - File System I/O and encoding detection.
  - Search/Regex engine optimization.
  - Multi-cursor coordinate calculations.
- **Benefit**: Zero-latency response for file operations and massive data handling.

### 1.2 Display Layer (The Shell) → Electron + React
- **Responsibility**: ONLY rendering the user interface and handling input event forwarding.
- **Tech**: React + TypeScript + Tailwind CSS 4.0 inside an Electron Chromium shell.
- **Tasks**:
  - Rendering markers, characters, and UI components.
  - Capturing keyboard/mouse events and piping them to C++.
  - Managing themes, layouts, and animations.
- **Benefit**: 100% visual parity with modern design standards (CodeWeaver aesthetic) while keeping the JS heap small.

---

## 2. RAM Optimization Strategy

### 2.1 The "Dumb Browser" Benefit
By moving all calculations to C++, the Electron process behaves like a single browser tab with no active scripts running heavy logic.
- **Stable RAM**: Since Electron doesn't have to manage large JS objects for text buffers or syntax trees, its memory usage remains stable and predictable (targeting ~140MB - 180MB).
- **Shared Memory**: Using memory-mapped files in C++ allows us to view 10GB logs without the Electron process ever seeing the actual text bytes unless they are visible in the viewport.

---

## 3. Communication Bridge
- **Native Implementation**: Using **Node-API (N-API)** to bind C++ methods directly to the Node.js Main process.
- **IPC Throughput**: Efficiently sending only viewport-visible data to the React frontend.
- **Zero-Copy**: Attempting to use shared memory buffers between Node and C++ where possible.

---

## 4. Current Roadmap
1. [x] **Shell**: Electron scaffolding and secure IPC completed.
2. [x] **File Explorer**: Native C++ bridge for filesystem logic completed.
3. [/] **Bridge**: Finalize N-API bridge for the native text buffer.
4. [ ] **Display**: Finalize custom high-performance rendering surface (React/Canvas alternative).
