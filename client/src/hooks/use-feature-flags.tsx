import { createContext, useContext, ReactNode } from "react";
import {
  FEATURE_FLAGS,
  FeatureFlag,
  RepositoryType,
  getRepositoryType,
  isFeatureEnabled,
} from "@/lib/version-config";

type FeatureFlagsContextType = {
  isEnabled: (feature: FeatureFlag) => boolean;
  getFeatureConfig: (feature: FeatureFlag) => {
    title: string;
    description: string;
    availability: {
      private: boolean;
      public: boolean;
      sandbox: boolean;
    };
  } | undefined;
  getAllFeatures: () => Array<{
    key: FeatureFlag;
    title: string;
    description: string;
    availability: {
      private: boolean;
      public: boolean;
      sandbox: boolean;
    };
    enabled: boolean;
    repoType: RepositoryType;
  }>;
  enabledFeatures: FeatureFlag[];
  repoType: RepositoryType;
  isFeatureAvailableInRepo: (feature: FeatureFlag, repo: RepositoryType) => boolean;
};

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const repoType = getRepositoryType();
  
  // Check if a feature is enabled based on current repository
  const isEnabled = (feature: FeatureFlag): boolean => {
    return isFeatureEnabled(feature);
  };
  
  // Get configuration for a specific feature
  const getFeatureConfig = (feature: FeatureFlag) => {
    return FEATURE_FLAGS[feature];
  };
  
  // Check if a feature is available in a specific repository type
  const isFeatureAvailableInRepo = (feature: FeatureFlag, repo: RepositoryType): boolean => {
    const config = FEATURE_FLAGS[feature];
    return config?.availability[repo] || false;
  };
  
  // Get a list of all features with their enabled status
  const getAllFeatures = () => {
    return Object.entries(FEATURE_FLAGS).map(([key, config]) => ({
      key: key as FeatureFlag,
      title: config.title,
      description: config.description,
      availability: config.availability,
      enabled: isEnabled(key as FeatureFlag),
      repoType,
    }));
  };
  
  // List of enabled features
  const enabledFeatures = Object.keys(FEATURE_FLAGS).filter(
    (key) => isEnabled(key as FeatureFlag)
  ) as FeatureFlag[];
  
  const contextValue: FeatureFlagsContextType = {
    isEnabled,
    getFeatureConfig,
    getAllFeatures,
    enabledFeatures,
    repoType,
    isFeatureAvailableInRepo,
  };
  
  return (
    <FeatureFlagsContext.Provider value={contextValue}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  
  if (!context) {
    throw new Error("useFeatureFlags must be used within a FeatureFlagsProvider");
  }
  
  return context;
}

/**
 * A component that conditionally renders content based on a feature flag
 */
export function FeatureFlagGuard({ 
  feature, 
  children,
  fallback = null 
}: { 
  feature: FeatureFlag; 
  children: ReactNode;
  fallback?: ReactNode; 
}) {
  const { isEnabled } = useFeatureFlags();
  
  if (isEnabled(feature)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}