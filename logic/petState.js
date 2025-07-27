const { ipcMain } = require('electron');

class PetState {
  constructor() {
    // Pet metrics (0-100 scale)
    this.hunger = 80;        // 100 = full, 0 = starving
    this.cleanliness = 80;   // 100 = clean, 0 = dirty
    this.mood = 80;          // 100 = happy, 0 = sad
    
    // State tracking
    this.lastFed = Date.now();
    this.lastCleaned = Date.now();
    this.lastPlayed = Date.now();
    this.activityCount = 0;
    
    // Timers
    this.decayTimers = {};
    
    // Configuration (use shorter intervals for testing)
    this.config = {
      hungerDecayInterval: process.env.TEST_MODE ? 60000 : 1200000, // 1 min test, 20 min prod
      hungerDecayAmount: 5,
      cleanlinessDecayPerActivity: 0.1,
      moodDecayInterval: process.env.TEST_MODE ? 30000 : 600000, // 30 sec test, 10 min prod
      moodDecayAmount: 3,
      feedBonus: 25,
      cleanBonus: 30,
      playBonus: 20
    };
    
    this.setupIPC();
  }

  setupIPC() {
    // Handle IPC requests
    ipcMain.handle('get-pet-state', () => this.getState());
    ipcMain.handle('feed-meowchi', () => this.feedMeowchi());
    ipcMain.handle('clean-meowchi', () => this.cleanMeowchi());
    ipcMain.handle('play-with-meowchi', () => this.playWithMeowchi());
  }

  start() {
    console.log('Pet state system started');
    
    // Start hunger decay timer
    this.decayTimers.hunger = setInterval(() => {
      this.hunger = Math.max(0, this.hunger - this.config.hungerDecayAmount);
      this.updateMood();
      this.sendUpdate();
    }, this.config.hungerDecayInterval);
    
    // Start mood decay timer
    this.decayTimers.mood = setInterval(() => {
      // Mood decays if pet is neglected
      const timeSinceFed = Date.now() - this.lastFed;
      const timeSinceCleaned = Date.now() - this.lastCleaned;
      const timeSincePlayed = Date.now() - this.lastPlayed;
      
      // If neglected for too long, mood drops
      if (timeSinceFed > this.config.hungerDecayInterval * 2 ||
          timeSinceCleaned > this.config.hungerDecayInterval * 3 ||
          timeSincePlayed > this.config.hungerDecayInterval * 2) {
        this.mood = Math.max(0, this.mood - this.config.moodDecayAmount);
        this.sendUpdate();
      }
    }, this.config.moodDecayInterval);
    
    // Send initial state
    this.sendUpdate();
  }

  stop() {
    // Clear all timers
    Object.values(this.decayTimers).forEach(timer => clearInterval(timer));
    this.decayTimers = {};
    console.log('Pet state system stopped');
  }

  // Decay cleanliness based on activity
  onActivity() {
    this.activityCount++;
    this.cleanliness = Math.max(0, this.cleanliness - this.config.cleanlinessDecayPerActivity);
    
    // Every 100 activities, update mood
    if (this.activityCount % 100 === 0) {
      this.updateMood();
      this.sendUpdate();
    }
  }

  // Calculate mood based on other stats
  updateMood() {
    // Base mood on hunger and cleanliness
    const hungerFactor = this.hunger / 100;
    const cleanlinessFactor = this.cleanliness / 100;
    
    // Weighted average
    const calculatedMood = (hungerFactor * 0.5 + cleanlinessFactor * 0.3 + (this.mood / 100) * 0.2) * 100;
    
    // Gradually adjust mood
    if (calculatedMood > this.mood) {
      this.mood = Math.min(100, this.mood + 2);
    } else if (calculatedMood < this.mood) {
      this.mood = Math.max(0, this.mood - 2);
    }
  }

  // Interaction functions
  feedMeowchi() {
    console.log('Feeding Meowchi!');
    this.hunger = Math.min(100, this.hunger + this.config.feedBonus);
    this.lastFed = Date.now();
    this.mood = Math.min(100, this.mood + 5); // Feeding improves mood
    this.sendUpdate();
    
    // Update hat progress
    if (global.hatManager) {
      global.hatManager.updateProgress('feeds', 1);
    }
    
    // Track interaction for evolution
    if (global.evolutionManager) {
      global.evolutionManager.trackInteraction('feed');
    }
    
    return {
      success: true,
      message: 'Yum! That was delicious! 😋',
      newHunger: this.hunger
    };
  }

