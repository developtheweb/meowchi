const { ipcMain } = require('electron');

class EvolutionManager {
  constructor() {
    // Evolution forms definition
    this.evolutions = {
      // Base form
      base: {
        id: 'base',
        name: 'Meowchi',
        emoji: '🐱',
        tier: 0,
        description: 'Your adorable digital companion'
      },
      
      // Tier 1 evolutions
      angel: {
        id: 'angel',
        name: 'Meowchi Angel',
        emoji: '😇',
        tier: 1,
        path: 'good',
        requirements: {
          avgCare: 80,
          minPlaytime: 3600000, // 1 hour
          minInteractions: 100
        },
        description: 'A blessed kitty with a halo'
      },
      
      sleepy: {
        id: 'sleepy',
        name: 'Sleepy Meowchi',
        emoji: '😴',
        tier: 1,
        path: 'neutral',
        requirements: {
          avgCare: 40,
          minPlaytime: 7200000, // 2 hours
          idleTime: 1800000 // 30 min idle
        },
        description: 'A lazy but content feline'
      },
      
      goblin: {
        id: 'goblin',
        name: 'Meowchi Goblin',
        emoji: '👺',
        tier: 1,
        path: 'bad',
        requirements: {
          avgCare: 20,
          neglectPeriods: 3,
          minPlaytime: 3600000 // 1 hour
        },
        description: 'A mischievous troublemaker'
      },
      
      // Tier 2 evolutions
      celestial: {
        id: 'celestial',
        name: 'Celestial Meowchi',
        emoji: '✨',
        tier: 2,
        path: 'good',
        requirements: {
          previousForm: 'angel',
          avgCare: 90,
          minPlaytime: 10800000, // 3 hours
          perfectCareDays: 2
        },
        description: 'A divine being of pure light'
      },
      
      overlord: {
        id: 'overlord',
        name: 'Overlord Meowchi',
        emoji: '👹',
        tier: 2,
        path: 'bad',
        requirements: {
          previousForm: 'goblin',
          avgCare: 10,
          minPlaytime: 10800000, // 3 hours
          chaosActions: 50
        },
        description: 'The dark lord of all cats'
      },
      
      zen: {
        id: 'zen',
        name: 'Zen Master Meowchi',
        emoji: '🧘',
        tier: 2,
        path: 'neutral',
        requirements: {
          previousForm: 'sleepy',
          avgCare: 60,
          minPlaytime: 14400000, // 4 hours
          balancedDays: 3
        },
        description: 'Achieved perfect balance'
      }
    };
    
    // Current evolution state
    this.currentEvolution = 'base';
    this.evolutionHistory = ['base'];
    this.evolutionStartTime = Date.now();
    
    // Care tracking
    this.careHistory = [];
    this.careCheckInterval = null;
    this.sessionStartTime = Date.now();
    this.totalPlaytime = 0;
    this.totalInteractions = 0;
    this.neglectPeriods = 0;
    this.chaosActions = 0;
    this.lastActivityTime = Date.now();
    this.perfectCareDays = 0;
    this.balancedDays = 0;
    
    this.setupIPC();
    this.startTracking();
  }
  
  setupIPC() {
    ipcMain.handle('get-evolution-state', () => this.getEvolutionState());
    ipcMain.handle('get-evolution-journal', () => this.getEvolutionJournal());
  }
  
  startTracking() {
    // Check care stats every 5 minutes
    this.careCheckInterval = setInterval(() => {
      this.checkEvolutionTriggers();
    }, process.env.TEST_MODE ? 30000 : 300000); // 30s test, 5min prod
  }
  
  stopTracking() {
    if (this.careCheckInterval) {
      clearInterval(this.careCheckInterval);
    }
  }
  
  // Update care stats from pet state
  updateCareStats(petState) {
    const careScore = (petState.hunger + petState.cleanliness + petState.mood) / 3;
    this.careHistory.push({
      timestamp: Date.now(),
      score: careScore,
      hunger: petState.hunger,
      cleanliness: petState.cleanliness,
      mood: petState.mood
    });
    
    // Keep only last 24 hours of data
    const dayAgo = Date.now() - 86400000;
    this.careHistory = this.careHistory.filter(entry => entry.timestamp > dayAgo);
    
    // Check for neglect
    if (careScore < 30 && Date.now() - this.lastActivityTime > 1800000) {
      this.neglectPeriods++;
    }
    
    // Check for perfect care day
    if (this.careHistory.length > 20) { // At least 20 checks
      const dayAvg = this.getAverageCare(86400000);
      if (dayAvg > 85) {
        this.perfectCareDays++;
      } else if (dayAvg > 45 && dayAvg < 75) {
        this.balancedDays++;
      }
    }
    
    this.lastActivityTime = Date.now();
  }
  
  // Track user interactions
  trackInteraction(type) {
    this.totalInteractions++;
    
    // Track chaos actions (playing when hungry/dirty)
    if (type === 'play' && global.petState) {
      const state = global.petState.getState();
      if (state.hunger < 30 || state.cleanliness < 30) {
        this.chaosActions++;
      }
    }
  }
  
