import { Terminal as XTerm } from 'xterm';

export const setupTerminalShortcuts = (term: XTerm) => {
  term.attachCustomKeyEventHandler((e: KeyboardEvent) => {
    // We only want to handle shortcuts on keydown to prevent double-firing (keydown + keypress/keyup)
    if (e.type !== 'keydown') {
      return true; 
    }

    // ---- Terminal Specific Linux Shortcuts ----
    
    // Ctrl+Shift+C: Copy to Clipboard
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      const selection = term.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection).catch(() => {
          // Fallback if browser blocks clipboard API
          document.execCommand('copy');
        });
      }
      return false; // Intercept key
    }

    // Ctrl+Shift+V: Paste from Clipboard
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        term.paste(text);
      }).catch(() => {
        // Fallback if browser blocks clipboard reading
        // The user can still fall back to native right-click paste or Ctrl+V
      });
      return false; // Intercept key
    }

    // Ctrl+C: Smart Copy / SIGINT
    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'c') {
      if (term.hasSelection()) {
        e.preventDefault();
        navigator.clipboard.writeText(term.getSelection()).catch(() => document.execCommand('copy'));
        return false;
      }
      // If no selection, allow xterm.js to process it and send SIGINT (\x03)
      return true;
    }

    // Ctrl+V: Standard Paste
    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        term.paste(text);
      }).catch(() => {});
      return false;
    }

    // ---- Global App Shortcuts Bypass ----
    // This allows xterm to ignore the keystroke, bubbling it up to the global window listener (use_global_shortcuts)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') return false; // Open Folder
    if ((e.ctrlKey || e.metaKey) && e.key === '`') return false; // Toggle Terminal
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') return false; // Save File
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') return false; // Global Search
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') return false; // Global Explorer
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') return false; // Command Palette

    return true; // Use default xterm handling for all other keys
  });
};
