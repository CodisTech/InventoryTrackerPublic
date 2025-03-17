import { cn } from "@/lib/utils";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getDetailedVersion, getDisplayVersion } from "@/lib/version-config";

/**
 * Version indicator component displaying the current repository type
 * and version information in the UI
 */
export function VersionIndicator() {
  const { repoType, getAllFeatures } = useFeatureFlags();
  const displayVersion = getDisplayVersion();
  const detailedVersion = getDetailedVersion();
  
  const enabledFeatures = getAllFeatures()
    .filter(feature => feature.enabled)
    .map(feature => feature.title);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="mr-2 flex cursor-help items-center gap-1.5">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                repoType === "private" && "bg-red-500",
                repoType === "public" && "bg-green-500",
                repoType === "sandbox" && "bg-amber-500"
              )}
            />
            <span className="text-xs text-muted-foreground">{displayVersion}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="w-80 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Version</span>
              <span className="text-xs">{detailedVersion}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Repository</span>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-xs font-medium text-white",
                  repoType === "private" && "bg-red-600",
                  repoType === "public" && "bg-green-600",
                  repoType === "sandbox" && "bg-amber-500"
                )}
              >
                {repoType.toUpperCase()}
              </span>
            </div>
            
            {enabledFeatures.length > 0 && (
              <div className="space-y-1">
                <span className="text-sm font-semibold">Enabled Features</span>
                <div className="grid grid-cols-2 gap-1">
                  {enabledFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}