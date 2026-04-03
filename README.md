# ash-memory-search

AI-powered semantic search engine for memory files.

[![NPM version](https://img.shields.io/npm/v/ash-memory-search)](https://www.npmjs.com/package/ash-memory-search)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What It Does

Searches across your OpenClaw memory files (`MEMORY.md`, `memory/*.md`) using **semantic similarity**, not just keyword matching. Understands the *meaning* of your queries to find relevant context.

## Installation

### Option 1: Global Install (Recommended)

```bash
# Install globally
npm install -g ash-memory-search

# Run setup (detects workspace, builds index)
ash-memory-search setup

# Start searching
ash-memory-search "what did I decide about authentication?"
```

### Option 2: Clone & Install

```bash
# Clone the repository
git clone https://github.com/ashcommand/ash-memory-search.git
cd ash-memory-search

# Install dependencies
npm install

# Run setup
npm run setup

# Search
npm run search
```

### Option 3: As a Dependency

```bash
# In your project
npm install ash-memory-search
```

```javascript
const { MemorySearch } = require('ash-memory-search');

const search = new MemorySearch({
  workspacePath: process.env.HOME + '/.openclaw/workspace'
});

const results = await search.query('authentication decisions', 5);
console.log(results);
```

## Quick Start

```bash
# Build the search index
ash-memory-search index

# Search your memories
ash-memory-search "gmail account I created"

# Start API server
ash-memory-search server --port 3777
```

## CLI Usage

```bash
# Search with natural language
ash-memory-search "what did we decide about JWT"

# Search with specific result limit
ash-memory-search "deployment issues" --limit 3

# Filter by date range
ash-memory-search "API design" --start 2026-01-01 --end 2026-01-31

# Interactive mode
ash-memory-search

# Rebuild index
ash-memory-search index

# Start API server
ash-memory-search server 3777

# Show help
ash-memory-search --help
```

## API Usage

Start the server:
```bash
ash-memory-search server
```

Search via HTTP:
```javascript
const response = await fetch('http://localhost:3777/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "what did we build last week",
    limit: 5
  })
});

const { results } = await response.json();
```

Endpoints:
- `POST /search` - Search memories
- `POST /reindex` - Rebuild index
- `GET /health` - Health check

## Features

- 🤖 **AI-Powered**: Uses transformer embeddings to understand meaning
- 🔍 **Semantic Search**: Finds relevant content even without keyword matches
- 📅 **Date Filtering**: Filter results by date ranges
- ⚡ **Fast**: Local embeddings, SQLite backend with WAL mode
- 🔒 **Private**: All data stays local, no external APIs
- 🌐 **Multiple Interfaces**: CLI, HTTP API, and programmatic

## Configuration

Environment variables:

```bash
# Workspace location (default: ~/.openclaw/workspace)
export MEMORY_SEARCH_WORKSPACE=/custom/path

# SQLite database location (default: <workspace>/ash-memory-search/index.db)
export MEMORY_SEARCH_DB=/custom/index.db

# Embedding model (default: Xenova/all-MiniLM-L6-v2)
export MEMORY_SEARCH_MODEL=all-MiniLM-L6-v2

# Query confidence threshold (default: 0.15)
export MEMORY_SEARCH_THRESHOLD=0.15
```

## Architecture

- **Embedding Provider**: Xenova Transformers (local, no API calls)
- **Vector Store**: SQLite with WAL mode for concurrent access
- **Search**: Cosine similarity on 384-dimensional embeddings
- **CLI**: Interactive and non-interactive modes
- **API**: HTTP server for integrations

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run benchmarks
npm run benchmark

# Manual testing
npm run search
```

## Security

- **Local only** - Embeddings run on your machine
- **No external APIs** - No data leaves your system
- **File permissions** - Respects standard file permissions
- **SQLite WAL** - Crash-safe with write-ahead logging

## Dependencies

- Node.js 18+
- `@xenova/transformers` - Local embeddings
- `better-sqlite3` - SQLite database
- `chalk` - Terminal colors
- `dotenv` - Environment configuration
- `inquirer` - Interactive prompts

## Use Cases

**Find Decisions**
```bash
ash-memory-search "decided to use JWT"
```

**Project Retrospectives**
```bash
ash-memory-search "what we shipped last sprint"
```

**Onboarding**
```bash
ash-memory-search "project setup" --start 2026-01-01
```

**Daily Standup Prep**
```bash
ash-memory-search "worked on yesterday"
```

## Documentation

- [SKILL.md](SKILL.md) - OpenClaw skill documentation
- [docs/architecture.md](docs/architecture.md) - Architecture deep dive
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines

## License

MIT - See [LICENSE](LICENSE) file

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Support

- GitHub Issues: https://github.com/ashcommand/ash-memory-search/issues
- Discussions: https://github.com/ashcommand/ash-memory-search/discussions

---

**Happy searching!** 🔍
