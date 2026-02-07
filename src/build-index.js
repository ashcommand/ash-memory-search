#!/usr/bin/env node

/**
 * Build Index Script
 * Rebuilds the embeddings index from memory files
 */

const { MemorySearch } = require('./search');

async function main() {
  console.log('Building memory search index...\n');
  
  const search = new MemorySearch();
  
  try {
    await search.buildIndex();
    console.log('\n✅ Index built successfully');
    console.log(`Indexed files: ${search.embeddings.size}`);
  } catch (error) {
    console.error('\n❌ Error building index:', error);
    process.exit(1);
  }
}

main();
