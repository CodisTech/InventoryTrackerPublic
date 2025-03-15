import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  LogOut, 
  LayoutDashboard, 
  Package, 
  RotateCw, 
  Users, 
  BarChart3,
  ShoppingBag,
  ShieldCheck
} from "lucide-react";
import codisLogoLight from "../../assets/images/codis-logo-light.svg";

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const navItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/" },
    { name: "Inventory", icon: <Package className="w-5 h-5" />, path: "/inventory" },
    { name: "Checked Out", icon: <ShoppingBag className="w-5 h-5" />, path: "/checked-out" },
    { name: "Transactions", icon: <RotateCw className="w-5 h-5" />, path: "/transactions" },
    { name: "Personnel", icon: <Users className="w-5 h-5" />, path: "/users" },
    { name: "Reports", icon: <BarChart3 className="w-5 h-5" />, path: "/reports" },
  ];
  
  // Admin menu items shown only for admin users
  const adminItems = user?.role === 'admin' || user?.role === 'super_admin' ? [
    { name: "Admin Management", icon: <ShieldCheck className="w-5 h-5" />, path: "/admin/management" },
    { name: "Activity Logs", icon: <RotateCw className="w-5 h-5" />, path: "/admin/activity" },
    { name: "Transfer Ownership", icon: <Users className="w-5 h-5" />, path: "/admin/transfers" }
  ] : [];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-neutral-100 shadow-sm">
      <div className="p-4 flex flex-col items-center justify-center border-b border-neutral-100">
        <img src={codisLogoLight} alt="Codis Technology" className="w-24 h-24 mb-2" />
        <h1 className="text-xl font-bold text-black">
          Codis Technology
        </h1>
        <p className="text-sm text-neutral-500">Inventory Management</p>
      </div>

      <nav className="py-6">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  location === item.path
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
          
          {/* Admin menu items */}
          {adminItems.length > 0 && (
            <>
              <li className="pt-2 pb-1">
                <div className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Admin Controls
                </div>
              </li>
              {adminItems.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.path}
                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                      location === item.path
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-neutral-100">
        <div className="flex items-center">
          <Avatar className="mr-3">
            <AvatarFallback className="bg-primary text-white">
              A
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-neutral-900">Administrator</p>
            <p className="text-xs text-neutral-500">System Admin</p>
          </div>
          <button 
            className="ml-auto hover:bg-neutral-100 p-2 rounded-full transition-colors" 
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-neutral-500" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
