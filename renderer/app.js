// Meowchi Renderer Process
const meowchiSprite = document.getElementById('meowchi-sprite');

// Array of cat emojis for variety
const catEmojis = ['🐱', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];
let currentEmojiIndex = 0;

// Simple interaction - clicking changes the cat emoji
meowchiSprite.addEventListener('click', () => {
  currentEmojiIndex = (currentEmojiIndex + 1) % catEmojis.length;
  meowchiSprite.textContent = catEmojis[currentEmojiIndex];
  
  // Add a little bounce animation
  meowchiSprite.style.animation = 'none';
  setTimeout(() => {
    meowchiSprite.style.animation = 'bounce 0.5s ease, float 3s ease-in-out infinite';
  }, 10);
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