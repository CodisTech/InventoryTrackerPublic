#!/bin/bash
# Script to set up proper execute permissions for repository scripts
# Usage: ./setup-repository-permissions.sh

echo "Setting up proper file permissions for repository scripts..."

# Make scripts executable
chmod +x sync-repositories.sh
chmod +x setup-git-repositories.sh
chmod +x setup-git-and-deploy.sh
chmod +x setup-repository-permissions.sh
[ -f deploy-to-github.sh ] && chmod +x deploy-to-github.sh
[ -f deploy-gh-pages.sh ] && chmod +x deploy-gh-pages.sh
[ -f deploy.sh ] && chmod +x deploy.sh

echo "Permission setup complete!"
echo "You can now run the following scripts:"
echo "  ./setup-git-repositories.sh                   - Set up Git repositories locally"
echo "  ./setup-git-and-deploy.sh <user> <repo> [token] - Create and push to GitHub"
echo "  ./sync-repositories.sh \"commit message\"        - Commit and push all repositories"