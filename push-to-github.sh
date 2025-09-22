#!/bin/bash

# Instructions to push to GitHub
echo "======================================"
echo "GITHUB PUSH INSTRUCTIONS"
echo "======================================"
echo ""
echo "1. First, create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Name it: claim-management-system"
echo "   - Make it public or private as needed"
echo "   - DO NOT initialize with README, .gitignore, or license"
echo ""
echo "2. After creating the repository, run these commands:"
echo ""
echo "   # Add your GitHub repository as remote origin"
echo "   git remote add origin https://github.com/YOUR_USERNAME/claim-management-system.git"
echo ""
echo "   # Or if using SSH:"
echo "   # git remote add origin git@github.com:YOUR_USERNAME/claim-management-system.git"
echo ""
echo "   # Push to GitHub"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Your repository will be available at:"
echo "   https://github.com/YOUR_USERNAME/claim-management-system"
echo ""
echo "======================================"
echo ""
echo "Replace YOUR_USERNAME with your actual GitHub username."
echo ""

# Check current git status
echo "Current Git Status:"
git status --short

echo ""
echo "Current Git Log (last 5 commits):"
git log --oneline -5