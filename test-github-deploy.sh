#!/bin/bash

# Test GitHub Pages deployment script
echo "Testing GitHub Pages deployment..."

# Create the gh-pages directory structure
echo "Creating the gh-pages directory..."
mkdir -p gh-pages

# Copy the landing page to the deployment directory
echo "Copying landing page..."
cp gh-pages-index.html gh-pages/index.html

# Create necessary GitHub Pages files
echo "Creating GitHub Pages configuration files..."
touch gh-pages/.nojekyll
echo "# Inventory Management System - GitHub Pages Demo" > gh-pages/README.md

# Test the GitHub Pages structure
echo "GitHub Pages deployment structure created at ./gh-pages/"
echo "To test, you can serve the directory with a local web server, for example:"
echo "  cd gh-pages && npx serve ."
echo ""
echo "To deploy to GitHub:"
echo "1. Create a GitHub repository"
echo "2. Run the following commands:"
echo "   cd gh-pages"
echo "   git init"
echo "   git add ."
echo "   git commit -m \"Initial GitHub Pages deployment\""
echo "   git remote add origin https://github.com/YOUR-USERNAME/inventory-management-system.git"
echo "   git push -u origin main"
echo "3. In your GitHub repository settings, enable GitHub Pages from the main branch"
echo ""
echo "Your GitHub Pages site will be available at: https://YOUR-USERNAME.github.io/inventory-management-system/"