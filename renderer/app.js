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