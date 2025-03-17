# Repository Structure Documentation

## Overview

The Inventory Management System is distributed across three different GitHub repositories to support various levels of access and feature availability. This document provides detailed information about the repository structure, branching strategy, and deployment workflow.

## Repository Types

### 1. Private Repository (Main)
- **Repository Name**: `InventoryTracker`
- **Branch Name**: `main`
- **Purpose**: Development repository with all features enabled
- **Access**: Restricted to authorized team members
- **Features**: All features are available, including experimental ones
- **Environment**: Development and production builds

### 2. Sandbox Repository
- **Repository Name**: `InventoryTrackerSandbox`
- **Branch Name**: `main` (synced from private repo's `sandbox` branch)
- **Purpose**: Testing ground for experimental features
- **Access**: Available to beta testers and development team
- **Features**: All features including experimental ones
- **Environment**: Sandbox testing environment

### 3. Public Repository
- **Repository Name**: `InventoryTrackerPublic`
- **Branch Name**: `main` (synced from private repo's `public` branch)
- **Purpose**: Public-facing version with stable features
- **Access**: Available to anyone
- **Features**: Limited feature set (stable features only)
- **Environment**: Production-ready builds

## Branch Strategy

```
Private Repository (origin/main)
   │
   ├── sandbox branch ────────► Sandbox Repository (sandbox/main)
   │
   └── public branch ─────────► Public Repository (public/main)
```

- **main**: The primary development branch in the private repository
- **sandbox**: Branch for experimental features and testing
- **public**: Branch for stable, public-facing features

## Feature Flag System

The application uses a feature flag system to control which features are available in each repository type. The feature flags are defined in:

`client/src/lib/version-config.ts`

Each feature has availability settings for different repository types:

```typescript
export const FEATURE_FLAGS = {
  ADVANCED_REPORTING: {
    title: "Advanced Reporting",
    description: "Advanced reporting and analytics features",
    availability: {
      private: true,
      public: false,
      sandbox: true
    }
  },
  // ... other features
};
```

## Repository Type Detection

The repository type is detected in two ways:

1. **Server-side**: Using the `.repository-type` file at the root of the project
2. **Client-side**: Using the `versionInfo.repository` property in `version-config.ts`

## Deployment Workflow

### Setting Up Repositories

Use the `setup-git-repositories.sh` script to initialize the Git repositories:

```bash
./setup-git-repositories.sh
```

This will:
- Create the necessary repositories if they don't exist
- Set up the proper Git remotes
- Create and configure branches with the correct repository type markers

### Setting Up Permissions

Use the `setup-repository-permissions.sh` script to configure repository permissions:

```bash
./setup-repository-permissions.sh --add-collaborator username private,sandbox
./setup-repository-permissions.sh --protect-branch
./setup-repository-permissions.sh --setup-teams your-organization
```

### Synchronizing Repositories

Use the `sync-repositories.sh` script to keep repositories in sync:

```bash
# Sync all repositories
./sync-repositories.sh --all

# Sync only public repository
./sync-repositories.sh --public

# Sync only sandbox repository
./sync-repositories.sh --sandbox
```

### Deploying to Specific Repositories

Use the specific deployment scripts:

```bash
# Deploy to public repository
./deploy-public.sh

# Deploy to sandbox repository
./deploy-sandbox.sh
```

## CI/CD Integration

The repository structure supports CI/CD workflows with GitHub Actions. The workflows can detect the repository type and apply the appropriate build and deployment steps.

Sample GitHub Actions workflow snippet:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Detect repository type
        run: |
          REPO_TYPE=$(node check-repository-type.cjs)
          echo "REPO_TYPE=$REPO_TYPE" >> $GITHUB_ENV
          
      - name: Build application
        run: |
          echo "Building for repository type: $REPO_TYPE"
          npm ci
          npm run build
```

## Best Practices

1. **Feature Development**:
   - Develop features in the private repository
   - Use feature flags to control availability
   - Test thoroughly in the sandbox environment before public release

2. **Repository Synchronization**:
   - Keep repositories in sync regularly
   - Always push changes to the private repository first
   - Use deployment scripts to update public and sandbox repositories

3. **Access Control**:
   - Restrict access to the private repository
   - Configure branch protection rules
   - Use GitHub teams for managing access

4. **Version Management**:
   - Update version numbers consistently across repositories
   - Tag releases in all repositories
   - Maintain a changelog for each repository

## Troubleshooting

### Repository Type Detection Issues

If the repository type detection is not working correctly:

1. Check the `.repository-type` file at the root of the project
2. Verify the `versionInfo.repository` property in `version-config.ts`
3. Run `node check-repository-type.cjs` to see the detected repository type

### Synchronization Issues

If you encounter issues with repository synchronization:

1. Check for uncommitted changes
2. Verify remote URLs with `git remote -v`
3. Try forcing the sync with `./sync-repositories.sh --all --force`

## Conclusion

This repository structure provides a flexible and secure way to manage different versions of the Inventory Management System. By following the guidelines in this document, you can ensure consistent deployment and feature availability across all repositories.