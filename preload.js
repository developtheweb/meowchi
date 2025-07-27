// Preload script for Electron
const { ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use ipcRenderer
window.meowchiAPI = {
  getInputStats: () => ipcRenderer.invoke('get-input-stats'),
  getTrackerStatus: () => ipcRenderer.invoke('input-tracker-status'),
  onInputStatsUpdate: (callback) => {
    ipcRenderer.on('input-stats-update', (event, stats) => callback(stats));
  }
};

console.log('Meowchi preload script loaded');