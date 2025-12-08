#!/bin/bash

# Vercel Direct Deployment Template
# This script can be used for any Vercel project to enable direct deployment
# Usage: Copy this to your project and run ./vercel-deploy-template.sh

set -e  # Exit on any error

# Configuration - Update these for your project
PROJECT_NAME=${PROJECT_NAME:-"your-project-name"}
PRODUCTION_URL=${PRODUCTION_URL:-"https://your-project.vercel.app"}
VERCEL_DASHBOARD=${VERCEL_DASHBOARD:-"https://vercel.com/your-team/your-project"}

echo "🚀 Vercel Direct Deployment Template"
echo "===================================="
echo "Project: $PROJECT_NAME"
echo "Production URL: $PRODUCTION_URL"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run 'vercel login' first."
    exit 1
fi

# Check if there are any changes to commit
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to commit"
else
    echo "📝 Committing changes..."
    
    # Add all changes
    git add .
    
    # Get commit message from argument or use default
    COMMIT_MSG=${1:-"Update $PROJECT_NAME"}
    
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
echo "🌐 Production URL: $PRODUCTION_URL"
echo "📊 Vercel Dashboard: $VERCEL_DASHBOARD"
echo ""
echo "💡 Tip: Use './vercel-deploy-template.sh \"Your commit message\"' to customize the commit message" 