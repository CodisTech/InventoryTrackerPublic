import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Menu, 
  Bell, 
  Search, 
  Shield, 
  ShieldAlert, 
  User, 
  UserCog 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { USER_ROLES, UserRole } from "@shared/schema";
import inventoryLogoDark from "../../assets/images/inventory-logo-dark.svg";
import SwitchRoleModal from "@/components/users/switch-role-modal";

interface AppHeaderProps {
  onMenuClick: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onMenuClick }) => {
  const { user, getUserRole, getHighestRole, logoutMutation } = useAuth();
  const [isRoleSwitchModalOpen, setIsRoleSwitchModalOpen] = useState(false);
  
  const activeRole = getUserRole();
  const highestRole = getHighestRole();
  
  // Get the display name for the current active role
  const getRoleDisplayName = (role: UserRole | null): string => {
    if (!role) return "Guest";
    
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return "Super Admin";
      case USER_ROLES.ADMIN:
        return "Admin";
      case USER_ROLES.STANDARD_USER:
        return "Standard User";
      default:
        return "Unknown Role";
    }
  };
  
  // Get the icon component for a role
  const getRoleIcon = (role: UserRole | null) => {
    if (!role) return <User className="h-4 w-4" />;
    
    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        return <ShieldAlert className="h-4 w-4" />;
      case USER_ROLES.ADMIN:
        return <Shield className="h-4 w-4" />;
      case USER_ROLES.STANDARD_USER:
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };
  
  // Whether the user can switch roles (has a higher role than standard)
  const canSwitchRoles = highestRole === USER_ROLES.ADMIN || highestRole === USER_ROLES.SUPER_ADMIN;
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white border-b border-neutral-100 py-2 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center md:hidden">
        <button className="p-2" aria-label="Menu" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </button>
        <img src={inventoryLogoDark} alt="Inventory Management" className="ml-2 h-8 w-8" />
        <h1 className="text-lg font-medium ml-2">Inventory System</h1>
      </div>

      <div className="hidden md:block w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-300" />
          <Input
            type="text"
            placeholder="Search inventory..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-100 rounded-md"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Role indicator and switcher */}
        {activeRole && (
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  {getRoleIcon(activeRole)}
                  <span>{getRoleDisplayName(activeRole)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  Signed in as <strong>{user?.fullName}</strong>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {canSwitchRoles && (
                  <DropdownMenuItem onClick={() => setIsRoleSwitchModalOpen(true)}>
                    <UserCog className="mr-2 h-4 w-4" />
                    <span>Switch Role</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        <button className="p-2 relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-white text-xs flex items-center justify-center">
            3
          </span>
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
              <Avatar>
                <AvatarFallback className="bg-primary text-white">
                  {user?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.username}
                </p>
                <Badge variant="outline" className="mt-1 justify-start">
                  {getRoleIcon(activeRole)}
                  <span className="ml-1">{getRoleDisplayName(activeRole)}</span>
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {canSwitchRoles && (
              <DropdownMenuItem onClick={() => setIsRoleSwitchModalOpen(true)}>
                <UserCog className="mr-2 h-4 w-4" />
                <span>Switch Role</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleLogout}>
              <User className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Role switch modal */}
      <SwitchRoleModal 
        isOpen={isRoleSwitchModalOpen} 
        onClose={() => setIsRoleSwitchModalOpen(false)} 
      />
    </header>
  );
};

export default AppHeader;
