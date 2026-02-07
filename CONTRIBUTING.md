# Contributing to Ash Memory Search

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the Ash Memory Search project.

## 🌟 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences

## 🚀 How to Contribute

### Reporting Bugs

1. **Search existing issues** first to avoid duplicates
2. **Use the bug report template** when creating a new issue
3. Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages and stack traces
   - Environment details (OS, Node version)

### Suggesting Features

1. **Check existing issues** for similar suggestions
2. **Use the feature request template**
3. Explain:
   - The problem you're trying to solve
   - Your proposed solution
   - Why this would benefit users

### Pull Requests

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm test                    # Run unit tests
   npm run benchmark          # Run performance benchmarks
   npm run test:all           # Run full test suite
   ```

4. **Commit your changes**
   - Use clear, descriptive commit messages
   - Reference issues in commit messages (e.g., `Fixes #123`)
   - Keep commits atomic (one logical change per commit)

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Submit a pull request**
   - Fill out the PR template completely
   - Link to any related issues
   - Describe your changes clearly

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ashcommand/ash-memory-search.git
   cd ash-memory-search
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the index**
   ```bash
   npm run index
   ```

4. **Start developing**
   - Make your changes
   - Test thoroughly
   - Submit PR

## 📋 Areas for Contribution

### High Priority

- **Performance Optimizations**
  - Vector index for faster queries (e.g., HNSW)
  - Parallel embedding generation
  - Streaming responses for large result sets

- **New Features**
  - Keyword boosting in hybrid search
  - Tag-based filtering
  - Related document suggestions
  - Export to various formats (JSON, CSV, Markdown)

- **Platform Support**
  - Windows compatibility improvements
  - Docker containerization
  - Cloud storage providers (S3, GCS)

### Medium Priority

- **Developer Experience**
  - Better error messages
  - Debug mode with verbose logging
  - Interactive setup wizard

- **Testing**
  - Integration tests
  - Performance regression tests
  - Stress tests with 10k+ documents

- **Documentation**
  - More examples and use cases
  - API documentation
  - Architecture diagrams

### Low Priority

- **UI Improvements**
  - Web interface
  - Interactive CLI enhancements
  - Desktop app wrapper

## 🧪 Testing Guidelines

### Before Submitting PR

1. **Run all tests**
   ```bash
   npm run test:all
   ```

2. **Check code coverage** (aim for >80%)
   ```bash
   npm test -- --coverage
   ```

3. **Test with real data**
   - Use your own memory files
   - Verify search quality
   - Check performance with large datasets

### Writing Tests

- **Unit tests** for individual functions
- **Integration tests** for API endpoints
- **Benchmarks** for performance-critical paths

Example test structure:
```javascript
await test('Feature description', async () => {
  const result = await yourFunction(input);
  if (!result.meetsExpectations) {
    throw new Error('Clear error message');
  }
});
```

## 📖 Documentation Guidelines

### Code Comments

- Explain **why**, not **what**
- Keep comments up to date with code changes
- Use JSDoc for public APIs

### README Updates

- Update README.md for user-facing changes
- Update CHANGELOG.md for version releases
- Keep examples current and working

## 🎨 Code Style Guidelines

### JavaScript

- Use ES6+ features (const, async/await, arrow functions)
- Prefer meaningful variable names
- Keep functions small and focused
- Handle errors explicitly

### Example

```javascript
// ✅ Good
async function buildIndex() {
  try {
    await this.init();
    await this.storage.clearAll();
    // ... implementation
  } catch (error) {
    console.error('Index build failed:', error);
    throw error;
  }
}

// ❌ Bad
function build() {  // Too vague
  this.init().then(() => {
    // ... implementation ...  // No error handling
  });
}
```

## 🚫 What NOT to Contribute

- **Breaking changes** without discussion
- **Style-only changes** (use existing style)
- **Large refactors** without prior approval
- **Feature bloat** (keep it focused)

## 🏆 Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Shown in GitHub contributors list

## 📞 Getting Help

- **Issues:** Create a GitHub issue for bugs/feature requests
- **Discussions:** Use GitHub Discussions for questions
- **Discord:** Join OpenClaw Discord for real-time chat

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Ash Memory Search! 🎉
