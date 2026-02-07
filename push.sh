#!/bin/bash

# Git Push Helper Script
# Run this to push all changes to GitHub

echo "🚀 Preparing to push to GitHub..."
cd /Users/command/.openclaw/workspace/ash-memory-search || exit 1

echo "📍 Location: $(pwd)"
echo "📊 Files to push:"
git status --short | head -20

echo ""
echo "📜 Recent commits:"
git log --oneline -3

echo ""
echo "⬆️  Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ SUCCESS! All changes pushed to GitHub"
    echo ""
    echo "🌐 Next step: Enable GitHub Pages"
    echo "   https://github.com/ashcommand/ash-memory-search/settings/pages"
    echo "   Select: Deploy from branch → main → /docs"
    exit 0
else
    echo "❌ Push failed. Check your GitHub credentials."
    exit 1
fi
