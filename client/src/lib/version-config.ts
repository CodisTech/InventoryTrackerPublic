/**
 * Version configuration for the application
 * This file defines which version of the application is running.
 * 
 * In production builds, these values will be replaced at build time
 * through environment variables or build flags.
 */

/**
 * Repository type definition
 */
export type RepositoryType = "private" | "public" | "sandbox";

/**
 * Feature flag type definitions
 */
export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Feature flag configuration - defines available features
 * and which repositories they're available in
 */
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
  EXPERIMENTAL_UI: {
    title: "Experimental UI",
    description: "Preview of upcoming UI enhancements and features",
    availability: {
      private: true,
      public: false,
      sandbox: true
    }
  },
  MULTI_CHECKOUT: {
    title: "Multi-Item Checkout",
    description: "Check out multiple items at once to a single person",
    availability: {
      private: true,
      public: true,
      sandbox: true
    }
  },
  BULK_IMPORT: {
    title: "Bulk Import",
    description: "Import inventory items or personnel from CSV files",
    availability: {
      private: true,
      public: true,
      sandbox: true
    }
  },
  PRIVACY_AGREEMENT: {
    title: "Privacy Agreements",
    description: "Track user acceptance of privacy policies",
    availability: {
      private: true,
      public: true,
      sandbox: true
    }
  },
  EULA_TRACKING: {
    title: "EULA Tracking",
    description: "Track user acceptance of end-user license agreements",
    availability: {
      private: true,
      public: true,
      sandbox: true
    }
  },
  BETA_FEATURES: {
    title: "Beta Features",
    description: "Early access to beta features under development",
    availability: {
      private: true,
      public: false,
      sandbox: true
    }
  }
};

/**
 * Version information type definition
 */
export type VersionInfo = {
  version: string;
  repository: RepositoryType;
  environment: "production" | "sandbox" | "development";
  buildDate?: string;
  buildNumber?: string;
  gitCommit?: string;
  features?: string[];
};

/**
 * The primary version configuration object.
 * 
 * Note: This will be automatically updated by the deployment scripts
 *       based on which repository is being deployed.
 */
export const versionInfo: VersionInfo = {
  version: "1.0.0",
  repository: "private", // Will be replaced during build for each repository
  environment: "development",
  buildDate: "",
  buildNumber: "",
  gitCommit: ""
};

/**
 * Get a human-friendly display version
 */
export function getDisplayVersion(): string {
  return `v${versionInfo.version}`;
}

/**
 * Get a detailed version string including build information
 */
export function getDetailedVersion(): string {
  const parts = [`v${versionInfo.version}`, versionInfo.repository];
  
  if (versionInfo.buildNumber) {
    parts.push(`build ${versionInfo.buildNumber}`);
  }
  
  if (versionInfo.gitCommit) {
    parts.push(`commit ${versionInfo.gitCommit.substring(0, 7)}`);
  }
  
  return parts.join(' • ');
}

/**
 * Determine if this is a production build
 */
export function isProduction(): boolean {
  return versionInfo.environment === "production";
}

/**
 * Determine if this is a sandbox build
 */
export function isSandbox(): boolean {
  return versionInfo.environment === "sandbox";
}

/**
 * Get the current repository type
 */
export function getRepositoryType(): RepositoryType {
  return versionInfo.repository;
}

/**
 * Check if a feature flag is enabled in the current repository
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  const featureConfig = FEATURE_FLAGS[feature];
  if (!featureConfig) return false;
  
  const repoType = getRepositoryType();
  return featureConfig.availability[repoType] === true;
}