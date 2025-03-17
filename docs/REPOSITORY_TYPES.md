# Repository Types

This application supports different repository configurations to accommodate various usage scenarios and access levels. Each repository type has its own feature set and is visually distinguishable in the UI.

## Available Repository Types

### Private Repository (Red)

- **Indicator**: Red dot and badge in the UI
- **Purpose**: Internal use with full feature set
- **Features**: All features enabled
- **Usage**: Main development and operational repository with complete functionality

### Public Repository (Green)

- **Indicator**: Green dot and badge in the UI
- **Purpose**: Public-facing version with limited features
- **Features**: Core features only (Advanced Reporting, Experimental UI, and Beta Features disabled)
- **Usage**: Repository for public use or demonstration with stable features only

### Sandbox Repository (Amber)

- **Indicator**: Amber/yellow dot and badge in the UI
- **Purpose**: Testing and development
- **Features**: All features enabled (same as Private)
- **Usage**: Safe testing environment for new features without affecting production

## Switching Repository Types

You can easily switch between repository types using the provided script:

```bash
# Switch to private repository
node change-repository-type.js private

# Switch to public repository
node change-repository-type.js public

# Switch to sandbox repository
node change-repository-type.js sandbox
```

After switching, refresh your browser to see the changes.

## Feature Availability by Repository Type

| Feature | Private | Public | Sandbox |
|---------|---------|--------|---------|
| Core Features | ✅ | ✅ | ✅ |
| Enhanced Security | ✅ | ✅ | ✅ |
| User Management | ✅ | ✅ | ✅ |
| Advanced Reporting | ✅ | ❌ | ✅ |
| Experimental UI | ✅ | ❌ | ✅ |
| Beta Features | ✅ | ❌ | ✅ |

## Technical Implementation

The repository type is determined through the following hierarchy:

1. `.repository-type` file in the root directory
2. `REPOSITORY_TYPE` environment variable
3. Git branch name (main → private, public → public, sandbox → sandbox)
4. Default to "private" if none of the above are available

The repository type is used to determine which features are available through the feature flag system. This system is implemented in:
- Client-side: `client/src/lib/version-config.ts` and `client/src/hooks/use-feature-flags.tsx`
- Server-side: `check-repository-type.js` and `repository-type.js`

## Usage in Code

You can check if a feature is enabled in your components using the `useFeatureFlags` hook:

```tsx
import { useFeatureFlags } from "@/hooks/use-feature-flags";

function MyComponent() {
  const { isEnabled } = useFeatureFlags();
  
  return (
    <div>
      {isEnabled("ADVANCED_REPORTING") && (
        <AdvancedReportingFeature />
      )}
    </div>
  );
}
```

Alternatively, use the `FeatureFlagGuard` component:

```tsx
import { FeatureFlagGuard } from "@/hooks/use-feature-flags";

function MyComponent() {
  return (
    <div>
      <FeatureFlagGuard 
        feature="EXPERIMENTAL_UI"
        fallback={<StandardUI />}
      >
        <ExperimentalUI />
      </FeatureFlagGuard>
    </div>
  );
}
```