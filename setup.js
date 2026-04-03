#!/usr/bin/env node

/**
 * Ash Memory Search - Setup Script
 * 
 * Handles:
 * - Detecting OpenClaw workspace
 * - Creating symlinks to skills directory
 * - Building initial index
 * - Showing setup confirmation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function detectWorkspace() {
  const candidates = [
    process.env.MEMORY_SEARCH_WORKSPACE,
    path.join(process.env.HOME, '.openclaw', 'workspace'),
    path.join(process.env.HOME, '.config', 'openclaw', 'workspace'),
    '/workspace',
    process.cwd()
  ];
  
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      // Check if it looks like an OpenClaw workspace
      const hasMemoryDir = fs.existsSync(path.join(candidate, 'memory'));
      const hasMemoryFile = fs.existsSync(path.join(candidate, 'MEMORY.md'));
      
      if (hasMemoryDir || hasMemoryFile) {
        return candidate;
      }
    }
  }
  
  // Default to standard location even if it doesn't exist yet
  return path.join(process.env.HOME, '.openclaw', 'workspace');
}

function detectSkillsDir() {
  const candidates = [
    process.env.OPENCLAW_SKILLS_DIR,
    path.join(process.env.HOME, '.openclaw', 'skills'),
    path.join(process.env.HOME, '.config', 'openclaw', 'skills'),
    path.join(process.env.HOME, '.local', 'share', 'openclaw', 'skills')
  ];
  
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  
  return null;
}

async function setup() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     🔍 Ash Memory Search - Setup                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Step 1: Detect workspace
  console.log('📁 Step 1: Workspace Detection');
  console.log('─────────────────────────────────');
  
  const detectedWorkspace = detectWorkspace();
  console.log(`Detected workspace: ${detectedWorkspace}`);
  
  if (!fs.existsSync(detectedWorkspace)) {
    console.log('\n⚠️  Workspace directory does not exist.');
    const create = await ask('Create it? [Y/n] ');
    
    if (create.toLowerCase() !== 'n') {
      fs.mkdirSync(detectedWorkspace, { recursive: true });
      fs.mkdirSync(path.join(detectedWorkspace, 'memory'), { recursive: true });
      console.log('✅ Created workspace directory with memory folder');
    }
  }
  
  const workspaceInput = await ask(`\nWorkspace path [${detectedWorkspace}]: `);
  const workspacePath = workspaceInput.trim() || detectedWorkspace;
  
  if (!fs.existsSync(workspacePath)) {
    console.error(`❌ Path does not exist: ${workspacePath}`);
    process.exit(1);
  }
  
  console.log(`\n✅ Using workspace: ${workspacePath}`);

  // Step 2: Check for skills directory
  console.log('\n📦 Step 2: OpenClaw Skills Directory');
  console.log('─────────────────────────────────');
  
  const skillsDir = detectSkillsDir();
  
  if (skillsDir) {
    console.log(`Detected skills directory: ${skillsDir}`);
    
    const currentDir = process.cwd();
    const expectedSkillPath = path.join(skillsDir, 'ash-memory-search');
    
    if (currentDir !== expectedSkillPath && !fs.existsSync(expectedSkillPath)) {
      const createSymlink = await ask('\nCreate symlink in skills directory? [Y/n] ');
      
      if (createSymlink.toLowerCase() !== 'n') {
        try {
          fs.symlinkSync(currentDir, expectedSkillPath, 'dir');
          console.log(`✅ Created symlink: ${expectedSkillPath} -> ${currentDir}`);
        } catch (error) {
          console.log(`⚠️  Could not create symlink: ${error.message}`);
          console.log('   You can manually create it later if needed.');
        }
      }
    } else if (fs.existsSync(expectedSkillPath)) {
      console.log('✅ Skill already linked in OpenClaw skills directory');
    }
  } else {
    console.log('⚠️  Could not detect OpenClaw skills directory.');
    console.log('   If you want to use this as an OpenClaw skill,');
    console.log('   manually copy or symlink this folder to ~/.openclaw/skills/');
  }

  // Step 3: Build initial index
  console.log('\n🔧 Step 3: Building Initial Index');
  console.log('─────────────────────────────────');
  
  const { MemorySearch } = require('./src/search');
  
  try {
    const search = new MemorySearch({ workspacePath });
    await search.buildIndex();
    const docCount = search.storage.getDocumentCount();
    await search.close();
    
    console.log(`✅ Index built with ${docCount} documents`);
  } catch (error) {
    console.error(`❌ Error building index: ${error.message}`);
    rl.close();
    process.exit(1);
  }

  // Step 4: Summary
  console.log('\n✨ Setup Complete!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\nYou can now use Ash Memory Search:');
  console.log('');
  console.log('  Command Line:');
  console.log('    ash-memory-search "your query here"');
  console.log('    ash-memory-search index');
  console.log('    ash-memory-search server');
  console.log('');
  console.log('  Programmatic:');
  console.log('    const { MemorySearch } = require("ash-memory-search");');
  console.log('    const search = new MemorySearch();');
  console.log('    const results = await search.query("your query");');
  console.log('');
  console.log('  Environment Variables:');
  console.log(`    export MEMORY_SEARCH_WORKSPACE=${workspacePath}`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════\n');
  
  rl.close();
}

setup().catch(error => {
  console.error('\n❌ Setup failed:', error);
  rl.close();
  process.exit(1);
});
