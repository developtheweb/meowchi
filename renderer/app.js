// Meowchi Renderer Process
const meowchiSprite = document.getElementById('meowchi-sprite');
const petPanel = document.getElementById('pet-panel');
const petStatus = document.getElementById('pet-status');
const statusText = document.getElementById('status-text');

// Pet state tracking
let currentPetState = null;
let isPanelOpen = false;

// Toggle pet panel on sprite click
meowchiSprite.addEventListener('click', () => {
  isPanelOpen = !isPanelOpen;
  if (isPanelOpen) {
    petPanel.classList.remove('hidden');
  } else {
    petPanel.classList.add('hidden');
  }
});

// Close panel when clicking outside
document.addEventListener('click', (e) => {
  if (!meowchiSprite.contains(e.target) && !petPanel.contains(e.target)) {
    petPanel.classList.add('hidden');
    isPanelOpen = false;
  }
});

// Add bounce animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.2); }
    50% { transform: scale(0.9); }
    75% { transform: scale(1.1); }
  }
`;
document.head.appendChild(style);

// Log that Meowchi is ready
console.log('Meowchi is ready to play! 🐱');

// Input tracking integration
const keypressCountEl = document.getElementById('keypress-count');
const clickCountEl = document.getElementById('click-count');

// Check if input tracking is available
async function checkInputTracking() {
  if (window.meowchiAPI) {
    const status = await window.meowchiAPI.getTrackerStatus();
    
    if (!status.supported) {
      console.warn('Input tracking not supported on this platform');
      // Show a warning in the stats overlay
      document.getElementById('stats-overlay').innerHTML = 
        '<div style="color: #ff9999;">Input tracking unavailable</div>';
      return false;
    }
    
    return true;
  }
  return false;
}

// Update stats display
function updateStats(stats) {
  if (stats) {
    keypressCountEl.textContent = stats.keyPressCount.toLocaleString();
    clickCountEl.textContent = stats.mouseClickCount.toLocaleString();
    
    // Change Meowchi's expression based on activity
    if (stats.totalActions > 0 && stats.totalActions % 50 === 0) {
      // Every 50 actions, make Meowchi happy
      meowchiSprite.textContent = '😻';
      setTimeout(() => {
        meowchiSprite.textContent = catEmojis[currentEmojiIndex];
      }, 2000);
    }
  }
}

// Initialize input tracking
async function initializeTracking() {
  const isAvailable = await checkInputTracking();
  
  if (isAvailable && window.meowchiAPI) {
    // Get initial stats
    const initialStats = await window.meowchiAPI.getInputStats();
    updateStats(initialStats);
    
    // Listen for updates
    window.meowchiAPI.onInputStatsUpdate((stats) => {
      updateStats(stats);
    });
  }
}

// Start tracking when page loads
initializeTracking();

// Pet State Integration
const hungerBar = document.getElementById('hunger-bar');
const cleanlinessBar = document.getElementById('cleanliness-bar');
const moodBar = document.getElementById('mood-bar');
const hungerValue = document.getElementById('hunger-value');
const cleanlinessValue = document.getElementById('cleanliness-value');
const moodValue = document.getElementById('mood-value');

// Action buttons
const feedBtn = document.getElementById('feed-btn');
const cleanBtn = document.getElementById('clean-btn');
const playBtn = document.getElementById('play-btn');

// Update pet state display
function updatePetState(state) {
  if (!state) return;
  
  currentPetState = state;
  
  // Update sprite based on mood
  meowchiSprite.textContent = state.moodEmoji;
  
  // Update stat bars
  hungerBar.style.width = `${state.hunger}%`;
  cleanlinessBar.style.width = `${state.cleanliness}%`;
  moodBar.style.width = `${state.mood}%`;
  
  // Update values
  hungerValue.textContent = `${state.hunger}%`;
  cleanlinessValue.textContent = `${state.cleanliness}%`;
  moodValue.textContent = `${state.mood}%`;
  
  // Update status text
  statusText.textContent = state.status;
  
  // Show status briefly if needs attention
  if (state.needsAttention) {
    petStatus.classList.remove('hidden');
    setTimeout(() => {
      petStatus.classList.add('hidden');
    }, 3000);
  }
}

// Pet care actions
feedBtn.addEventListener('click', async () => {
  if (window.meowchiAPI) {
    const result = await window.meowchiAPI.feedMeowchi();
    if (result.success) {
      showActionFeedback(result.message);
    }
  }
});

cleanBtn.addEventListener('click', async () => {
  if (window.meowchiAPI) {
    const result = await window.meowchiAPI.cleanMeowchi();
    if (result.success) {
      showActionFeedback(result.message);
    }
  }
});

playBtn.addEventListener('click', async () => {
  if (window.meowchiAPI) {
    const result = await window.meowchiAPI.playWithMeowchi();
    if (result.success) {
      showActionFeedback(result.message);
    }
  }
});

// Show action feedback
function showActionFeedback(message) {
  statusText.textContent = message;
  petStatus.classList.remove('hidden');
  
  // Add happy animation
  meowchiSprite.style.animation = 'none';
  setTimeout(() => {
    meowchiSprite.style.animation = 'bounce 0.5s ease, float 3s ease-in-out infinite';
  }, 10);
  
  setTimeout(() => {
    petStatus.classList.add('hidden');
  }, 3000);
}

// Initialize pet state
async function initializePetState() {
  if (window.meowchiAPI) {
    // Get initial state
    const initialState = await window.meowchiAPI.getPetState();
    updatePetState(initialState);
    
    // Listen for updates
    window.meowchiAPI.onPetStateUpdate((state) => {
      updatePetState(state);
    });
  }
}

// Initialize pet state when page loads
initializePetState();

// Inventory System Integration
const inventoryBtn = document.getElementById('inventory-btn');
const inventoryPanel = document.getElementById('inventory-panel');
const closeInventoryBtn = document.getElementById('close-inventory');
const inventoryGrid = document.getElementById('inventory-grid');
const meowchiHat = document.getElementById('meowchi-hat');

let isInventoryOpen = false;
let currentInventory = null;

// Toggle inventory panel
inventoryBtn.addEventListener('click', () => {
  isInventoryOpen = !isInventoryOpen;
  if (isInventoryOpen) {
    inventoryPanel.classList.remove('hidden');
    petPanel.classList.add('hidden');
    isPanelOpen = false;
  } else {
    inventoryPanel.classList.add('hidden');
  }
});

closeInventoryBtn.addEventListener('click', () => {
  inventoryPanel.classList.add('hidden');
  isInventoryOpen = false;
});

// Close panels when clicking outside
document.addEventListener('click', (e) => {
  const clickedElements = [meowchiSprite, petPanel, inventoryPanel, inventoryBtn];
  const clickedInside = clickedElements.some(el => el.contains(e.target));
  
  if (!clickedInside) {
    petPanel.classList.add('hidden');
    inventoryPanel.classList.add('hidden');
    isPanelOpen = false;
    isInventoryOpen = false;
  }
});

// Render inventory items
function renderInventory(inventory) {
  if (!inventory) return;
  
  currentInventory = inventory;
  inventoryGrid.innerHTML = '';
  
  inventory.hats.forEach(hat => {
    const hatElement = document.createElement('div');
    hatElement.className = `hat-item ${hat.unlocked ? '' : 'locked'} ${hat.equipped ? 'equipped' : ''} rarity-${hat.rarity}`;
    
    let progressHtml = '';
    if (!hat.unlocked && hat.progress) {
      progressHtml = `
        <div class="unlock-progress">
          ${hat.progress.current}/${hat.progress.required}
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${hat.progress.percentage}%"></div>
          </div>
        </div>
      `;
    }
    
    hatElement.innerHTML = `
      <span class="hat-icon">${hat.emoji || '🎩'}</span>
      <div class="hat-name">${hat.name}</div>
      <div class="hat-rarity rarity-${hat.rarity}">${hat.rarity}</div>
      ${hat.equipped ? '<div class="equipped-badge">EQUIPPED</div>' : ''}
      ${progressHtml}
    `;
    
    if (hat.unlocked) {
      hatElement.addEventListener('click', () => equipHat(hat.id));
    }
    
    inventoryGrid.appendChild(hatElement);
  });
}

// Equip a hat
async function equipHat(hatId) {
  if (window.meowchiAPI) {
    const result = await window.meowchiAPI.equipHat(hatId);
    if (result.success) {
      showActionFeedback(result.message);
      
      // Add equip animation
      addSparkleEffect(meowchiSprite);
    }
  }
}

// Update displayed hat
function updateDisplayedHat(hat) {
  if (hat && hat.emoji) {
    meowchiHat.textContent = hat.emoji;
    meowchiHat.style.display = 'block';
  } else {
    meowchiHat.textContent = '';
    meowchiHat.style.display = 'none';
  }
}

// Add sparkle effect for hat changes
function addSparkleEffect(element) {
  const sparkleContainer = document.createElement('div');
  sparkleContainer.className = 'sparkle-effect';
  
  for (let i = 0; i < 8; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.animationDelay = `${Math.random() * 0.5}s`;
    sparkleContainer.appendChild(sparkle);
  }
  
  element.appendChild(sparkleContainer);
  setTimeout(() => sparkleContainer.remove(), 1000);
}

// Initialize inventory
async function initializeInventory() {
  if (window.meowchiAPI) {
    // Get initial inventory
    const inventory = await window.meowchiAPI.getInventory();
    renderInventory(inventory);
    
    // Get equipped hat
    const equippedHat = await window.meowchiAPI.getEquippedHat();
    updateDisplayedHat(equippedHat);
    
    // Listen for inventory updates
    window.meowchiAPI.onInventoryUpdate((inventory) => {
      renderInventory(inventory);
      const equipped = inventory.hats.find(h => h.equipped);
      updateDisplayedHat(equipped);
    });
    
    // Listen for hat unlocks
    window.meowchiAPI.onHatUnlocked((data) => {
      statusText.textContent = data.message;
      petStatus.classList.remove('hidden');
      addSparkleEffect(meowchiSprite);
      
      setTimeout(() => {
        petStatus.classList.add('hidden');
      }, 4000);
    });
  }
}

// Initialize inventory when page loads
initializeInventory();

// Evolution System Integration
const journalBtn = document.getElementById('journal-btn');
const journalPanel = document.getElementById('journal-panel');
const closeJournalBtn = document.getElementById('close-journal');
const currentEvolutionDiv = document.getElementById('current-evolution');
const evolutionProgressDiv = document.getElementById('evolution-progress');
const evolutionHistoryDiv = document.getElementById('evolution-history');
const evolutionDialog = document.getElementById('evolution-dialog');
const closeEvolutionBtn = document.getElementById('close-evolution');

let isJournalOpen = false;
let currentEvolutionState = null;

// Toggle journal panel
journalBtn.addEventListener('click', () => {
  isJournalOpen = !isJournalOpen;
  if (isJournalOpen) {
    journalPanel.classList.remove('hidden');
    petPanel.classList.add('hidden');
    inventoryPanel.classList.add('hidden');
    isPanelOpen = false;
    isInventoryOpen = false;
    updateJournal();
  } else {
    journalPanel.classList.add('hidden');
  }
});

closeJournalBtn.addEventListener('click', () => {
  journalPanel.classList.add('hidden');
  isJournalOpen = false;
});

// Close evolution dialog
closeEvolutionBtn.addEventListener('click', () => {
  evolutionDialog.classList.add('hidden');
});

// Update close panels logic
document.addEventListener('click', (e) => {
  const clickedElements = [meowchiSprite, petPanel, inventoryPanel, journalPanel, inventoryBtn, journalBtn];
  const clickedInside = clickedElements.some(el => el.contains(e.target));
  
  if (!clickedInside) {
    petPanel.classList.add('hidden');
    inventoryPanel.classList.add('hidden');
    journalPanel.classList.add('hidden');
    isPanelOpen = false;
    isInventoryOpen = false;
    isJournalOpen = false;
  }
});

// Update journal content
async function updateJournal() {
  if (window.meowchiAPI) {
    const state = await window.meowchiAPI.getEvolutionState();
    const journal = await window.meowchiAPI.getEvolutionJournal();
    
    // Update current evolution display
    currentEvolutionDiv.innerHTML = `
      <div class="evolution-form">${state.current.emoji}</div>
      <div class="evolution-name">${state.current.name}</div>
      <div class="evolution-tier">Tier ${state.current.tier}</div>
      <div class="evolution-description">${state.current.description}</div>
    `;
    
    // Update evolution progress
    evolutionProgressDiv.innerHTML = '';
    if (state.possibleEvolutions && state.possibleEvolutions.length > 0) {
      evolutionProgressDiv.innerHTML = '<h4>Next Evolutions:</h4>';
      
      state.possibleEvolutions.forEach(evo => {
        let progressHtml = '';
        
        if (evo.progress) {
          Object.entries(evo.progress).forEach(([key, prog]) => {
            const percentage = Math.round(prog.percentage);
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            const value = formatProgressValue(key, prog);
            
            progressHtml += `
              <div class="evolution-requirement">
                <div class="requirement-label">
                  <span>${label}</span>
                  <span>${value}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
              </div>
            `;
          });
        }
        
        evolutionProgressDiv.innerHTML += `
          <div class="evolution-candidate">
            <h5>${evo.emoji} ${evo.name}</h5>
            ${progressHtml}
          </div>
        `;
      });
    }
    
    // Update evolution history
    evolutionHistoryDiv.innerHTML = '<h4>Evolution History:</h4>';
    journal.history.forEach((form, index) => {
      const date = index === 0 ? 'Original Form' : new Date().toLocaleDateString();
      evolutionHistoryDiv.innerHTML += `
        <div class="history-item">
          <div class="history-emoji">${form.emoji}</div>
          <div class="history-info">
            <div class="history-name">${form.name}</div>
            <div class="history-date">${date}</div>
          </div>
        </div>
      `;
    });
  }
}

// Format progress values
function formatProgressValue(type, progress) {
  if (type === 'playtime') {
    const hours = Math.floor(progress.current / 3600000);
    const reqHours = Math.floor(progress.required / 3600000);
    return `${hours}h / ${reqHours}h`;
  }
  return `${progress.current} / ${progress.required}`;
}

// Handle evolution trigger
function showEvolutionDialog(data) {
  const oldFormDiv = document.getElementById('old-form');
  const newFormDiv = document.getElementById('new-form');
  const messageDiv = document.getElementById('evolution-message');
  
  oldFormDiv.textContent = data.oldForm.emoji;
  newFormDiv.textContent = data.newForm.emoji;
  messageDiv.textContent = data.message;
  
  evolutionDialog.classList.remove('hidden');
  
  // Update Meowchi sprite immediately
  meowchiSprite.textContent = data.newForm.emoji;
  currentEvolutionState = data.newForm;
  
  // Add extra sparkles
  for (let i = 0; i < 3; i++) {
    setTimeout(() => addSparkleEffect(meowchiSprite), i * 500);
  }
}

// Initialize evolution system
async function initializeEvolution() {
  if (window.meowchiAPI) {
    // Get initial state
    const state = await window.meowchiAPI.getEvolutionState();
    currentEvolutionState = state.current;
    
    // Update sprite if evolved
    if (state.current.id !== 'base') {
      meowchiSprite.textContent = state.current.emoji;
    }
    
    // Listen for evolution events
    window.meowchiAPI.onEvolutionTriggered((data) => {
      showEvolutionDialog(data);
    });
  }
}

// Initialize evolution when page loads
initializeEvolution();