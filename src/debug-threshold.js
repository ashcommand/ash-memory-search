const { MemorySearch } = require('./search');

async function main() {
  const search = new MemorySearch();
  
  // Test the specific query and see what similarity scores we get
  const results = await search.query('what did we build today', 10);
  
  if (results.length === 0) {
    console.log('No results above threshold. Let\'s see what the actual similarity scores are:');
    
    // Temporarily lower threshold to see all scores
    await search.loadOrBuildIndex();
    await search.init();
    
    const queryEmbedding = await search.embedder('what did we build today', { pooling: 'mean' });
    const queryVector = Array.from(queryEmbedding.data || queryEmbedding);
    
    console.log('\nAll document similarities (for debugging):');
    for (const [path, data] of search.embeddings) {
      const similarity = search.cosineSimilarity(queryVector, data.embedding);
      console.log(`  ${path}: ${(similarity * 100).toFixed(2)}%`);
    }
  }
}

main().catch(console.error);
