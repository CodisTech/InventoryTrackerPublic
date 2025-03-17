#!/bin/bash

# Deploy to InventoryTracker repository with GitHub Pages demo
# This script pushes the current codebase to the InventoryTracker repository
# and sets up GitHub Pages for the demo

# GitHub credentials
GITHUB_USERNAME="codistech"
REPO_NAME="InventoryTracker"

# Use the GitHub token from environment
GITHUB_TOKEN=$GITHUB_TOKEN

echo -e "\033[36m====== Deploying to InventoryTracker Repository ======\033[0m"

# Initialize git if not already initialized
if [ ! -d .git ]; then
  echo -e "\033[36mInitializing git repository...\033[0m"
  git init
fi

# Create a commit message
echo -e "\033[36mCreating commit message...\033[0m"
cat > commit_message.txt << EOL
Deploy Inventory Management System with Live Demo

This commit includes:
- Complete inventory management system with user authentication
- Interactive demo for GitHub Pages
- GitHub Actions workflow for automated deployment
- Comprehensive documentation and setup guides
EOL

# Check if remote exists, if not add it
if ! git remote | grep -q origin; then
  echo -e "\033[36mAdding GitHub remote...\033[0m"
  git remote add origin https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git
else
  echo -e "\033[36mUpdating GitHub remote...\033[0m"
  git remote set-url origin https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git
fi

# Configure git user
echo -e "\033[36mConfiguring git user...\033[0m"
git config user.name "${GITHUB_USERNAME}"
git config user.email "${GITHUB_USERNAME}@users.noreply.github.com"

# Create .nojekyll file for GitHub Pages
echo -e "\033[36mEnsuring GitHub Pages configuration is correct...\033[0m"
touch .nojekyll

# Ensure the gh-pages directory exists with proper content
echo -e "\033[36mPreparing GitHub Pages content...\033[0m"
if [ -d "gh-pages" ]; then
  echo "  - gh-pages directory already exists"
else
  mkdir -p gh-pages
  echo "  - Created gh-pages directory"
fi

# Ensure .nojekyll exists in gh-pages
if [ ! -f "gh-pages/.nojekyll" ]; then
  touch gh-pages/.nojekyll
  echo "  - Created .nojekyll file in gh-pages"
fi

# Add all files
echo -e "\033[36mAdding files to git...\033[0m"
git add .

# Commit changes
echo -e "\033[36mCommitting changes...\033[0m"
git commit -F commit_message.txt

# Push to GitHub
echo -e "\033[36mPushing to GitHub...\033[0m"
git push -u origin main --force

echo -e "\033[32mDeployment to repository complete!\033[0m"
echo -e "\033[36mYour code has been pushed to: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}\033[0m"

echo -e "\033[36m====== Setting up GitHub Pages Demo ======\033[0m"
echo -e "\033[36mThe GitHub Actions workflow will automatically deploy the demo to GitHub Pages.\033[0m"
echo -e "\033[36mOnce the workflow completes, your demo will be available at:\033[0m"
echo -e "\033[32mhttps://${GITHUB_USERNAME}.github.io/${REPO_NAME}/demo.html\033[0m"
echo -e "\033[36m(Note: It may take a few minutes for the GitHub Pages site to be built and deployed)\033[0m"

echo -e "\033[36m====== Next Steps ======\033[0m"
echo -e "1. Visit your repository: \033[32mhttps://github.com/${GITHUB_USERNAME}/${REPO_NAME}\033[0m"
echo -e "2. Check the 'Actions' tab to monitor the deployment workflow"
echo -e "3. Once the workflow completes, access your demo at: \033[32mhttps://${GITHUB_USERNAME}.github.io/${REPO_NAME}/demo.html\033[0m"