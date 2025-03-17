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
    description: "Advanced reporting and analytics features",
    availability: {
      private: true,
      public: false,
      sandbox: true
    }
  },
  EXPERIMENTAL_UI: {
    title: "Experimental UI",
    description: "New experimental user interface components",
    availability: {
      private: true,
      public: false,
      sandbox: true
    }
  },
  PRIVACY_AGREEMENTS: {
    title: "Privacy Agreements",
    description: "Privacy agreement tracking and management",
    availability: {
      private: true,
      public: true,
      sandbox: true
    }
  },
  AUDIT_LOGGING: {
    title: "Audit Logging",
    description: "Detailed audit logging of all system actions",
    availability: {
      private: true,
      public: true,
      sandbox: true
    }
  },
  BETA_FEATURES: {
    title: "Beta Features",
    description: "Upcoming features in beta testing",
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
  repository: "private", // Default to private, will be updated by deployment scripts
  environment: "development", // Default to development
  buildDate: new Date().toISOString(),
  features: Object.keys(FEATURE_FLAGS).filter(key => 
    FEATURE_FLAGS[key as FeatureFlag].availability.private
  )
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
  return `v${versionInfo.version} (${versionInfo.repository} - ${versionInfo.environment})`;
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
  // If the feature doesn't exist, it's not enabled
  if (!FEATURE_FLAGS[feature]) return false;
  
  // Check if the feature is available in the current repository
  return FEATURE_FLAGS[feature].availability[versionInfo.repository] === true;
}