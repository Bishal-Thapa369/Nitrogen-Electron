# 🚀 Nitrogen: Future Improvement Strategy (Phase 4 Roadmap)

This industrial-grade roadmap outlines the transition of Nitrogen from an elite high-performance shell into a professional-grade development environment. Each pillar represents a critical "Reflex" upgrade to achieve industry-standard UX parity with VS Code and Sublime Text.

---

### 1. 🛡️ Pillar I: Absolute Tab Persistence & Session Recovery (Industrial Stability)
**Current Status:** Nitrogen currently operates on a transient session model. Reloading the Electron window, restarting the app, or switching project folders results in a total loss of the active tab state, split-screen layouts, and terminal context.

**The Industrial Fix:**
- **Workspace-Aware Sync:** Implement a `.nitrogen/workspace.json` (or localized Electron store) to snapshots the entire state of the `EditorGroups` array.
- **Visual Context Restoration:** Save and restore `activeGroupId`, `activeFilePath` per group, and the precise `sidebarWidth` and `terminalHeight`.
- **Background Terminal Resurrection:** Map existing PIDs or re-spawn identical terminal sessions upon re-entry, ensuring zero workflow disruption.
- **Benefit:** Transition from a session-based editor to a **Persistent Development Environment**.

### 2. 🔠 Pillar II: Global Sidebar Find & Replace (Native Content Discovery)
**Current Status:** Our high-speed `Ctrl+P` fuzzy search efficiently discovers filenames, but Nitrogen currently lacks a project-wide content-search engine.

**The Industrial Fix:**
- **C++ Multi-Threaded Content Scanner:** Bridge the existing `SearchEngine.cpp` to a new `Ctrl+Shift+F` sidebar view. 
- **Real-Time Result Virtualization:** Utilize our O(1) virtualization engine to display 10,000+ search matches across the project with zero UI stutter.
- **Regex & Case-Sensitivity:** Add professional-grade filtering toggles to the search input, allowing for high-fidelity content discovery.
- **Benefit:** Instant, project-wide code discovery that scales to repositories with 100k+ files.

### 3. 📂 Pillar III: Sidebar Keyboard-Only Navigation (Power-User Flux)
**Current Status:** The sidebar tree is currently a mouse-centric UI. While visually premium, it forces the user to break their terminal/editor focus to expand folders or select files.

**The Industrial Fix:**
- **Standard IDE Key-Bindings:** Implement a high-performance keyboard event listener in the `useSidebarNavigation` hook:
    - `Up/Down Arrows`: Navigate focused nodes in the file tree.
    - `Enter`: Open focused file as a permanent tab.
    - `Space / l`: Preview focused file (temporary tab) or expand folder.
    - `h / Escape`: Collapse folder or move focus to parent directory.
    - `Letter Keys`: Jump to next file matching the character (native OS-style search).
- **Benefit:** Professional **100% Keyboard-Driven Workflow**, keeping hands on the home row.

### 4. 🎨 Pillar IV: Minimalist & Interactive Status Bar Actions (Contextual Utility)
**Current Status:** The status bar provides a premium aesthetic but remains largely informational. It does not allow for real-time configuration of the active editor buffer or system state.

**The Industrial Fix:**
- **Dynamic Language Selection:** Make the "Language" name clickable to trigger a fuzzy-finder pop-up for switching Monaco syntax highlighting (e.g., from Plain Text to C++/JavaScript).
- **Interactive Formatting Control:** Add click handlers to the "Spaces: 2" indicator to toggle indentation settings or convert between Tabs and Spaces globally.
- **Fast Travel (Go to Line):** Link the "Line/Col" tracker to a `Ctrl+G` prompt for instant vertical navigation across large source files.
- **Real-Time Git Toggles:** Convert the Git branch indicator into a branch-switching menu.
- **Benefit:** High-speed contextual access to common editor commands directly from the footer.

---

### 🚀 Summary of Objectives
| Category | Priority | System Impact | UX Goal |
| :--- | :--- | :--- | :--- |
| **Persistence** | CRITICAL | Core State / Storage | Zero Workflow Loss |
| **Search** | HIGH | C++ Bridge / UI | Instant Content Discovery |
| **Navigation** | MEDIUM | Sidebar UI / Hooks | Mouse-Free Operation |
| **Utility** | POLISH | Status Bar / Editor | Contextual Control |

---
**Status:** DRAFT (Phase 4 Design Document)
**Target Branch:** v12-feature-cycle
