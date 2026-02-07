// Git Push Script - Node.js Version
// Execute git commands directly

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Pushing to GitHub via Node.js...\n');

try {
  process.chdir('/Users/command/.openclaw/workspace/ash-memory-search');
  console.log('📍 Directory:', process.cwd());
  
  console.log('\n🔍 Checking git status...');
  const status = execSync('git status --short', { encoding: 'utf8' });
  console.log(status);
  
  console.log('\n📜 Recent commits:');
  const log = execSync('git log --oneline -3', { encoding: 'utf8' });
  console.log(log);
  
  console.log('\n⬆️  Pushing to GitHub...');
  const push = execSync('git push origin main', { encoding: 'utf8' });
  console.log(push);
  
  console.log('\n✅ SUCCESS! All changes pushed to GitHub!');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}