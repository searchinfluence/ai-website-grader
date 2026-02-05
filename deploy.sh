#!/bin/bash

# AI Website Grader Deployment Script
# This script commits changes and triggers a direct Vercel deployment

set -e  # Exit on any error

echo "🚀 AI Website Grader - Direct Deployment Script"
echo "================================================"

# Check if there are any changes to commit
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to commit"
else
    echo "📝 Committing changes..."
    
    # Add all changes
    git add .
    
    # Get commit message from argument or use default
    COMMIT_MSG=${1:-"Update AI Website Grader"}
    
    # Commit changes
    git commit -m "$COMMIT_MSG"
    
    echo "✅ Changes committed"
fi

# Push to GitHub (this will trigger automatic deployment)
echo "📤 Pushing to GitHub..."
git push origin main

# Trigger direct Vercel deployment for immediate feedback
echo "🚀 Triggering direct Vercel deployment..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "🌐 Production URL: https://ai-website-grader.vercel.app"
echo "📊 Vercel Dashboard: https://vercel.com/will-scotts-projects/ai-website-grader"
echo ""
echo "💡 Tip: Use './deploy.sh "Your commit message"' to customize the commit message" 