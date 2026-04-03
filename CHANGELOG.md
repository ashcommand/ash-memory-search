# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-04-03

### Added
- Initial stable release of ash-memory-search
- AI-powered semantic search using transformer embeddings
- SQLite backend with WAL mode for concurrent access
- CLI tool with interactive and non-interactive modes
- HTTP API server for programmatic access
- Setup wizard for easy configuration
- Support for date filtering in searches
- Local embeddings (no external API calls required)
- Cross-platform support (macOS, Linux, Windows)
- Comprehensive test suite and benchmarks
- Full documentation including README, CONTRIBUTING, and SKILL.md

### Features
- Semantic search across Markdown memory files
- Fallback search for broader queries
- Real-time indexing with progress indicators
- Token usage tracking and optimization
- Concurrent read access with serialized writes
- Multiple entry points (CLI, API, programmatic)

## [0.2.0] - 2026-02-07

### Added
- SQLite storage backend replacing JSON
- Improved performance with WAL mode
- Better error handling and recovery

## [0.1.0] - 2026-02-06

### Added
- Initial prototype with JSON storage
- Basic semantic search functionality
- CLI interface
- OpenClaw plugin support

[Unreleased]: https://github.com/ashcommand/ash-memory-search/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ashcommand/ash-memory-search/releases/tag/v1.0.0
[0.2.0]: https://github.com/ashcommand/ash-memory-search/releases/tag/v0.2.0
[0.1.0]: https://github.com/ashcommand/ash-memory-search/releases/tag/v0.1.0
