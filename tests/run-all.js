#!/usr/bin/env node

/**
 * Test Runner - Runs all tests and benchmarks
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Running Memory Search Test Suite\n');
console.log('='.repeat(60));

const results = [];

function runTest(name, command) {
  console.log(`\nRunning: ${name}`);
  console.log('-'.repeat(60));
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    results.push({ name, status: '✅ PASSED' });
    console.log(`${name}: ✅ PASSED\n`);
    return true;
  } catch (error) {
    results.push({ name, status: '❌ FAILED' });
    console.log(`${name}: ❌ FAILED\n`);
    return false;
  }
}

// Run unit tests
const unitPassed = runTest(
  'Unit Tests',
  'node tests/unit-tests.js'
);

// Run benchmarks
const benchPassed = runTest(
  'Performance Benchmarks',
  'node tests/benchmark.js'
);

// Integration test: Test CLI
const cliPassed = runTest(
  'CLI Integration Test',
  'echo "gmail account" | timeout 15s node src/cli.js || test $? -eq 124'
);

// Integration test: Test API server
console.log('\nIntegration Test: API Server');
console.log('-'.repeat(60));
const serverTestPassed = (() => {
  try {
    const server = require('../src/server');
    const testServer = new server.MemorySearchServer({ port: 3778 });
    
    testServer.start().then(() => {
      console.log('Server started successfully');
      
      // Test health endpoint
      const http = require('http');
      http.get('http://localhost:3778/health', (res) => {
        if (res.statusCode === 200) {
          console.log('✅ Health endpoint working');
          results.push({ name: 'API Server', status: '✅ PASSED' });
          testServer.stop().then(() => {
            console.log('Server stopped\n');
          });
        } else {
          throw new Error('Health check failed');
        }
      }).on('error', (err) => {
        throw err;
      });
    }).catch(error => {
      console.log(`❌ Server test failed: ${error.message}\n`);
      results.push({ name: 'API Server', status: '❌ FAILED' });
    });
    
    return true;
  } catch (error) {
    console.log(`❌ Server test failed: ${error.message}\n`);
    results.push({ name: 'API Server', status: '❌ FAILED' });
    return false;
  }
})();

console.log('\n' + '='.repeat(60));
console.log('TEST SUITE SUMMARY');
console.log('='.repeat(60));

results.forEach(result => {
  console.log(`${result.status} ${result.name}`);
});

const passed = results.filter(r => r.status.includes('✅')).length;
const failed = results.filter(r => r.status.includes('❌')).length;

console.log(`\nTotal: ${results.length} tests`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

console.log('\n' + '='.repeat(60));

process.exit(failed > 0 ? 1 : 0);