  // Calculate average care over time period
  getAverageCare(timePeriod = 3600000) {
    const cutoff = Date.now() - timePeriod;
    const recentCare = this.careHistory.filter(entry => entry.timestamp > cutoff);
    
    if (recentCare.length === 0) return 50;
    
    const avgScore = recentCare.reduce((sum, entry) => sum + entry.score, 0) / recentCare.length;
    return Math.round(avgScore);
  }
  
  // Check if evolution requirements are met
  checkEvolutionTriggers() {
    const currentForm = this.evolutions[this.currentEvolution];
    const playtime = Date.now() - this.sessionStartTime + this.totalPlaytime;
    const avgCare = this.getAverageCare();
    const idleTime = Date.now() - this.lastActivityTime;
    
    // Check each possible evolution
    for (const [id, evolution] of Object.entries(this.evolutions)) {
      if (evolution.tier !== currentForm.tier + 1) continue;
      
      const req = evolution.requirements;
      let canEvolve = true;
      
      // Check all requirements
      if (req.previousForm && this.currentEvolution !== req.previousForm) canEvolve = false;
      if (req.avgCare && avgCare < req.avgCare) canEvolve = false;
      if (req.minPlaytime && playtime < req.minPlaytime) canEvolve = false;
      if (req.minInteractions && this.totalInteractions < req.minInteractions) canEvolve = false;
      if (req.neglectPeriods && this.neglectPeriods < req.neglectPeriods) canEvolve = false;
      if (req.idleTime && idleTime < req.idleTime) canEvolve = false;
      if (req.chaosActions && this.chaosActions < req.chaosActions) canEvolve = false;
      if (req.perfectCareDays && this.perfectCareDays < req.perfectCareDays) canEvolve = false;
      if (req.balancedDays && this.balancedDays < req.balancedDays) canEvolve = false;
      
      if (canEvolve) {
        this.triggerEvolution(id);
        break;
      }
    }
  }
  
  // Trigger evolution
  triggerEvolution(evolutionId) {
    if (this.currentEvolution === evolutionId) return;
    
    const newForm = this.evolutions[evolutionId];
    const oldForm = this.evolutions[this.currentEvolution];
    
    console.log(`Meowchi is evolving from ${oldForm.name} to ${newForm.name}!`);
    
    this.currentEvolution = evolutionId;
    this.evolutionHistory.push(evolutionId);
    this.evolutionStartTime = Date.now();
    
    // Send evolution event to renderer
    const { BrowserWindow } = require('electron');
    const windows = BrowserWindow.getAllWindows();
    
    windows.forEach(window => {
      window.webContents.send('evolution-triggered', {
        oldForm: oldForm,
        newForm: newForm,
        message: `${oldForm.name} is evolving into ${newForm.name}!`
      });
    });
  }
  
  // Get current evolution state
  getEvolutionState() {
    const currentForm = this.evolutions[this.currentEvolution];
    const playtime = Date.now() - this.sessionStartTime + this.totalPlaytime;
    const avgCare = this.getAverageCare();
    
    return {
      current: currentForm,
      tier: currentForm.tier,
      avgCare: avgCare,
      totalPlaytime: playtime,
      totalInteractions: this.totalInteractions,
      evolutionAge: Date.now() - this.evolutionStartTime,
      possibleEvolutions: this.getPossibleEvolutions()
    };
  }
  
  // Get possible next evolutions
  getPossibleEvolutions() {
    const currentTier = this.evolutions[this.currentEvolution].tier;
    const possible = [];
    
    for (const [id, evolution] of Object.entries(this.evolutions)) {
      if (evolution.tier === currentTier + 1) {
        const progress = this.getEvolutionProgress(evolution);
        possible.push({
          ...evolution,
          progress: progress
        });
      }
    }
    
    return possible;
  }
  
  // Calculate progress towards an evolution
  getEvolutionProgress(evolution) {
    const req = evolution.requirements;
    const progress = {};
    const playtime = Date.now() - this.sessionStartTime + this.totalPlaytime;
    const avgCare = this.getAverageCare();
    
    if (req.avgCare) {
      progress.avgCare = {
        current: avgCare,
        required: req.avgCare,
        percentage: Math.min(100, (avgCare / req.avgCare) * 100)
      };
    }
    
    if (req.minPlaytime) {
      progress.playtime = {
        current: playtime,
        required: req.minPlaytime,
        percentage: Math.min(100, (playtime / req.minPlaytime) * 100)
      };
    }
    
    if (req.minInteractions) {
      progress.interactions = {
        current: this.totalInteractions,
        required: req.minInteractions,
        percentage: Math.min(100, (this.totalInteractions / req.minInteractions) * 100)
      };
    }
    
    return progress;
  }
  
  // Get evolution journal
  getEvolutionJournal() {
    return {
      history: this.evolutionHistory.map(id => this.evolutions[id]),
      totalEvolutions: this.evolutionHistory.length - 1,
      currentForm: this.evolutions[this.currentEvolution],
      startTime: this.sessionStartTime
    };
  }
}

module.exports = EvolutionManager;