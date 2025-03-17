#!/bin/bash

# Setup Git Repositories Script
# This script sets up the three Git repositories (private, public, sandbox)
# for the Inventory Management System

set -e

# Configuration
PRIVATE_REPO_NAME="inventory-management-system"
PUBLIC_REPO_NAME="inventory-management-system-public"
SANDBOX_REPO_NAME="inventory-management-system-sandbox"

PRIVATE_REMOTE="origin"
PUBLIC_REMOTE="public-origin"
SANDBOX_REMOTE="sandbox-origin"

GITHUB_USERNAME=""
GITHUB_TOKEN=""

# Prompt for GitHub credentials if not set
if [ -z "$GITHUB_USERNAME" ]; then
  read -p "Enter GitHub username: " GITHUB_USERNAME
fi

if [ -z "$GITHUB_TOKEN" ]; then
  read -s -p "Enter GitHub personal access token: " GITHUB_TOKEN
  echo
fi

# Check if we're in the root directory of the project
if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
  echo "Error: This script must be run from the root directory of the project"
  exit 1
fi

# Check if git is already initialized
if [ ! -d ".git" ]; then
  echo "Initializing Git repository..."
  git init
else
  echo "Git repository already initialized"
fi

# Ensure .repository-type file exists for private repo
echo "repository: private" > .repository-type

# Set up .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
  echo "Creating .gitignore file..."
  cat > .gitignore << EOF
node_modules/
dist/
.env
*.log
.DS_Store
coverage/
.vscode/
*.local
EOF
fi

# Configure Git user
git config user.name "$GITHUB_USERNAME"
git config user.email "$GITHUB_USERNAME@users.noreply.github.com"

# Create initial commit if needed
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  echo "Creating initial commit..."
  git add .
  git commit -m "Initial commit"
fi

# Create different branches for each repository
echo "Setting up branches for repositories..."

# Ensure we're on main branch for private repository
git checkout -B main

# Create public branch
echo "Creating public branch..."
git checkout -b public
echo "repository: public" > .repository-type
git add .repository-type
git commit -m "Set repository type to public"

# Create sandbox branch
echo "Creating sandbox branch..."
git checkout -b sandbox
echo "repository: sandbox" > .repository-type
git add .repository-type
git commit -m "Set repository type to sandbox"

# Return to main branch
git checkout main

# Optionally set up remote repositories
setup_remotes() {
  echo "Setting up remote repositories..."
  
  # Create GitHub repositories using API
  echo "Creating GitHub repositories (if they don't exist)..."
  
  # Create private repository
  curl -s -X POST -u "$GITHUB_USERNAME:$GITHUB_TOKEN" https://api.github.com/user/repos \
    -d "{\"name\":\"$PRIVATE_REPO_NAME\",\"private\":true}" > /dev/null || true
  
  # Create public repository
  curl -s -X POST -u "$GITHUB_USERNAME:$GITHUB_TOKEN" https://api.github.com/user/repos \
    -d "{\"name\":\"$PUBLIC_REPO_NAME\",\"private\":false}" > /dev/null || true
  
  # Create sandbox repository
  curl -s -X POST -u "$GITHUB_USERNAME:$GITHUB_TOKEN" https://api.github.com/user/repos \
    -d "{\"name\":\"$SANDBOX_REPO_NAME\",\"private\":true}" > /dev/null || true
  
  # Add remote for private repository
  git remote remove $PRIVATE_REMOTE 2>/dev/null || true
  git remote add $PRIVATE_REMOTE "https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$PRIVATE_REPO_NAME.git"
  
  # Add remote for public repository
  git remote remove $PUBLIC_REMOTE 2>/dev/null || true
  git remote add $PUBLIC_REMOTE "https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$PUBLIC_REPO_NAME.git"
  
  # Add remote for sandbox repository
  git remote remove $SANDBOX_REMOTE 2>/dev/null || true
  git remote add $SANDBOX_REMOTE "https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$SANDBOX_REPO_NAME.git"
  
  echo "Remote repositories configured"
}

# Ask if user wants to set up remote repositories
read -p "Do you want to set up remote repositories on GitHub? (y/n): " setup_remote_choice
if [ "$setup_remote_choice" = "y" ] || [ "$setup_remote_choice" = "Y" ]; then
  setup_remotes
else
  echo "Skipping remote repository setup"
fi

# Push to remotes if configured
push_to_remotes() {
  echo "Pushing to remote repositories..."
  
  # Push private branch to private repository
  git checkout main
  git push -u $PRIVATE_REMOTE main
  
  # Push public branch to public repository
  git checkout public
  git push -u $PUBLIC_REMOTE public:main
  
  # Push sandbox branch to sandbox repository
  git checkout sandbox
  git push -u $SANDBOX_REMOTE sandbox:main
  
  # Return to main branch
  git checkout main
}

# Ask if user wants to push to remote repositories
if [ "$setup_remote_choice" = "y" ] || [ "$setup_remote_choice" = "Y" ]; then
  read -p "Do you want to push to remote repositories now? (y/n): " push_choice
  if [ "$push_choice" = "y" ] || [ "$push_choice" = "Y" ]; then
    push_to_remotes
  else
    echo "Skipping remote push"
  fi
fi

echo "Repository setup complete!"
echo ""
echo "Branches created:"
echo "- main (private repository)"
echo "- public (public repository)"
echo "- sandbox (sandbox repository)"
echo ""
echo "To push changes to different repositories:"
echo "1. git checkout main && git push $PRIVATE_REMOTE main"
echo "2. git checkout public && git push $PUBLIC_REMOTE public:main"
echo "3. git checkout sandbox && git push $SANDBOX_REMOTE sandbox:main"
echo ""
echo "For more information, see docs/REPOSITORY_STRUCTURE.md"