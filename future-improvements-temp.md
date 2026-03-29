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


### 2. 📂 Pillar III: Sidebar Keyboard-Only Navigation (Power-User Flux)
**Current Status:** The sidebar tree is currently a mouse-centric UI. While visually premium, it forces the user to break their terminal/editor focus to expand folders or select files.

**The Industrial Fix:**
- **Standard IDE Key-Bindings:** Implement a high-performance keyboard event listener in the `useSidebarNavigation` hook:
    - `Up/Down Arrows`: Navigate focused nodes in the file tree.
    - `Enter`: Open focused file as a permanent tab.
    - `Space / l`: Preview focused file (temporary tab) or expand folder.
    - `h / Escape`: Collapse folder or move focus to parent directory.
    - `Letter Keys`: Jump to next file matching the character (native OS-style search).
- **Benefit:** Professional **100% Keyboard-Driven Workflow**, keeping hands on the home row.


---

### 🚀 Summary of Objectives
| Category | Priority | System Impact | UX Goal |
| :--- | :--- | :--- | :--- |
| **Persistence** | CRITICAL | Core State / Storage | Zero Workflow Loss |
| **Navigation** | MEDIUM | Sidebar UI / Hooks | Mouse-Free Operation |

---
**Status:** DRAFT (Phase 4 Design Document)
**Target Branch:** v12-feature-cycle
