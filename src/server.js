/**
 * API Server for Memory Search
 * HTTP endpoint for integration with SQLite backend
 */

const http = require('http');
const url = require('url');
const { MemorySearch } = require('./search');

class MemorySearchServer {
  constructor(options = {}) {
    this.port = options.port || 3777;
    this.search = new MemorySearch();
    this.server = null;
    this.initialized = false;
    this.requestQueue = []; // Simple queue for serializing write operations
    this.isProcessingQueue = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    // Pre-load index and model
    await this.search.loadOrBuildIndex();
    console.log('✅ Memory search server initialized');
    this.initialized = true;
  }

  async handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Health check
    if (pathname === '/health' && method === 'GET') {
      const docCount = this.search.storage.getDocumentCount();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok', 
        documents: docCount,
        initialized: this.initialized 
      }));
      return;
    }

    // Search endpoint
    if (pathname === '/search' && method === 'POST') {
      await this._handleSearch(req, res);
      return;
    }

    // Rebuild index endpoint
    if (pathname === '/reindex' && method === 'POST') {
      await this._handleReindex(req, res);
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  async _handleSearch(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const params = JSON.parse(body);
        const query = params.query;
        const limit = params.limit || 5;
        
        if (!query) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing query parameter' }));
          return;
        }

        // Build date filter if provided
        let dateFilter = {};
        if (params.startDate) {
          dateFilter.startDate = new Date(params.startDate);
        }
        if (params.endDate) {
          dateFilter.endDate = new Date(params.endDate);
        }

        const results = await this.search.query(query, limit, dateFilter);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          query,
          resultsCount: results.length,
          results
        }, null, 2));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  }

  async _handleReindex(req, res) {
    // Queue reindex operation to serialize writes
    this.requestQueue.push({
      type: 'reindex',
      req,
      res
    });
    this._processQueue();
  }

  async _processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const job = this.requestQueue.shift();
      
      try {
        if (job.type === 'reindex') {
          console.log('Starting reindex operation...');
          await this.search.buildIndex();
          
          job.res.writeHead(200, { 'Content-Type': 'application/json' });
          job.res.end(JSON.stringify({ 
            success: true, 
            documents: this.search.storage.getDocumentCount() 
          }));
        }
      } catch (error) {
        job.res.writeHead(500, { 'Content-Type': 'application/json' });
        job.res.end(JSON.stringify({ error: error.message }));
      }
    }
    
    this.isProcessingQueue = false;
  }

  async start() {
    await this.initialize();
    
    this.server = http.createServer(this.handleRequest.bind(this));
    
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`🚀 Memory search server listening on http://localhost:${this.port}`);
        console.log(`Endpoints:`);
        console.log(`  POST /search - Query search engine`);
        console.log(`  POST /reindex - Rebuild index (serialized)`);
        console.log(`  GET  /health - Health check`);
        resolve();
      });
    });
  }

  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(resolve);
      });
    }
  }
}

// CLI mode
if (require.main === module) {
  const server = new MemorySearchServer();
  server.start().catch(console.error);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.stop().then(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  });
}

module.exports = { MemorySearchServer };