import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { 
  getDetailedVersion, 
  getDisplayVersion, 
  getRepositoryType, 
  RepositoryType,
  versionInfo
} from "@/lib/version-config";
import { cn } from "@/lib/utils";

const REPO_LABELS: Record<RepositoryType, string> = {
  "private": "PRIVATE",
  "public": "PUBLIC",
  "sandbox": "SANDBOX"
};

const REPO_COLORS: Record<RepositoryType, { bg: string, text: string }> = {
  "private": { bg: "bg-red-600", text: "text-white" },
  "public": { bg: "bg-green-600", text: "text-white" },
  "sandbox": { bg: "bg-amber-500", text: "text-white" }
};

/**
 * Version indicator component displaying the current repository type
 * and version information in the UI
 */
export function VersionIndicator() {
  const { repoType, enabledFeatures } = useFeatureFlags();
  
  return (
    <div className="flex flex-col items-end text-xs">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-muted-foreground">{getDisplayVersion()}</span>
        <span 
          className={cn(
            "px-1.5 py-0.5 rounded font-medium",
            REPO_COLORS[repoType].bg,
            REPO_COLORS[repoType].text
          )}
        >
          {REPO_LABELS[repoType]}
        </span>
      </div>
      <div className="text-muted-foreground/70 hover:text-muted-foreground transition-colors">
        {versionInfo.environment}
        {versionInfo.buildNumber && ` • build ${versionInfo.buildNumber}`}
      </div>
      
      {/* Tooltip that shows on hover with detailed version information */}
      <div className="group relative">
        <button 
          className="text-muted-foreground/50 hover:text-muted-foreground text-[10px] mt-1"
          aria-label="Show version details"
        >
          Version details
        </button>
        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-popover border rounded-md shadow-md 
                     opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50
                     text-left">
          <div className="text-xs space-y-1">
            <p><strong>Version:</strong> {versionInfo.version}</p>
            <p><strong>Repository:</strong> {repoType}</p>
            <p><strong>Environment:</strong> {versionInfo.environment}</p>
            {versionInfo.buildDate && (
              <p><strong>Build date:</strong> {new Date(versionInfo.buildDate).toLocaleString()}</p>
            )}
            {versionInfo.buildNumber && (
              <p><strong>Build number:</strong> {versionInfo.buildNumber}</p>
            )}
            {versionInfo.gitCommit && (
              <p><strong>Git commit:</strong> {versionInfo.gitCommit.substring(0, 7)}</p>
            )}
            <div className="border-t pt-1 mt-1">
              <p><strong>Enabled features:</strong> {enabledFeatures.length}</p>
              <ul className="pl-4 text-[10px] mt-1 list-disc">
                {enabledFeatures.map(feature => (
                  <li key={feature}>{feature.replace(/_/g, ' ').toLowerCase()}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}