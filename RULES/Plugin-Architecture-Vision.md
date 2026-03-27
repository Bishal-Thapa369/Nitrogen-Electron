# Nitrogen Plugin Architecture: The Vision for Infinite Extensibility 🔌

As Nitrogen matures, we don't want to modify the core "Engine" for every small feature or visual tweak. This document outlines the roadmap for the **Nitrogen Plugin API (Phase 4)**, drawing inspiration from industry leaders like VS Code.

---

## 🛡️ Model: The VS Code "Extension Host" 🛡️
VS Code prevents extensions from slowing down the editor UI by using a **Process-Isolation Strategy**.

-   **Separate Process:** It spawns a dedicated Node.js process called the **Extension Host**.
-   **Crash Protection:** If an extension crashes, the main editor continues to run without interruption.
-   **IPC Message Passing:** The editor and the extension host communicate via an **Intersubjective Logic Bridge** (IPC), effectively the same high-speed architecture we use for our C++ native core.

---

## 🎨 Nitrogen Strategy: The "Plugin Bridge"
Since Nitrogen already has an atomic store and a modular bridge, we are perfectly positioned to implement a high-performance plugin engine.

### Step 1: Decentralized Discovery 📂
The editor will monitor a specific **`extensions/`** directory. Each folder there must contain a **`manifest.json`** defining the plugin's name, version, and the entry point for its logic.

### Step 2: The "Socket" System (Hooks) 🔌
We will expose lifecycle "sockets" within our Zustand store that plugins can subscribe to:
-   **`onFileOpen`**: Triggered when a new document is loaded (e.g., for auto-formatting).
-   **`onKeyStroke`**: Intercept keystrokes (e.g., for Vim-mode emulation).
-   **`onSidebarRender`**: Inject custom icons or file-tree metadata.
-   **`onTerminalData`**: Monitor or transform shell outputs.

### Step 3: The Restricted `nitrogen` API 🛡️
To ensure security and stability, plugins won't have direct access to internal global states. Instead, they will use a formal **Proxy Object**:

```javascript
// Example: A tiny "Hello World" plugin:
nitrogen.commands.register('hello-world', () => {
   nitrogen.window.showToast("Hello from your first Nitrogen Add-on!");
});
```

---

## 💡 The "NitroScripts" Solution (Zero-Edit Tweaks)
For internal power-users who want to make quick changes without creating a full extension, we will implement **NitroScripts**.

-   **`nitro.config.js`**: A single configuration file at the root of the project.
-   **Role:** You can write 2-3 lines of JavaScript there to override shortcuts, change themes, or tweak UI margins instantly—no need to touch the `src/` core.

---

## 🚀 The Future of Nitrogen
By implementing this plugin architecture, we achieve a status of **Permanent Extensibility**. Nitrogen will grow not just through our core development, but through an ecosystem of "Nitro-ready" scripts and plugins. 🏆🏆
