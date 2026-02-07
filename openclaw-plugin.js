/**
 * OpenClaw Skill - Ash Memory Search
 * Registers memory-search commands in OpenClaw
 */

const { MemorySearch } = require('ash-memory-search');

class AshMemorySearchSkill {
  constructor(config) {
    this.config = {
      workspacePath: config.workspacePath || process.env.HOME + '/.openclaw/workspace',
      threshold: config.threshold || 0.15,
      model: config.model || 'Xenova/all-MiniLM-L6-v2',
      ...config
    };
    
    this.search = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    this.search = new MemorySearch({
      workspacePath: this.config.workspacePath,
      embeddingModel: this.config.model
    });
    
    await this.search.init();
    
    // Build index on first load
    await this.search.loadOrBuildIndex();
    
    this.initialized = true;
  }

  /**
   * Search command
   * Usage: /memory-search <query> [options]
   */
  async search(args, context) {
    await this.init();
    
    const query = args.join(' ');
    if (!query) {
      throw new Error('Please provide a search query. Example: /memory-search "gmail account"');
    }
    
    try {
      const results = await this.search.query(query, 5);
      
      if (results.length === 0) {
        return "No relevant memories found. Try broadening your query or building the index.";
      }
      
      // Format results for OpenClaw
      return this._formatResults(results, query);
    } catch (error) {
      return `❌ Search error: ${error.message}`;
    }
  }

  /**
   * Build index command
   * Usage: /memory-search:index
   */
  async index(args, context) {
    await this.init();
    
    try {
      await this.search.buildIndex();
      const count = this.search.storage.getDocumentCount();
      return `✅ Index built successfully with ${count} documents.`;
    } catch (error) {
      return `❌ Index build failed: ${error.message}`;
    }
  }

  /**
   * Interactive search command
   * Usage: /memory-search:interactive
   */
  async interactive(args, context) {
    // In OpenClaw context, we can't do interactive stdin
    // So we'll return usage instructions
    return `
🤖 Interactive search is available via CLI:

Terminal:
  cd ~/.openclaw/skills/ash-memory-search
  npm run search

Commands:
  /memory-search <query>     - Search your memories
  /memory-search:index      - Rebuild the index
    `;
  }

  /**
   * Format search results for OpenClaw output
   */
  _formatResults(results, query) {
    const lines = [];
    lines.push(`🔍 Search results for: "${query}"`);
    lines.push('');
    
    const hasWeakMatches = results.some(r => r._isWeakMatch);
    if (hasWeakMatches) {
      lines.push('⚠️  Some results are low confidence - try refining your query');
      lines.push('');
    }
    
    results.forEach((result, i) => {
      const confidence = result._isWeakMatch ? '⚠️' : `[${i + 1}]`;
      lines.push(`${confidence} **${result.metadata.title}**`);
      lines.push(`Path: ${result.path}`);
      lines.push(`Similarity: ${(result.similarity * 100).toFixed(1)}%`);
      if (result.metadata.snippet) {
        lines.push(`Snippet: ${result.metadata.snippet.substring(0, 150)}...`);
      }
      lines.push('---');
    });
    
    return lines.join('\n');
  }
}

module.exports = {
  name: 'ash-memory-search',
  description: 'AI-powered semantic search for OpenClaw memory files',
  skill: AshMemorySearchSkill,
  commands: {
    'memory-search': {
      handler: 'search',
      description: 'Search memory files using AI',
      usage: '/memory-search <query>'
    },
    'memory-search:index': {
      handler: 'index',
      description: 'Rebuild the search index',
      usage: '/memory-search:index'
    },
    'memory-search:interactive': {
      handler: 'interactive',
      description: 'Interactive search mode (via CLI)',
      usage: '/memory-search:interactive'
    }
  }
};
