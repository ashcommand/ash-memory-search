# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in ash-memory-search, please report it responsibly.

### How to Report

1. **Do NOT open a public issue** - This could expose the vulnerability before a fix is available.

2. **Email the maintainers directly** at: ashcommand620@gmail.com

3. **Include the following information:**
   - Description of the vulnerability
   - Steps to reproduce (if applicable)
   - Potential impact
   - Suggested fix (if you have one)
   - Your contact information for follow-up

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Assessment**: Within 1 week, we'll confirm the vulnerability and provide an estimated timeline for a fix
- **Updates**: Regular updates on our progress
- **Credit**: With your permission, we'll credit you in the security advisory and release notes

### Security Best Practices

When using ash-memory-search:

1. **Keep dependencies updated** - Run `npm audit` regularly
2. **Secure your workspace** - The index contains your memory content; protect the workspace directory
3. **Use environment variables** for configuration instead of hardcoding sensitive paths
4. **Review permissions** - Ensure the SQLite database has appropriate file permissions

## Security Features

- All embeddings are generated locally - no data sent to external APIs
- SQLite database with WAL mode for crash safety
- No network requests during normal operation (when using local embeddings)

## Disclosure Policy

We follow a coordinated disclosure policy:

1. Vulnerability reported privately
2. We confirm and develop a fix
3. Fix is released with a security advisory
4. Details disclosed publicly after 30 days or when fix is widely adopted

Thank you for helping keep ash-memory-search secure!
