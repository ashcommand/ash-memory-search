#!/usr/bin/env node

/**
 * CLI for Memory Search
 * Interactive search interface
 */

const { MemorySearch } = require('./search');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

async function main() {
  const search = new MemorySearch();
  
  console.log('\n🔍 Memory Search Engine');
  console.log('Type your query and press Enter');
  console.log('Type "exit" or press Ctrl+C to quit\n');
  
  const rl = readline.createInterface({ input, output });
  
  const askQuestion = () => {
    return new Promise((resolve) => {
      rl.question('Query: ', resolve);
    });
  };
  
  try {
    // Build/load index on startup
    await search.loadOrBuildIndex();
    
    while (true) {
      const query = await askQuestion();
      
      if (!query || query.toLowerCase() === 'exit') {
        console.log('Goodbye!');
        rl.close();
        break;
      }
      
      if (query.trim().length < 3) {
        console.log('Query too short. Try something more specific.\n');
        continue;
      }
      
      try {
        const results = await search.query(query, 5);
        await search.renderResults(results);
      } catch (error) {
        console.error('Search error:', error.message);
      }
      
      console.log('\n' + '='.repeat(60) + '\n');
    }
  } catch (error) {
    console.error('Fatal error:', error);
    rl.close();
    process.exit(1);
  }
}

main().catch(console.error);
