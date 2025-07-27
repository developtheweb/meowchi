# Windows Installation Guide

## Installing Meowchi on Windows

When you download and run the Meowchi installer, you may encounter Windows SmartScreen warnings because the app isn't signed with a code signing certificate.

### Bypassing SmartScreen Filter

1. Download the `.exe` installer from the releases page
2. When you run it, Windows Defender SmartScreen may block it
3. Click "More info" on the warning screen
4. Click "Run anyway" to proceed with installation

### Alternative: Disable SmartScreen (Not Recommended)

For IT administrators or advanced users who need to deploy without warnings:

1. Open Windows Security
2. Go to App & browser control
3. Under "Check apps and files", select "Warn" or "Off"
4. Remember to re-enable after installation

### Antivirus False Positives

Some antivirus software may flag Meowchi due to:
- Global keyboard/mouse monitoring (required for activity tracking)
- Unsigned executable

If this happens:
1. Add an exception for Meowchi in your antivirus
2. Or temporarily disable real-time protection during installation
3. Re-enable protection after installation

### Administrator Permissions

Meowchi may work better with administrator privileges for:
- Global input monitoring
- Always-on-top window functionality

To run as administrator:
1. Right-click on Meowchi shortcut
2. Select "Run as administrator"
3. Or set it permanently in Properties → Compatibility

## Future Improvements

We're working on getting a code signing certificate to eliminate these warnings in future releases.