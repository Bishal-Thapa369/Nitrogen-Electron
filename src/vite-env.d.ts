/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    send: (channel: string, data: any) => void;
    receive: (channel: string, func: (...args: any[]) => void) => void;
  };
}
