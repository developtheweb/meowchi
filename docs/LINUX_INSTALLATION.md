# Linux Installation Guide

## Installing Meowchi on Linux

### Making AppImage Executable

1. Download the `.AppImage` file from releases
2. Make it executable:
   ```bash
   chmod +x Meowchi-*.AppImage
   ```
3. Run the AppImage:
   ```bash
   ./Meowchi-*.AppImage
   ```

### Input Monitoring Permissions

Meowchi requires permissions to monitor keyboard and mouse input. Depending on your distribution:

#### Option 1: Add User to Input Group (Recommended)

```bash
sudo usermod -a -G input $USER
```

Then log out and log back in for changes to take effect.

#### Option 2: Create udev Rule

Create a file `/etc/udev/rules.d/99-meowchi.rules`:

```bash
sudo tee /etc/udev/rules.d/99-meowchi.rules << EOF
KERNEL=="uinput", MODE="0660", GROUP="input", TAG+="uaccess"
SUBSYSTEM=="input", MODE="0660", GROUP="input", TAG+="uaccess"
EOF
```

Then reload udev:
```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

#### Option 3: Run with Elevated Permissions (Not Recommended)

As a last resort:
```bash
sudo ./Meowchi-*.AppImage
```

### Wayland Compatibility

On Wayland, global input monitoring may have limitations. If you experience issues:

1. Try running under X11/Xorg session instead
2. Or use `sudo` (security risk, not recommended)

### Desktop Integration

To add Meowchi to your application menu:

```bash
# Extract AppImage
./Meowchi-*.AppImage --appimage-extract

# Move to opt
sudo mv squashfs-root /opt/meowchi

# Create desktop entry
cat > ~/.local/share/applications/meowchi.desktop << EOF
[Desktop Entry]
Name=Meowchi
Exec=/opt/meowchi/AppRun
Icon=/opt/meowchi/meowchi.png
Type=Application
Categories=Game;
EOF
```

### Troubleshooting

**"FUSE is required"**: Install FUSE:
- Debian/Ubuntu: `sudo apt install fuse libfuse2`
- Fedora: `sudo dnf install fuse fuse-libs`
- Arch: `sudo pacman -S fuse2`

**Input not tracking**: Check permissions with:
```bash
ls -la /dev/input/
groups $USER
```