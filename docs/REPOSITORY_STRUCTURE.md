# Repository Structure Guide

This document explains the multi-repository structure used in the Inventory Management System.

## Repository Types

The application is organized into three separate repository types:

| Repository | Access | Features | Purpose |
|------------|--------|----------|---------|
| **Private** | Internal only | All features enabled | Production deployment with full functionality |
| **Public** | Open source | Limited feature set | Public demonstration and community contributions |
| **Sandbox** | Development team | All features enabled | Testing and experimentation |

## Feature Availability

| Feature | Private | Public | Sandbox | Description |
|---------|---------|--------|---------|-------------|
| Core Features | ✅ | ✅ | ✅ | Essential inventory management functionality |
| User Management | ✅ | ✅ | ✅ | User and permission management |
| Enhanced Security | ✅ | ✅ | ✅ | Security features and protections |
| Advanced Reporting | ✅ | ❌ | ✅ | Detailed analytics and reporting |
| Experimental UI | ✅ | ❌ | ✅ | Experimental UI components |
| Beta Features | ✅ | ❌ | ✅ | Upcoming features in development |

## Feature Flag System

The application uses a feature flag system to conditionally enable features based on the repository type. This is implemented in `client/src/lib/version-config.ts`.

### Using Feature Flags

```tsx
import { FeatureFlagGuard, useFeatureFlags } from "@/hooks/use-feature-flags";

// To check if a feature is enabled in your component:
const { isEnabled } = useFeatureFlags();
if (isEnabled('ADVANCED_REPORTING')) {
  // Implement advanced reporting features
}

// Or use the guard component to conditionally render elements:
<FeatureFlagGuard feature="BETA_FEATURES">
  <BetaFeatureComponent />
</FeatureFlagGuard>
```

## Repository Type Detection

The application detects which repository it's running in using the following hierarchy:

1. `.repository-type` file in the root directory
2. Environment variable: `REPOSITORY_TYPE`
3. Git branch name: `main` (private), `public`, `sandbox`
4. Default fallback to `private`

The detection logic is implemented in `check-repository-type.cjs`.

## Deployment

### GitHub Actions Workflows

Three GitHub Actions workflows are set up to handle deployment:

- `.github/workflows/deploy.yml` - Main deployment pipeline for the `private` repository
- `.github/workflows/deploy-sandbox.yml` - Deployment for the `sandbox` repository
- `.github/workflows/pages.yml` - Documentation deployment to GitHub Pages

### Documentation

Documentation is automatically generated and deployed to GitHub Pages whenever changes are made to the documentation files or the main branch.

## Development

### Switching Repository Types

For local development, you can switch between repository types using:

```bash
# Switch to private repository mode
node change-repository-type.js private

# Switch to public repository mode
node change-repository-type.js public

# Switch to sandbox repository mode
node change-repository-type.js sandbox
```

The change takes effect immediately after refreshing the browser.

### Visual Indicators

The current repository type is indicated in the UI with:

1. A version indicator in the header showing the version number and a colored dot:
   - 🔴 Red: Private repository
   - 🟢 Green: Public repository
   - 🟠 Amber: Sandbox repository

2. A repository type badge on the login page

3. A repository type indicator in the mobile navigation sidebar