/**
 * Ash Memory Search - Main Entry Point
 * AI-powered semantic search engine for memory files
 * 
 * @module ash-memory-search
 */

const { MemorySearch } = require('./src/search');
const { MemorySearchServer } = require('./src/server');
const { SqliteStorage } = require('./src/storage');

/**
 * Main MemorySearch class for semantic search
 * @see MemorySearch
 */
module.exports = {
  MemorySearch,
  MemorySearchServer,
  SqliteStorage
};
