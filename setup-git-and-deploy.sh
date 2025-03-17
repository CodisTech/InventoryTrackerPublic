#!/bin/bash

# Setup git and deploy to GitHub
echo -e "\033[36m====== Setting up Git and Deploying to GitHub ======\033[0m"

# Configure git if not already done
if [ -z "$(git config --global user.name)" ]; then
  echo -e "\033[33mPlease enter your GitHub username:\033[0m"
  read github_username
  git config --global user.name "$github_username"
fi

if [ -z "$(git config --global user.email)" ]; then
  echo -e "\033[33mPlease enter your GitHub email:\033[0m"
  read github_email
  git config --global user.email "$github_email"
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

# Attempt to push to GitHub
echo -e "\033[36mAttempting to push to GitHub...\033[0m"
echo -e "\033[33;1mYou will be prompted for your GitHub username and password/token.\033[0m"
git push -u origin gh-pages --force

# Check if push was successful
if [ $? -eq 0 ]; then
  echo -e "\033[32mDeployment successful!\033[0m"
  echo -e "\033[36mYour interactive demo will be available at:\033[0m https://codistech.github.io/inventory-management-system/demo.html"
  echo -e "\033[36mNote: It may take a few minutes for GitHub Pages to build and deploy your site.\033[0m"
else
  echo -e "\033[31mDeployment failed. This is likely due to authentication limitations in Replit.\033[0m"
  echo -e "\033[36mPlease download the gh-pages-export.zip file and follow the instructions in replit-to-github-deployment.md.\033[0m"
fi

cd ..