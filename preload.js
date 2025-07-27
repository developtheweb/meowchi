// Preload script for Electron
const { ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use ipcRenderer
window.meowchiAPI = {
  // Input tracking methods
  getInputStats: () => ipcRenderer.invoke('get-input-stats'),
  getTrackerStatus: () => ipcRenderer.invoke('input-tracker-status'),
  onInputStatsUpdate: (callback) => {
    ipcRenderer.on('input-stats-update', (event, stats) => callback(stats));
  },
  
  // Pet state methods
  getPetState: () => ipcRenderer.invoke('get-pet-state'),
  feedMeowchi: () => ipcRenderer.invoke('feed-meowchi'),
  cleanMeowchi: () => ipcRenderer.invoke('clean-meowchi'),
  playWithMeowchi: () => ipcRenderer.invoke('play-with-meowchi'),
  onPetStateUpdate: (callback) => {
    ipcRenderer.on('pet-state-update', (event, state) => callback(state));
  }
};

console.log('Meowchi preload script loaded');