const { MemorySearch } = require('../src/search');
const fs = require('fs').promises;
const path = require('path');

async function runTests() {
  console.log('🧪 Running Memory Search Tests...\n');
  
  const workspaceDir = path.join(__dirname, 'fixtures');
  const search = new MemorySearch({
    workspacePath: workspaceDir,
    indexPath: path.join(workspaceDir, 'test-index.json')
  });
  
  let passed = 0;
  let failed = 0;
  
  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    }
  }
  
  // Setup test fixtures
  await test('Setup test fixtures', async () => {
    await fs.mkdir(workspaceDir, { recursive: true });
    await fs.mkdir(path.join(workspaceDir, 'memory'), { recursive: true });
    
    // Create test memory files
    await fs.writeFile(
      path.join(workspaceDir, 'memory/2026-01-15.md'),
      '# January 15\n\nMeeting about authentication system. Decided to use JWT tokens.'
    );
    
    await fs.writeFile(
      path.join(workspaceDir, 'memory/2026-01-20.md'),
      '# January 20\n\nDeployed new API endpoints to production. Monitoring error rates.'
    );
  });
  
  // Test 1: Model caching
  await test('Model caching works', async () => {
    const start = Date.now();
    await search.init();
    const firstLoad = Date.now() - start;
    
    const start2 = Date.now();
    await search.init(); // Should be instant
    const secondLoad = Date.now() - start2;
    
    if (secondLoad > firstLoad * 0.5) {
      throw new Error('Model not cached properly');
    }
  });
  
  // Test 2: Build index
  await test('Builds index from memory files', async () => {
    await search.buildIndex();
    if (search.embeddings.size !== 2) {
      throw new Error(`Expected 2 documents, got ${search.embeddings.size}`);
    }
  });
  
  // Test 3: Query returns results
  await test('Query returns relevant results', async () => {
    const results = await search.query('authentication JWT tokens', 3);
    if (results.length === 0) {
      throw new Error('No results returned');
    }
    if (!results[0].path.includes('2026-01-15')) {
      throw new Error('Wrong document ranked first');
    }
  });
  
  // Test 4: Date filtering
  await test('Date filtering works', async () => {
    const startDate = new Date('2026-01-18');
    const endDate = new Date('2026-01-25');
    
    const results = await search.query('API deployment production', 5, { startDate, endDate });
    
    if (results.length === 0) {
      throw new Error('No results with date filter');
    }
    if (!results[0].path.includes('2026-01-20')) {
      throw new Error('Date filter returned wrong document');
    }
  });
  
  // Test 5: Nonsense query handling
  await test('Nonsense query returns weak matches or empty', async () => {
    const results = await search.query('xyznonexistentquery123', 3);
    // Should return weak matches (flagged) or empty, not crash
    if (results.length >= 1 && !results[0]._isWeakMatch && results[0].similarity < 0.05) {
      throw new Error('Should return weak matches for nonsense query');
    }
  });
  
  // Test 6: Similarity calculation
  await test('Cosine similarity calculation is correct', async () => {
    // Test with identical vectors
    const vec = [1, 0, 0];
    const similarity = search.cosineSimilarity(vec, vec);
    if (Math.abs(similarity - 1.0) > 0.001) {
      throw new Error('Self-similarity should be 1.0');
    }
  });
  
  // Test 7: Index persistence
  await test('Index saves and loads correctly', async () => {
    await search.buildIndex();
    const sizeAfterBuild = search.embeddings.size;
    
    // Clear and reload
    search.embeddings.clear();
    await search.loadOrBuildIndex();
    
    if (search.embeddings.size !== sizeAfterBuild) {
      throw new Error('Index not persisted correctly');
    }
  });
  
  // Test 8: Date parsing
  await test('Date parsing from filepath works', async () => {
    const date = search.parseDateFromPath('memory/2026-01-15.md');
    if (!date || date.getFullYear() !== 2026 || date.getMonth() !== 0 || date.getDate() !== 15) {
      throw new Error('Date parsing failed');
    }
  });
  
  // Cleanup
  await test('Cleanup test files', async () => {
    await fs.rm(workspaceDir, { recursive: true, force: true });
  });
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Tests completed: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
