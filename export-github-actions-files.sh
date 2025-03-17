#!/bin/bash

# Export GitHub Actions files
echo -e "\033[36m====== Exporting GitHub Actions Files ======\033[0m"

# Create output directory
mkdir -p github-actions-export

# Copy GitHub workflow file
echo -e "\033[36mCopying GitHub workflow file...\033[0m"
mkdir -p github-actions-export/.github/workflows
cp .github/workflows/pages.yml github-actions-export/.github/workflows/

# Copy deployment script
echo -e "\033[36mCopying deployment script...\033[0m"
cp deploy-live-demo.sh github-actions-export/

# Copy setup guide
echo -e "\033[36mCopying setup guide...\033[0m"
cp github-actions-setup-guide.md github-actions-export/

# Create ZIP archive
echo -e "\033[36mCreating ZIP archive...\033[0m"
cd github-actions-export
zip -r ../github-actions-setup.zip .
cd ..

# Cleanup
echo -e "\033[36mCleaning up...\033[0m"
rm -rf github-actions-export

echo -e "\033[32mExport complete!\033[0m"
echo -e "\033[36mThe files needed for GitHub Actions setup have been exported to:\033[0m github-actions-setup.zip"
echo -e "\033[36mDownload this file and extract it to your local repository, then follow the instructions in github-actions-setup-guide.md\033[0m"