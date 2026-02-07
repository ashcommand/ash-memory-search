# SKILL.md

# Ash Memory Search

AI-powered semantic search for your OpenClaw memory files. Find context using natural language instead of hunting through daily logs.

## 🎯 What It Does

- Searches across your `memory/*.md` and `MEMORY.md` files
- Uses AI embeddings to understand *meaning*, not just keywords
- Returns relevant results with similarity scores
- Supports date filtering and API access

## ⚡ Quick Start

```bash
# Install the skill (when published)
npm install ash-memory-search

# Build your index
openclaw memory-search index

# Search your memories
openclaw memory-search "what did I decide about authentication"
```

## 🚀 Usage

### Command Line

```bash
# Search with natural language
openclaw memory-search "gmail account I created"

# Limit results
openclaw memory-search "deployment" --limit 3

# Filter by date range
openclaw memory-search "API design" --start 2026-01-01 --end 2026-01-31

# Interactive mode
openclaw memory-search --interactive

# Rebuild index
openclaw memory-search index

# Start API server
openclaw memory-search server --port 3777
```

### API Access

```javascript
// Start the server
openclaw memory-search server

// Search via HTTP
const response = await fetch('http://localhost:3777/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "what did we build last week",
    limit: 5
  })
});

const results = await response.json();
```

### Programmatic Usage

```javascript
const { MemorySearch } = require('ash-memory-search');

const search = new MemorySearch({
  workspacePath: process.env.HOME + '/.openclaw/workspace'
});

const results = await search.query('authentication decisions', 3);
console.log(results);
```

## 🎯 Features

### ✅ Semantic Search

Understands meaning, not just keywords:
- `"gmail account"` → finds `ashcommand620@gmail.com` (49% match)
- `"what we built"` → returns weak matches with warnings

### ✅ Date Filtering

Filter results by date ranges:
```bash
--start 2026-02-01 --end 2026-02-15
```

### ✅ Fallback Results

When no high-confidence matches found, returns weak matches with ⚠️ warning

### ✅ Performance

- Model caching: subsequent queries < 0.1ms
- Indexing: ~150 docs/sec
- Query speed: ~2.5ms average

### ✅ Concurrent Access

SQLite backend with WAL mode supports:
- Multiple concurrent readers
- Serialized writers (automatic)
- No file corruption

### ✅ Multiple Interfaces

- CLI for interactive use
- HTTP API for integrations
- Programmatic API for scripts

## 🤔 Use Cases

**1. Find Decisions**
```bash
openclaw memory-search "decided to use JWT"
```

**2. Project Retrospectives**
```bash
openclaw memory-search "what we shipped last sprint"
```

**3. Onboarding**
```bash
openclaw memory-search "project setup" --start 2026-01-01
```

**4. Daily Standup Prep**
```bash
openclaw memory-search "worked on yesterday"
```

## 🔧 Configuration

Environment variables:

```bash
# Workspace location (default: ~/.openclaw/workspace)
export MEMORY_SEARCH_WORKSPACE=/custom/path

# SQLite database location
export MEMORY_SEARCH_DB=/custom/index.db

# Embedding model (default: Xenova/all-MiniLM-L6-v2)
export MEMORY_SEARCH_MODEL=all-MiniLM-L6-v2

# Query confidence threshold
export MEMORY_SEARCH_THRESHOLD=0.15
```

## 📊 Output Format

```bash
$ openclaw memory-search "github account"

=======================================================
Found 1 relevant documents
=======================================================

[1] 2026-02-06
Path: memory/2026-02-06.md
Similarity: 38.3%
Size: 1KB
Last modified: 2/6/2026
Snippet: GitHub Account Created - Created... 
=======================================================
```

## 🚀 Installation in OpenClaw

Add to your OpenClaw workspace:

```bash
# Clone into skills directory
git clone https://github.com/ashcommand/ash-memory-search \
  ~/.openclaw/skills/ash-memory-search

# Install dependencies
cd ~/.openclaw/skills/ash-memory-search
npm install

# Build index
openclaw memory-search index

# Use it!
openclaw memory-search "what did I work on"
```

## 🛠️ Development

```bash
# Clone
git clone https://github.com/ashcommand/ash-memory-search.git
cd ash-memory-search

# Install
npm install

# Run tests
npm test

# Run benchmarks
npm run benchmark

# Manual testing
npm run search
```

## 🔒 Security

- **Local only** - Embeddings run on your machine
- **No external APIs** - No data leaves your system
- **File permissions** - Respects standard file permissions
- **SQLite WAL** - Crash-safe with write-ahead logging

## 📦 Dependencies

- Node.js 18+
- `@xenova/transformers` - Local embeddings
- `better-sqlite3` - SQLite database
- `dotenv` - Environment configuration

## 📄 License

MIT - See [LICENSE](LICENSE) file

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 🐛 Issues

Report bugs at: https://github.com/ashcommand/ash-memory-search/issues

## 📚 Architecture Blog

Read about the technical architecture: [Architecture Deep Dive](docs/architecture.md)

## 🌟 Acknowledgments

- Built with Transformers.js for local embeddings
- Inspired by modern AI-native tooling approaches
- OpenClaw community for feedback and testing

## 📞 Support

- GitHub Issues: https://github.com/ashcommand/ash-memory-search/issues
- OpenClaw Discord: https://discord.com/invite/clawd
- Discussions: https://github.com/ashcommand/ash-memory-search/discussions

---

**Happy searching!** 🔍
