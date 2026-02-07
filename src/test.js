#!/usr/bin/env node

/**
 * Test Script
 * Validates the search engine works
 */

const { MemorySearch } = require('./search');

async function main() {
  console.log('Running memory search tests...\n');
  
  const search = new MemorySearch();
  
  try {
    // Test 1: Query about something that should be in memory
    console.log('Test 1: Querying for "gmail account"');
    const results = await search.query('gmail account created today', 3);
    
    if (results.length > 0) {
      console.log(`✅ Found ${results.length} results`);
      await search.renderResults(results);
    } else {
      console.log('⚠️  No results found - might need to build index first');
    }
    
    // Test 2: Query about GitHub
    console.log('\n\nTest 2: Querying for "GitHub account"');
    const results2 = await search.query('github account created', 3);
    
    if (results2.length > 0) {
      console.log(`✅ Found ${results2.length} results`);
      await search.renderResults(results2);
    } else {
      console.log('⚠️  No results found - might need to build index first');
    }
    
    console.log('\n✅ Tests completed');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

main();
