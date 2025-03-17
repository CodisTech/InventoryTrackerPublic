# Manual GitHub Pages Deployment

This document explains how to manually deploy the Inventory Management System to GitHub Pages.

## Prerequisites

1. A GitHub Personal Access Token with the appropriate permissions (repo).
2. Git installed on your machine.
3. Node.js installed for building the GitHub Pages content.

## Steps for Manual Deployment

### 1. Set up your GitHub token

Export your GitHub token as an environment variable:

```bash
export GITHUB_TOKEN=your_github_token_here
```

### 2. Run the deployment script

```bash
./deploy-gh-pages.sh
```

This script will:

1. Build the GitHub Pages content with the appropriate repository type.
2. Create a temporary Git repository.
3. Copy the generated content into this repository.
4. Push the content to the `gh-pages` branch of your GitHub repository.

### 3. Verify the deployment

After the script completes, you can visit your GitHub Pages site at:

```
https://codistech.github.io/InventoryTrackerSandbox
```

## Automated Deployment with GitHub Actions

Deployment is also automated through GitHub Actions. The workflow will trigger when:

- Changes are pushed to the `main`, `public`, or `sandbox` branches.
- Files in specific paths are changed (docs, screenshots, README, etc.)
- The workflow is manually triggered.

The GitHub Actions workflow can be found in `.github/workflows/pages.yml`.

## Troubleshooting

If you encounter issues with the deployment:

1. Check that your GitHub token has the necessary permissions.
2. Verify that the repository URL in the deployment script is correct.
3. Check the GitHub Pages settings in your repository settings to ensure it's configured to serve from the `gh-pages` branch.

## Repository Type Detection

The deployment process automatically detects which repository type (private, public, or sandbox) is being deployed and configures the GitHub Pages content accordingly. Feature flags and available functionality will be displayed based on the repository type.