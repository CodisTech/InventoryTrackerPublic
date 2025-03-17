#!/bin/bash
# Script to set up Git repository and deploy to GitHub
# This script requires a personal access token with repo permissions
# Usage: ./setup-git-and-deploy.sh <github-username> <repository-name> <github-token>

# Check if required parameters are provided
if [ "$#" -lt 2 ]; then
  echo "Please provide your GitHub username and repository name."
  echo "Usage: ./setup-git-and-deploy.sh <github-username> <repository-name> [github-token]"
  exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME=$2
GITHUB_TOKEN=$3

# Setup git repositories
echo "Setting up git repositories..."
chmod +x setup-git-repositories.sh
./setup-git-repositories.sh

# Create GitHub repository if token provided
if [ ! -z "$GITHUB_TOKEN" ]; then
  echo "Creating GitHub repository..."
  
  # Check if repository already exists
  REPO_CHECK=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME")
  
  if echo "$REPO_CHECK" | grep -q "Not Found"; then
    # Create the repository
    curl -H "Authorization: token $GITHUB_TOKEN" \
      -d "{\"name\": \"$REPO_NAME\", \"private\": true}" \
      https://api.github.com/user/repos
    
    echo "Repository created successfully."
  else
    echo "Repository already exists."
  fi
  
  # Set the remote origin
  git remote remove origin 2>/dev/null
  git remote add origin "https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git"
  
  echo "Remote origin set."
else
  echo "No GitHub token provided, skipping repository creation."
  echo "You can manually set the remote origin with:"
  echo "  git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
fi

# Make sync script executable
chmod +x sync-repositories.sh

# Push all repositories
echo "Pushing all repositories to GitHub..."
./sync-repositories.sh "Initial repository setup"

echo ""
echo "Repository setup complete!"
echo "Your repository is now available at: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "Branch structure:"
echo "  main    - Private repository (all features)"
echo "  public  - Public repository (limited features)"
echo "  sandbox - Sandbox repository (testing environment)"