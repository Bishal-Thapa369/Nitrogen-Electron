# Nitrogen Hybrid Architecture: The Journey to a Standalone App 📦

This document explains exactly how the "loose parts" of our industrial-grade hybrid architecture (C++, TypeScript, Node.js, and CSS) are bolted together into a single, high-performance installer (`.exe`, `.deb`, `.dmg`).

---

## 🏗️ The Hybrid Philosophy: Calculation Off-loading
Nitrogen operates on a **Calculation Off-load Strategy**. We don't just "run JS"; we treat JavaScript as the **Presenter** and C++ as the **Engine**.

### 🧩 The Three Core Domains:
1.  **Native Domain (The Engine):** C++17 Core managing recursive file scanning, PTY management, and high-performance Piece-Table text buffers.
2.  **Logic Domain (The Bridge):** Node-API (N-API) providing the zero-latency "handshake" between C++ and JavaScript.
3.  **Display Domain (The Shell):** React 19 and Tailwind 4.0 inside an Electron/Chromium shell, providing a premium glassy UI.

---

## 🛠️ The Build Pipeline: From Code to Installer

The process consists of three distinct stages of "crushing" and "wrapping":

### 🔹 Stage 1: Native Compilation (The Steel Work)
Before we can даже start the installer, we use **CMake** and **cmake-js** to compile all our `.cpp` and `.hpp` files.
-   **Output:** Binary files called **`.node`** addons.
-   **Role:** These are essentially **Native DLLs** for Node.js. They contain machine-code instructions that run directly on your CPU without any translation.

### 🔹 Stage 2: Frontend Bundling (The Paint & Interior)
We use **Vite** to process our entire React and TypeScript frontend.
-   **Output:** A compact **`dist/`** folder.
-   **Role:** Vite minifies thousands of lines of TSX and CSS into highly optimized, tiny JavaScript and HTML files. This ensures the UI is snappy and the app size stays lean.

### 🔹 Stage 3: Professional Packaging (The Magic Part) 🎩
Finally, we use **`electron-builder`** to produce the final executable. This involves architectural "stacking":

> [!NOTE]
> **1. ASAR Archiving:** 
> It bundles all your code (compiled JS, the `dist/` folder, and the `.node` C++ binaries) into one single, read-only, high-performance archive called an `app.asar`.
>
> **2. Runtime Inclusion:** 
> It takes a pre-compiled version of the **Electron executable** (a stripped-down, lightweight Chromium-based shell) that is specific to your Operating System.
>
> **3. OS Wrapping (The Installer):**
> *   **Windows:** Wraps the ASAR and Runtime into an **`.exe`** (NSIS Installer) or MSI.
> *   **Linux:** Wraps them into a **`.deb`** (Debian/Ubuntu), **`.AppImage`**, or **`.rpm`**.
> *   **macOS:** Wraps them into a **`.dmg`** or a **`.app`** bundle.

---

## 🎯 Consistency of Performance
Following this pipeline ensures that we maintain the industrial performance of a native app while using the aesthetic power of the modern web. When you click **Nitrogen.exe**, you aren't just opening a "web page"—you are starting a **C++ Engine** wrapped in a **Cinematic Shell**. 🚀🏆
