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
    description: "Enables detailed analytics and reporting features",
    availability: {
      private: true,
      public: false,
      sandbox: true
    }
  },
  EXPERIMENTAL_UI: {
    title: "Experimental UI",
    description: "Enables experimental UI components and layouts",
    availability: {
      private: true,
      public: false,
      sandbox: true
    }
  },
  BETA_FEATURES: {
    title: "Beta Features",
    description: "Enables beta features that are still under development",
    availability: {
      private: true,
      public: false,
      sandbox: true
    }
  },
  CORE_FEATURES: {
    title: "Core Features",
    description: "Essential inventory management functionality",
    availability: {
      private: true,
      public: true,
      sandbox: true
    }
  },
  ENHANCED_SECURITY: {
    title: "Enhanced Security",
    description: "Additional security features",
    availability: {
      private: true,
      public: true,
      sandbox: true
    }
  },
  USER_MANAGEMENT: {
    title: "User Management",
    description: "Comprehensive user and permission management",
    availability: {
      private: true,
      public: true,
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
  repository: "private", // Default to private, will be overridden by detection
  environment: "development",
  buildDate: new Date().toISOString(),
  gitCommit: "development"
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
  return `v${versionInfo.version} (${versionInfo.environment})`;
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
  // In the client-side code, we'll rely on the value set at build time
  // This value could be overridden using environment variables during build
  // or by using the detection script (check-repository-type.js)
  
  try {
    // For local development, check if we have a repository type in localStorage
    const storedRepoType = localStorage.getItem("repository-type");
    
    if (storedRepoType && ["private", "public", "sandbox"].includes(storedRepoType)) {
      return storedRepoType as RepositoryType;
    }
    
    // If we have a window.__REPOSITORY_TYPE__ global (injected at build time)
    if (
      typeof window !== "undefined" && 
      (window as any).__REPOSITORY_TYPE__ &&
      ["private", "public", "sandbox"].includes((window as any).__REPOSITORY_TYPE__)
    ) {
      return (window as any).__REPOSITORY_TYPE__ as RepositoryType;
    }
  } catch (e) {
    // If localStorage isn't available or there's another error, just use the default
    console.error("Error fetching repository type:", e);
  }
  
  // Use the default from versionInfo if no other source is available
  return versionInfo.repository;
}

/**
 * Check if a feature flag is enabled in the current repository
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  const repo = getRepositoryType();
  const featureConfig = FEATURE_FLAGS[feature];
  
  if (!featureConfig) {
    return false;
  }
  
  return featureConfig.availability[repo] || false;
}