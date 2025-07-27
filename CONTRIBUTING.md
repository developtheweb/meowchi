# Contributing to Meowchi

First off, thank you for considering contributing to Meowchi! 🐱

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible using our bug report template.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please use our feature request template and include as many details as possible.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Ensure your code follows the existing code style.
4. Make sure your code lints.
5. Issue that pull request!

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the app in development:
   ```bash
   npm start
   ```

### Building

```bash
# Build for your current platform
npm run dist

# Build for specific platforms
npm run dist:win
npm run dist:mac
npm run dist:linux
```

## Style Guidelines

### JavaScript Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Keep lines under 120 characters when possible

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### File Organization

- Keep related functionality in the same file
- Use descriptive file names
- Place new features in the appropriate directory:
  - `logic/` - Game logic and systems
  - `renderer/` - UI and rendering code
  - `assets/` - Images and media files

## Testing

- Test your changes on as many platforms as you have access to
- Ensure the app starts without errors
- Verify that existing features still work
- Check that your feature works with different screen sizes

## Questions?

Feel free to open an issue with your question or reach out on the discussions page.

Thank you for contributing! 🎉