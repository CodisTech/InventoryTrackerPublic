import { createContext, ReactNode, useContext } from "react";
import { 
  FeatureFlag, 
  FEATURE_FLAGS, 
  getRepositoryType, 
  RepositoryType,
  isFeatureEnabled as checkFeatureEnabled
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

const FeatureFlagsContext = createContext<FeatureFlagsContextType | null>(null);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const repoType = getRepositoryType();
  
  const isEnabled = (feature: FeatureFlag): boolean => {
    return checkFeatureEnabled(feature);
  };
  
  const getFeatureConfig = (feature: FeatureFlag) => {
    return FEATURE_FLAGS[feature];
  };
  
  const isFeatureAvailableInRepo = (feature: FeatureFlag, repo: RepositoryType): boolean => {
    const config = FEATURE_FLAGS[feature];
    return config ? config.availability[repo] : false;
  };
  
  const getAllFeatures = () => {
    return Object.entries(FEATURE_FLAGS).map(([key, config]) => ({
      key: key as FeatureFlag,
      title: config.title,
      description: config.description,
      availability: config.availability,
      enabled: isEnabled(key as FeatureFlag),
      repoType
    }));
  };
  
  const enabledFeatures = Object.keys(FEATURE_FLAGS).filter(
    key => isEnabled(key as FeatureFlag)
  ) as FeatureFlag[];

  return (
    <FeatureFlagsContext.Provider
      value={{
        isEnabled,
        getFeatureConfig,
        getAllFeatures,
        enabledFeatures,
        repoType,
        isFeatureAvailableInRepo
      }}
    >
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
  return isEnabled(feature) ? <>{children}</> : <>{fallback}</>;
}