# ash-memory-search

AI-powered semantic search engine for memory files.

## What It Does

Searches across your OpenClaw memory files (MEMORY.md, memory/*.md) using semantic similarity, not just keyword matching.

## Quick Start

```bash
npm install
npm run index    # Build the search index
npm run search   # Interactive search CLI
```

## Usage

```bash
# Search memory files
npm run search "what did we decide about authentication?"

# In your code
const { MemorySearch } = require('./src/search');
const search = new MemorySearch();
const results = await search.query("authentication decisions");
```

## Architecture

- **Embedding Provider:** OpenAI or local embeddings (depending on config)
- **Vector Store:** In-memory + persistence to disk
- **Index:** Rebuilt on-demand or via cron
- **CLI:** Interactive search with scoring

## Deploy

Pushes to main branch automatically deploy via GitHub Actions (if configured for cloud hosting).

## Security

- Credentials stored in `.env` (never committed)
- Token-based API access
- Rate limiting on all endpoints

## License

MIT
