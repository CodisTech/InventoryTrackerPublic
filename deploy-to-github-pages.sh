#!/bin/bash

# GitHub Pages Deployment Script
# This script builds and deploys documentation to GitHub Pages

set -e

# Configuration
GITHUB_USERNAME=""
GITHUB_TOKEN=""
REPO_NAME="inventory-management-system"
PAGES_BRANCH="gh-pages"
DOCS_DIR="docs"
SCREENSHOTS_DIR="screenshots"
OUTPUT_DIR="gh-pages"

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

# Check repository type
REPO_TYPE="private"
if [ -f ".repository-type" ]; then
  REPO_TYPE=$(grep -oP 'repository:\s*\K\w+' .repository-type || echo "private")
fi
echo "Detected repository type: $REPO_TYPE"

# Prepare output directory
echo "Creating output directory for GitHub Pages..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Copy documentation files
echo "Copying documentation files..."
cp -r "$DOCS_DIR"/* "$OUTPUT_DIR"/

# Copy screenshots if they exist
if [ -d "$SCREENSHOTS_DIR" ]; then
  echo "Copying screenshots..."
  mkdir -p "$OUTPUT_DIR/screenshots"
  cp -r "$SCREENSHOTS_DIR"/* "$OUTPUT_DIR/screenshots"/
fi

# Create .nojekyll file to bypass Jekyll processing
touch "$OUTPUT_DIR/.nojekyll"

# Create index.html
echo "Creating index.html..."
cat > "$OUTPUT_DIR/index.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inventory Management System Documentation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
    }
    h2 {
      color: #3498db;
      margin-top: 30px;
    }
    a {
      color: #3498db;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .repo-type {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 3px;
      color: white;
      font-weight: bold;
      margin-left: 10px;
    }
    .private {
      background-color: #e74c3c;
    }
    .public {
      background-color: #2ecc71;
    }
    .sandbox {
      background-color: #f39c12;
    }
    .documentation-list {
      background-color: #f8f9fa;
      border-radius: 5px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .documentation-list ul {
      list-style-type: none;
      padding-left: 0;
    }
    .documentation-list li {
      margin-bottom: 10px;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    .documentation-list li:last-child {
      border-bottom: none;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 0.9em;
      color: #7f8c8d;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Inventory Management System 
    <span class="repo-type ${REPO_TYPE}">${REPO_TYPE^^}</span>
    </h1>
    <p>Documentation and Resources</p>
  </div>

  <div class="documentation-list">
    <h2>Documentation</h2>
    <ul>
      <li><a href="REPOSITORY_STRUCTURE.md">Repository Structure</a></li>
      <li><a href="API.md">API Documentation</a></li>
      <li><a href="DATABASE.md">Database Schema</a></li>
      <li><a href="USER_GUIDE.md">User Guide</a></li>
    </ul>
  </div>

  <div class="documentation-list">
    <h2>Screenshots</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
      <div>
        <h3>Dashboard</h3>
        <img src="screenshots/dashboard.svg" alt="Dashboard Screenshot" style="max-width: 300px;">
      </div>
      <div>
        <h3>Inventory</h3>
        <img src="screenshots/inventory.svg" alt="Inventory Screenshot" style="max-width: 300px;">
      </div>
      <div>
        <h3>Transactions</h3>
        <img src="screenshots/transactions.svg" alt="Transactions Screenshot" style="max-width: 300px;">
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Inventory Management System &copy; 2025</p>
    <p>Repository Type: <strong>${REPO_TYPE^^}</strong></p>
  </div>
</body>
</html>
EOF

# Create README
echo "Creating README.md..."
cat > "$OUTPUT_DIR/README.md" << EOF
# Inventory Management System Documentation

This repository contains documentation for the Inventory Management System ($REPO_TYPE version).

- [Repository Structure](REPOSITORY_STRUCTURE.md)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [User Guide](USER_GUIDE.md)
EOF

# Deploy methods
deploy_with_git() {
  echo "Deploying using Git..."
  
  # Create temporary directory for gh-pages
  local temp_dir=$(mktemp -d)
  cp -r "$OUTPUT_DIR"/* "$temp_dir"/
  cp "$OUTPUT_DIR/.nojekyll" "$temp_dir"/
  
  # Git operations
  cd "$temp_dir"
  git init
  git config user.name "$GITHUB_USERNAME"
  git config user.email "$GITHUB_USERNAME@users.noreply.github.com"
  git add .
  git commit -m "Update documentation"
  git branch -M "$PAGES_BRANCH"
  
  # Set remote and push
  git remote add origin "https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git"
  git push -f origin "$PAGES_BRANCH"
  
  # Clean up
  cd -
  rm -rf "$temp_dir"
}

deploy_with_api() {
  echo "Deploying using GitHub API..."
  
  # Check if branch exists
  local branch_exists=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/branches/$PAGES_BRANCH")
  
  # Get SHA of current gh-pages branch if it exists
  local base_sha=""
  if [ "$branch_exists" == "200" ]; then
    echo "Branch $PAGES_BRANCH exists, getting SHA..."
    base_sha=$(curl -s \
      -H "Authorization: token $GITHUB_TOKEN" \
      "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/branches/$PAGES_BRANCH" | \
      grep -o '"sha": "[^"]*"' | head -1 | cut -d'"' -f4)
    echo "Current SHA: $base_sha"
  fi
  
  # Create tree for each file in the output directory
  local tree_items=()
  find "$OUTPUT_DIR" -type f | while read file; do
    path=${file#"$OUTPUT_DIR/"}
    echo "Adding to tree: $path"
    
    # Create blob
    blob_sha=$(curl -s -X POST \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Content-Type: application/json" \
      "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/git/blobs" \
      -d "{\"content\":\"$(base64 -w0 < "$file")\", \"encoding\":\"base64\"}" | \
      grep -o '"sha": "[^"]*"' | head -1 | cut -d'"' -f4)
    
    tree_items+=("{\"path\":\"$path\", \"mode\":\"100644\", \"type\":\"blob\", \"sha\":\"$blob_sha\"}")
  done
  
  # Create tree
  local tree_json="{\"base_tree\":\"$base_sha\",\"tree\":[${tree_items[@]}]}"
  local tree_sha=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/git/trees" \
    -d "$tree_json" | \
    grep -o '"sha": "[^"]*"' | head -1 | cut -d'"' -f4)
  
  # Create commit
  local commit_sha=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/git/commits" \
    -d "{\"message\":\"Update documentation\",\"tree\":\"$tree_sha\",\"parents\":[\"$base_sha\"]}" | \
    grep -o '"sha": "[^"]*"' | head -1 | cut -d'"' -f4)
  
  # Update reference or create branch
  if [ "$branch_exists" == "200" ]; then
    # Update reference
    curl -s -X PATCH \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Content-Type: application/json" \
      "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/git/refs/heads/$PAGES_BRANCH" \
      -d "{\"sha\":\"$commit_sha\",\"force\":true}"
  else
    # Create branch
    curl -s -X POST \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Content-Type: application/json" \
      "https://api.github.com/repos/$GITHUB_USERNAME/$REPO_NAME/git/refs" \
      -d "{\"ref\":\"refs/heads/$PAGES_BRANCH\",\"sha\":\"$commit_sha\"}"
  fi
}

# Ask which deployment method to use
echo "How would you like to deploy to GitHub Pages?"
echo "1. Using Git (recommended)"
echo "2. Using GitHub API"
echo "3. Skip deployment (just prepare files)"
read -p "Enter option (1-3): " DEPLOY_OPTION

case $DEPLOY_OPTION in
  1) # Git deployment
    deploy_with_git
    ;;
  2) # API deployment
    deploy_with_api
    ;;
  3) # Skip deployment
    echo "Skipping deployment, files prepared in $OUTPUT_DIR"
    ;;
  *) # Invalid option
    echo "Error: Invalid option selected"
    exit 1
    ;;
esac

echo ""
echo "Documentation deployment process completed"
if [ "$DEPLOY_OPTION" != "3" ]; then
  echo "Your documentation should now be available at: https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
fi
echo ""