#!/usr/bin/env node

/**
 * API Server for Memory Search
 * HTTP endpoint for integration
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
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', documents: this.search.embeddings.size }));
      return;
    }

    // Search endpoint
    if (pathname === '/search' && method === 'POST') {
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
      return;
    }

    // Rebuild index endpoint
    if (pathname === '/reindex' && method === 'POST') {
      try {
        await this.search.buildIndex();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, documents: this.search.embeddings.size }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  async start() {
    await this.initialize();
    
    this.server = http.createServer(this.handleRequest.bind(this));
    
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`🚀 Memory search server listening on http://localhost:${this.port}`);
        console.log(`Endpoints:`);
        console.log(`  POST /search - Query search engine`);
        console.log(`  POST /reindex - Rebuild index`);
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
