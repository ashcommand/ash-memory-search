#!/bin/bash

# GitHub Repository Setup Script
# This script makes the repository public and enables GitHub Pages

echo "🔐 GitHub Setup Script"
echo "======================"
echo ""

# Configuration
TOKEN="${GITHUB_TOKEN:-your_token_here}"  # Set GITHUB_TOKEN env var or replace
REPO="ashcommand/ash-memory-search"

echo "📍 Repository: $REPO"
echo "🔑 Token: ${TOKEN:0:8}..."
echo ""

# Step 1: Make repository public
echo "📡 Step 1: Making repository public..."
curl -X PATCH \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$REPO \
  -d '{"private": false}'

echo ""
echo "✅ Repository is now public!"
echo ""

# Step 2: Enable GitHub Pages
echo "🌐 Step 2: Enabling GitHub Pages..."
curl -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$REPO/pages \
  -d '{
    "source": {
      "branch": "main",
      "path": "/docs"
    }
  }'

echo ""
echo "✅ GitHub Pages enabled!"
echo ""

# Step 3: Verify setup
echo "🔍 Step 3: Verifying setup..."
curl -s \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$REPO | grep -E '(private|full_name)'

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📍 Your site will be live at:"
echo "   https://ashcommand.github.io/ash-memory-search/"
echo ""
echo "⏰ Note: It may take 1-2 minutes to deploy the first time"
echo "⚠️  You need to set GITHUB_TOKEN environment variable with your GitHub Personal Access Token"
echo "   Or replace 'your_token_here' in this script with your token"