# macOS Installation Guide

## Installing Meowchi on macOS

Meowchi supports both Intel and Apple Silicon Macs (M1/M2/M3). The app is built as a universal binary that runs natively on both architectures.

When you download and open the Meowchi DMG file, you may encounter security warnings because the app isn't signed with an Apple Developer certificate.

### Method 1: Right-Click to Open (Recommended)

1. Download the `.dmg` file from the releases page
2. Open the DMG and drag Meowchi to your Applications folder
3. **Do not double-click to open!** Instead:
   - Right-click (or Control-click) on Meowchi in Applications
   - Select "Open" from the context menu
   - Click "Open" in the security dialog that appears
   - macOS will remember your choice for future launches

### Method 2: System Preferences

1. Try to open Meowchi normally (it will be blocked)
2. Go to System Preferences → Privacy & Security
3. In the General tab, you'll see "Meowchi was blocked"
4. Click "Open Anyway"
5. Confirm by clicking "Open" in the popup

### Method 3: Terminal Command

For advanced users, you can remove the quarantine attribute:

```bash
xattr -d com.apple.quarantine /Applications/Meowchi.app
```

### Method 4: Disable Gatekeeper (Not Recommended)

This disables security checks system-wide:

```bash
sudo spctl --master-disable
```

To re-enable:
```bash
sudo spctl --master-enable
```

## Troubleshooting

### "Meowchi is damaged and can't be opened"

This usually means the quarantine attribute needs to be removed:

```bash
xattr -cr /Applications/Meowchi.app
```

### App Translocation Issues

If Meowchi won't save settings or behaves strangely, make sure you:
1. Copied it to Applications (don't run from the DMG)
2. Ejected the DMG after copying

### Input Monitoring Permission

Meowchi needs permission to monitor keyboard and mouse input:
1. Go to System Preferences → Privacy & Security → Input Monitoring
2. Click the lock to make changes
3. Add Meowchi to the list and check the box
4. Restart Meowchi

## Future Improvements

We're working on getting an Apple Developer certificate to sign future releases, which will eliminate these security warnings.