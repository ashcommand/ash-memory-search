/**
 * SQLite Storage Backend for Memory Search
 * Provides ACID transactions, concurrent access, and better performance
 */

const Database = require('better-sqlite3');
const fs = require('fs').promises;
const path = require('path');

class SqliteStorage {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
    
    // Open database in WAL mode for concurrent readers/writers
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    
    this._createTables();
    this.initialized = true;
  }

  _createTables() {
    // Main documents table - stores embeddings and metadata
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        path TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        snippet TEXT,
        content_size INTEGER,
        modified TEXT NOT NULL,
        embedding BLOB NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Change log for incremental updates
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS changes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation TEXT NOT NULL, -- 'add', 'update', 'delete'
        path TEXT NOT NULL,
        title TEXT,
        snippet TEXT,
        content_size INTEGER,
        modified TEXT,
        embedding BLOB,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Index for faster queries
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_documents_modified ON documents(modified)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_changes_timestamp ON changes(timestamp)`);
  }

  /**
   * Insert or update a document
   */
  async upsertDocument(doc) {
    const stmt = this.db.prepare(`
      INSERT INTO documents (path, title, snippet, content_size, modified, embedding)
      VALUES (@path, @title, @snippet, @content_size, @modified, @embedding)
      ON CONFLICT(path) DO UPDATE SET
        title = excluded.title,
        snippet = excluded.snippet,
        content_size = excluded.content_size,
        modified = excluded.modified,
        embedding = excluded.embedding,
        created_at = CURRENT_TIMESTAMP
    `);
    
    stmt.run({
      path: doc.path,
      title: doc.title,
      snippet: doc.snippet,
      content_size: doc.size,
      modified: doc.modified,
      embedding: Buffer.from(new Float32Array(doc.embedding).buffer)
    });
    
    // Log the change
    await this._logChange('update', doc);
  }

  /**
   * Insert a new document
   */
  async insertDocument(doc) {
    const stmt = this.db.prepare(`
      INSERT INTO documents (path, title, snippet, content_size, modified, embedding)
      VALUES (@path, @title, @snippet, @content_size, @modified, @embedding)
    `);
    
    stmt.run({
      path: doc.path,
      title: doc.title,
      snippet: doc.snippet,
      content_size: doc.size,
      modified: doc.modified,
      embedding: Buffer.from(new Float32Array(doc.embedding).buffer)
    });
    
    await this._logChange('add', doc);
  }

  /**
   * Delete a document by path
   */
  async deleteDocument(filePath) {
    const stmt = this.db.prepare('DELETE FROM documents WHERE path = ?');n    stmt.run(filePath);
    
    await this._logChange('delete', { path: filePath });
  }

  /**
   * Get all documents
   */
  async getAllDocuments() {
    const stmt = this.db.prepare('SELECT * FROM documents ORDER BY modified DESC');
    const rows = stmt.all();
    
    return rows.map(row => ({
      path: row.path,
      metadata: {
        title: row.title,
        snippet: row.snippet,
        size: row.content_size,
        modified: row.modified
      },
      embedding: Array.from(new Float32Array(row.embedding.buffer))
    }));
  }

  /**
   * Get document count
   */
  getDocumentCount() {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM documents');
    return stmt.get().count;
  }

  /**
   * Delete all documents (for reindexing)
   */
  async clearAll() {
    this.db.exec('DELETE FROM documents');
    this.db.exec('DELETE FROM changes');
  }

  /**
   * Get all changes (for replication/debugging)
   */
  async getChanges(since = null) {
    let sql = 'SELECT * FROM changes';
    let params = [];
    
    if (since) {
      sql += ' WHERE timestamp > ?';
      params.push(since);
    }
    
    sql += ' ORDER BY timestamp ASC';
    
    const stmt = this.db.prepare(sql);
    return stmt.all(params);
  }

  /**
   * Log a change operation
   */
  async _logChange(operation, doc) {
    const stmt = this.db.prepare(`
      INSERT INTO changes (operation, path, title, snippet, content_size, modified, embedding)
      VALUES (@operation, @path, @title, @snippet, @content_size, @modified, @embedding)
    `);
    
    stmt.run({
      operation,
      path: doc.path,
      title: doc.title || null,
      snippet: doc.snippet || null,
      content_size: doc.size || null,
      modified: doc.modified || null,
      embedding: doc.embedding ? Buffer.from(new Float32Array(doc.embedding).buffer) : null
    });
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.db) {
      this.db.close();
      this.initialized = false;
    }
  }

  /**
   * Run vacuum to reclaim space
   */
  async vacuum() {
    this.db.exec('VACUUM');
  }
}

module.exports = { SqliteStorage };