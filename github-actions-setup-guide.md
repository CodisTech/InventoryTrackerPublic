# GitHub Actions Setup Guide

This guide explains how to set up GitHub Actions for automating deployments across the three repository types: private, public, and sandbox.

## Prerequisites

Before setting up GitHub Actions, ensure you have:

1. Created all three repositories on GitHub:
   - `inventory-management-system` (private repository)
   - `inventory-management-system-public` (public repository)
   - `inventory-management-system-sandbox` (sandbox repository)

2. Generated a GitHub Personal Access Token with appropriate permissions:
   - `repo` (full control of private repositories)
   - `workflow` (to update GitHub Action workflows)
   - `admin:org` (if using organization teams)

## Repository Structure

The application is distributed across three repositories with different access levels:

- **Private Repository**: Contains all features, intended for internal use
- **Public Repository**: Contains limited features, intended for public distribution
- **Sandbox Repository**: Contains all features for testing purposes

## Workflow Files

GitHub Actions workflows are defined in YAML files in the `.github/workflows/` directory:

- `deploy.yml` - Deploys the private repository to production
- `deploy-sandbox.yml` - Deploys the sandbox repository to test environment
- `pages.yml` - Publishes documentation to GitHub Pages

## Setting Up GitHub Secrets

For each repository, you need to set up the following secrets:

1. Go to your repository settings
2. Navigate to Secrets > Actions
3. Click "New repository secret"
4. Add the following secrets:
   - `DEPLOY_TOKEN`: GitHub Personal Access Token with repo and workflow permissions
   - `DB_CONNECTION_STRING`: Database connection string for the respective environment

## Customizing Workflows

### Production Deployment (deploy.yml)

This workflow runs on the private repository whenever changes are pushed to the `main` branch:

1. Checks that the repository type is set to "private"
2. Builds the application with production settings
3. Deploys to the production environment

### Sandbox Deployment (deploy-sandbox.yml)

This workflow runs on the sandbox repository whenever changes are pushed to the `sandbox` branch:

1. Checks that the repository type is set to "sandbox"
2. Builds the application with all features enabled
3. Deploys to the testing environment

### Documentation Deployment (pages.yml)

This workflow publishes documentation to GitHub Pages:

1. Copies files from the `docs/` directory
2. Creates an HTML index page customized for the repository type
3. Publishes to the `gh-pages` branch

## Manual Deployment

To manually trigger a deployment:

1. Go to the Actions tab in your repository
2. Select the desired workflow
3. Click "Run workflow"
4. Select the branch you want to deploy
5. Click "Run workflow"

## Repository Synchronization Strategy

When developing features:

1. Develop in the private repository's `main` branch
2. Use the `sync-repositories.sh` script to synchronize changes to other repositories
3. Feature flags will automatically adjust available features based on repository type

## Troubleshooting

Common issues:

1. **Workflow fails due to repository type mismatch**
   - Ensure the `.repository-type` file contains the correct repository type
   - Example: `repository: private` for the private repository

2. **Authentication failures**
   - Check that the `DEPLOY_TOKEN` secret is set correctly
   - Ensure the token has not expired
   - Verify the token has necessary permissions

3. **Build failures**
   - Check the build logs for specific errors
   - Ensure all dependencies are correctly installed
   - Verify that environmental variables are set correctly

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Setting up GitHub Pages with Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)