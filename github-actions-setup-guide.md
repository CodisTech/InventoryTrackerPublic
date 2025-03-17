# Setting Up GitHub Actions for Automated Demo Deployment

This guide explains how to set up GitHub Actions to automatically deploy your inventory management system's interactive demo to GitHub Pages.

## Required Files

The following files needed for GitHub Actions deployment have already been created in this project:

1. `.github/workflows/pages.yml` - The GitHub Actions workflow definition
2. `deploy-live-demo.sh` - The script that generates the demo content

## Setup Instructions

### Step 1: Add the Files to Your Repository

You need to add these files to your GitHub repository. Here's how:

1. Clone your repository (if you haven't already):
   ```bash
   git clone https://github.com/codistech/inventory-management-system.git
   cd inventory-management-system
   ```

2. Create the `.github/workflows` directory if it doesn't exist:
   ```bash
   mkdir -p .github/workflows
   ```

3. Copy the `pages.yml` file from this Replit project to your local repository:
   - Create a file at `.github/workflows/pages.yml` with the content below
   
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

4. Copy the `deploy-live-demo.sh` script from this Replit project to your local repository:
   - Create a file named `deploy-live-demo.sh` in the root of your repository
   - Make sure the script is executable: `chmod +x deploy-live-demo.sh`

### Step 2: Commit and Push the Files

1. Add the files to git:
   ```bash
   git add .github/workflows/pages.yml deploy-live-demo.sh
   ```

2. Commit the changes:
   ```bash
   git commit -m "Add GitHub Actions workflow for demo deployment"
   ```

3. Push to GitHub:
   ```bash
   git push origin main
   ```

### Step 3: Configure GitHub Pages

1. Go to your repository on GitHub
2. Navigate to Settings > Pages
3. Under "Source", select "GitHub Actions" (it may automatically select this)
4. The GitHub Actions workflow will automatically deploy to the gh-pages branch

### Step 4: Run the Workflow

The workflow will run automatically when you push changes to the main branch. You can also run it manually:

1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. Select the "Deploy to GitHub Pages" workflow
4. Click "Run workflow" and select the main branch

## Verify Deployment

After the workflow completes successfully:

1. Go to Settings > Pages to see the URL of your deployed site
2. Your interactive demo will be available at:
   ```
   https://codistech.github.io/inventory-management-system/demo.html
   ```

## Troubleshooting

If you encounter issues:

1. Check the Actions tab for workflow run details and error messages
2. Ensure your repository is public or has GitHub Pages enabled for private repositories
3. Verify that the workflow file (.github/workflows/pages.yml) is in the correct location
4. Make sure the deploy-live-demo.sh script is executable and in the root directory