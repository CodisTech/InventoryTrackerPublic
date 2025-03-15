import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth, Permission } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  LogOut, 
  LayoutDashboard, 
  Package, 
  RotateCw, 
  Users, 
  BarChart3,
  ShoppingBag,
  ShieldCheck,
  ClipboardList,
  FileText,
  UserCog
} from "lucide-react";
import codisLogoLight from "../../assets/images/codis-logo-light.svg";
import { USER_ROLES } from "@shared/schema";

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { user, logoutMutation, hasPermission } = useAuth();

  // Determine which nav items to show based on user role
  const isAdmin = user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPER_ADMIN;
  const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;

  // Define all possible navigation items with required permissions
  const navigationItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/",
      permission: Permission.VIEW_INVENTORY,
      showAlways: true
    },
    {
      name: "Inventory",
      icon: <Package className="w-5 h-5" />,
      path: "/inventory",
      permission: Permission.VIEW_INVENTORY,
      showAlways: true
    },
    {
      name: "Checked Out",
      icon: <ShoppingBag className="w-5 h-5" />,
      path: "/checked-out",
      permission: Permission.VIEW_CHECKED_OUT,
      showAlways: false
    },
    {
      name: "Transactions",
      icon: <RotateCw className="w-5 h-5" />,
      path: "/transactions",
      permission: Permission.VIEW_TRANSACTIONS,
      showAlways: true
    },
    {
      name: "Personnel",
      icon: <Users className="w-5 h-5" />,
      path: "/users",
      permission: Permission.MANAGE_PERSONNEL,
      showAlways: false,
      isAdmin: true
    },
    {
      name: "Reports",
      icon: <BarChart3 className="w-5 h-5" />,
      path: "/reports",
      permission: Permission.VIEW_REPORTS,
      showAlways: false,
      isAdmin: true
    }
  ];

  // Admin menu items shown only for admin users
  const adminNavigationItems = [
    {
      name: "User Management",
      icon: <Users className="w-5 h-5" />,
      path: "/admin/management",
      permission: Permission.MANAGE_ADMINS,
      isSuperAdmin: true
    },
    {
      name: "Transfer Ownership",
      icon: <UserCog className="w-5 h-5" />,
      path: "/admin/transfers",
      permission: Permission.TRANSFER_OWNERSHIP,
      isSuperAdmin: true
    },
    {
      name: "Activity Logs",
      icon: <FileText className="w-5 h-5" />,
      path: "/admin/activity",
      permission: null, // No specific permission
      isAdminOnly: true, 
      isSuperAdmin: true  // Also show for super admins
    }
  ];

  // Filter items based on permissions
  const navItems = navigationItems.filter(item => 
    (item.showAlways && hasPermission(item.permission)) || 
    (item.isAdmin && isAdmin && hasPermission(item.permission))
  );
  
  // Filter admin items
  const adminItems = adminNavigationItems.filter(item => 
    (item.isAdminOnly && isAdmin) || 
    (item.isSuperAdmin && isSuperAdmin && (item.permission ? hasPermission(item.permission) : true))
  );
  
  // For debugging - temporary direct links for super admin
  if (isSuperAdmin) {
    console.log("User is super admin - should show admin links");
    // Log only essential properties to avoid cyclic references
    console.log("Admin navigation item paths:", adminNavigationItems.map(item => item.path));
    console.log("Filtered admin item paths:", adminItems.map(item => item.path));
    console.log("Has MANAGE_ADMINS permission:", hasPermission(Permission.MANAGE_ADMINS));
  }

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
              {user?.fullName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-neutral-900">{user?.fullName || "User"}</p>
            <p className="text-xs text-neutral-500">
              {user?.role === USER_ROLES.SUPER_ADMIN && "Super Admin"}
              {user?.role === USER_ROLES.ADMIN && "Administrator"}
              {user?.role === USER_ROLES.STANDARD_USER && "Standard User"}
            </p>
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
