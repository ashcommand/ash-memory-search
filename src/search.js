/**
 * Memory Search Engine - Core Module
 * Uses transformer embeddings for semantic search
 */

const { pipeline } = require('@xenova/transformers');
const fs = require('fs').promises;
const path = require('path');

class MemorySearch {
  constructor(options = {}) {
    this.workspacePath = options.workspacePath || path.join(process.env.HOME, '.openclaw', 'workspace');
    this.indexPath = options.indexPath || path.join(this.workspacePath, 'ash-memory-search', 'index.json');
    this.embeddingModel = options.embeddingModel || 'sentence-transformers/all-MiniLM-L6-v2';
    this.embedder = null;
    this.embeddings = new Map(); // memory path -> {embedding, metadata}
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    // Use the most reliable model directly
    this.embeddingModel = 'Xenova/all-MiniLM-L6-v2';
    console.log('Loading embedding model...');
    this.embedder = await pipeline('feature-extraction', this.embeddingModel);
    this.initialized = true;
    console.log('✅ Model loaded');
  }

  async loadOrBuildIndex() {
    try {
      const indexData = await fs.readFile(this.indexPath, 'utf8');
      const data = JSON.parse(indexData);
      this.embeddings = new Map(Object.entries(data.embeddings));
      console.log(`✅ Loaded index with ${this.embeddings.size} documents`);
      return true;
    } catch (e) {
      console.log('Index not found, building...');
      await this.buildIndex();
      return false;
    }
  }

  async buildIndex() {
    await this.init();
    
    const memoryDir = path.join(this.workspacePath, 'memory');
    const memoryMain = path.join(this.workspacePath, 'MEMORY.md');
    
    const filesToIndex = [];
    
    // Add main MEMORY.md if exists
    try {
      await fs.access(memoryMain);
      filesToIndex.push(memoryMain);
    } catch (e) {
      console.log('MEMORY.md not found, will only index memory/*.md');
    }
    
    // Add memory directory files
    try {
      const memoryFiles = await fs.readdir(memoryDir);
      const mdFiles = memoryFiles.filter(f => f.endsWith('.md'));
      filesToIndex.push(...mdFiles.map(f => path.join(memoryDir, f)));
    } catch (e) {
      console.log('memory/ directory not found');
    }
    
    console.log(`Found ${filesToIndex.length} files to index`);
    
    for (const filePath of filesToIndex) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const relativePath = path.relative(this.workspacePath, filePath);
        
        // Extract title/first line for metadata
        const lines = content.split('\n');
        const title = lines.find(l => l.trim()) || relativePath;
        
        console.log(`  Indexing: ${relativePath} (${Math.round(content.length/1024)}KB)`);
        
        // Generate embedding (512 dimensions for MiniLM-L6-v2)
        const embedding = await this.embedder(content, { pooling: 'mean' });
        
        // Extract a content snippet (first 500 chars, clean)
        const snippetLines = content.split('\n').slice(1, 6); // Skip title, get next few lines
        const cleanSnippet = snippetLines
          .map(line => line.replace(/^#+\s*/, '').trim())
          .filter(line => line.length > 10)
          .join(' ')
          .substring(0, 400);
        
        this.embeddings.set(relativePath, {
          embedding: Array.from(embedding.data || embedding),
          metadata: {
            title: title.replace(/^#+\s*/, '').trim().substring(0, 100),
            size: content.length,
            modified: new Date().toISOString(),
            path: relativePath,
            snippet: cleanSnippet || content.substring(0, 300).replace(/\n/g, ' ')
          }
        });
      } catch (error) {
        console.error(`  Error indexing ${filePath}:`, error.message);
      }
    }
    
    await this.saveIndex();
    console.log(`✅ Built index with ${this.embeddings.size} documents`);
  }

  async saveIndex() {
    const indexData = {
      version: '1.0',
      model: this.embeddingModel,
      builtAt: new Date().toISOString(),
      embeddings: Object.fromEntries(this.embeddings)
    };
    
    await fs.mkdir(path.dirname(this.indexPath), { recursive: true });
    await fs.writeFile(this.indexPath, JSON.stringify(indexData, null, 2));
    console.log(`Index saved to ${this.indexPath}`);
  }

  cosineSimilarity(a, b) {
    if (a.length !== b.length) {
      throw new Error(`Vector dimensions mismatch: ${a.length} vs ${b.length}`);
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async query(queryText, limit = 5) {
    await this.init();
    await this.loadOrBuildIndex();
    
    console.log(`\nSearching for: "${queryText}"`);
    console.log(`Scanning ${this.embeddings.size} documents...`);
    
    // Generate query embedding
    const queryEmbedding = await this.embedder(queryText, { pooling: 'mean' });
    const queryVector = Array.from(queryEmbedding.data || queryEmbedding);
    
    // Calculate similarity for all documents
    const results = [];
    for (const [path, data] of this.embeddings) {
      const similarity = this.cosineSimilarity(queryVector, data.embedding);
      if (similarity > 0.3) { // Threshold filter
        results.push({
          path,
          similarity,
          metadata: data.metadata
        });
      }
    }
    
    // Sort by similarity (descending)
    results.sort((a, b) => b.similarity - a.similarity);
    
    return results.slice(0, limit);
  }

  async renderResults(results) {
    const { default: chalk } = await import('chalk');
    
    console.log(chalk.bold(`\n${'='.repeat(60)}`));
    console.log(chalk.bold(`Found ${results.length} relevant documents`));
    console.log(chalk.bold('='.repeat(60)));
    
    for (const [i, result] of results.entries()) {
      console.log(chalk.cyan(`\n[${i + 1}] ${result.metadata.title}`));
      console.log(chalk.gray(`Path: ${result.path}`));
      console.log(chalk.gray(`Similarity: ${(result.similarity * 100).toFixed(1)}%`));
      console.log(chalk.gray(`Size: ${Math.round(result.metadata.size / 1024)}KB`));
      console.log(chalk.gray(`Last modified: ${new Date(result.metadata.modified).toLocaleDateString()}`));
      
      // Show stored snippet
      if (result.metadata.snippet) {
        console.log(chalk.white(`Snippet: ${result.metadata.snippet.substring(0, 200)}...`));
      }
      
      console.log('='.repeat(60));
    }
  }
}

module.exports = { MemorySearch };
