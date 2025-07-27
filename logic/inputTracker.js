const { ipcMain } = require('electron');

class InputTracker {
  constructor() {
    this.keyPressCount = 0;
    this.mouseClickCount = 0;
    this.uIOhook = null;
    this.isTracking = false;
    this.lastActivity = Date.now();
    this.sessionStartTime = Date.now();
    this.platformSupported = true;
  }

  async initialize() {
    try {
      // Try to load uiohook-napi
      this.uIOhook = require('uiohook-napi').uIOhook;
      console.log('Input tracking initialized successfully');
      this.setupHooks();
      return true;
    } catch (error) {
      console.error('Failed to initialize input tracking:', error);
      this.platformSupported = false;
      // Set up IPC to notify renderer of the error
      ipcMain.handle('input-tracker-status', () => ({
        supported: false,
        error: error.message
      }));
      return false;
    }
  }

  setupHooks() {
    if (!this.uIOhook) return;

    // Track keyboard events
    this.uIOhook.on('keydown', (e) => {
      this.keyPressCount++;
      this.lastActivity = Date.now();
      this.sendUpdate();
    });

    // Track mouse clicks
    this.uIOhook.on('mousedown', (e) => {
      this.mouseClickCount++;
      this.lastActivity = Date.now();
      this.sendUpdate();
    });

    // Handle IPC requests
    ipcMain.handle('get-input-stats', () => this.getStats());
    ipcMain.handle('input-tracker-status', () => ({
      supported: this.platformSupported,
      tracking: this.isTracking
    }));
  }

  start() {
    if (!this.uIOhook || this.isTracking) return;
    
    try {
      this.uIOhook.start();
      this.isTracking = true;
      console.log('Input tracking started');
    } catch (error) {
      console.error('Failed to start input tracking:', error);
      this.isTracking = false;
    }
  }

  stop() {
    if (!this.uIOhook || !this.isTracking) return;
    
    try {
      this.uIOhook.stop();
      this.isTracking = false;
      console.log('Input tracking stopped');
    } catch (error) {
      console.error('Failed to stop input tracking:', error);
    }
  }

  getStats() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const timeSinceLastActivity = Date.now() - this.lastActivity;
    
    return {
      keyPressCount: this.keyPressCount,
      mouseClickCount: this.mouseClickCount,
      totalActions: this.keyPressCount + this.mouseClickCount,
      sessionDuration,
      timeSinceLastActivity,
      isTracking: this.isTracking,
      platformSupported: this.platformSupported
    };
  }

  sendUpdate() {
    // Send update to all windows
    const { BrowserWindow } = require('electron');
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
      window.webContents.send('input-stats-update', this.getStats());
    });
  }

  reset() {
    this.keyPressCount = 0;
    this.mouseClickCount = 0;
    this.sessionStartTime = Date.now();
    this.lastActivity = Date.now();
    this.sendUpdate();
  }
}

module.exports = InputTracker;