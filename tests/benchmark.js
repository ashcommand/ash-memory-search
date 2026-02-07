#!/usr/bin/env node

/**
 * Performance Benchmarks for Memory Search
 * Measures indexing speed, query speed, memory usage
 */

const { MemorySearch } = require('../src/search');
const fs = require('fs').promises;
const path = require('path');
const { performance } = require('perf_hooks');

async function benchmark() {
  console.log('📊 Running Performance Benchmarks\n');
  console.log('='.repeat(60));
  
  const workspaceDir = path.join(__dirname, 'benchmark-fixtures');
  const indexPath = path.join(workspaceDir, 'bench-index.json');
  
  // Generate test data
  console.log('Generating test fixtures...');
  await fs.mkdir(path.join(workspaceDir, 'memory'), { recursive: true });
  
  const testDocuments = [];
  for (let i = 0; i < 50; i++) {
    const date = new Date(2026, 0, i + 1); // 50 days
    const content = `# ${date.toDateString()}\n\nThis is test document number ${i}. It contains some relevant information about project progress, decisions made, and outcomes. The content is designed to be realistic and searchable. Topics include: authentication, deployment, API design, team meetings, bug fixes, and feature releases.`;
    
    const filename = date.toISOString().split('T')[0] + '.md'; // YYYY-MM-DD.md
    testDocuments.push({ filename, content });
    await fs.writeFile(path.join(workspaceDir, 'memory', filename), content);
  }
  
  const search = new MemorySearch({ workspacePath: workspaceDir, indexPath });
  
  // Benchmark 1: Model loading (cold start)
  console.log('\n1. Model Loading (Cold Start)');
  let start = performance.now();
  await search.init();
  let duration = performance.now() - start;
  console.log(`   Time: ${duration.toFixed(2)}ms`);
  console.log(`   Result: ${duration < 5000 ? '✅ Acceptable' : '⚠️  Slow'}`);
  
  // Benchmark 2: Model loading (warm cache)
  console.log('\n2. Model Loading (Warm Cache)');
  start = performance.now();
  await search.init();
  duration = performance.now() - start;
  console.log(`   Time: ${duration.toFixed(2)}ms`);
  console.log(`   Result: ${duration < 100 ? '✅ Cached' : '❌ Not cached'}`);
  
  // Benchmark 3: Indexing speed
  console.log('\n3. Indexing 50 Documents');
  start = performance.now();
  await search.buildIndex();
  duration = performance.now() - start;
  const docsPerSecond = (50 / (duration / 1000)).toFixed(1);
  console.log(`   Time: ${duration.toFixed(2)}ms (${docsPerSecond} docs/sec)`);
  console.log(`   Result: ${duration < 30000 ? '✅ Fast' : '⚠️  Slow'}`);
  
  // Benchmark 4: Query speed (cold)
  console.log('\n4. Query Speed (First Query)');
  start = performance.now();
  let results = await search.query('authentication system design', 5);
  duration = performance.now() - start;
  console.log(`   Time: ${duration.toFixed(2)}ms (${results.length} results)`);
  console.log(`   Result: ${duration < 1000 ? '✅ Fast' : '⚠️  Slow'}`);
  
  // Benchmark 5: Query speed (warm)
  console.log('\n5. Query Speed (Subsequent Queries)');
  const queries = [
    'deployment production API',
    'team meeting decisions',
    'bug fixes releases',
    'project progress outcomes',
    'authentication deployment'
  ];
  
  let totalQueryTime = 0;
  for (const query of queries) {
    start = performance.now();
    await search.query(query, 5);
    totalQueryTime += performance.now() - start;
  }
  const avgQueryTime = totalQueryTime / queries.length;
  console.log(`   Average: ${avgQueryTime.toFixed(2)}ms per query`);
  console.log(`   Result: ${avgQueryTime < 500 ? '✅ Fast' : '⚠️  Slow'}`);
  
  // Benchmark 6: Memory usage
  console.log('\n6. Memory Usage');
  const usage = process.memoryUsage();
  console.log(`   RSS: ${(usage.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Heap Used: ${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Heap Total: ${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Result: ${usage.heapUsed < 500 * 1024 * 1024 ? '✅ Reasonable' : '⚠️  High'}`);
  
  // Benchmark 7: Index size
  console.log('\n7. Index Size');
  const stats = await fs.stat(indexPath);
  console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`   Per doc: ${(stats.size / 50).toFixed(2)} KB/doc`);
  console.log(`   Result: ${stats.size < 50 * 1024 * 1024 ? '✅ Compact' : '⚠️  Large'}`);
  
  // Benchmark 8: Date filtering overhead
  console.log('\n8. Date Filtering Overhead');
  start = performance.now();
  results = await search.query('authentication', 5, {
    startDate: new Date('2026-01-10'),
    endDate: new Date('2026-01-20')
  });
  duration = performance.now() - start;
  console.log(`   Time: ${duration.toFixed(2)}ms (${results.length} filtered results)`);
  console.log(`   Overhead: ${duration < avgQueryTime * 1.5 ? '✅ Minimal' : '⚠️  Significant'}`);
  
  // Cleanup
  await fs.rm(workspaceDir, { recursive: true, force: true });
  
  console.log('\n' + '='.repeat(60));
  console.log('Benchmarks completed');
  console.log('='.repeat(60));
}

benchmark().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
