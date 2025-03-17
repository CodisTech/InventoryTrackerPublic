#!/bin/bash

# This script helps deploy the inventory management system to a GitHub repository
# Usage: ./deploy-to-github.sh <github_username> <repository_name> <github_token>

# Check if required arguments are provided
if [ $# -lt 3 ]; then
  echo "Usage: ./deploy-to-github.sh <github_username> <repository_name> <github_token>"
  exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME=$2
GITHUB_TOKEN=$3

echo -e "\033[36m====== Deploying to GitHub ======\033[0m"

# Initialize git if not already initialized
if [ ! -d .git ]; then
  echo -e "\033[36mInitializing git repository...\033[0m"
  git init
fi

# Create a commit message
echo -e "\033[36mCreating commit message...\033[0m"
cat > commit_message.txt << EOL
Deploy Inventory Management System

This commit includes:
- Complete inventory management system with user authentication
- Interactive demo for GitHub Pages
- GitHub Actions workflow for automated deployment
- Comprehensive documentation
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

# Add all files
echo -e "\033[36mAdding files to git...\033[0m"
git add .

# Commit changes
echo -e "\033[36mCommitting changes...\033[0m"
git commit -F commit_message.txt

# Push to GitHub
echo -e "\033[36mPushing to GitHub...\033[0m"
git push -u origin main --force

echo -e "\033[32mDeployment complete!\033[0m"
echo -e "\033[36mYour code has been pushed to: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}\033[0m"
echo -e "\033[36mGitHub Pages demo will be available at: https://${GITHUB_USERNAME}.github.io/${REPO_NAME}/demo.html\033[0m"
echo -e "\033[36m(Note: It may take a few minutes for the GitHub Pages site to be built and deployed)\033[0m"