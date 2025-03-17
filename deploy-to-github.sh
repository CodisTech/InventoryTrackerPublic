#!/bin/bash

# GitHub Pages Deployment Script
echo -e "\033[36m====== GitHub Pages Deployment Script ======\033[0m"
echo -e "\033[33;1mThis script will deploy the interactive demo to GitHub Pages.\033[0m"

# Ensure gh-pages directory exists
if [ ! -d "gh-pages" ]; then
  echo -e "\033[31mError: gh-pages directory not found. Running demo preparation script first...\033[0m"
  ./deploy-live-demo.sh
fi

# Navigate to gh-pages directory
cd gh-pages

# Initialize git repository
echo -e "\033[36mInitializing git repository...\033[0m"
git init

# Add all files
echo -e "\033[36mAdding files to git...\033[0m"
git add .

# Commit changes
echo -e "\033[36mCommitting changes...\033[0m"
git commit -m "GitHub Pages Interactive Demo"

# Create gh-pages branch
echo -e "\033[36mCreating gh-pages branch...\033[0m"
git branch -M gh-pages

# Add GitHub remote
echo -e "\033[36mAdding GitHub remote...\033[0m"
git remote add origin https://github.com/codistech/inventory-management-system.git

# Push to GitHub
echo -e "\033[36mPushing to GitHub...\033[0m"
echo -e "\033[33;1mYou will be prompted for your GitHub username and password or token.\033[0m"
git push -u origin gh-pages --force

echo -e "\033[36mDeployment completed!\033[0m"
echo ""
echo -e "\033[36mYour interactive demo will be available at:\033[0m https://codistech.github.io/inventory-management-system/demo.html"
echo -e "\033[36mNote: It may take a few minutes for GitHub Pages to build and deploy your site.\033[0m"

cd ..