# Input Tracking Setup and Troubleshooting

## Overview
Meowchi uses `uiohook-napi` for global keyboard and mouse tracking. This allows the app to count your productivity actions even when Meowchi's window is not in focus.

## Platform Requirements

### Linux
- Requires X11 or Wayland display server
- May need additional permissions for input monitoring
- If running on Wayland, you may need to run with sudo or configure permissions:
  ```bash
  sudo npm start
  ```

### macOS
- Requires accessibility permissions
- Go to System Preferences → Security & Privacy → Privacy → Accessibility
- Add and enable the Electron app

### Windows
- Should work out of the box
- May require running as Administrator on some systems

## Troubleshooting

### "Input tracking unavailable" message
This means the input tracking library couldn't initialize. Try:

1. **Check permissions**: Ensure the app has the necessary system permissions
2. **Run with elevated privileges**: Try running as administrator/sudo
3. **Check console for errors**: Run with `NODE_ENV=development npm start` to see detailed logs

### Building from source
If the pre-built binaries don't work, you may need to rebuild:
```bash
npm rebuild uiohook-napi
```

### Fallback behavior
If input tracking fails:
- The app will still function normally
- The stats overlay will show "Input tracking unavailable"
- All other features (animations, interactions) will work
- Points/XP system will be disabled until Phase 3

## Security Note
Input tracking requires system-level permissions because it monitors global keyboard and mouse events. This is necessary for the gamification features but means you should only run this app from trusted sources.