# 🐾 Meowchi - Your Productivity Pet

A gamified desktop virtual pet that rewards productivity by tracking keyboard and mouse activity. Meowchi evolves based on how well you take care of it!

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🎮 Core Gameplay
- **Virtual Pet**: Adorable cat companion that lives on your desktop
- **Activity Tracking**: Earn XP and coins through keyboard/mouse usage
- **Care System**: Feed, clean, and play with Meowchi to keep it happy
- **Floating Window**: Always-on-top transparent window

### 🎩 Customization
- **Hat Collection**: Unlock 9 different hats with various rarities
- **Progress Tracking**: See your progress towards new unlocks
- **Visual Variety**: Different cat expressions and reactions

### 🦋 Evolution System
- **7 Evolution Forms**: From basic Meowchi to Celestial, Zen Master, or Overlord
- **3 Evolution Paths**: Good (high care), Neutral (balanced), Bad (neglect)
- **Dynamic Progression**: Evolution based on care patterns and playtime

### 💾 Save System
- **Auto-Save**: Progress saved every 60 seconds
- **Persistent Storage**: All stats, unlocks, and evolution preserved
- **Data Recovery**: Automatic backup and corruption handling

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/developtheweb/meowchi.git

# Install dependencies
cd meowchi
npm install

# Start the app
npm start
```

### Building from Source
```bash
# Build for all platforms
npm run dist

# Platform-specific builds
npm run dist:win    # Windows
npm run dist:mac    # macOS  
npm run dist:linux  # Linux
```

## 🎯 How to Play

1. **Earn Points**: Type and click to earn XP and coins
2. **Care for Meowchi**: 
   - 🍔 Feed when hungry (every 20 min)
   - 🧼 Clean when dirty (based on activity)
   - 🎮 Play to boost mood
3. **Unlock Hats**: Reach milestones to unlock cosmetic items
4. **Evolve**: Maintain good care for positive evolutions

## 🛠️ Development

### Tech Stack
- **Electron.js**: Cross-platform desktop framework
- **Node.js**: Backend logic and native modules
- **uiohook-napi**: Global input tracking
- **lowdb**: Persistent JSON storage

### Project Structure
```
meowchi/
├── main.js              # Electron main process
├── renderer/            # UI components
├── logic/              # Game systems
│   ├── inputTracker.js # Activity monitoring
│   ├── petState.js     # Pet mechanics
│   ├── hatManager.js   # Inventory system
│   ├── evolutionManager.js # Evolution logic
│   └── saveManager.js  # Persistence layer
└── assets/             # Sprites and media
```

### Testing
```bash
# Run in test mode (faster timers)
TEST_MODE=true npm start
```

## 🔧 Troubleshooting

### Input Tracking Issues
- **Linux**: May require running with `sudo` or configuring permissions
- **macOS**: Grant accessibility permissions in System Preferences
- **Windows**: May need to run as Administrator

### Save Data Location
- **Windows**: `%APPDATA%/meowchi/`
- **macOS**: `~/Library/Application Support/meowchi/`
- **Linux**: `~/.config/meowchi/`

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Credits

Created with 💖 by developtheweb

Special thanks to the Electron and Node.js communities!

---

**Note**: Meowchi requires system-level permissions for input tracking. Only download from trusted sources.