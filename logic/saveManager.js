const { app, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

class SaveManager {
  constructor() {
    this.db = null;
    this.saveInterval = null;
    this.savePath = path.join(app.getPath('userData'), 'meowchi-save.json');
    this.backupPath = path.join(app.getPath('userData'), 'meowchi-save.backup.json');
    this.autoSaveDelay = process.env.TEST_MODE ? 30000 : 60000; // 30s test, 60s prod
    
    this.defaultData = {
      version: '1.0.0',
      lastSaved: null,
      petState: {
        hunger: 80,
        cleanliness: 80,
        mood: 80,
        lastFed: Date.now(),
        lastCleaned: Date.now(),
        lastPlayed: Date.now()
      },
      stats: {
        totalKeyPresses: 0,
        totalMouseClicks: 0,
        totalPlaytime: 0,
        sessionCount: 0,
        firstPlayed: Date.now()
      },
      inventory: {
        equippedHat: 'none',
        unlockedHats: ['none', 'party'],
        hatProgress: {
          totalFeeds: 0,
          totalCleans: 0,
          totalPlays: 0
        }
      },
      evolution: {
        currentForm: 'base',
        evolutionHistory: ['base'],
        totalInteractions: 0,
        neglectPeriods: 0,
        chaosActions: 0,
        perfectCareDays: 0,
        balancedDays: 0,
        careHistory: []
      }
    };
    
    this.setupIPC();
  }
  
  setupIPC() {
    ipcMain.handle('reset-save', () => this.resetSave());
  }
  
  async initialize() {
    try {
      // Create save directory if it doesn't exist
      const saveDir = path.dirname(this.savePath);
      await fs.mkdir(saveDir, { recursive: true });
      
      // Initialize lowdb
      const adapter = new JSONFile(this.savePath);
      this.db = new Low(adapter, this.defaultData);
      
      // Load existing data
      await this.db.read();
      
      // Validate and migrate save data
      if (!this.validateSaveData()) {
        console.warn('Save data validation failed, attempting recovery...');
        await this.recoverSaveData();
      }
      
      // Start auto-save
      this.startAutoSave();
      
      console.log('Save system initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize save system:', error);
      this.logError('SaveManager.initialize', error);
      return false;
    }
  }
  
  validateSaveData() {
    if (!this.db.data) return false;
    
    // Check for required top-level keys
    const requiredKeys = ['version', 'petState', 'stats', 'inventory', 'evolution'];
    for (const key of requiredKeys) {
      if (!(key in this.db.data)) {
        console.warn(`Missing required key: ${key}`);
        return false;
      }
    }
    
    // Validate data types
    if (typeof this.db.data.petState.hunger !== 'number' ||
        typeof this.db.data.stats.totalKeyPresses !== 'number' ||
        typeof this.db.data.inventory.equippedHat !== 'string' ||
        typeof this.db.data.evolution.currentForm !== 'string') {
      console.warn('Invalid data types detected');
      return false;
    }
    
    return true;
  }
  
  async recoverSaveData() {
    try {
      // Try to load backup
      const backupAdapter = new JSONFile(this.backupPath);
      const backupDb = new Low(backupAdapter, this.defaultData);
      await backupDb.read();
      
      if (this.validateSaveData.call({ db: backupDb })) {
        console.log('Recovered from backup save');
        this.db.data = backupDb.data;
        await this.db.write();
      } else {
        console.log('Creating fresh save data');
        this.db.data = { ...this.defaultData };
        await this.db.write();
      }
    } catch (error) {
      console.error('Failed to recover save data:', error);
      this.db.data = { ...this.defaultData };
      await this.db.write();
    }
  }
  
  startAutoSave() {
    // Save immediately
    this.save();
    
    // Set up interval
    this.saveInterval = setInterval(() => {
      this.save();
    }, this.autoSaveDelay);
  }
  
  stopAutoSave() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }
  
  async save() {
    if (!this.db) return;
    
    try {
      // Update last saved time
      this.db.data.lastSaved = Date.now();
      
      // Create backup before saving
      await this.createBackup();
      
      // Save to file
      await this.db.write();
      
      console.log('Game saved successfully');
    } catch (error) {
      console.error('Failed to save game:', error);
      this.logError('SaveManager.save', error);
    }
  }
  
  async createBackup() {
    try {
      await fs.copyFile(this.savePath, this.backupPath);
    } catch (error) {
      // Ignore if main save doesn't exist yet
      if (error.code !== 'ENOENT') {
        console.error('Failed to create backup:', error);
      }
    }
  }
  
  // Save pet state
  savePetState(petState) {
    if (!this.db) return;
    
    this.db.data.petState = {
      hunger: petState.hunger,
      cleanliness: petState.cleanliness,
      mood: petState.mood,
      lastFed: petState.lastFed,
      lastCleaned: petState.lastCleaned,
      lastPlayed: petState.lastPlayed
    };
  }
  
  // Save input stats
  saveInputStats(stats) {
    if (!this.db) return;
    
    this.db.data.stats.totalKeyPresses = stats.keyPressCount;
    this.db.data.stats.totalMouseClicks = stats.mouseClickCount;
  }
  
  // Save inventory
  saveInventory(hatManager) {
    if (!this.db) return;
    
    this.db.data.inventory.equippedHat = hatManager.equippedHat;
    this.db.data.inventory.unlockedHats = hatManager.hats
      .filter(hat => hat.unlocked)
      .map(hat => hat.id);
    
    this.db.data.inventory.hatProgress = {
      totalFeeds: hatManager.progress.totalFeeds,
      totalCleans: hatManager.progress.totalCleans,
      totalPlays: hatManager.progress.totalPlays
    };
  }
  
  // Save evolution state
  saveEvolution(evolutionManager) {
    if (!this.db) return;
    
    this.db.data.evolution = {
      currentForm: evolutionManager.currentEvolution,
      evolutionHistory: evolutionManager.evolutionHistory,
      totalInteractions: evolutionManager.totalInteractions,
      neglectPeriods: evolutionManager.neglectPeriods,
      chaosActions: evolutionManager.chaosActions,
      perfectCareDays: evolutionManager.perfectCareDays,
      balancedDays: evolutionManager.balancedDays,
      careHistory: evolutionManager.careHistory.slice(-100) // Keep last 100 entries
    };
  }
  
  // Load all game data
  loadGameData() {
    if (!this.db || !this.db.data) return null;
    
    // Update session count
    this.db.data.stats.sessionCount++;
    
    return {
      petState: this.db.data.petState,
      stats: this.db.data.stats,
      inventory: this.db.data.inventory,
      evolution: this.db.data.evolution
    };
  }
  
  // Update playtime
  updatePlaytime(additionalTime) {
    if (!this.db) return;
    
    this.db.data.stats.totalPlaytime += additionalTime;
  }
  
  // Reset save data
  async resetSave() {
    try {
      this.db.data = { ...this.defaultData };
      await this.db.write();
      
      // Notify all systems to reset
      const { BrowserWindow } = require('electron');
      const windows = BrowserWindow.getAllWindows();
      windows.forEach(window => {
        window.webContents.send('save-reset');
      });
      
      console.log('Save data reset successfully');
      return { success: true, message: 'Meowchi has been reset!' };
    } catch (error) {
      console.error('Failed to reset save:', error);
      this.logError('SaveManager.resetSave', error);
      return { success: false, message: 'Failed to reset save data' };
    }
  }
  
  // Error logging
  async logError(context, error) {
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        context: context,
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code
        }
      };
      
      const logPath = path.join(app.getPath('userData'), 'crashlog.json');
      let logs = [];
      
      try {
        const existing = await fs.readFile(logPath, 'utf8');
        logs = JSON.parse(existing);
      } catch (e) {
        // File doesn't exist or is invalid
      }
      
      logs.push(errorLog);
      
      // Keep only last 50 errors
      if (logs.length > 50) {
        logs = logs.slice(-50);
      }
      
      await fs.writeFile(logPath, JSON.stringify(logs, null, 2));
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
}

module.exports = SaveManager;