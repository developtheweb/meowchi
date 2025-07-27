const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const InputTracker = require('./logic/inputTracker');

let mainWindow;
let inputTracker;

function createWindow() {
  // Create the browser window with specific properties for floating pet
  mainWindow = new BrowserWindow({
    width: 180,
    height: 180,
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
  mainWindow.setPosition(width - 200, height - 200);

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
  createWindow();
  
  // Initialize input tracker
  inputTracker = new InputTracker();
  const initialized = await inputTracker.initialize();
  
  if (initialized) {
    inputTracker.start();
    console.log('Meowchi input tracking active!');
  } else {
    console.warn('Input tracking not available on this platform');
  }
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (inputTracker) {
      inputTracker.stop();
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