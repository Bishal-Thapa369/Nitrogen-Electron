/**
 * Independent Terminal Event Bus
 * 
 * Lightweight dispatcher for multi-session terminal data.
 * Pure TypeScript (no Node.js 'events' dependency) to ensure renderer compatibility.
 */
class TerminalEventEmitter {
  private listeners: Record<string, Function[]> = {};

  on(event: string, fn: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  off(event: string, fn: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== fn);
  }

  emit(event: string, ...args: any[]) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(fn => fn(...args));
  }
}

export const terminalEvents = new TerminalEventEmitter();

// Initialize the global listener once
if (typeof window !== 'undefined' && (window as any).electronAPI) {
  (window as any).electronAPI.onTerminalData((sid: number, data: string) => {
    terminalEvents.emit(`data-${sid}`, data);
    // Also emit a generic data event for simplicity if needed
    terminalEvents.emit('any-data', sid, data);
  });
}
