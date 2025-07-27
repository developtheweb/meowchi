const { ipcMain } = require('electron');

class HatManager {
  constructor() {
    // Default hat collection
    this.hats = [
      {
        id: 'none',
        name: 'No Hat',
        emoji: '',
        rarity: 'common',
        unlocked: true,
        unlockCriteria: null,
        description: 'Au naturel'
      },
      {
        id: 'party',
        name: 'Party Hat',
        emoji: '🎉',
        rarity: 'common',
        unlocked: true,
        unlockCriteria: null,
        description: 'Ready to celebrate!'
      },
      {
        id: 'crown',
        name: 'Royal Crown',
        emoji: '👑',
        rarity: 'rare',
        unlocked: false,
        unlockCriteria: { type: 'inputs', value: 500 },
        description: 'Fit for a king!'
      },
      {
        id: 'wizard',
        name: 'Wizard Hat',
        emoji: '🧙',
        rarity: 'rare',
        unlocked: false,
        unlockCriteria: { type: 'inputs', value: 1000 },
        description: 'Magical powers included'
      },
      {
        id: 'chef',
        name: 'Chef Hat',
        emoji: '👨‍🍳',
        rarity: 'common',
        unlocked: false,
        unlockCriteria: { type: 'feeds', value: 20 },
        description: 'Master of the kitchen'
      },
      {
        id: 'santa',
        name: 'Santa Hat',
        emoji: '🎅',
        rarity: 'epic',
        unlocked: false,
        unlockCriteria: { type: 'inputs', value: 2500 },
        description: 'Ho ho ho!'
      },
      {
        id: 'pirate',
        name: 'Pirate Hat',
        emoji: '🏴‍☠️',
        rarity: 'rare',
        unlocked: false,
        unlockCriteria: { type: 'plays', value: 50 },
        description: 'Ahoy matey!'
      },
      {
        id: 'cowboy',
        name: 'Cowboy Hat',
        emoji: '🤠',
        rarity: 'common',
        unlocked: false,
        unlockCriteria: { type: 'inputs', value: 250 },
        description: 'Yeehaw!'
      },
      {
        id: 'graduation',
        name: 'Graduation Cap',
        emoji: '🎓',
        rarity: 'epic',
        unlocked: false,
        unlockCriteria: { type: 'inputs', value: 5000 },
        description: 'Smart kitty!'
      }
    ];
    
    // Currently equipped hat
    this.equippedHat = 'none';
    
    // Track progress
    this.progress = {
      totalInputs: 0,
      totalFeeds: 0,
      totalCleans: 0,
      totalPlays: 0
    };
    
    this.setupIPC();
  }
  
  setupIPC() {
    ipcMain.handle('get-inventory', () => this.getInventory());
    ipcMain.handle('equip-hat', (event, hatId) => this.equipHat(hatId));
    ipcMain.handle('get-equipped-hat', () => this.getEquippedHat());
  }
  
  getInventory() {
    return {
      hats: this.hats.map(hat => ({
        ...hat,
        equipped: hat.id === this.equippedHat,
        progress: this.getUnlockProgress(hat)
      })),
      equippedHat: this.equippedHat
    };
  }
  
  getUnlockProgress(hat) {
    if (hat.unlocked || !hat.unlockCriteria) return null;
    
    let current = 0;
    const { type, value } = hat.unlockCriteria;
    
    switch (type) {
      case 'inputs':
        current = this.progress.totalInputs;
        break;
      case 'feeds':
        current = this.progress.totalFeeds;
        break;
      case 'cleans':
        current = this.progress.totalCleans;
        break;
      case 'plays':
        current = this.progress.totalPlays;
        break;
    }
    
    return {
      current: Math.min(current, value),
      required: value,
      percentage: Math.round((current / value) * 100)
    };
  }
  
  equipHat(hatId) {
    const hat = this.hats.find(h => h.id === hatId);
    
    if (!hat) {
      return { success: false, message: 'Hat not found' };
    }
    
    if (!hat.unlocked) {
      return { success: false, message: 'Hat is locked' };
    }
    
    this.equippedHat = hatId;
    this.sendUpdate();
    
    return {
      success: true,
      message: `Equipped ${hat.name}!`,
      hat: hat
    };
  }
  
  getEquippedHat() {
    return this.hats.find(h => h.id === this.equippedHat) || this.hats[0];
  }
  
  // Update progress and check for unlocks
  updateProgress(type, amount = 1) {
    switch (type) {
      case 'inputs':
        this.progress.totalInputs += amount;
        break;
      case 'feeds':
        this.progress.totalFeeds += amount;
        break;
      case 'cleans':
        this.progress.totalCleans += amount;
        break;
      case 'plays':
        this.progress.totalPlays += amount;
        break;
    }
    
    // Check for new unlocks
    let newUnlocks = [];
    this.hats.forEach(hat => {
      if (!hat.unlocked && hat.unlockCriteria) {
        const progress = this.getUnlockProgress(hat);
        if (progress && progress.percentage >= 100) {
          hat.unlocked = true;
          newUnlocks.push(hat);
        }
      }
    });
    
    if (newUnlocks.length > 0) {
      this.sendUnlockNotification(newUnlocks);
    }
    
    this.sendUpdate();
  }
  
  sendUnlockNotification(hats) {
    const { BrowserWindow } = require('electron');
    const windows = BrowserWindow.getAllWindows();
    
    windows.forEach(window => {
      hats.forEach(hat => {
        window.webContents.send('hat-unlocked', {
          hat: hat,
          message: `🎉 New hat unlocked: ${hat.name}!`
        });
      });
    });
  }
  
  sendUpdate() {
    const { BrowserWindow } = require('electron');
    const windows = BrowserWindow.getAllWindows();
    const inventory = this.getInventory();
    
    windows.forEach(window => {
      window.webContents.send('inventory-update', inventory);
    });
  }
  
  // Cycle through unlocked hats
  cycleHat() {
    const unlockedHats = this.hats.filter(h => h.unlocked);
    const currentIndex = unlockedHats.findIndex(h => h.id === this.equippedHat);
    const nextIndex = (currentIndex + 1) % unlockedHats.length;
    
    return this.equipHat(unlockedHats[nextIndex].id);
  }
}

module.exports = HatManager;