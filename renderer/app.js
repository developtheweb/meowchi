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