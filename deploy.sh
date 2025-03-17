#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Create necessary files for GitHub Pages
echo "Setting up GitHub Pages deployment..."
touch dist/.nojekyll
cp dist/index.html dist/404.html

# Initialize and configure Git
cd dist
git init
git add .
git commit -m "Deploy to GitHub Pages"
git branch -M gh-pages

# Update this with your GitHub repository URL
echo "Please update the following line with your GitHub repository URL before running this script"
git remote add origin git@github.com:your-username/inventory-management-system.git

# Force push to the gh-pages branch
git push -f origin gh-pages

# Return to root directory
cd ..
echo "Deployment to GitHub Pages complete!"