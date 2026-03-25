# Nitrogen Editor 🧪

> **Blazing Fast. Hybrid Native. Code Centric.**

Nitrogen is a high-performance modern code editor built with a unique **Hybrid Architecture**: the industrial-grade performance of **C++17** for core logic, bridged via **Node-API (N-API)** to a fluid, premium **React/TypeScript** interface inside an **Electron/Chromium** shell.

## 🚀 The Hybrid Philosophy

Nitrogen isn't an "Electron app" in the traditional sense. It follows a strict **Calculation Off-load** strategy:
- **Logic Layer (The Brain):** C++ manages all heavy-duty tasks—File System scanning, Piece-Table text buffers, and eventually, syntax parsing (Tree-sitter).
- **Display Layer (The Shell):** React and Tailwind 4.0 handle the rendering, animations, and aesthetic interactions, ensuring 1:1 visual parity with modern design standards.

## ✨ Key Features (Phase 2: Native-Core)

- **Native C++ File Explorer:** Recursive directory scanning using `std::filesystem` with depth-limited lazy-loading. Optimized for repositories with 10k+ files.
- **N-API Bridge:** High-throughput communication between the C++ core and the Electron main process.
- **Piece-Table Text Buffer:** $O(1)$ performance for text insertions, deletions, and undo/redo operations (Implementation ongoing).
- **CodeWeaver Aesthetics:** A premium, glassmorphic UI designed for deep focus and visual excellence.

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Logic Core** | C++17 (Piece Table, Filesystem) |
| **Native Bridge** | N-API / cmake-js |
| **UI Shell** | Electron (Chromium) |
| **Frontend** | React 19, TypeScript, Tailwind CSS 4.0 |
| **State** | Zustand (Z-State) |

## 🏗️ Getting Started

### Prerequisites
- **Node.js**: v18+
- **C++ Compiler**: GCC 9+/Clang 10+ (Linux), MSVC (Windows), or Apple Clang (macOS).
- **CMake**: v3.15+

### Installation
```bash
# Clone the repository
git clone https://github.com/Bishal-Thapa369/Nitrogen-Electron.git
cd Nitrogen-Electron

# Install dependencies and compile the C++ native addon
npm install
```

### Development
```bash
# Launch the editor in development mode
npm run dev:electron
```

## 📜 Project Governance

Nitrogen follows a strict architectural protocol documented in the `RULES/` directory:
- [FIle-Rules.md](RULES/FIle-Rules.md) — Directory and file naming conventions.
- [Progress.md](RULES/Progress.md) — Permanent achievement log and mission roadmap.
- [Plan.md](RULES/Plan.md) — The strategic architectural roadmap.

---

### 📅 Current Milestone
**Milestone 22: Native Offloading Phase 1** — 100% Native File system integration completed. Currently transitioning text manipulation to the C++ Piece Table bridge.

---
Created by [Bishal Thapa](https://github.com/Bishal-Thapa369)
