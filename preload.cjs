const { contextBridge, ipcRenderer } = require('electron');

// Expose IPC functionality to the renderer safely using CommonJS for stability
contextBridge.exposeInMainWorld('electronAPI', {
  // Direct IPC Send/Receive
  send: (channel, data) => {
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  // Specific Window Controls
  minimize: () => {
    console.log('Renderer: Requesting Minimize');
    ipcRenderer.send('window-minimize');
  },
  maximize: () => {
    console.log('Renderer: Requesting Maximize');
    ipcRenderer.send('window-maximize');
  },
  close: () => {
    console.log('Renderer: Requesting Close');
    ipcRenderer.send('window-close');
  }
});
