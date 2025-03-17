import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Permission } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useFeatureFlags, FeatureFlagGuard } from "@/hooks/use-feature-flags";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [location] = useLocation();
  const { hasPermission, user } = useAuth();
  const { repoType } = useFeatureFlags();
  
  // Close the mobile nav when location changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location, isOpen, onClose]);
  
  // Handle esc key press to close the mobile nav
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleEscKey);
    
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);
  
  // Prevent scrolling when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 top-0 z-50 w-64 overflow-y-auto border-r bg-background p-6 shadow-lg transition-transform duration-300",
          isOpen ? "transform-none" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <div className="mt-6 flex flex-col space-y-1">
          <MobileNavLink href="/" active={location === "/"}>
            Dashboard
          </MobileNavLink>
          
          {hasPermission(Permission.VIEW_INVENTORY) && (
            <MobileNavLink href="/inventory" active={location === "/inventory"}>
              Inventory
            </MobileNavLink>
          )}
          
          {hasPermission(Permission.VIEW_TRANSACTIONS) && (
            <MobileNavLink href="/transactions" active={location === "/transactions"}>
              Transactions
            </MobileNavLink>
          )}
          
          {hasPermission(Permission.VIEW_CHECKED_OUT) && (
            <MobileNavLink href="/checked-out" active={location === "/checked-out"}>
              Checked Out
            </MobileNavLink>
          )}
          
          {hasPermission(Permission.VIEW_REPORTS) && (
            <FeatureFlagGuard feature="ADVANCED_REPORTING">
              <MobileNavLink href="/reports" active={location === "/reports"}>
                Reports
              </MobileNavLink>
            </FeatureFlagGuard>
          )}
          
          {hasPermission(Permission.MANAGE_PERSONNEL) && (
            <MobileNavLink href="/users" active={location === "/users"}>
              Users
            </MobileNavLink>
          )}
          
          {/* Admin-only section */}
          {hasPermission(Permission.MANAGE_ADMINS) && (
            <>
              <div className="my-2 h-px bg-border" />
              <p className="mb-1 px-2 text-xs text-muted-foreground">Admin</p>
              
              <MobileNavLink href="/admin/management" active={location === "/admin/management"}>
                User Management
              </MobileNavLink>
              
              <MobileNavLink href="/admin/activity" active={location === "/admin/activity"}>
                Activity Logs
              </MobileNavLink>
              
              <FeatureFlagGuard feature="BETA_FEATURES">
                <MobileNavLink href="/admin/transfer" active={location === "/admin/transfer"}>
                  Transfer Ownership
                </MobileNavLink>
              </FeatureFlagGuard>
            </>
          )}
        </div>
        
        {/* Repository type indicator */}
        <div className="absolute bottom-4 left-0 w-full px-6">
          <div className="flex items-center justify-between rounded border border-border bg-muted/50 px-3 py-2 text-xs">
            <span className="text-muted-foreground">Repository</span>
            <span 
              className={cn(
                "rounded px-1.5 py-0.5 font-medium",
                repoType === "private" ? "bg-red-600 text-white" :
                repoType === "public" ? "bg-green-600 text-white" :
                "bg-amber-500 text-white"
              )}
            >
              {repoType.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

interface MobileNavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function MobileNavLink({ href, active, children }: MobileNavLinkProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center rounded-md px-2 py-1.5 text-sm font-medium",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {children}
      </a>
    </Link>
  );
}