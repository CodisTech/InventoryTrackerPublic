import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const navItems = [
    { name: "Dashboard", icon: "dashboard", path: "/" },
    { name: "Inventory", icon: "inventory", path: "/inventory" },
    { name: "Transactions", icon: "sync_alt", path: "/transactions" },
    { name: "Users", icon: "people", path: "/users" },
    { name: "Reports", icon: "assessment", path: "/reports" },
    { name: "Settings", icon: "settings", path: "/settings" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-neutral-100 shadow-sm">
      <div className="p-4 flex items-center justify-center border-b border-neutral-100">
        <span className="material-icons mr-2 text-primary">inventory_2</span>
        <h1 className="text-xl font-medium text-neutral-900">Inventory System</h1>
      </div>

      <nav className="py-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.path}>
                <a
                  className={`flex items-center px-4 py-3 ${
                    location === item.path
                      ? "bg-primary-light text-white"
                      : "text-neutral-500 hover:bg-neutral-50"
                  }`}
                >
                  <span className="material-icons mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-neutral-100">
        <div className="flex items-center">
          <Avatar className="mr-3">
            <AvatarFallback className="bg-primary text-white">
              {user?.fullName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-neutral-900">{user?.fullName || "User"}</p>
            <p className="text-xs text-neutral-500">{user?.role || "User"}</p>
          </div>
          <button className="ml-auto" onClick={handleLogout}>
            <LogOut className="h-5 w-5 text-neutral-500" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
