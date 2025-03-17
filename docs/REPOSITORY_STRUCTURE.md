# Repository Structure

The Inventory Management System is distributed across three repositories with different access levels and purposes:

## Repository Types

### 1. Private Repository
- **Repository Type:** `private`
- **Access Level:** Internal team only
- **Purpose:** Main development repository with all features and capabilities
- **Features:** All features enabled, including experimental and beta features
- **Deployment:** Internal development and staging environments

### 2. Public Repository
- **Repository Type:** `public`
- **Access Level:** Available to all users
- **Purpose:** Limited functionality open-source version
- **Features:** Core functionality only, without advanced or experimental features
- **Deployment:** Public demo and open-source distribution

### 3. Sandbox Repository
- **Repository Type:** `sandbox`
- **Access Level:** Internal testing team
- **Purpose:** Testing ground for new features
- **Features:** All features enabled, including experimental and beta features
- **Deployment:** Testing environments

## Repository Detection

The system automatically detects which repository it's running from using the `.repository-type` file at the root of the project. This file contains a simple JSON-like structure:

```
repository: private
```

Valid values are `private`, `public`, and `sandbox`.

## Feature Flag System

Features are controlled through the feature flag system defined in `client/src/lib/version-config.ts`. Each feature has availability settings for each repository type:

```typescript
export const FEATURE_FLAGS = {
  ADVANCED_REPORTING: {
    title: "Advanced Reporting",
    description: "Enhanced reporting capabilities with charts, exports, and custom filters",
    availability: {
      private: true,
      public: false,
      sandbox: true
    }
  },
  // Other features...
};
```

The React hook `useFeatureFlags` provides easy access to feature availability in components:

```typescript
import { useFeatureFlags, FeatureFlagGuard } from "@/hooks/use-feature-flags";

// Using the hook directly
function MyComponent() {
  const { isEnabled } = useFeatureFlags();
  
  return (
    <div>
      {isEnabled("ADVANCED_REPORTING") && (
        <AdvancedReportingUI />
      )}
    </div>
  );
}

// Using the guard component
function AnotherComponent() {
  return (
    <FeatureFlagGuard feature="ADVANCED_REPORTING">
      <AdvancedReportingUI />
    </FeatureFlagGuard>
  );
}
```

## Repository Synchronization

Repositories can be synchronized using the provided scripts:

- `setup-git-repositories.sh`: Initial setup of all three repositories
- `sync-repositories.sh`: Synchronize changes between repositories
- `setup-repository-permissions.sh`: Configure appropriate permissions for each repository

## Version Indicator

The current repository type is clearly indicated in the UI via the `VersionIndicator` component, which displays:

- Current version number
- Repository type (PRIVATE, PUBLIC, or SANDBOX)
- Build information (when available)
- Environment (development, sandbox, or production)
- List of enabled features (on hover)

## GitHub Actions Workflows

Each repository has specific GitHub Actions workflows:

### Private Repository
- `deploy.yml`: Deploys to internal environments
- `pages.yml`: Deploys documentation to GitHub Pages

### Public Repository
- `deploy.yml`: Deploys to public demo environments
- `pages.yml`: Deploys public documentation

### Sandbox Repository
- `deploy-sandbox.yml`: Deploys to testing environments

## Adding New Features

When adding new features, follow these steps to ensure proper repository management:

1. Develop the feature in the `private` repository
2. Add a feature flag in `client/src/lib/version-config.ts`
3. Use `FeatureFlagGuard` or `useFeatureFlags` to conditionally render UI elements
4. Test thoroughly in the `sandbox` repository
5. If appropriate for public release, enable it for the `public` repository

## Reference

For more information, see:
- `client/src/lib/version-config.ts` - Feature flag definitions
- `client/src/hooks/use-feature-flags.tsx` - React hooks for feature flags
- `client/src/components/layout/version-indicator.tsx` - UI component showing repository type