import { 
  createContext, 
  ReactNode, 
  useContext, 
  useEffect, 
  useMemo, 
  useState 
} from "react";

import { 
  FeatureFlag, 
  FEATURE_FLAGS, 
  getRepositoryType, 
  isFeatureEnabled, 
  RepositoryType 
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
  const [repoType, setRepoType] = useState<RepositoryType>(getRepositoryType());
  
  // Ensure repository type is up to date
  useEffect(() => {
    setRepoType(getRepositoryType());
    
    // This would be needed if repository type could change at runtime,
    // but for now it's set at build time
    const checkRepoType = () => {
      const currentType = getRepositoryType();
      if (currentType !== repoType) {
        setRepoType(currentType);
      }
    };
    
    // Check repository type on focus, which helps during development
    window.addEventListener("focus", checkRepoType);
    
    return () => {
      window.removeEventListener("focus", checkRepoType);
    };
  }, [repoType]);
  
  // Get all enabled features based on the repository type
  const enabledFeatures = useMemo(() => {
    return Object.keys(FEATURE_FLAGS).filter(
      feature => isFeatureEnabled(feature as FeatureFlag)
    ) as FeatureFlag[];
  }, [repoType]);
  
  const isEnabled = (feature: FeatureFlag): boolean => {
    return isFeatureEnabled(feature);
  };
  
  const getFeatureConfig = (feature: FeatureFlag) => {
    return FEATURE_FLAGS[feature];
  };
  
  const isFeatureAvailableInRepo = (feature: FeatureFlag, repo: RepositoryType): boolean => {
    const config = FEATURE_FLAGS[feature];
    return config ? config.availability[repo] === true : false;
  };
  
  const getAllFeatures = () => {
    return Object.entries(FEATURE_FLAGS).map(([key, config]) => ({
      key: key as FeatureFlag,
      ...config,
      enabled: isFeatureEnabled(key as FeatureFlag),
      repoType
    }));
  };
  
  const contextValue: FeatureFlagsContextType = {
    isEnabled,
    getFeatureConfig,
    getAllFeatures,
    enabledFeatures,
    repoType,
    isFeatureAvailableInRepo
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