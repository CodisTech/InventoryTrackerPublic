# Deploying from Replit to GitHub Pages

Due to security limitations in Replit, I can't directly push to your GitHub repository. Here's how you can deploy the live demo from this Replit project to your GitHub repository:

## Method 1: Deploy directly from your local machine (Recommended)

1. Clone your repository locally:
   ```bash
   git clone https://github.com/codistech/inventory-management-system.git
   cd inventory-management-system
   ```

2. Download the `gh-pages` directory from this Replit project:
   - Click on the file browser icon in Replit
   - Right-click on the `gh-pages` folder and select "Download"
   - Extract the downloaded zip file to your local repository

3. Navigate to the gh-pages directory and initialize git:
   ```bash
   cd gh-pages
   git init
   git add .
   git commit -m "GitHub Pages Interactive Demo"
   git branch -M gh-pages
   git remote add origin https://github.com/codistech/inventory-management-system.git
   git push -u origin gh-pages --force
   ```

4. After pushing, go to your GitHub repository settings:
   - Navigate to Settings > Pages
   - Select branch: gh-pages
   - Save

## Method 2: Use GitHub Actions (Automated)

1. In your GitHub repository, make sure you have the following files:
   - `.github/workflows/pages.yml` (already created in this project)
   - `deploy-live-demo.sh` (already created in this project)

2. Push these files to your main branch:
   ```bash
   git add .github/workflows/pages.yml deploy-live-demo.sh
   git commit -m "Add GitHub Pages deployment workflow"
   git push origin main
   ```

3. After pushing, GitHub Actions will automatically build and deploy your demo site to the gh-pages branch.

4. Go to your GitHub repository settings:
   - Navigate to Settings > Pages
   - Select branch: gh-pages
   - Save

## Method 3: Manual Export and Upload (Alternative)

If you can't use the Git methods above, you can:

1. Export the files from the `gh-pages` directory in this Replit project:
   - Click on the file browser icon in Replit
   - Right-click on each file in the `gh-pages` folder and download them

2. Create a new branch in your GitHub repository named `gh-pages`:
   - Go to your repository on GitHub
   - Click on the branch dropdown
   - Type `gh-pages`
   - Click "Create branch: gh-pages from 'main'"

3. Upload the files:
   - Navigate to the gh-pages branch
   - Click "Add file" > "Upload files"
   - Drag and drop all the files from the gh-pages directory
   - Commit changes

4. Enable GitHub Pages:
   - Go to Settings > Pages
   - Select branch: gh-pages
   - Save

## Verifying Deployment

After deployment, your demo will be available at:
```
https://codistech.github.io/inventory-management-system/demo.html
```

Note: It may take a few minutes for GitHub Pages to build and deploy your site.