  cleanMeowchi() {
    console.log('Cleaning Meowchi!');
    this.cleanliness = Math.min(100, this.cleanliness + this.config.cleanBonus);
    this.lastCleaned = Date.now();
    this.mood = Math.min(100, this.mood + 3); // Cleaning improves mood slightly
    this.sendUpdate();
    
    // Update hat progress
    if (global.hatManager) {
      global.hatManager.updateProgress('cleans', 1);
    }
    
    // Track interaction for evolution
    if (global.evolutionManager) {
      global.evolutionManager.trackInteraction('clean');
    }
    
    return {
      success: true,
      message: 'Ahh, much better! So fresh and clean! 🧼',
      newCleanliness: this.cleanliness
    };
  }

  playWithMeowchi() {
    console.log('Playing with Meowchi!');
    this.lastPlayed = Date.now();
    this.mood = Math.min(100, this.mood + this.config.playBonus);
    // Playing makes pet slightly hungry and dirty
    this.hunger = Math.max(0, this.hunger - 3);
    this.cleanliness = Math.max(0, this.cleanliness - 5);
    this.sendUpdate();
    
    // Update hat progress
    if (global.hatManager) {
      global.hatManager.updateProgress('plays', 1);
    }
    
    // Track interaction for evolution
    if (global.evolutionManager) {
      global.evolutionManager.trackInteraction('play');
    }
    
    return {
      success: true,
      message: 'Wheee! That was fun! Let\'s play again! 🎉',
      newMood: this.mood
    };
  }

  // Get current state and mood emoji
  getState() {
    const state = {
      hunger: Math.round(this.hunger),
      cleanliness: Math.round(this.cleanliness),
      mood: Math.round(this.mood),
      lastFed: this.lastFed,
      lastCleaned: this.lastCleaned,
      lastPlayed: this.lastPlayed,
      moodEmoji: this.getMoodEmoji(),
      status: this.getStatus(),
      needsAttention: this.getNeedsAttention()
    };
    
    return state;
  }

  getMoodEmoji() {
    // Determine emoji based on overall state
    if (this.mood >= 80 && this.hunger >= 60 && this.cleanliness >= 60) {
      return '😺'; // Happy
    } else if (this.mood >= 60) {
      return '😸'; // Content
    } else if (this.hunger < 30) {
      return '😿'; // Hungry/Sad
    } else if (this.cleanliness < 30) {
      return '🤢'; // Dirty/Sick
    } else if (this.mood < 30) {
      return '😾'; // Angry/Upset
    } else {
      return '😼'; // Neutral/Meh
    }
  }

  getStatus() {
    // Priority-based status messages
    if (this.hunger < 20) return 'Starving! Feed me! 🍔';
    if (this.cleanliness < 20) return 'I need a bath! 🛁';
    if (this.mood < 20) return 'I\'m sad... play with me? 😢';
    if (this.hunger < 50) return 'Getting hungry... 🍽️';
    if (this.cleanliness < 50) return 'Feeling a bit dirty... 🧽';
    if (this.mood < 50) return 'I\'m bored... 🎮';
    if (this.mood >= 80) return 'I\'m so happy! 💖';
    return 'Doing okay! 😊';
  }

  getNeedsAttention() {
    return this.hunger < 30 || this.cleanliness < 30 || this.mood < 30;
  }

  // Send update to renderer
  sendUpdate() {
    const { BrowserWindow } = require('electron');
    const windows = BrowserWindow.getAllWindows();
    const state = this.getState();
    
    windows.forEach(window => {
      window.webContents.send('pet-state-update', state);
    });
    
    // Update evolution manager with care stats
    if (global.evolutionManager) {
      global.evolutionManager.updateCareStats({
        hunger: this.hunger,
        cleanliness: this.cleanliness,
        mood: this.mood
      });
    }
  }
}

module.exports = PetState;