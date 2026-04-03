/**
 * Ash Memory Search - ESM Entry Point
 * AI-powered semantic search engine for memory files
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { MemorySearch } = require('./src/search.js');
const { MemorySearchServer } = require('./src/server.js');
const { SqliteStorage } = require('./src/storage.js');

export { MemorySearch, MemorySearchServer, SqliteStorage };
export default { MemorySearch, MemorySearchServer, SqliteStorage };
