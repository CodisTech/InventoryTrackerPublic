import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VersionIndicator } from "@/components/layout/version-indicator";
import { useAuth } from "@/hooks/use-auth";
import { Menu, RefreshCcw } from "lucide-react";
import { Link } from "wouter";
import SwitchRoleModal from "@/components/users/switch-role-modal";

interface AppHeaderProps {
  onMenuClick: () => void;
}

export default function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { user, logoutMutation, activeRole } = useAuth();
  const [isSwitchRoleModalOpen, setIsSwitchRoleModalOpen] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="border-b h-16 px-4 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        <Link href="/">
          <a className="flex items-center gap-2">
            <img 
              src="/logo.svg" 
              alt="Inventory Management System" 
              className="h-8 w-8" 
            />
            <span className="font-semibold hidden md:block">
              Inventory Management System
            </span>
          </a>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <VersionIndicator />
        
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:block">
              {user.fullName} 
              {activeRole && <span className="ml-1 text-xs text-muted-foreground">({activeRole})</span>}
            </span>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsSwitchRoleModalOpen(true)}
              title="Switch Role"
              className="gap-1"
            >
              <RefreshCcw className="h-3 w-3" />
              <span>Switch Role</span>
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          <Link href="/auth">
            <a>
              <Button variant="default" size="sm">
                Login
              </Button>
            </a>
          </Link>
        )}
      </div>
      
      <SwitchRoleModal 
        isOpen={isSwitchRoleModalOpen} 
        onClose={() => setIsSwitchRoleModalOpen(false)} 
      />
    </header>
  );
}