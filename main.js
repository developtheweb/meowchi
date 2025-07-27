const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const InputTracker = require('./logic/inputTracker');
const PetState = require('./logic/petState');
const HatManager = require('./logic/hatManager');
const EvolutionManager = require('./logic/evolutionManager');
const SaveManager = require('./logic/saveManager');

let mainWindow;
let inputTracker;
let petState;
let hatManager;
let evolutionManager;
let saveManager;

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (saveManager) {
    saveManager.logError('uncaughtException', error);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (saveManager) {
    saveManager.logError('unhandledRejection', new Error(String(reason)));
  }
});

function createWindow() {
  // Create the browser window with specific properties for floating pet
  mainWindow = new BrowserWindow({
    width: 420,
    height: 250,
    x: 100, // Initial position, can be adjusted
    y: 100,
    transparent: true, // Enable transparency
    frame: false, // Remove window frame
    alwaysOnTop: true, // Keep window on top
    hasShadow: false, // Remove shadow
    resizable: false, // Prevent resizing
    skipTaskbar: true, // Don't show in taskbar
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Position window near taskbar (bottom right)
  const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;
  mainWindow.setPosition(width - 450, height - 200);

  // Prevent window from being hidden
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, 'floating');

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  try {
    createWindow();
    
    // Initialize save manager first
    saveManager = new SaveManager();
    global.saveManager = saveManager;
    await saveManager.initialize();
    console.log('Meowchi save system active!');
    
    // Load saved data
    const savedData = saveManager.loadGameData();
    
    // Initialize pet state
    petState = new PetState();
    global.petState = petState;
    
    // Restore saved pet state
    if (savedData && savedData.petState) {
      petState.hunger = savedData.petState.hunger;
      petState.cleanliness = savedData.petState.cleanliness;
      petState.mood = savedData.petState.mood;
      petState.lastFed = savedData.petState.lastFed;
      petState.lastCleaned = savedData.petState.lastCleaned;
      petState.lastPlayed = savedData.petState.lastPlayed;
    }
    
    petState.start();
    console.log('Meowchi pet state system active!');
    
    // Initialize hat manager
    hatManager = new HatManager();
    global.hatManager = hatManager;
    
    // Restore saved inventory
    if (savedData && savedData.inventory) {
      hatManager.equippedHat = savedData.inventory.equippedHat;
      hatManager.progress = savedData.inventory.hatProgress;
      
      // Unlock saved hats
      savedData.inventory.unlockedHats.forEach(hatId => {
        const hat = hatManager.hats.find(h => h.id === hatId);
        if (hat) hat.unlocked = true;
      });
    }
    
    console.log('Meowchi hat system active!');
    
    // Initialize evolution manager
    evolutionManager = new EvolutionManager();
    global.evolutionManager = evolutionManager;
    
    // Restore saved evolution state
    if (savedData && savedData.evolution) {
      evolutionManager.currentEvolution = savedData.evolution.currentForm;
      evolutionManager.evolutionHistory = savedData.evolution.evolutionHistory;
      evolutionManager.totalInteractions = savedData.evolution.totalInteractions;
      evolutionManager.neglectPeriods = savedData.evolution.neglectPeriods;
      evolutionManager.chaosActions = savedData.evolution.chaosActions;
      evolutionManager.perfectCareDays = savedData.evolution.perfectCareDays;
      evolutionManager.balancedDays = savedData.evolution.balancedDays;
      evolutionManager.careHistory = savedData.evolution.careHistory;
    }
    
    console.log('Meowchi evolution system active!');
    
    // Initialize input tracker
    inputTracker = new InputTracker();
    
    // Restore saved stats
    if (savedData && savedData.stats) {
      inputTracker.keyPressCount = savedData.stats.totalKeyPresses;
      inputTracker.mouseClickCount = savedData.stats.totalMouseClicks;
    }
    
    const initialized = await inputTracker.initialize();
    
    if (initialized) {
      inputTracker.start();
      console.log('Meowchi input tracking active!');
    } else {
      console.warn('Input tracking not available on this platform');
    }
    
    // Set up save hooks
    setupSaveHooks();
    
  } catch (error) {
    console.error('Failed to initialize app:', error);
    if (saveManager) {
      saveManager.logError('app.whenReady', error);
    }
  }
});

// Set up auto-save triggers
function setupSaveHooks() {
  // Save on critical events
  ipcMain.on('save-game', () => {
    saveAllSystems();
  });
  
  // Save before quit
  app.on('before-quit', () => {
    saveAllSystems();
  });
}

// Save all system states
function saveAllSystems() {
  if (!saveManager) return;
  
  if (petState) {
    saveManager.savePetState(petState);
  }
  
  if (inputTracker) {
    saveManager.saveInputStats(inputTracker.getStats());
  }
  
  if (hatManager) {
    saveManager.saveInventory(hatManager);
  }
  
  if (evolutionManager) {
    saveManager.saveEvolution(evolutionManager);
  }
  
  // Update playtime
  const sessionTime = Date.now() - (saveManager.db.data.lastSaved || Date.now());
  saveManager.updatePlaytime(sessionTime);
  
  saveManager.save();
}

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    saveAllSystems();
    
    if (inputTracker) {
      inputTracker.stop();
    }
    if (petState) {
      petState.stop();
    }
    if (evolutionManager) {
      evolutionManager.stopTracking();
    }
    if (saveManager) {
      saveManager.stopAutoSave();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Prevent the app from quitting when clicking the dock icon on macOS
app.on('before-quit', (event) => {
  if (process.platform === 'darwin') {
    event.preventDefault();
    mainWindow.hide();
  }
});