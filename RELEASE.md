# Release Process

## Automated Releases with GitHub Actions

This project uses GitHub Actions to automatically build and release Meowchi for all platforms.

### How to Create a Release

1. **Update Version**:
   ```bash
   # Update version in package.json
   npm version patch  # or minor/major
   ```

2. **Commit Changes**:
   ```bash
   git add package.json package-lock.json
   git commit -m "Bump version to x.x.x"
   git push
   ```

3. **Create Release Tag**:
   ```bash
   git tag v0.1.0  # Replace with your version
   git push origin v0.1.0
   ```

4. **GitHub Actions Will**:
   - Automatically trigger on the new tag
   - Build for Windows, macOS, and Linux
   - Create a GitHub Release with all artifacts
   - Upload the built files

### Manual Workflow Trigger

You can also manually trigger a build from the Actions tab:
1. Go to Actions → Build and Release
2. Click "Run workflow"
3. Select the branch/tag

### Build Artifacts

The workflow creates:
- **Windows**: `.exe` installer
- **macOS**: `.dmg` disk image
- **Linux**: `.AppImage` portable app

### Platform Requirements

- **Windows**: Windows 10 or later
- **macOS**: macOS 10.13 or later
- **Linux**: Most modern distributions with GLIBC 2.28+

### Versioning

Follow semantic versioning:
- `MAJOR.MINOR.PATCH`
- Example: `1.2.3`
- Tag format: `v1.2.3`

### Notes

- Builds are automatically code-signed where possible
- macOS builds may require notarization for distribution
- Linux AppImage is portable and doesn't require installation