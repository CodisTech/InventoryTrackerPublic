#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# GitHub username and repository name
GITHUB_USERNAME="codistech"
REPO_NAME="inventory-management-system"

echo -e "${CYAN}====== GitHub Pages Deployment Script ======${NC}"
echo -e "${YELLOW}This script will deploy the GitHub Pages demo to your repository.${NC}"
echo

# Check if user provided username as argument
if [ "$1" != "" ]; then
    GITHUB_USERNAME=$1
    echo -e "${GREEN}Using GitHub username: ${GITHUB_USERNAME}${NC}"
fi

# Check if GitHub username is still default
if [ "$GITHUB_USERNAME" == "your-username" ]; then
    echo -e "${RED}ERROR: You need to edit this script to set your GitHub username!${NC}"
    echo -e "Edit this file and change 'your-username' to your actual GitHub username"
    echo -e "Or run the script with your username as an argument: ./deploy-to-github-pages.sh your-username"
    exit 1
fi

# Update the GitHub Pages demo with the correct username
echo -e "${CYAN}Updating GitHub Pages demo with your username...${NC}"
sed -i "s|your-username|${GITHUB_USERNAME}|g" gh-pages/index.html

# Make sure the gh-pages directory exists
if [ ! -d "gh-pages" ]; then
    echo -e "${RED}ERROR: gh-pages directory not found!${NC}"
    exit 1
fi

# Create temporary directory for deployment
TEMP_DIR="temp-gh-pages-deploy"
rm -rf $TEMP_DIR
mkdir $TEMP_DIR

# Copy gh-pages content to temporary directory
echo -e "${CYAN}Preparing files for deployment...${NC}"
cp -r gh-pages/* $TEMP_DIR/
cp gh-pages/.nojekyll $TEMP_DIR/ 2>/dev/null || touch $TEMP_DIR/.nojekyll

# Initialize git repository in temporary directory
cd $TEMP_DIR
git init
git add .
git config --local user.email "deployment@example.com"
git config --local user.name "Deployment Script"
git commit -m "Deploy to GitHub Pages"

# Push to GitHub
echo -e "${CYAN}Pushing to GitHub Pages...${NC}"
echo -e "${YELLOW}You may be asked for your GitHub credentials.${NC}"
git branch -M main
git remote add origin https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git

# Push to GitHub (this will prompt for credentials)
if git push -f origin main; then
    echo -e "${GREEN}Successfully pushed to GitHub!${NC}"
    echo -e "${GREEN}Your GitHub Pages site will be available at:${NC}"
    echo -e "${CYAN}https://${GITHUB_USERNAME}.github.io/${REPO_NAME}/${NC}"
    echo -e "${YELLOW}It may take a few minutes for the site to be published.${NC}"
    echo -e "${YELLOW}Don't forget to enable GitHub Pages in your repository settings:${NC}"
    echo -e "${CYAN}https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/settings/pages${NC}"
    echo -e "${YELLOW}Set the Source to 'main' branch and save.${NC}"
else
    echo -e "${RED}Failed to push to GitHub. Please check your credentials and repository permissions.${NC}"
fi

# Clean up
cd ..
rm -rf $TEMP_DIR
echo -e "${GREEN}Deployment process completed!${NC}"