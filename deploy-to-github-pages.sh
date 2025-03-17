#!/bin/bash

# Deploy documentation to GitHub Pages
# This script generates documentation and deploys it to GitHub Pages

set -e  # Exit on any error

# Variables
TEMP_DIR="gh-pages-temp"
GH_PAGES_DIR="gh-pages"
DOCS_DIR="docs"

# Create temporary directory
echo "Creating temporary directory..."
mkdir -p "$TEMP_DIR"

# Copy documentation
echo "Copying documentation files..."
cp -r "$DOCS_DIR"/* "$TEMP_DIR"/

# Copy screenshots for documentation
if [ -d "screenshots" ]; then
  echo "Copying screenshots..."
  mkdir -p "$TEMP_DIR/screenshots"
  cp -r screenshots/* "$TEMP_DIR/screenshots"/
fi

# Create index.html
echo "Creating index.html..."
cat > "$TEMP_DIR/index.html" << EOF
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
    .header img {
      max-width: 200px;
      margin-bottom: 10px;
    }
    .documentation-list {
      background-color: #f8f9fa;
      border-radius: 5px;
      padding: 20px;
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
    <h1>Inventory Management System</h1>
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
        <img src="screenshots/dashboard.png" alt="Dashboard Screenshot" style="max-width: 300px;">
      </div>
      <div>
        <h3>Inventory</h3>
        <img src="screenshots/inventory.png" alt="Inventory Screenshot" style="max-width: 300px;">
      </div>
      <div>
        <h3>Transactions</h3>
        <img src="screenshots/transactions.png" alt="Transactions Screenshot" style="max-width: 300px;">
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Inventory Management System &copy; 2025</p>
  </div>
</body>
</html>
EOF

# Create .nojekyll file to bypass Jekyll processing
touch "$TEMP_DIR/.nojekyll"

# Create a simple README
cat > "$TEMP_DIR/README.md" << EOF
# Inventory Management System Documentation

This repository contains documentation for the Inventory Management System.

- [Repository Structure](REPOSITORY_STRUCTURE.md)
- [API Documentation](API.md)
- [Database Schema](DATABASE.md)
- [User Guide](USER_GUIDE.md)
EOF

# Create a demo page
cat > "$TEMP_DIR/demo.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inventory Management System - Live Demo</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      text-align: center;
      padding: 50px 20px;
    }
    h1 {
      color: #2c3e50;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .btn {
      display: inline-block;
      background-color: #3498db;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 10px;
    }
    .btn:hover {
      background-color: #2980b9;
    }
    .repo-info {
      background-color: #f8f9fa;
      border-radius: 5px;
      padding: 20px;
      margin: 30px 0;
      text-align: left;
    }
    .repo-type {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 3px;
      color: white;
      font-weight: bold;
      margin-right: 10px;
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
  </style>
</head>
<body>
  <div class="container">
    <h1>Inventory Management System</h1>
    <h2>Live Demo Environments</h2>
    
    <div class="repo-info">
      <h3><span class="repo-type private">PRIVATE</span> Main Repository</h3>
      <p>Full-featured development environment with all features enabled.</p>
      <p><strong>Features:</strong> All features, including experimental ones</p>
      <p><strong>Access:</strong> Restricted to authorized team members</p>
      <a href="#" class="btn">Access Private Demo</a>
    </div>
    
    <div class="repo-info">
      <h3><span class="repo-type sandbox">SANDBOX</span> Sandbox Repository</h3>
      <p>Testing environment for experimental features.</p>
      <p><strong>Features:</strong> All features, including experimental ones</p>
      <p><strong>Access:</strong> Available to beta testers and development team</p>
      <a href="#" class="btn">Access Sandbox Demo</a>
    </div>
    
    <div class="repo-info">
      <h3><span class="repo-type public">PUBLIC</span> Public Repository</h3>
      <p>Public-facing version with stable features only.</p>
      <p><strong>Features:</strong> Limited feature set (stable features only)</p>
      <p><strong>Access:</strong> Available to anyone</p>
      <a href="#" class="btn">Access Public Demo</a>
    </div>
    
    <p>For more information, visit the <a href="index.html">documentation</a>.</p>
  </div>
</body>
</html>
EOF

# Copy to the final gh-pages directory
echo "Copying to gh-pages directory..."
mkdir -p "$GH_PAGES_DIR"
cp -r "$TEMP_DIR"/* "$GH_PAGES_DIR"/
cp "$TEMP_DIR/.nojekyll" "$GH_PAGES_DIR"/

# Clean up
echo "Cleaning up..."
rm -rf "$TEMP_DIR"

echo "GitHub Pages files prepared successfully!"
echo "Files are available in the '$GH_PAGES_DIR' directory."
echo "You can now deploy to GitHub Pages with:"
echo "  git subtree push --prefix $GH_PAGES_DIR origin gh-pages"