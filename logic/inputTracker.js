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

    // Debug: Log all events to see what's available
    const debugMode = process.env.DEBUG_INPUT === 'true';
    
    // Track ALL keyboard events using keydown
    this.uIOhook.on('keydown', (e) => {
      if (debugMode) console.log('Keydown event:', e);
      this.keyPressCount++;
      this.lastActivity = Date.now();
      this.sendUpdate();
    });

    // Track mouse clicks using the 'click' event
    this.uIOhook.on('click', (e) => {
      if (debugMode) console.log('Click event:', e);
      this.mouseClickCount++;
      this.lastActivity = Date.now();
      this.sendUpdate();
    });
    
    // Optional: Track all input events for debugging
    if (debugMode) {
      this.uIOhook.on('input', (e) => {
        console.log('Input event:', e);
      });
    }

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
    
    // Notify pet state about activity (for cleanliness decay)
    if (global.petState) {
      global.petState.onActivity();
    }
    
    // Update hat manager progress
    if (global.hatManager) {
      global.hatManager.updateProgress('inputs', 1);
    }
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