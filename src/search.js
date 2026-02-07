/**
 * Memory Search Engine - Core Module
 * Uses transformer embeddings for semantic search with SQLite backend
 */

const { pipeline } = require('@xenova/transformers');
const { SqliteStorage } = require('./storage');
const path = require('path');

// Global model cache to persist across instances
const MODEL_CACHE = {
  embedder: null,
  modelName: null,
  initialized: false
};

class MemorySearch {
  constructor(options = {}) {
    this.workspacePath = options.workspacePath || path.join(process.env.HOME, '.openclaw', 'workspace');
    
    // SQLite storage instead of JSON file
    const dbPath = path.join(this.workspacePath, 'ash-memory-search', 'index.db');
    this.storage = new SqliteStorage(dbPath);
    
    this.embeddingModel = options.embeddingModel || 'sentence-transformers/all-MiniLM-L6-v2';
    this.embedder = null;
    this.initialized = false;
  }

  async init() {
    // Initialize SQLite storage first
    await this.storage.init();
    
    // Use global model cache to persist across queries
    if (MODEL_CACHE.initialized) {
      this.embedder = MODEL_CACHE.embedder;
      this.embeddingModel = MODEL_CACHE.modelName;
      this.initialized = true;
      return;
    }
    
    // Use the most reliable model directly
    this.embeddingModel = 'Xenova/all-MiniLM-L6-v2';
    
    if (!MODEL_CACHE.embedder) {
      console.log('Loading embedding model...');
      MODEL_CACHE.embedder = await pipeline('feature-extraction', this.embeddingModel);
      MODEL_CACHE.modelName = this.embeddingModel;
      MODEL_CACHE.initialized = true;
      console.log('✅ Model loaded');
    }
    
    this.embedder = MODEL_CACHE.embedder;
    this.initialized = true;
  }

  async loadOrBuildIndex() {
    await this.storage.init();
    
    const docCount = this.storage.getDocumentCount();
    
    if (docCount > 0) {
      console.log(`✅ Loaded index with ${docCount} documents`);
      return true;
    } else {
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
      const fs = require('fs').promises;
      await fs.access(memoryMain);
      filesToIndex.push(memoryMain);
    } catch (e) {
      console.log('MEMORY.md not found, will only index memory/*.md');
    }
    
    // Add memory directory files
    try {
      const fs = require('fs').promises;
      const memoryFiles = await fs.readdir(memoryDir);
      const mdFiles = memoryFiles.filter(f => f.endsWith('.md'));
      filesToIndex.push(...mdFiles.map(f => path.join(memoryDir, f)));
    } catch (e) {
      console.log('memory/ directory not found');
    }
    
    console.log(`Found ${filesToIndex.length} files to index`);
    
    // Clear existing index
    await this.storage.clearAll();
    
    // Process files in batches for better performance
    const batchSize = 10;
    for (let i = 0; i < filesToIndex.length; i += batchSize) {
      const batch = filesToIndex.slice(i, i + batchSize);
      await Promise.all(batch.map(filePath => this._indexFile(filePath)));
    }
    
    await this.storage.vacuum();
    console.log(`✅ Built index with ${this.storage.getDocumentCount()} documents`);
  }

  async _indexFile(filePath) {
    try {
      const fs = require('fs').promises;
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
      
      await this.storage.insertDocument({
        path: relativePath,
        title: title.replace(/^#+\s*/, '').trim().substring(0, 100),
        snippet: cleanSnippet || content.substring(0, 300).replace(/\n/g, ' '),
        size: content.length,
        modified: new Date().toISOString(),
        embedding: Array.from(embedding.data || embedding)
      });
    } catch (error) {
      console.error(`  Error indexing ${filePath}:`, error.message);
    }
  }

  parseDateFromPath(filePath) {
    // Extract date from YYYY-MM-DD.md format
    const match = filePath.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
      const day = parseInt(match[3], 10);
      return new Date(year, month, day);
    }
    return null;
  }

  filterByDate(candidates, startDate, endDate) {
    if (!startDate && !endDate) return candidates;
    
    return candidates.filter(candidate => {
      const fileDate = this.parseDateFromPath(candidate.path);
      if (!fileDate) return true; // Keep items without parseable dates
      
      if (startDate && fileDate < startDate) return false;
      if (endDate && fileDate > endDate) return false;
      
      return true;
    });
  }

  async query(queryText, limit = 5, dateFilter = {}) {
    await this.init();
    await this.loadOrBuildIndex();
    
    const { startDate, endDate } = dateFilter;
    
    console.log(`\nSearching for: "${queryText}"`);
    if (startDate || endDate) {
      const dateRange = [];
      if (startDate) dateRange.push(`from ${startDate.toLocaleDateString()}`);
      if (endDate) dateRange.push(`to ${endDate.toLocaleDateString()}`);
      console.log(`Date filter: ${dateRange.join(' ')}`);
    }
    
    const docCount = this.storage.getDocumentCount();
    console.log(`Scanning ${docCount} documents...`);
    
    // Get all documents from SQLite
    const documents = await this.storage.getAllDocuments();
    
    // Generate query embedding
    const queryEmbedding = await this.embedder(queryText, { pooling: 'mean' });
    const queryVector = Array.from(queryEmbedding.data || queryEmbedding);
    
    // Calculate similarity for all documents
    const allCandidates = [];
    for (const doc of documents) {
      const similarity = this.cosineSimilarity(queryVector, doc.embedding);
      allCandidates.push({
        path: doc.path,
        similarity,
        metadata: doc.metadata
      });
    }
    
    // Sort by similarity (descending)
    allCandidates.sort((a, b) => b.similarity - a.similarity);
    
    // Apply date filtering
    const dateFilteredCandidates = this.filterByDate(allCandidates, startDate, endDate);
    
    // Get high-confidence results (> 15% similarity)
    const highConfidence = dateFilteredCandidates.filter(r => r.similarity > 0.15);
    
    if (highConfidence.length > 0) {
      return highConfidence.slice(0, limit);
    }
    
    // Fallback: return top weak matches (> 5% similarity) with flag
    const weakMatches = dateFilteredCandidates.filter(r => r.similarity > 0.05);
    if (weakMatches.length > 0) {
      console.log(`⚠️  Low confidence matches - consider refining your query`);
      return weakMatches.slice(0, Math.min(2, limit)).map(r => ({
        ...r,
        _isWeakMatch: true
      }));
    }
    
    // No matches at all
    return [];
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

  async renderResults(results) {
    const { default: chalk } = await import('chalk');
    
    const hasWeakMatches = results.some(r => r._isWeakMatch);
    const title = hasWeakMatches ? 
      `Found ${results.length} weak matches (low confidence)` : 
      `Found ${results.length} relevant documents`;
    
    console.log(chalk.bold(`\n${'='.repeat(60)}`));
    console.log(chalk.bold(title));
    console.log(chalk.bold('='.repeat(60)));
    
    for (const [i, result] of results.entries()) {
      const prefix = result._isWeakMatch ? chalk.yellow('⚠') : chalk.cyan(`[${i + 1}]`);
      console.log(`${prefix} ${result.metadata.title}`);
      
      if (result._isWeakMatch) {
        console.log(chalk.yellow('  Low confidence match - try refining your query'));
      }
      
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

  async close() {
    await this.storage.close();
  }
}

module.exports = { MemorySearch };
