import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AppHeaderProps {
  onMenuClick: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-neutral-100 py-2 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center md:hidden">
        <button className="p-2" aria-label="Menu" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </button>
        <span className="material-icons ml-2 text-primary">inventory_2</span>
        <h1 className="text-lg font-medium ml-2">Inventory</h1>
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

      <div className="flex items-center">
        <button className="p-2 relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-white text-xs flex items-center justify-center">
            3
          </span>
        </button>
        <div className="ml-2 md:hidden">
          <Avatar>
            <AvatarFallback className="bg-primary text-white">
              {user?.fullName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
