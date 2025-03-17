# Manual GitHub Pages Deployment Guide

This guide provides step-by-step instructions for deploying the Inventory Management System's live demo to GitHub Pages.

## Prerequisites

1. A GitHub account
2. Git installed on your local machine
3. Owner/collaborator access to the GitHub repository (codistech/inventory-management-system)

## Deployment Steps

### Option 1: Deploy from your local machine

1. Clone the repository (if you haven't already):
   ```bash
   git clone https://github.com/codistech/inventory-management-system.git
   cd inventory-management-system
   ```

2. Run the demo preparation script:
   ```bash
   chmod +x ./deploy-live-demo.sh
   ./deploy-live-demo.sh
   ```

3. Navigate to the gh-pages directory:
   ```bash
   cd gh-pages
   ```

4. Initialize a git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial GitHub Pages deployment"
   ```

5. Create a new branch named `gh-pages`:
   ```bash
   git branch -M gh-pages
   ```

6. Add your GitHub repository as remote:
   ```bash
   git remote add origin https://github.com/codistech/inventory-management-system.git
   ```

7. Push to GitHub:
   ```bash
   git push -u origin gh-pages --force
   ```

### Option 2: Use GitHub Actions (Automated Deployment)

1. In your repository, go to "Settings" > "Pages"
2. Under "Build and deployment", select "GitHub Actions" as the source
3. Create a `.github/workflows/pages.yml` file with the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Create gh-pages content
        run: |
          chmod +x ./deploy-live-demo.sh
          ./deploy-live-demo.sh
      
      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@4.1.5
        with:
          branch: gh-pages
          folder: gh-pages
```

4. Commit this file to your repository
5. The workflow will run automatically on new pushes to main, or you can manually trigger it

## Verifying Deployment

1. After deployment, your GitHub Pages site will be available at:
   - https://codistech.github.io/inventory-management-system/

2. The interactive demo will be available at:
   - https://codistech.github.io/inventory-management-system/demo.html

## Troubleshooting

1. **404 Error after deployment**: It may take a few minutes for GitHub Pages to build and deploy. If you still see a 404 after 10 minutes, check:
   - That your repository is public or has GitHub Pages enabled for private repositories
   - The branch name in GitHub Pages settings matches the one you pushed to

2. **Custom domain issues**: If you're using a custom domain:
   - Ensure DNS settings are properly configured
   - Add a CNAME file to your gh-pages branch with your domain name

3. **Missing assets**: Make sure all paths in your HTML files use relative paths

## Updating the Demo

To update the demo after making changes to the main application:

1. Run the demo preparation script again
2. Commit and push the changes to the gh-pages branch
3. GitHub Pages will automatically rebuild and deploy your site

## Support

If you encounter any issues with the deployment process, please open an issue on the GitHub repository for assistance.